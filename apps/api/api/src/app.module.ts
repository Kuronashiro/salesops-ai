import { Module } from '@nestjs/common';
import { TransactionModule } from './transaction/transaction.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { AuditService } from './audit/audit.service';
import { PrismaModule } from './prisma/prisma.module'; // 🔥 TAMBAH INI
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './audit/audit.interceptor';
import { AuditController } from './audit/audit.controller'
import { AuditModule } from './audit/audit.module'

@Module({
  imports: [
  TransactionModule,
  AnalyticsModule,
  AuthModule,
  PrismaModule,
  AuditModule,
],
  providers: [
  AuditService,
  {
    provide: APP_INTERCEPTOR,
    useClass: AuditInterceptor,
  },
],
})
export class AppModule {}