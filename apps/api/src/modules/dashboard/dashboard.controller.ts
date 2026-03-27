import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { CurrentOrg } from '../../common/decorators/current-org.decorator.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  getMetrics(@CurrentOrg('id') orgId: string) {
    return this.dashboardService.getMetrics(orgId);
  }
}
