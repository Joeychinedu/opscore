import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service.js';
import { CreateOrgDto } from './dto/create-org.dto.js';
import { UpdateOrgDto } from './dto/update-org.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateOrgDto, @CurrentUser('id') userId: string) {
    return this.organizationsService.create(dto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findUserOrgs(@CurrentUser('id') userId: string) {
    return this.organizationsService.findUserOrgs(userId);
  }

  @Patch(':orgId')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('orgId') orgId: string, @Body() dto: UpdateOrgDto) {
    return this.organizationsService.update(orgId, dto);
  }
}
