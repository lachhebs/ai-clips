export interface TranscribeOptions {
  language?: string;
  task?: 'transcribe' | 'translate';
}

export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  speaker?: string;
  confidence?: number;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  segments: TranscriptionSegment[];
}

export interface TranscriptionProvider {
  transcribe(audioPath: string, options?: TranscribeOptions): Promise<TranscriptionResult>;
}

export { WhisperProvider } from './whisper';
