import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy for correct IP extraction behind load balancers
  if (process.env.TRUST_PROXY === 'true') {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', true);
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Courier & Logistics Management API')
    .setDescription(
      'Multi-module enterprise backend for international courier operations. ' +
      'Supports multi-branch, RBAC, shipment tracking, invoicing, and accounting.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Health')
    .addTag('Auth')
    .addTag('Branches')
    .addTag('Employees')
    .addTag('Attendance')
    .addTag('Customers')
    .addTag('Inventory')
    .addTag('Shipments')
    .addTag('Manifests')
    .addTag('Services & Tariffs')
    .addTag('Billing / Invoices')
    .addTag('Accounting')
    .addTag('Audit Logs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Courier API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
