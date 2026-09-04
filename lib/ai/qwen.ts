import {
  AIProvider,
  VideoAnalysisInput,
  VideoAnalysisResult,
  ClipDiscoveryInput,
  ClipCandidate,
  ClipScoringInput,
  ClipScoreResult,
} from './provider';

export class QwenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.QWEN_API_KEY || '';
    this.model = process.env.QWEN_MODEL || 'qwen-plus';
    this.baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  }

  private async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Qwen API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async analyzeVideo(input: VideoAnalysisInput): Promise<VideoAnalysisResult> {
    const transcriptPreview = input.transcript.slice(0, 8000);

    const prompt = `Analyze this video transcript and provide insights.

TRANSCRIPT:
${transcriptPreview}

VIDEO METADATA:
- Duration: ${Math.round(input.metadata.duration)}s
- Resolution: ${input.metadata.resolution || 'unknown'}

Respond in JSON format:
{
  "summary": "Brief summary of the video content",
  "topics": ["topic1", "topic2", "topic3"],
  "mood": "overall mood/tone of the video",
  "keyMoments": [
    {"time": 120, "description": "What happens at this moment", "importance": 8}
  ]
}`;

    const result = await this.chat([
      { role: 'system', content: 'You are a video content analyzer. Respond only in valid JSON.' },
      { role: 'user', content: prompt },
    ]);

    return JSON.parse(result);
  }

  async findClips(input: ClipDiscoveryInput): Promise<ClipCandidate[]> {
    const transcriptWithTimes = input.segments
      .map(s => `[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] ${s.text}`)
      .join('\n');

    const prompt = `Find the best ${input.numClips} viral short-form clips from this video.

TRANSCRIPT WITH TIMESTAMPS:
${transcriptWithTimes.slice(0, 10000)}

ANALYSIS:
- Topics: ${input.analysis.topics.join(', ')}
- Mood: ${input.analysis.mood}
- Summary: ${input.analysis.summary}

CONSTRAINTS:
- Each clip must be ${input.minDuration}-${input.maxDuration} seconds
- Clips must start and end at natural speech boundaries
- Prioritize: strong hooks, emotional moments, surprising revelations, complete stories
- Style: ${input.style || 'TikTok/Instagram Reels'}

Respond in JSON format:
{
  "clips": [
    {
      "startTime": 45.2,
      "endTime": 92.8,
      "title": "Catchy title for the clip",
      "hook": "The opening line that grabs attention",
      "description": "Why this clip is compelling",
      "reasoning": "Why you selected these specific boundaries"
    }
  ]
}`;

    const result = await this.chat([
      { role: 'system', content: 'You are an expert video editor who finds viral clips. Respond only in valid JSON.' },
      { role: 'user', content: prompt },
    ]);

    const parsed = JSON.parse(result);
    return parsed.clips || [];
  }

  async scoreClips(input: ClipScoringInput): Promise<ClipScoreResult> {
    const prompt = `Score this video clip on multiple dimensions (0-10 scale).

CLIP:
- Title: ${input.candidate.title}
- Hook: ${input.candidate.hook}
- Description: ${input.candidate.description}
- Duration: ${(input.candidate.endTime - input.candidate.startTime).toFixed(1)}s

TRANSCRIPT:
${input.transcript.slice(0, 3000)}

CONTEXT:
${input.context.slice(0, 2000)}

Score each dimension 0-10:
- hook: How strong is the opening hook (attention in first 3 seconds)
- value: Does it deliver value/information/entertainment
- emotion: Emotional impact and resonance
- surprise: Unexpected twists or revelations
- story: Narrative completeness and arc
- standalone: Can it stand alone without context
- clarity: Audio/video quality and clarity
- visual: Visual appeal and engagement
- virality: Likelihood to be shared

Respond in JSON format:
{
  "hook": 8.5,
  "value": 7.0,
  "emotion": 6.5,
  "surprise": 8.0,
  "story": 7.5,
  "standalone": 9.0,
  "clarity": 8.0,
  "visual": 6.0,
  "virality": 8.5,
  "overall": 7.7,
  "reasoning": "Brief explanation of scores"
}`;

    const result = await this.chat([
      { role: 'system', content: 'You are a viral content scoring expert. Respond only in valid JSON.' },
      { role: 'user', content: prompt },
    ]);

    return JSON.parse(result);
  }
}
