import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: false,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('CRUD API')
    .setVersion('1.0.0')
    .setDescription(
      'REST API for Items with PostgreSQL. Create, read, update, and delete items.',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-ui.html', app, document, {
    jsonDocumentUrl: 'api-docs',
  });

  const port = parseInt(process.env.PORT ?? '8081', 10);
  await app.listen(port);
  console.log(`Application is running on http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/swagger-ui.html`);
}

bootstrap();
