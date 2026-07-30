export abstract class AttachmentStorageService {
  abstract upload(key: string, buffer: Buffer, mimeType: string): Promise<void>;
  abstract download(key: string): Promise<Buffer>;
  abstract createDownloadUrl(key: string): Promise<string>;
  abstract delete(key: string): Promise<void>;
}
