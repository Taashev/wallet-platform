import { Inject, Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { PasswordService } from '../../security/password.service';
import { TokenService } from '../../security/token.service';
import { SessionsService } from '../../sessions/sessions.service';
import { USERS_REPOSITORY } from '../../users/constants/users.keys';
import type { UsersRepository } from '../../users/interfaces/users-repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
    private sessionsService: SessionsService,
    private tokenService: TokenService,
    private passwordService: PasswordService,
    private transactionServie: TransactionService,
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

    return await this.transactionServie.run(async () => {
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

      return { accessToken, refreshToken };
    });
  }
}
