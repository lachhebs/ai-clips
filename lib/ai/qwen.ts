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
    this.model = process.env.QWEN_MODEL || 'qwen-vl-max';
    this.baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  }

  private async chat(messages: Array<{ role: string; content: string | Array<Record<string, unknown>> }>): Promise<string> {
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
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Qwen API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private parseJsonResponse(text: string): Record<string, unknown> {
    // Try to extract JSON from the response, handling markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    return JSON.parse(text);
  }

  async analyzeVideo(input: VideoAnalysisInput): Promise<VideoAnalysisResult> {
    const result = await this.chat([
      {
        role: 'system',
        content: 'You are a video content analyzer. You MUST respond with valid JSON only, no markdown formatting.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'video_url',
            video_url: { url: input.videoUrl },
          },
          {
            type: 'text',
            text: `Analyze this video and provide insights.

VIDEO METADATA:
- Duration: ${Math.round(input.metadata.duration)}s
- Title: ${input.metadata.title || 'Untitled'}

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "summary": "Brief summary of the video content",
  "topics": ["topic1", "topic2", "topic3"],
  "mood": "overall mood/tone of the video",
  "keyMoments": [
    {"time": 120, "description": "What happens at this moment", "importance": 8}
  ]
}`,
          },
        ],
      },
    ]);

    return this.parseJsonResponse(result) as unknown as VideoAnalysisResult;
  }

  async findClips(input: ClipDiscoveryInput): Promise<ClipCandidate[]> {
    const result = await this.chat([
      {
        role: 'system',
        content: 'You are an expert video editor who finds viral clips. You MUST respond with valid JSON only, no markdown formatting.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'video_url',
            video_url: { url: input.videoUrl },
          },
          {
            type: 'text',
            text: `Find the best ${input.numClips} viral short-form clips from this video.

ANALYSIS:
- Topics: ${input.analysis.topics.join(', ')}
- Mood: ${input.analysis.mood}
- Summary: ${input.analysis.summary}

CONSTRAINTS:
- Each clip must be ${input.minDuration}-${input.maxDuration} seconds
- Clips must start and end at natural boundaries (scene changes, pauses, speech breaks)
- Prioritize: strong hooks, emotional moments, surprising revelations, complete stories
- Style: ${input.style || 'TikTok/Instagram Reels'}

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "clips": [
    {
      "startTime": 45.2,
      "endTime": 92.8,
      "title": "Catchy title for the clip",
      "hook": "The opening line or moment that grabs attention",
      "description": "Why this clip is compelling",
      "reasoning": "Why you selected these specific boundaries"
    }
  ]
}`,
          },
        ],
      },
    ]);

    const parsed = this.parseJsonResponse(result) as Record<string, unknown>;
    return (parsed.clips as ClipCandidate[]) || [];
  }

  async scoreClips(input: ClipScoringInput): Promise<ClipScoreResult> {
    const duration = input.candidate.endTime - input.candidate.startTime;

    const result = await this.chat([
      {
        role: 'system',
        content: 'You are a viral content scoring expert. You MUST respond with valid JSON only, no markdown formatting.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'video_url',
            video_url: { url: '' },
          },
          {
            type: 'text',
            text: `Score this video clip concept on multiple dimensions (0-10 scale).

CLIP:
- Title: ${input.candidate.title}
- Hook: ${input.candidate.hook}
- Description: ${input.candidate.description}
- Duration: ${duration.toFixed(1)}s
- Time range: ${input.candidate.startTime}s - ${input.candidate.endTime}s

CONTEXT:
- Video topics: ${input.analysis.topics.join(', ')}
- Video mood: ${input.analysis.mood}
- Summary: ${input.analysis.summary}

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

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
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
}`,
          },
        ],
      },
    ]);

    return this.parseJsonResponse(result) as unknown as ClipScoreResult;
  }
}
