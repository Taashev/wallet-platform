import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import { CurrentUser } from '../../shared/decorators/current-user';
import { OffsetPaginationDto } from '../../shared/pagination/offset-pagination.dto';
import { ResponseUserDto } from '../auth/dto/response-user.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

import { UserFilterDto } from './dto/get-users-query.dto';
import { GetCurrentUserUseCase } from './usecases/get-current-user.usecase';
import { GetUsersUseCase } from './usecases/get-users.usecase';

@Controller({ version: '1', path: 'users' })
export class UsersController {
  constructor(
    private getCurrentUserUseCase: GetCurrentUserUseCase,
    private getUsersUseCase: GetUsersUseCase,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Get('/me')
  async getCurrentUser(@CurrentUser() userId: string) {
    const user = await this.getCurrentUserUseCase.execute(userId);

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
}
