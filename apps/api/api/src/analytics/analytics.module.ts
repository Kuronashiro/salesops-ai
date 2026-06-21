import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // ✅ ini fix error
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}