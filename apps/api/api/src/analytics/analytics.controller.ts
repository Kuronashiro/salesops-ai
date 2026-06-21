import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

// 🔐 RBAC IMPORT
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ✅ SUMMARY (PROTECTED)
  @UseGuards(JwtAuthGuard, RolesGuard)
@Get('summary')
@Roles('admin')
getSummary(
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  return this.analyticsService.getSummary(startDate, endDate);
}

  // ✅ SALES BY MONTH (PROTECTED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('sales-by-month')
  getSalesByMonth() {
    return this.analyticsService.getSalesByMonth();
  }

  // ✅ TOP PRODUCTS (PROTECTED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('top-products')
  getTopProducts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('mode') mode: string,
  ) {
    return this.analyticsService.getTopProducts(startDate, endDate, mode);
  }
}