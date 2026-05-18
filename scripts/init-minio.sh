#!/bin/sh
set -eu

mc alias set storage "$MINIO_ENDPOINT" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

mc mb --ignore-existing "storage/$MINIO_BUCKET"

mc version enable "storage/$MINIO_BUCKET"
