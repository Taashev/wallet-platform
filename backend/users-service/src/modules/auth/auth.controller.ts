import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ERROR_MESSAGES } from '../../shared/constants/messages.error';
import { CurrentUser } from '../../shared/decorators/current-user';
import type { CurrentUserType } from '../users/types/user.type';

import { AuthLocalDto } from './dto/auth-local.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { RefreshTokenUseCase } from './usecases/refresh-token.usecase';
import { SigninUseCase } from './usecases/signin.usecase';
import { SignoutUseCase } from './usecases/signout.usecase';
import { SignupUseCase } from './usecases/signup.usecase';

@ApiTags('Auth')
@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private signupUseCase: SignupUseCase,
    private signinUseCase: SigninUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private signoutUseCase: SignoutUseCase,
  ) {}

  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiHeader({
    name: 'User-Agent',
    required: false,
  })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiConflictResponse({
    description: ERROR_MESSAGES.DATABASE_UNIQUE_VIOLATION,
  })
  @Post('/signup')
  async createUser(
    @Headers('User-Agent') userAgent: string | undefined,
    @Body() createUserDto: CreateUserDto,
  ) {
    const { accessToken, refreshToken } = await this.signupUseCase.execute(
      createUserDto,
      userAgent,
    );

    return { accessToken, refreshToken };
  }

  @ApiOperation({ summary: 'Авторизация с помощью username и password' })
  @ApiHeader({
    name: 'User-Agent',
    required: false,
  })
  @ApiBody({ type: AuthLocalDto })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiUnauthorizedResponse()
  @Post('/signin')
  async authLocal(
    @Headers('User-Agent') userAgent: string | undefined,
    @Body() authLocalDto: AuthLocalDto,
  ) {
    const { accessToken, refreshToken } = await this.signinUseCase.execute(
      authLocalDto,
      userAgent,
    );

    return { accessToken, refreshToken };
  }

  @ApiOperation({ summary: 'Обновить access и refresh токены' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiUnauthorizedResponse()
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokenUseCase.execute(refreshTokenDto);
  }

  @ApiOperation({ summary: 'Выйти из сессии текущего пользователя' })
  @ApiBearerAuth('bearer')
  @ApiNoContentResponse({ description: 'Пользователь вышел из системы' })
  @ApiUnauthorizedResponse({
    description: 'Токен доступа отсутствует или недействителен.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessGuard)
  @Post('/signout')
  async signout(@CurrentUser() currentUser: CurrentUserType) {
    return await this.signoutUseCase.execute(currentUser);
  }
}
