import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  createPresignedPost,
  PresignedPostOptions,
} from '@aws-sdk/s3-presigned-post';

import type { ConfigType, S3ConfigType } from '../config';

import type {
  IFileStorageService,
  PresignedUploadPostOptions,
  UploadFileParams,
  UploadFileResult,
} from './file-storage.interface';
import { S3_CLIENT } from './file-storage.keys';

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
    options: PresignedUploadPostOptions,
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
      Key: `tmp/${key}`,
      Fields: {},
      Conditions: [],
      Expires: expiresInSeconds,
    };

    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        const metadataField = `X-Amz-Meta-${key}`;

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

  async upload(params: UploadFileParams): Promise<UploadFileResult> {
    if (!params.key.trim()) {
      throw new BadRequestException('File key is required');
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
}
