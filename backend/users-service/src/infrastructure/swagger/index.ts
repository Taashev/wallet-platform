import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

function buildVersionedSwaggerDocument(
  document: OpenAPIObject,
  version: string,
  serverUrl: string,
): OpenAPIObject {
  const versionPrefix = `/${version}/`;
  const paths = Object.fromEntries(
    Object.entries(document.paths).filter(([path]) =>
      path.startsWith(versionPrefix),
    ),
  );

  return {
    ...document,
    info: {
      ...document.info,
      title: `${document.info.title} ${version.toUpperCase()}`,
    },
    servers: [{ url: serverUrl, description: version }],
    paths,
  };
}

export function buildSwagger(
  baseUrl: string,
  version: string,
  app: INestApplication,
) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Users Service API')
    .setDescription('API документация для users-service')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste access token',
      },
      'bearer',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  const docsPath = `/docs/${version}`;
  const docsUrl = baseUrl + docsPath;
  const apiBaseUrl = baseUrl;

  const versionedSwaggerDocument = buildVersionedSwaggerDocument(
    swaggerDocument,
    version,
    apiBaseUrl,
  );

  SwaggerModule.setup(docsPath, app, versionedSwaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  return docsUrl;
}
