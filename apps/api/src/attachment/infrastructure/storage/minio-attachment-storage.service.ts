import { Injectable } from '@nestjs/common';
import { StorageService } from '@/shared/infrastructure/storage/storage.service';
import { AttachmentStorageService } from '../../domain/attachment-storage.service';

@Injectable()
export class MinioAttachmentStorageService extends AttachmentStorageService {
  constructor(private readonly storage: StorageService) {
    super();
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    await this.storage.upload({ key, body: buffer, contentType: mimeType });
  }

  download(key: string): Promise<Buffer> {
    return this.storage.download(key);
  }

  createDownloadUrl(key: string): Promise<string> {
    return this.storage.getPresignedUrl(key);
  }

  delete(key: string): Promise<void> {
    return this.storage.delete(key);
  }
}
