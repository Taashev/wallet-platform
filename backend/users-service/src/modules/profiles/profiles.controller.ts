import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { plainToInstance } from 'class-transformer';

import { ERROR_MESSAGES } from '../../shared/constants/messages.error';
import { CurrentUser } from '../../shared/decorators/current-user';
import { OffsetPaginationDto } from '../../shared/pagination/offset-pagination.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import type { CurrentUserType } from '../users/types/user.type';

import { ActiveProfilesQueryDto } from './dto/active-profiles-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileFilterDto } from './dto/get-profile-query.dto';
import { ProfileListResponseDto } from './dto/profile-list-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordUseCase } from './usecases/change-password.usecase';
import { DeleteCurrentUserUseCase } from './usecases/delete-current-user.usecase';
import { FindActiveProfilesUseCase } from './usecases/find-active-profiles.usecase';
import { GetCurrentProfileUseCase } from './usecases/get-current-profile.usecase';
import { GetProfilesUseCase } from './usecases/get-profiles.usecase';
import { UpdateCurrentUserUseCase } from './usecases/update-current-user.usecase';

@ApiTags('Profiles')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: ERROR_MESSAGES.INVALID_ACCESS_TOKEN,
})
@Controller({ path: 'profiles', version: '1' })
export class ProfilesController {
  constructor(
    private findActiveProfilesUseCase: FindActiveProfilesUseCase,
    private getCurrentProfileUseCase: GetCurrentProfileUseCase,
    private getProfilesUseCase: GetProfilesUseCase,
    private updateCurrentUserUseCase: UpdateCurrentUserUseCase,
    private changePasswordUseCase: ChangePasswordUseCase,
    private deleteCurrentUserUseCase: DeleteCurrentUserUseCase,
  ) {}

  @ApiOperation({ summary: 'Получить профиль авторизованного пользователя' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse({ description: ERROR_MESSAGES.USER_NOT_FOUND })
  @UseGuards(JwtAccessGuard)
  @Get('/me')
  async getCurrentProfile(@CurrentUser() currentUser: CurrentUserType) {
    const profile = await this.getCurrentProfileUseCase.execute(
      currentUser.userId,
    );

    return plainToInstance(ProfileResponseDto, profile, {
      groups: ['private'],
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'username', required: false, type: String })
  @ApiOkResponse({ type: ProfileListResponseDto })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  @Get()
  async getProfiles(
    @Query() offsetPaginationDto: OffsetPaginationDto,
    @Query() filter: ProfileFilterDto,
  ) {
    const { profiles, count } = await this.getProfilesUseCase.execute(
      filter,
      offsetPaginationDto,
    );

    const sanitizedProfiles = plainToInstance(ProfileResponseDto, profiles, {
      excludeExtraneousValues: true,
      groups: ['public'],
    });

    return { users: sanitizedProfiles, total: count };
  }

  @ApiOperation({ summary: 'Получить список активных профилей' })
  @ApiOkResponse({ type: [ProfileResponseDto] })
  @UseGuards(JwtAccessGuard)
  @Get('active')
  async getActiveProfiles(@Query() query: ActiveProfilesQueryDto) {
    const profiles = await this.findActiveProfilesUseCase.execute(
      query.minAge,
      query.maxAge,
      query,
    );

    return plainToInstance(ProfileResponseDto, profiles, {
      excludeExtraneousValues: true,
      groups: ['public'],
    });
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

  @ApiOperation({ summary: 'Мягкое удаление текущего пользователя' })
  @ApiNoContentResponse({ description: 'Пользователь удален' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessGuard)
  @Delete('/me')
  async softDeleteUser(@CurrentUser() currentUser: CurrentUserType) {
    await this.deleteCurrentUserUseCase.execute(currentUser);
  }
}
