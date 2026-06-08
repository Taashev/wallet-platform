import { ValidationError } from '../../../shared/errors';
import { CURRENT_DEFAULT_VALUE, STATUS_DEFAULT_VALUE } from '../avatars.rules';
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_SIZE_BYTES,
  AVATAR_STATUSES,
} from '../constants/avatar-constants';
import {
  AvatarMimeType,
  AvatarStatus,
  CreateAvatar,
  RestoreAvatar,
} from '../types/avatar.type';

export class AvatarEntity {
  readonly avatarId: string;
  private readonly _storageKey: string;
  private readonly _originalName: string;
  private readonly _mimeType: string | null;
  private readonly _sizeBytes: number | null;
  private readonly _userId: string;
  private _current: boolean;
  private _status: AvatarStatus;

  private constructor(props: RestoreAvatar) {
    this.avatarId = props.avatarId;
    this._storageKey = props.storageKey;
    this._originalName = props.originalName;
    this._mimeType = props.mimeType;
    this._sizeBytes = props.sizeBytes;
    this._userId = props.userId;
    this._current = props.current;
    this._status = props.status;
  }

  get storageKey() {
    return this._storageKey;
  }

  get originalName() {
    return this._originalName;
  }

  get mimeType() {
    return this._mimeType;
  }

  get sizeBytes() {
    return this._sizeBytes;
  }

  get userId() {
    return this._userId;
  }

  get current() {
    return this._current;
  }

  get status() {
    return this._status;
  }

  static validateNotEmpty(value: string, fieldName: string) {
    if (!value.trim().length) {
      throw new ValidationError({
        message: `${fieldName} не может быть пустой строкой`,
        expose: true,
      });
    }
  }

  static validateMimeType(mimeType: string) {
    this.validateNotEmpty(mimeType, 'mimeType');

    if (!AVATAR_ALLOWED_MIME_TYPES.includes(mimeType as AvatarMimeType)) {
      throw new ValidationError({
        message: 'Неразрешенный mime type',
        expose: true,
      });
    }
  }

  static validateSizeBytes(sizeBytes: number) {
    if (!Number.isInteger(sizeBytes) || sizeBytes < 1) {
      throw new ValidationError({
        message: 'sizeBytes должен быть положительным целым числом',
        expose: true,
      });
    }

    if (sizeBytes > AVATAR_MAX_SIZE_BYTES) {
      throw new ValidationError({
        message: 'Слишком большой файл',
        expose: true,
      });
    }
  }

  static validateStatus(status: AvatarStatus) {
    if (!Object.values(AVATAR_STATUSES).includes(status)) {
      throw new ValidationError({
        message: 'Невалидный статус аватара',
        expose: true,
      });
    }
  }

  static create(createProps: CreateAvatar) {
    this.validateNotEmpty(createProps.avatarId, 'avatarId');
    this.validateNotEmpty(createProps.storageKey, 'storageKey');
    this.validateNotEmpty(createProps.userId, 'userId');

    if (createProps.sizeBytes !== undefined && createProps.sizeBytes !== null) {
      this.validateSizeBytes(createProps.sizeBytes);
    }

    if (createProps.mimeType !== undefined && createProps.mimeType !== null) {
      this.validateMimeType(createProps.mimeType);
    }

    const status = createProps.status ?? STATUS_DEFAULT_VALUE;

    this.validateStatus(status);

    return new AvatarEntity({
      avatarId: createProps.avatarId,
      storageKey: createProps.storageKey,
      originalName: createProps.originalName,
      current: createProps.current ?? CURRENT_DEFAULT_VALUE,
      status,
      mimeType: createProps.mimeType ?? null,
      sizeBytes: createProps.sizeBytes ?? null,
      userId: createProps.userId,
    });
  }

  static restore(restoreProps: RestoreAvatar) {
    return new AvatarEntity(restoreProps);
  }
}
