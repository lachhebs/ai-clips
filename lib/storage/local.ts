import { StorageProvider } from './index';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = process.env.STORAGE_PATH || './storage';
  }

  private getFullPath(filePath: string): string {
    return path.join(this.basePath, filePath);
  }

  async upload(filePath: string, buffer: Buffer, contentType?: string): Promise<string> {
    const fullPath = this.getFullPath(filePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return filePath;
  }

  async download(filePath: string): Promise<Buffer> {
    const fullPath = this.getFullPath(filePath);
    return fs.readFile(fullPath);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = this.getFullPath(filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  async getSignedUrl(filePath: string, expiresIn?: number): Promise<string> {
    // For local storage, return the file path as-is
    // In production, this would generate a time-limited signed URL
    return `/api/storage/${filePath}`;
  }

  async exists(filePath: string): Promise<boolean> {
    const fullPath = this.getFullPath(filePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(16).toString('hex');
    return `${hash}${ext}`;
  }
}
