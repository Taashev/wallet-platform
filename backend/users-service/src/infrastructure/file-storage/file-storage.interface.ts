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

export type DeleteFileResult = {
  bucket: string;
  key: string;
  versionId?: string;
};

export type GetFileResult = FileMetadata & {
  bucket: string;
  key: string;
  body: Buffer;
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

export type FileMetadata = {
  contentLength?: number;
  contentType?: string;
  eTag?: string;
  metadata?: Record<string, string>;
};

export interface IFileStorageService {
  getPresignedUploadPost(
    key: string,
    options?: PresignedUploadPostOptions,
  ): Promise<PresignedUploadPost>;

  checkConnection(bucket?: string): Promise<void>;

  getMetadata(key: string): Promise<FileMetadata>;

  getFile(key: string, bucket?: string): Promise<GetFileResult>;

  upload(params: UploadFileParams): Promise<UploadFileResult>;

  delete(key: string, bucket?: string): Promise<DeleteFileResult>;
}
