import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DashboardAuthGuard } from './dashboard-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [DashboardAuthGuard],
  exports: [DashboardAuthGuard],
})
export class AuthModule {}
