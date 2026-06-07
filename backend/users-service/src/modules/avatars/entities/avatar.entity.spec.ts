import { ValidationError } from '../../../shared/errors';
import { CURRENT_DEFAULT_VALUE, STATUS_DEFAULT_VALUE } from '../avatars.rules';

import { AvatarEntity } from './avatar.entity';

describe('Avatar domain entity', () => {
  const createProps = {
    avatarId: '1e9d26d1-c76c-4a81-8d37-b2a6f796fa30',
    storageKey: 'tmp/avatars/1e9d26d1-c76c-4a81-8d37-b2a6f796fa30',
    originalName: 'avatar.png',
    mimeType: 'image/png',
    sizeBytes: 1024,
    userId: 'b7a1e0c9-3f9a-4f80-a2ff-82c0d1f1d001',
  };

  it('создает аватар с дефолтными current и status', () => {
    const avatar = AvatarEntity.create(createProps);

    expect(avatar.avatarId).toBe(createProps.avatarId);
    expect(avatar.storageKey).toBe(createProps.storageKey);
    expect(avatar.originalName).toBe(createProps.originalName);
    expect(avatar.mimeType).toBe(createProps.mimeType);
    expect(avatar.sizeBytes).toBe(createProps.sizeBytes);
    expect(avatar.userId).toBe(createProps.userId);
    expect(avatar.current).toBe(CURRENT_DEFAULT_VALUE);
    expect(avatar.status).toBe(STATUS_DEFAULT_VALUE);
  });

  it('выбрасывает ValidationError, если storageKey пустой', () => {
    expect(() =>
      AvatarEntity.create({
        ...createProps,
        storageKey: ' ',
      }),
    ).toThrow(ValidationError);
  });

  it('выбрасывает ValidationError, если mimeType запрещен', () => {
    expect(() =>
      AvatarEntity.create({
        ...createProps,
        mimeType: 'image/gif',
      }),
    ).toThrow(ValidationError);
  });

  it('выбрасывает ValidationError, если размер файла невалидный', () => {
    expect(() =>
      AvatarEntity.create({
        ...createProps,
        sizeBytes: 0,
      }),
    ).toThrow(ValidationError);
  });
});
