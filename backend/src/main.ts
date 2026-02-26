import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { join } from 'path';
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
    .addTag('Prof Categories', 'Profession categories and subcategories management endpoints')
    .addTag('Prof Feed', 'Professional feed endpoints (personalized feed, timeline, trending, recommendations)')
    .addTag('Prof Notifications', 'Professional notifications endpoints (get, mark as read, preferences)')
    .addTag('Booking Packages', 'Booking packages management endpoints')
    .addTag('Cities Members', 'City members (mayors, council members) management endpoints')
    .addTag('Prof Search', 'Professional search endpoints (global search, professions, users, stats, trends)')
    .addTag('Prof Reports', 'Professional reports endpoints (create, view, update reports for users, posts, comments)')
    .addTag('WebSocket Management', 'WebSocket server process management endpoints (start, stop, status, force-kill)')
    .addTag('Suggestions Claims', 'Suggestions and claims management endpoints (create, view, rate, reply, update)')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  
  // Load custom Swagger CSS and JS
  // Try src folder first (development), then dist folder (production)
  const cssPathDev = join(process.cwd(), 'src', 'common', 'swagger', 'swagger-custom.css');
  const jsPathDev = join(process.cwd(), 'src', 'common', 'swagger', 'swagger-custom.js');
  const cssPath = join(process.cwd(), 'dist', 'src', 'common', 'swagger', 'swagger-custom.css');
  const jsPath = join(process.cwd(), 'dist', 'src', 'common', 'swagger', 'swagger-custom.js');
  
  let customCss: string = '';
  let customJs: string = '';
  
  try {
    // Try development path first
    customCss = readFileSync(cssPathDev, 'utf8');
    customJs = readFileSync(jsPathDev, 'utf8');
    logger.log('✅ Loaded Swagger custom files from src directory');
  } catch (devError) {
    try {
      // Fallback to production path
      customCss = readFileSync(cssPath, 'utf8');
      customJs = readFileSync(jsPath, 'utf8');
      logger.log('✅ Loaded Swagger custom files from dist directory');
    } catch (prodError) {
      logger.warn('⚠️  Could not load Swagger custom files. Tag filter and search will not be available.');
      logger.warn(`   Tried: ${cssPathDev}`);
      logger.warn(`   Tried: ${cssPath}`);
    }
  }

  const swaggerSetupOptions: any = {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  };

  // Only add custom CSS/JS if they were loaded successfully
  if (customCss) {
    swaggerSetupOptions.customCss = customCss;
  }
  if (customJs) {
    swaggerSetupOptions.customJs = customJs;
  }

  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, swaggerSetupOptions);

  // Start server
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  logger.log(`🚀 Application running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`📦 Environment: ${configService.get<string>('app.nodeEnv')}`);
}

bootstrap();
