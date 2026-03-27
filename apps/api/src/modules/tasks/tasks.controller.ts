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
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentOrg } from '../../common/decorators/current-org.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  findAll(
    @CurrentOrg('id') orgId: string,
    @Query()
    query: PaginationDto & {
      search?: string;
      projectId?: string;
      assigneeId?: string;
      status?: string;
      priority?: string;
    },
  ) {
    return this.tasksService.findAll(orgId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  create(@CurrentOrg('id') orgId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(orgId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  findById(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.tasksService.findById(id, orgId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  update(
    @Param('id') id: string,
    @CurrentOrg('id') orgId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, orgId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('MANAGER')
  remove(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.tasksService.remove(id, orgId);
  }
}
