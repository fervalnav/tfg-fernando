import { AttachmentStorageService } from '../../src/attachment/domain/attachment-storage.service';

type StoredFile = {
  buffer: Buffer;
  mimeType: string;
};

export class InMemoryAttachmentStorageService extends AttachmentStorageService {
  private readonly files = new Map<string, StoredFile>();

  upload(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    this.files.set(key, { buffer: Buffer.from(buffer), mimeType });
    return Promise.resolve();
  }

  download(key: string): Promise<Buffer> {
    const stored = this.files.get(key);
    if (!stored) throw new Error(`Missing E2E object: ${key}`);
    return Promise.resolve(Buffer.from(stored.buffer));
  }

  createDownloadUrl(key: string): Promise<string> {
    if (!this.files.has(key)) throw new Error(`Missing E2E object: ${key}`);
    return Promise.resolve(`https://storage.invalid/${encodeURIComponent(key)}`);
  }

  delete(key: string): Promise<void> {
    this.files.delete(key);
    return Promise.resolve();
  }

  reset(): void {
    this.files.clear();
  }
}
