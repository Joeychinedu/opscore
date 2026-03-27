import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { CurrentOrg } from '../../common/decorators/current-org.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  findAll(
    @CurrentOrg('id') orgId: string,
    @Query() query: PaginationDto & { entity?: string; action?: string },
  ) {
    return this.activityService.findAll(orgId, query);
  }
}
