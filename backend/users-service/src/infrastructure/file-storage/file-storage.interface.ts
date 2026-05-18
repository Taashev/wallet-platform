import { Readable } from 'node:stream';

export type FileBody = Buffer | Uint8Array | Blob | string | Readable;

export type UploadFileParams = {
  key: string;
  body: FileBody;
  bucket?: string;
  contentType?: string;
  metadata?: Record<string, string>;
};

export type UploadFileResult = {
  bucket: string;
  key: string;
  eTag?: string;
  versionId?: string;
};

export interface PresignedUploadPost {
  url: string;
  fields: Record<string, string>;
}

export interface PresignedUploadPostOptions {
  contentType?: string;
  minFileSizeBytes?: number;
  maxFileSizeBytes?: number;
  expiresInSeconds?: number;
  metadata?: Record<string, string>;
}

export interface IFileStorageService {
  getPresignedUploadPost(
    key: string,
    options?: PresignedUploadPostOptions,
  ): Promise<PresignedUploadPost>;

  checkConnection(bucket?: string): Promise<void>;

  upload(params: UploadFileParams): Promise<UploadFileResult>;
}
