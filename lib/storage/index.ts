export interface StorageProvider {
  upload(filePath: string, buffer: Buffer, contentType?: string): Promise<string>;
  download(filePath: string): Promise<Buffer>;
  delete(filePath: string): Promise<void>;
  getSignedUrl(filePath: string, expiresIn?: number): Promise<string>;
  exists(filePath: string): Promise<boolean>;
}

import { LocalStorageProvider } from './local';

let storageInstance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!storageInstance) {
    storageInstance = new LocalStorageProvider();
  }
  return storageInstance;
}
