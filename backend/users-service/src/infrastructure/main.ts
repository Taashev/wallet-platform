import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfigType, ConfigType, CorsConfigType } from './config';
import { AppExceptionFilter } from './http/filters/app-exception.filter';
import { buildSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<ConfigType>>(ConfigService);

  const appConfig = configService.getOrThrow<AppConfigType>('app');

  const corsConfig = configService.getOrThrow<CorsConfigType>('cors');

  if (corsConfig.enabled) {
    app.enableCors({
      origin: corsConfig.origin,
      methods: corsConfig.methods,
      allowedHeaders: corsConfig.allowedHeaders,
      exposedHeaders: corsConfig.exposedHeaders,
      credentials: corsConfig.credentials,
      maxAge: corsConfig.maxAge,
    });
  }

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new AppExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        exposeDefaultValues: true,
        excludeExtraneousValues: true,
      },
    }),
  );

  const baseUrl = `http://${appConfig.host}:${appConfig.port}`;

  const urlSwaggerV1 = buildSwagger(baseUrl, 'v1', app);

  await app.listen(appConfig.port, appConfig.host, () => {
    if (appConfig.isDev) {
      console.table({
        baseUrl,
        docsV1: urlSwaggerV1,
        pid: process.pid,
      });
    }
  });
}
void bootstrap();
