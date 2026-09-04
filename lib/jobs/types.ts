export enum JobType {
  UPLOAD = "UPLOAD",
  PROBE = "PROBE",
  TRANSCRIBE = "TRANSCRIBE",
  SCENE_DETECT = "SCENE_DETECT",
  AI_ANALYSIS = "AI_ANALYSIS",
  CLIP_DISCOVERY = "CLIP_DISCOVERY",
  CLIP_SCORING = "CLIP_SCORING",
  REFRAME = "REFRAME",
  CAPTIONS = "CAPTIONS",
  RENDER = "RENDER",
  THUMBNAIL = "THUMBNAIL",
}

export enum JobStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  RETRYING = "RETRYING",
}

export interface JobData {
  jobId: string;
  projectId: string;
  type: JobType;
  payload?: Record<string, unknown>;
}

export interface VideoJobData extends JobData {
  filePath?: string;
  outputPath?: string;
  startTime?: number;
  endTime?: number;
  aspectRatio?: string;
  resolution?: string;
}

export interface AIJobData extends JobData {
  segments?: Array<{ text: string; start: number; end: number }>;
  provider?: string;
  model?: string;
}

export interface RenderJobData extends JobData {
  clipId: string;
  videoPath: string;
  startTime: number;
  endTime: number;
  outputPath: string;
  captionSettings?: Record<string, unknown>;
  aspectRatio?: string;
}
