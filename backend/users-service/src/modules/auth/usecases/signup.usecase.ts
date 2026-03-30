import { Inject, Injectable } from '@nestjs/common';

import { SessionsService } from '../../sessions/sessions.service';
import type { UsersRepository } from '../../users/interfaces/repository.interface';
import { USERS_REPOSITORY } from '../../users/users.keys';
import { CreateUserDto } from '../dto/create-user.dto';
import { PasswordService } from '../services/password.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
    private sessionsService: SessionsService,
    private tokenService: TokenService,
    private passwordService: PasswordService,
  ) {}

  async execute(createUserDto: CreateUserDto, userAgent: string | undefined) {
    const passwordHash = await this.passwordService.hash(
      createUserDto.password,
    );

    const userId = crypto.randomUUID();

    const sessionId = this.sessionsService.generateSessionId();

    const { accessToken, refreshToken } = this.tokenService.createAuthTokens({
      userId,
      sessionId,
    });

    const user = await this.usersRepository.create({
      userId,
      username: createUserDto.username,
      email: createUserDto.email,
      password: passwordHash,
      about: createUserDto.about,
      dateOfBirth: createUserDto.dateOfBirth,
    });

    await this.sessionsService.create({
      sessionId,
      refreshToken,
      userId: user.userId,
      userAgent,
    });

    return { user, accessToken, refreshToken };
  }
}
