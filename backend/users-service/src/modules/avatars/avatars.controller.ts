import {
  Controller,
  Delete,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  Param,
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
import { DeleteAvatarParamsDto } from './dto/delete-avatar.dto';
import { DeleteAvatarUseCase } from './usecases/delete-avatar.usecase';
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
  constructor(
    private uploadAvatarUseCase: UploadAvatarUseCase,
    private deleteAvatarUseCase: DeleteAvatarUseCase,
  ) {}

  @UseGuards(JwtAccessGuard)
  @UseInterceptors(avatarUploadInterceptor)
  @Post()
  upload(
    @CurrentUser() user: CurrentUserType,
    @UploadedFile(createAvatarFilePipe()) file: Express.Multer.File,
  ) {
    return this.uploadAvatarUseCase.execute(user.userId, file);
  }

  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':avatarId')
  async delete(
    @CurrentUser() currentUser: CurrentUserType,
    @Param() params: DeleteAvatarParamsDto,
  ) {
    return await this.deleteAvatarUseCase.execute(
      params.avatarId,
      currentUser.userId,
    );
  }
}
