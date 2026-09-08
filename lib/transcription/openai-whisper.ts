export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  segments: TranscriptionSegment[];
}

export async function transcribeWithOpenAI(
  audioUrl: string
): Promise<TranscriptionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  // Download the audio file
  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) {
    throw new Error(`Failed to download audio: ${audioResponse.status}`);
  }
  const audioBuffer = await audioResponse.arrayBuffer();

  // Create form data for OpenAI API
  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer], { type: "audio/mpeg" }), "audio.mp3");
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");
  formData.append("timestamp_granularities[]", "segment");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI Whisper API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  return {
    text: data.text || "",
    language: data.language || "en",
    segments: (data.segments || []).map((seg: any) => ({
      text: (seg.text || "").trim(),
      start: seg.start ?? 0,
      end: seg.end ?? 0,
      confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : undefined,
    })),
  };
}
