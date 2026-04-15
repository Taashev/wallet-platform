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

import { plainToInstance } from 'class-transformer';

import { CurrentUser } from '../../shared/decorators/current-user';
import { OffsetPaginationDto } from '../../shared/pagination/offset-pagination.dto';
import { ResponseUserDto } from '../auth/dto/response-user.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

import { ChangePasswordDto } from './dto/change-password.dto';
import { UserFilterDto } from './dto/get-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { CurrentUserType } from './types/user.type';
import { ChangePasswordUseCase } from './usecases/change-password.usecase';
import { DeleteCurrentUserUseCase } from './usecases/delete-current-user.usecase';
import { GetCurrentUserUseCase } from './usecases/get-current-user.usecase';
import { GetUsersUseCase } from './usecases/get-users.usecase';
import { UpdateCurrentUserUseCase } from './usecases/update-current-user.usecase';

@Controller({ version: '1', path: 'users' })
export class UsersController {
  constructor(
    private getCurrentUserUseCase: GetCurrentUserUseCase,
    private getUsersUseCase: GetUsersUseCase,
    private deleteCurrentUserUseCase: DeleteCurrentUserUseCase,
    private updateCurrentUserUseCase: UpdateCurrentUserUseCase,
    private changePasswordUseCase: ChangePasswordUseCase,
  ) {}

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

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessGuard)
  @Delete('/me')
  async softDeleteUser(@CurrentUser() currentUser: CurrentUserType) {
    await this.deleteCurrentUserUseCase.execute(currentUser);
  }

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
