export interface AIProvider {
  analyzeVideo(input: VideoAnalysisInput): Promise<VideoAnalysisResult>;
  findClips(input: ClipDiscoveryInput): Promise<ClipCandidate[]>;
  scoreClips(input: ClipScoringInput): Promise<ClipScoreResult>;
}

export interface VideoAnalysisInput {
  transcript: string;
  segments: Array<{ text: string; start: number; end: number; speaker?: string }>;
  metadata: {
    duration: number;
    resolution?: string;
    fps?: number;
    title?: string;
  };
}

export interface VideoAnalysisResult {
  summary: string;
  topics: string[];
  mood: string;
  keyMoments: Array<{
    time: number;
    description: string;
    importance: number;
  }>;
}

export interface ClipDiscoveryInput {
  transcript: string;
  segments: Array<{ text: string; start: number; end: number }>;
  analysis: VideoAnalysisResult;
  numClips: number;
  minDuration: number;
  maxDuration: number;
  style?: string;
}

export interface ClipCandidate {
  startTime: number;
  endTime: number;
  title: string;
  hook: string;
  description: string;
  reasoning: string;
}

export interface ClipScoringInput {
  candidate: ClipCandidate;
  transcript: string;
  context: string;
}

export interface ClipScoreResult {
  hook: number;
  value: number;
  emotion: number;
  surprise: number;
  story: number;
  standalone: number;
  clarity: number;
  visual: number;
  virality: number;
  overall: number;
  reasoning: string;
}
