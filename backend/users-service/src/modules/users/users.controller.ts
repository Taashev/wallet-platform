import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
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
import { ResponseUserDto } from '../auth/dto/response-user.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

import { ChangePasswordDto } from './dto/change-password.dto';
import { UserFilterDto } from './dto/get-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersListResponseDto } from './dto/users-list-response.dto';
import type { CurrentUserType } from './types/user.type';
import { ChangePasswordUseCase } from './usecases/change-password.usecase';
import { DeleteCurrentUserUseCase } from './usecases/delete-current-user.usecase';
import { GetCurrentUserUseCase } from './usecases/get-current-user.usecase';
import { GetUsersUseCase } from './usecases/get-users.usecase';
import { UpdateCurrentUserUseCase } from './usecases/update-current-user.usecase';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: ERROR_MESSAGES.INVALID_ACCESS_TOKEN,
})
@Controller({ version: '1', path: 'users' })
export class UsersController {
  constructor(
    private getCurrentUserUseCase: GetCurrentUserUseCase,
    private getUsersUseCase: GetUsersUseCase,
    private deleteCurrentUserUseCase: DeleteCurrentUserUseCase,
    private updateCurrentUserUseCase: UpdateCurrentUserUseCase,
    private changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @ApiOperation({ summary: 'Получить профиль авторизованного пользователя' })
  @ApiOkResponse({ type: ResponseUserDto })
  @ApiNotFoundResponse({ description: ERROR_MESSAGES.USER_NOT_FOUND })
  @UseGuards(JwtAccessGuard)
  @Get('/me')
  async getCurrentUser(@CurrentUser() currentUser: CurrentUserType) {
    const user = await this.getCurrentUserUseCase.execute(currentUser.userId);

    const sanitazedUser = plainToInstance(ResponseUserDto, user, {
      groups: ['private'],
      excludeExtraneousValues: true,
    });

    return sanitazedUser;
  }

  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'username', required: false, type: String })
  @ApiOkResponse({ type: UsersListResponseDto })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  @Post()
  async getUsers(
    @Query() offsetPaginationDto: OffsetPaginationDto,
    @Query() filter: UserFilterDto,
  ) {
    const { users, count } = await this.getUsersUseCase.execute(
      filter,
      offsetPaginationDto,
    );

    const sanitaziedUsers = plainToInstance(ResponseUserDto, users, {
      excludeExtraneousValues: true,
      groups: ['public'],
    });

    return { users: sanitaziedUsers, total: count };
  }

  @ApiOperation({ summary: 'Мягкое удаление текущего пользователя' })
  @ApiNoContentResponse({ description: 'Пользователь удален' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessGuard)
  @Delete('/me')
  async softDeleteUser(@CurrentUser() currentUser: CurrentUserType) {
    await this.deleteCurrentUserUseCase.execute(currentUser);
  }

  @ApiOperation({ summary: 'Обновить текущий профиль пользователя' })
  @ApiOkResponse({ type: ResponseUserDto })
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

    const sanitazedUser = plainToInstance(ResponseUserDto, user, {
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
