import {
  Controller,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../shared/decorators/current-user';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import type { CurrentUserType } from '../users/types/user.type';

import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_SIZE_BYTES,
} from './constants/avatar-constants';
import { UploadAvatarUseCase } from './usecases/upload-avatar.usecase';

const avatarUploadInterceptor = FileInterceptor('file', {
  limits: { fileSize: AVATAR_MAX_SIZE_BYTES },
});

function createAvatarFilePipe() {
  return new ParseFilePipe({
    fileIsRequired: true,
    validators: [
      new FileTypeValidator({
        fileType: new RegExp(`^(${AVATAR_ALLOWED_MIME_TYPES.join('|')})$`),
      }),
    ],
  });
}

@Controller({ path: 'avatars', version: '1' })
export class AvatarsController {
  constructor(private readonly uploadAvatarUseCase: UploadAvatarUseCase) {}

  @UseGuards(JwtAccessGuard)
  @UseInterceptors(avatarUploadInterceptor)
  @Post()
  upload(
    @CurrentUser() user: CurrentUserType,
    @UploadedFile(createAvatarFilePipe()) file: Express.Multer.File,
  ) {
    return this.uploadAvatarUseCase.execute(user.userId, file);
  }
}
