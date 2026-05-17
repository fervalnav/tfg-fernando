import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const httpLogger = new Logger('HTTP');
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      httpLogger.log(`${req.method} ${req.originalUrl} → ${res.statusCode}`);
    });
    next();
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3001',
    credentials: true,
  });

  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder().setTitle('TFG API').setVersion('1.0').addBearerAuth().build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  Logger.log(`API running on http://localhost:${port}/api`);
}

void bootstrap();
