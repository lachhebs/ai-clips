import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execFileAsync = promisify(execFile);

export interface VideoProbe {
  duration: number;
  width: number;
  height: number;
  fps: number;
  videoCodec: string;
  audioCodec: string;
  bitrate: number;
  size: number;
}

export interface SubtitleStyle {
  fontName?: string;
  fontSize?: number;
  primaryColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  position?: 'top' | 'center' | 'bottom';
}

async function ensureDir(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

export async function probeVideo(filePath: string): Promise<VideoProbe> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'quiet',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    filePath,
  ]);

  const data = JSON.parse(stdout);
  const videoStream = data.streams.find((s: any) => s.codec_type === 'video');
  const audioStream = data.streams.find((s: any) => s.codec_type === 'audio');

  if (!videoStream) throw new Error('No video stream found');

  const fps = videoStream.r_frame_rate
    ? eval(videoStream.r_frame_rate)
    : 30;

  return {
    duration: parseFloat(data.format.duration || '0'),
    width: videoStream.width,
    height: videoStream.height,
    fps,
    videoCodec: videoStream.codec_name,
    audioCodec: audioStream?.codec_name || 'none',
    bitrate: parseInt(data.format.bit_rate || '0'),
    size: parseInt(data.format.size || '0'),
  };
}

export async function extractAudio(videoPath: string, outputPath: string): Promise<string> {
  await ensureDir(outputPath);
  await execFileAsync('ffmpeg', [
    '-i', videoPath,
    '-vn',
    '-acodec', 'libmp3lame',
    '-q:a', '2',
    '-y',
    outputPath,
  ]);
  return outputPath;
}

export async function cutClip(
  inputPath: string,
  startTime: number,
  endTime: number,
  outputPath: string
): Promise<string> {
  await ensureDir(outputPath);
  await execFileAsync('ffmpeg', [
    '-i', inputPath,
    '-ss', startTime.toString(),
    '-to', endTime.toString(),
    '-c', 'copy',
    '-y',
    outputPath,
  ]);
  return outputPath;
}

export async function scaleVideo(
  inputPath: string,
  width: number,
  height: number,
  outputPath: string
): Promise<string> {
  await ensureDir(outputPath);
  await execFileAsync('ffmpeg', [
    '-i', inputPath,
    '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
    '-c:a', 'copy',
    '-y',
    outputPath,
  ]);
  return outputPath;
}

export async function cropVideo(
  inputPath: string,
  x: number,
  y: number,
  width: number,
  height: number,
  outputPath: string
): Promise<string> {
  await ensureDir(outputPath);
  await execFileAsync('ffmpeg', [
    '-i', inputPath,
    '-vf', `crop=${width}:${height}:${x}:${y}`,
    '-c:a', 'copy',
    '-y',
    outputPath,
  ]);
  return outputPath;
}

export async function reframeTo916(
  inputPath: string,
  outputPath: string,
  cropX?: number
): Promise<string> {
  await ensureDir(outputPath);
  // Get source dimensions
  const probe = await probeVideo(inputPath);
  const targetHeight = probe.height;
  const targetWidth = Math.round(targetHeight * 9 / 16);

  // Center crop by default, or use provided cropX
  const x = cropX ?? Math.max(0, Math.round((probe.width - targetWidth) / 2));

  await execFileAsync('ffmpeg', [
    '-i', inputPath,
    '-vf', `crop=${targetWidth}:${targetHeight}:${x}:0`,
    '-c:a', 'copy',
    '-y',
    outputPath,
  ]);
  return outputPath;
}

export async function burnSubtitles(
  videoPath: string,
  srtPath: string,
  outputPath: string,
  style?: SubtitleStyle
): Promise<string> {
  await ensureDir(outputPath);

  const fontName = style?.fontName || 'Arial';
  const fontSize = style?.fontSize || 24;
  const primaryColor = style?.primaryColor || '&H00FFFFFF';
  const outlineColor = style?.outlineColor || '&H00000000';
  const outlineWidth = style?.outlineWidth || 2;

  const position = style?.position || 'bottom';
  const marginV = position === 'top' ? 50 : position === 'center' ? 0 : 50;
  const alignment = position === 'top' ? 8 : position === 'center' ? 5 : 2;

  const srtPathEscaped = srtPath.replace(/:/g, '\\:').replace(/'/g, "\\'");

  await execFileAsync('ffmpeg', [
    '-i', videoPath,
    '-vf', `subtitles=${srtPathEscaped}:force_style='FontName=${fontName},FontSize=${fontSize},PrimaryColour=${primaryColor},OutlineColour=${outlineColor},Outline=${outlineWidth},MarginV=${marginV},Alignment=${alignment}'`,
    '-c:a', 'copy',
    '-y',
    outputPath,
  ]);
  return outputPath;
}

export async function generateThumbnail(
  videoPath: string,
  time: number,
  outputPath: string
): Promise<string> {
  await ensureDir(outputPath);
  await execFileAsync('ffmpeg', [
    '-i', videoPath,
    '-ss', time.toString(),
    '-vframes', '1',
    '-vf', 'scale=640:-1',
    '-y',
    outputPath,
  ]);
  return outputPath;
}

export async function normalizeAudio(
  inputPath: string,
  outputPath: string
): Promise<string> {
  await ensureDir(outputPath);
  await execFileAsync('ffmpeg', [
    '-i', inputPath,
    '-af', 'loudnorm=I=-16:LRA=11:TP=-1.5',
    '-y',
    outputPath,
  ]);
  return outputPath;
}

export async function getDuration(filePath: string): Promise<number> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'quiet',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath,
  ]);
  return parseFloat(stdout.trim());
}
