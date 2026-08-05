import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  const MySQLStore = MySQLStoreFactory(session);
  const sessionStore = new MySQLStore({
    host: configService.getOrThrow<string>('DB_HOST'),
    port: Number(configService.get('DB_PORT') ?? 3306),
    user: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_DATABASE'),
    createDatabaseTable: true,
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000,
  });

  await sessionStore.onReady();

  if (isProduction) {
    app.set('trust proxy', 1);
  }

  app.use(
    session({
      name: 'dashboard.sid',
      secret: configService.getOrThrow<string>('SESSION_SECRET'),
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  app.enableCors({
    origin: configService.getOrThrow<string>('FRONTEND_URL'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(Number(configService.get('PORT') ?? 3000));
}

void bootstrap();
