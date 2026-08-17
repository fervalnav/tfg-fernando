import { DeleteBucketPolicyCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual<typeof import('@aws-sdk/client-s3')>('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://storage.invalid/signed'),
}));

describe('StorageService', () => {
  beforeEach(() => {
    mockSend.mockReset();
    jest.mocked(S3Client).mockClear();
  });

  it('removes a pre-existing public policy when the bucket already exists', async () => {
    mockSend.mockResolvedValue(undefined);
    const service = new StorageService(config());

    await service.onModuleInit();

    expect(mockSend).toHaveBeenNthCalledWith(1, expect.any(HeadBucketCommand));
    expect(mockSend).toHaveBeenNthCalledWith(2, expect.any(DeleteBucketPolicyCommand));
  });

  it('accepts a bucket without a policy and uses the configured signed URL expiry', async () => {
    mockSend.mockImplementation((command: unknown) => {
      if (command instanceof DeleteBucketPolicyCommand) {
        return Promise.reject(Object.assign(new Error('No policy'), { name: 'NoSuchBucketPolicy' }));
      }
      return Promise.resolve(undefined);
    });
    const service = new StorageService(config({ S3_PRESIGNED_URL_EXPIRES_IN_SECONDS: '42' }));

    await expect(service.onModuleInit()).resolves.toBeUndefined();
    await expect(service.getPresignedUrl('account/document.pdf')).resolves.toBe('https://storage.invalid/signed');
    expect(jest.mocked(getSignedUrl)).toHaveBeenCalledWith(expect.anything(), expect.anything(), { expiresIn: 42 });
  });

  it('signs browser downloads with the public endpoint instead of the container endpoint', async () => {
    const service = new StorageService(
      config({
        S3_ENDPOINT: 'http://minio:9000',
        S3_PUBLIC_ENDPOINT: 'https://files.lia.example.com',
      }),
    );

    await service.getPresignedUrl('account/document.pdf');

    expect(jest.mocked(S3Client)).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ endpoint: 'http://minio:9000' }),
    );
    expect(jest.mocked(S3Client)).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ endpoint: 'https://files.lia.example.com' }),
    );
    expect(jest.mocked(getSignedUrl)).toHaveBeenCalledWith(
      expect.objectContaining({ send: mockSend }),
      expect.anything(),
      { expiresIn: 3600 },
    );
  });
});

function config(values: Record<string, string> = {}): ConfigService {
  return {
    get: jest.fn((key: string, defaultValue: unknown) => values[key] ?? defaultValue),
  } as unknown as ConfigService;
}
