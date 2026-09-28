import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createSwaggerAuthMiddleware } from './core/swagger/swagger-auth.middleware';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Behind exactly one proxy (nginx), which sets X-Forwarded-For. Without
  // this, req.ip is nginx's container address, so session IPs and the
  // device location on Active Devices were wrong. Safe to trust one hop:
  // the api container is only `expose`d (no published port) in
  // docker-compose.yaml, so every request comes through nginx.
  app.set('trust proxy', 1);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away any properties not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra properties are sent
      transform: true, // Automatically transforms payloads to DTO instances
    }),
  );

  // Enable CORS so React Native frontend can talk to it!
  app.enableCors();

  // Swagger docs protected by HTTP Basic Auth for QA testing and development
  const enableSwagger =
    process.env.ENABLE_SWAGGER === 'true' ||
    process.env.NODE_ENV !== 'production' ||
    Boolean(process.env.SWAGGER_PASSWORD);

  if (enableSwagger && process.env.ENABLE_SWAGGER !== 'false') {
    app.use(createSwaggerAuthMiddleware());

    const config = new DocumentBuilder()
      .setTitle('Buyootna API')
      .setDescription('Buyootna backend REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .addServer(`http://localhost:${process.env.PORT ?? 8000}`, 'Local')
      .addServer('https://api.buyootna.cloud', 'Production')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT ?? 8000, () => {
    console.log('App running on port:', process.env.PORT ?? 8000);
  });
}
bootstrap().catch((err) => {
  console.error('Failed to start NestJS application:', err);
  process.exit(1);
});
