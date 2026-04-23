import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { Observable } from 'rxjs';

import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { UnauthorizedError } from '../../../shared/errors';
import { TokenService } from '../../security/token.service';

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
      throw new UnauthorizedError({
        message: 'Отсутствует заголовок Authorization',
        expose: true,
      });
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedError({
        message: 'Невалидный тип авторизации',
        expose: true,
      });
    }

    if (token === undefined) {
      throw new UnauthorizedError({
        message: ERROR_MESSAGES.INVALID_ACCESS_TOKEN,
        expose: true,
      });
    }

    try {
      const { sessionId, userId } =
        this.tokenService.validateAccessToken(token);

      request.user = {
        sessionId,
        userId,
      };

      return true;
    } catch {
      throw new UnauthorizedError({
        message: ERROR_MESSAGES.INVALID_ACCESS_TOKEN,
        expose: true,
      });
    }
  }
}
