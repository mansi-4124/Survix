import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const requestTimeoutMs = Number(process.env.REQUEST_TIMEOUT_MS ?? 15000);
  const safeTimeoutMs =
    Number.isFinite(requestTimeoutMs) && requestTimeoutMs > 0
      ? requestTimeoutMs
      : 15000;

  app.enableCors({ origin: true, credentials: true });

  app.use(cookieParser.default());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor(),
    new TimeoutInterceptor(safeTimeoutMs),
  );

  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
