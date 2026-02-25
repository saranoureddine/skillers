import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global API prefix
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Skillers CMS API')
    .setDescription('Enterprise CMS API for Skillers application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token',
        name: 'Authorization',
        description: 'Enter your authentication token (from login/register response)',
        in: 'header',
      },
      'Token-auth',
    )
    .addTag('Users', 'User management endpoints')
    .addTag('User Blocks', 'User blocking and unblocking endpoints')
    .addTag('Addresses', 'User addresses management endpoints')
    .addTag('Voice Calls', 'Voice and video call management endpoints')
    .addTag('Administration Terms', 'Administration terms management endpoints')
    .addTag('Ag Tables Schema', 'Tables schema and permissions management endpoints')
    .addTag('Ag Permissions', 'Permissions management endpoints')
    .addTag('Prof Posts', 'Professional posts and comments management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Start server
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  logger.log(`🚀 Application running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`📦 Environment: ${configService.get<string>('app.nodeEnv')}`);
}

bootstrap();
