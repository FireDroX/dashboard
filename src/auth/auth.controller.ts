import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @Get('session')
  getSession(@Req() request: Request) {
    return {
      authenticated: request.session.isAuthenticated === true,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() request: Request) {
    const dashboardPassword =
      this.configService.getOrThrow<string>('DASHBOARD_PASSWORD');

    if (dto.password !== dashboardPassword) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    await regenerateSession(request);
    request.session.isAuthenticated = true;
    await saveSession(request);

    return {
      authenticated: true,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await destroySession(request);
    response.clearCookie('dashboard.sid');

    return {
      authenticated: false,
    };
  }
}

function regenerateSession(request: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    request.session.regenerate((error) => {
      if (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        return;
      }

      resolve();
    });
  });
}

function saveSession(request: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    request.session.save((error) => {
      if (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        return;
      }

      resolve();
    });
  });
}

function destroySession(request: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    request.session.destroy((error) => {
      if (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        return;
      }

      resolve();
    });
  });
}
