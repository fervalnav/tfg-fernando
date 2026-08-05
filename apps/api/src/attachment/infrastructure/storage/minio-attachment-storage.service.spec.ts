import { StorageService } from '@/shared/infrastructure/storage/storage.service';
import { MinioAttachmentStorageService } from './minio-attachment-storage.service';

describe('MinioAttachmentStorageService', () => {
  it('delegates upload, download, presigning and deletion without changing PDF buffers', async () => {
    const pdf = Buffer.from('%PDF-1.4');
    const upload = jest.fn().mockResolvedValue(undefined);
    const download = jest.fn().mockResolvedValue(pdf);
    const getPresignedUrl = jest.fn().mockResolvedValue('https://storage.invalid/document');
    const deleteObject = jest.fn().mockResolvedValue(undefined);
    const storage = {
      upload,
      download,
      getPresignedUrl,
      delete: deleteObject,
    } as unknown as StorageService;
    const service = new MinioAttachmentStorageService(storage);

    await service.upload('account/opportunity/document.pdf', pdf, 'application/pdf');
    await expect(service.download('account/opportunity/document.pdf')).resolves.toBe(pdf);
    await expect(service.createDownloadUrl('account/opportunity/document.pdf')).resolves.toBe(
      'https://storage.invalid/document',
    );
    await service.delete('account/opportunity/document.pdf');

    expect(upload).toHaveBeenCalledWith({
      key: 'account/opportunity/document.pdf',
      body: pdf,
      contentType: 'application/pdf',
    });
    expect(download).toHaveBeenCalledWith('account/opportunity/document.pdf');
    expect(getPresignedUrl).toHaveBeenCalledWith('account/opportunity/document.pdf');
    expect(deleteObject).toHaveBeenCalledWith('account/opportunity/document.pdf');
  });
});
