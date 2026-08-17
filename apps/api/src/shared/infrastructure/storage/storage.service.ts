import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  DeleteBucketPolicyCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly s3: S3Client;
  private readonly publicS3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly presignedUrlExpiresInSeconds: number;
  private readonly logger = new Logger(StorageService.name);

  constructor(config: ConfigService) {
    this.endpoint = config.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    const publicEndpoint = config.get<string>('S3_PUBLIC_ENDPOINT', this.endpoint);
    this.bucket = config.get<string>('S3_BUCKET', 'tfg-files');
    const configuredExpiry = Number(config.get<string | number>('S3_PRESIGNED_URL_EXPIRES_IN_SECONDS', 3600));
    this.presignedUrlExpiresInSeconds =
      Number.isInteger(configuredExpiry) && configuredExpiry > 0 ? configuredExpiry : 3600;

    const clientOptions = {
      region: config.get<string>('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get<string>('S3_ACCESS_KEY_ID', 'tfg_user'),
        secretAccessKey: config.get<string>('S3_SECRET_ACCESS_KEY', 'tfg_password'),
      },
      forcePathStyle: config.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true',
    };

    this.s3 = new S3Client({ ...clientOptions, endpoint: this.endpoint });
    this.publicS3 =
      publicEndpoint === this.endpoint ? this.s3 : new S3Client({ ...clientOptions, endpoint: publicEndpoint });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket "${this.bucket}" created`);
    }

    try {
      await this.s3.send(new DeleteBucketPolicyCommand({ Bucket: this.bucket }));
      this.logger.log(`Public bucket policy removed from "${this.bucket}"`);
    } catch (error) {
      if (!(error instanceof Error) || error.name !== 'NoSuchBucketPolicy') throw error;
    }
  }

  async upload(params: { key: string; body: Buffer; contentType: string }): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );
    return `${this.endpoint}/${this.bucket}/${params.key}`;
  }

  async getPresignedUrl(key: string, expiresInSeconds = this.presignedUrlExpiresInSeconds): Promise<string> {
    return getSignedUrl(this.publicS3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }

  async download(key: string): Promise<Buffer> {
    const result = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!result.Body) throw new Error(`Storage object "${key}" has no body`);
    return Buffer.from(await result.Body.transformToByteArray());
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
