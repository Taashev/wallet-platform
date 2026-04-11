import { Controller, Get, UseGuards } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import { ERROR_MESSAGES } from '../../shared/constants/messages.error';
import { CurrentUser } from '../../shared/decorators/current-user';
import { UnauthorizedError } from '../../shared/errors';
import { ResponseUserDto } from '../auth/dto/response-user.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

import { GetUsersUseCase } from './usecases/get-users.usecase';

@Controller({ version: '1', path: 'users' })
export class UsersController {
  constructor(private getUsersUseCase: GetUsersUseCase) {}

  @UseGuards(JwtAccessGuard)
  @Get('/me')
  async profile(@CurrentUser() userId: string) {
    const { users, count } = await this.getUsersUseCase.execute([userId]);

    if (count === 0) {
      throw new UnauthorizedError({
        message:
          'Access token успешно провалидирован, но пользователь не найден',
        safeMessage: ERROR_MESSAGES.INVALID_ACCESS_TOKEN,
        expose: true,
      });
    }

    const sanitazedUser = plainToInstance(ResponseUserDto, users[0], {
      excludeExtraneousValues: true,
    });

    return sanitazedUser;
  }
}
