import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  createPresignedPost,
  PresignedPostOptions,
} from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { ValidationError } from '../../shared/errors';
import type { ConfigType, S3ConfigType } from '../config';

import type {
  DeleteFileResult,
  FileMetadata,
  GetFileResult,
  IFileStorageService,
  PresignedDownloadUrlOptions,
  PresignedUploadPostOptions,
  UploadFileParams,
  UploadFileResult,
} from './file-storage.interface';
import { S3_CLIENT } from './file-storage.keys';

type TransformableBody = {
  transformToByteArray(): Promise<Uint8Array>;
};

@Injectable()
export class FileStorageService implements IFileStorageService {
  private readonly defaultBucket: string;

  constructor(
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    private readonly config: ConfigService<ConfigType>,
  ) {
    const s3Config = this.config.getOrThrow<S3ConfigType>('s3');

    this.defaultBucket = s3Config.bucket;
  }

  async checkConnection(bucket = this.defaultBucket): Promise<void> {
    await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
  }

  async getPresignedUploadPost(
    key: string,
    options: PresignedUploadPostOptions = {},
  ) {
    const {
      minFileSizeBytes = 0,
      maxFileSizeBytes,
      contentType,
      expiresInSeconds,
      metadata,
    } = options;

    const presignedPostOptions: PresignedPostOptions = {
      Bucket: this.defaultBucket,
      Key: key,
      Fields: {},
      Conditions: [],
      Expires: expiresInSeconds,
    };

    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        const metadataField = `x-amz-meta-${key}`;

        presignedPostOptions.Fields![metadataField] = value;

        presignedPostOptions.Conditions?.push([
          'eq',
          `$${metadataField}`,
          value,
        ]);
      }
    }

    if (contentType) {
      presignedPostOptions.Fields!['Content-Type'] = contentType;

      presignedPostOptions.Conditions?.push([
        'eq',
        '$Content-Type',
        contentType,
      ]);
    }

    if (maxFileSizeBytes) {
      presignedPostOptions.Conditions?.push([
        'content-length-range',
        minFileSizeBytes,
        maxFileSizeBytes,
      ]);
    }

    return await createPresignedPost(this.s3Client, presignedPostOptions);
  }

  async getPresignedDownloadUrl(
    key: string,
    options: PresignedDownloadUrlOptions = {},
  ): Promise<string> {
    if (!key.trim()) {
      throw new ValidationError({ message: 'Требуется ключ файла' });
    }

    const { expiresInSeconds } = options;

    const command = new GetObjectCommand({
      Bucket: this.defaultBucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  async upload(params: UploadFileParams): Promise<UploadFileResult> {
    if (!params.key.trim()) {
      throw new ValidationError({ message: 'Требуется ключ файла' });
    }

    const bucket = params.bucket ?? this.defaultBucket;

    const response = await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        Metadata: params.metadata,
      }),
    );

    return {
      bucket,
      key: params.key,
      eTag: response.ETag,
      versionId: response.VersionId,
    };
  }

  async delete(
    key: string,
    bucket = this.defaultBucket,
  ): Promise<DeleteFileResult> {
    if (!key.trim()) {
      throw new ValidationError({ message: 'Требуется ключ файла' });
    }

    const response = await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    return {
      bucket,
      key,
      versionId: response.VersionId,
    };
  }

  async getMetadata(key: string): Promise<FileMetadata> {
    const response = await this.s3Client.send(
      new HeadObjectCommand({ Bucket: this.defaultBucket, Key: key }),
    );

    return {
      contentLength: response.ContentLength,
      contentType: response.ContentType,
      eTag: response.ETag,
      metadata: response.Metadata,
    };
  }

  async getFile(
    key: string,
    bucket = this.defaultBucket,
  ): Promise<GetFileResult> {
    if (!key.trim()) {
      throw new ValidationError({ message: 'Требуется ключ файла' });
    }

    const response = await this.s3Client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );

    return {
      bucket,
      key,
      body: await this.toBuffer(response.Body),
      contentLength: response.ContentLength,
      contentType: response.ContentType,
      eTag: response.ETag,
      metadata: response.Metadata,
    };
  }

  private async toBuffer(
    body: GetObjectCommandOutput['Body'],
  ): Promise<Buffer> {
    if (!body) {
      throw new ValidationError({ message: 'Тело файла пусто' });
    }

    if (this.hasTransformToByteArray(body)) {
      return Buffer.from(await body.transformToByteArray());
    }

    throw new ValidationError({ message: 'Неподдерживаемый тип файла' });
  }

  // type guard - безопасно проверяет что у обьекта есть метод transformToByteArray
  private hasTransformToByteArray(body: unknown): body is TransformableBody {
    return (
      typeof body === 'object' &&
      body !== null &&
      'transformToByteArray' in body &&
      typeof (body as Partial<TransformableBody>).transformToByteArray ===
        'function'
    );
  }
}
