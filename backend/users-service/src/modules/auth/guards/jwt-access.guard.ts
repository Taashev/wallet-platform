import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { Observable } from 'rxjs';

import { TokenService } from '../services/token.service';

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const httpContext = context.switchToHttp();

    const request = httpContext.getRequest<Request>();

    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Отсутствует заголовок Authorization');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedException('Невалидный тип авторизации');
    }

    if (token === undefined) {
      throw new UnauthorizedException('Невалидный токен авторизации');
    }

    try {
      const { userId } = this.tokenService.validateAccessToken(token);

      request.userId = userId;

      return true;
    } catch {
      throw new UnauthorizedException('Невалидный токен авторизации');
    }
  }
}
