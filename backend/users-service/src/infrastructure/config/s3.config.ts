import z from 'zod';

import {
  DEFAULT_S3_FORCE_PATH_STYLE,
  DEFAULT_S3_REGION,
} from '../../shared/constants/config-default-values';

const envBooleanSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  if (['true', '1', 'yes'].includes(value.toLowerCase())) {
    return true;
  }

  if (['false', '0', 'no'].includes(value.toLowerCase())) {
    return false;
  }

  return value;
}, z.boolean());

export const s3EnvSchema = z.object({
  S3_URL: z.string().url(),
  S3_REGION: z.string().default(DEFAULT_S3_REGION),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_FORCE_PATH_STYLE: envBooleanSchema.default(DEFAULT_S3_FORCE_PATH_STYLE),
  S3_UPLOAD_PRESIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive(),
  S3_AVATAR_MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive(),
});

export type S3Env = z.infer<typeof s3EnvSchema>;

export type S3ConfigType = {
  endpoint: S3Env['S3_URL'];
  region: S3Env['S3_REGION'];
  accessKeyId: S3Env['S3_ACCESS_KEY'];
  secretAccessKey: S3Env['S3_SECRET_KEY'];
  bucket: S3Env['S3_BUCKET'];
  forcePathStyle: S3Env['S3_FORCE_PATH_STYLE'];
  uploadPresignedUrlTtlSeconds: S3Env['S3_UPLOAD_PRESIGNED_URL_TTL_SECONDS'];
  avatarMaxFileSizeBytes: S3Env['S3_AVATAR_MAX_FILE_SIZE_BYTES'];
};
