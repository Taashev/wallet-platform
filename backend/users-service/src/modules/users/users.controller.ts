import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { plainToInstance } from 'class-transformer';

import { ERROR_MESSAGES } from '../../shared/constants/messages.error';
import { CurrentUser } from '../../shared/decorators/current-user';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { ProfileResponseDto } from '../profiles/dto/profile-response.dto';

import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { CurrentUserType } from './types/user.type';
import { ChangePasswordUseCase } from './usecases/change-password.usecase';
import { DeleteCurrentUserUseCase } from './usecases/delete-current-user.usecase';
import { UpdateCurrentUserUseCase } from './usecases/update-current-user.usecase';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: ERROR_MESSAGES.INVALID_ACCESS_TOKEN,
})
@Controller({ version: '1', path: 'users' })
export class UsersController {
  constructor(
    private deleteCurrentUserUseCase: DeleteCurrentUserUseCase,
    private updateCurrentUserUseCase: UpdateCurrentUserUseCase,
    private changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @ApiOperation({ summary: 'Мягкое удаление текущего пользователя' })
  @ApiNoContentResponse({ description: 'Пользователь удален' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessGuard)
  @Delete('/me')
  async softDeleteUser(@CurrentUser() currentUser: CurrentUserType) {
    await this.deleteCurrentUserUseCase.execute(currentUser);
  }

  @ApiOperation({ summary: 'Обновить текущий профиль пользователя' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @UseGuards(JwtAccessGuard)
  @Patch('/me')
  async changeCurrentUser(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.updateCurrentUserUseCase.execute(
      currentUser.userId,
      updateUserDto,
    );

    const sanitazedUser = plainToInstance(ProfileResponseDto, user, {
      groups: ['private'],
      excludeExtraneousValues: true,
    });

    return sanitazedUser;
  }

  @ApiOperation({ summary: 'Изменить текущий пароль пользователя' })
  @ApiNoContentResponse({ description: 'Пароль изменен' })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessGuard)
  @Patch('/me/password')
  async changePassword(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() passwordDto: ChangePasswordDto,
  ) {
    await this.changePasswordUseCase.execute(
      currentUser,
      passwordDto.oldPassword,
      passwordDto.newPassword,
    );
  }
}
