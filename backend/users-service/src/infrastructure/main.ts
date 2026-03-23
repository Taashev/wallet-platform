import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfigType, ConfigType } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const configService = app.get<ConfigService<ConfigType>>(ConfigService);

  const appConfig = configService.getOrThrow<AppConfigType>('app');

  await app.listen(appConfig.APP_PORT, appConfig.APP_HOST, () => {
    console.table({
      host: appConfig.APP_HOST,
      port: appConfig.APP_PORT,
      pid: process.pid,
    });
  });
}
bootstrap();
