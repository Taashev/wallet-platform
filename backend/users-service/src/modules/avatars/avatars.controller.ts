import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../shared/decorators/current-user';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import type { CurrentUserType } from '../users/types/user.type';

import { CreateAvatarUploadUrlDto } from './dto/upload-url.dto';
import { GetUploadAvatarUrlUseCase } from './usecases/upload-avatar.usecase';

@Controller({ path: 'avatars', version: '1' })
export class AvatarsController {
  constructor(private getUploadAvatarUrlUseCase: GetUploadAvatarUrlUseCase) {}

  @UseGuards(JwtAccessGuard)
  @Post('/upload-url')
  async upload(
    @CurrentUser() user: CurrentUserType,
    @Body() params: CreateAvatarUploadUrlDto,
  ) {
    return await this.getUploadAvatarUrlUseCase.execute(
      user.userId,
      params.contentType,
    );
  }
}
