import { TranscriptionProvider, TranscriptionResult, TranscribeOptions } from './index';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

const execFileAsync = promisify(execFile);

export class WhisperProvider implements TranscriptionProvider {
  private model: string;
  private language?: string;

  constructor(options?: { model?: string; language?: string }) {
    this.model = options?.model || process.env.WHISPER_MODEL || 'small';
    this.language = options?.language || process.env.WHISPER_DEFAULT_LANGUAGE;
  }

  async transcribe(audioPath: string, options?: TranscribeOptions): Promise<TranscriptionResult> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'whisper-'));
    const baseName = path.basename(audioPath, path.extname(audioPath));

    const args: string[] = [
      audioPath,
      '--model', this.model,
      '--output_format', 'json',
      '--output_dir', tmpDir,
    ];

    const lang = options?.language || this.language;
    if (lang) {
      args.push('--language', lang);
    }

    if (options?.task === 'translate') {
      args.push('--task', 'translate');
    }

    try {
      await execFileAsync('whisper', args, {
        maxBuffer: 50 * 1024 * 1024,
        timeout: 30 * 60 * 1000,
      });

      const jsonPath = path.join(tmpDir, `${baseName}.json`);
      const raw = await fs.readFile(jsonPath, 'utf-8');
      const data = JSON.parse(raw);

      return {
        text: data.text || '',
        language: data.language || lang || 'en',
        segments: (data.segments || []).map((seg: any) => ({
          text: (seg.text || '').trim(),
          start: seg.start ?? 0,
          end: seg.end ?? 0,
          confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : undefined,
        })),
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(
          'whisper command not found. Install it with: pip install -U openai-whisper'
        );
      }
      throw new Error(`Local Whisper transcription failed: ${error.message}`);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
