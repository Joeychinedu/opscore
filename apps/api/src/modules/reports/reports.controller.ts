import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { CurrentOrg } from '../../common/decorators/current-org.decorator.js';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @UseGuards(JwtAuthGuard, TenantGuard)
  getRevenueReport(
    @CurrentOrg('id') orgId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getRevenueReport(orgId, from, to);
  }

  @Get('projects')
  @UseGuards(JwtAuthGuard, TenantGuard)
  getProjectReport(@CurrentOrg('id') orgId: string) {
    return this.reportsService.getProjectReport(orgId);
  }

  @Get('team')
  @UseGuards(JwtAuthGuard, TenantGuard)
  getTeamReport(@CurrentOrg('id') orgId: string) {
    return this.reportsService.getTeamReport(orgId);
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard, TenantGuard)
  getInvoiceReport(@CurrentOrg('id') orgId: string) {
    return this.reportsService.getInvoiceReport(orgId);
  }
}
