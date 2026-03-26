import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentOrg } from '../../common/decorators/current-org.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('members')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  findAll(@CurrentOrg('id') orgId: string) {
    return this.membershipsService.findAll(orgId);
  }

  @Post('invite')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('ADMIN')
  invite(@CurrentOrg('id') orgId: string, @Body() dto: InviteMemberDto) {
    return this.membershipsService.invite(orgId, dto);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('ADMIN')
  updateRole(
    @Param('id') id: string,
    @CurrentOrg('id') orgId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.membershipsService.updateRole(id, orgId, dto.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.membershipsService.remove(id, orgId);
  }
}
