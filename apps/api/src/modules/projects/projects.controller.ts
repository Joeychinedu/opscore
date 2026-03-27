import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentOrg } from '../../common/decorators/current-org.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  findAll(
    @CurrentOrg('id') orgId: string,
    @Query() query: PaginationDto & { search?: string; status?: string; clientId?: string },
  ) {
    return this.projectsService.findAll(orgId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  create(@CurrentOrg('id') orgId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(orgId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  findById(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.projectsService.findById(id, orgId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  update(
    @Param('id') id: string,
    @CurrentOrg('id') orgId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, orgId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.projectsService.remove(id, orgId);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard, TenantGuard)
  addMember(
    @Param('id') id: string,
    @CurrentOrg('id') orgId: string,
    @Body('userId') userId: string,
  ) {
    return this.projectsService.addMember(id, orgId, userId);
  }

  @Delete(':id/members/:uid')
  @UseGuards(JwtAuthGuard, TenantGuard)
  removeMember(
    @Param('id') id: string,
    @CurrentOrg('id') orgId: string,
    @Param('uid') uid: string,
  ) {
    return this.projectsService.removeMember(id, orgId, uid);
  }
}
