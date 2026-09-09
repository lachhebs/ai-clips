export interface AIProvider {
  analyzeVideo(input: VideoAnalysisInput): Promise<VideoAnalysisResult>;
  findClips(input: ClipDiscoveryInput): Promise<ClipCandidate[]>;
  scoreClips(input: ClipScoringInput): Promise<ClipScoreResult>;
}

export interface VideoAnalysisInput {
  videoUrl: string;
  metadata: {
    duration: number;
    resolution?: string;
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
  videoUrl: string;
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
  analysis: VideoAnalysisResult;
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
