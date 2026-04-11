import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

import { Response } from 'express';

import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { AppError } from '../../../shared/errors';
import { APP_ERROR_TYPE } from '../../../shared/errors/type';

@Catch(AppError)
export class AppExceptionFilter implements ExceptionFilter<AppError> {
  catch(exception: AppError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const statusCode = exception.expose
      ? this.getStatusCode(exception)
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const clientMessage = exception.expose
      ? exception.safeMessage
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

    const clientBody: Record<string, unknown> = {
      statusCode,
      message: clientMessage,
    };

    if (exception.expose && exception.details) {
      clientBody.details = exception.details;
    }

    console.log(exception);

    response.status(statusCode).json(clientBody);
  }

  private getStatusCode(exception: AppError) {
    switch (exception.type) {
      case APP_ERROR_TYPE.validation:
        return HttpStatus.BAD_REQUEST;
      case APP_ERROR_TYPE.not_found:
        return HttpStatus.NOT_FOUND;
      case APP_ERROR_TYPE.conflict:
        return HttpStatus.CONFLICT;
      case APP_ERROR_TYPE.unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case APP_ERROR_TYPE.forbidden:
        return HttpStatus.FORBIDDEN;
      case APP_ERROR_TYPE.unavailable:
        return HttpStatus.SERVICE_UNAVAILABLE;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
