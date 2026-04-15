import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfigType, ConfigType } from './config';
import { AppExceptionFilter } from './http/filters/app-exception.filter';
import { buildSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new AppExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { exposeDefaultValues: true },
    }),
  );

  const configService = app.get<ConfigService<ConfigType>>(ConfigService);

  const appConfig = configService.getOrThrow<AppConfigType>('app');

  const baseUrl = `http://${appConfig.APP_HOST}:${appConfig.APP_PORT}`;

  const urlSwaggerV1 = buildSwagger(baseUrl, 'v1', app);

  await app.listen(appConfig.APP_PORT, appConfig.APP_HOST, () => {
    console.table({
      host: appConfig.APP_HOST,
      port: appConfig.APP_PORT,
      docsV1: urlSwaggerV1,
      pid: process.pid,
    });
  });
}
void bootstrap();
