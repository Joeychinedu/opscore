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
import { ClientsService } from './clients.service.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentOrg } from '../../common/decorators/current-org.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  findAll(
    @CurrentOrg('id') orgId: string,
    @Query() query: PaginationDto & { search?: string },
  ) {
    return this.clientsService.findAll(orgId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  create(@CurrentOrg('id') orgId: string, @Body() dto: CreateClientDto) {
    return this.clientsService.create(orgId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  findById(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.clientsService.findById(id, orgId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  update(
    @Param('id') id: string,
    @CurrentOrg('id') orgId: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, orgId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.clientsService.remove(id, orgId);
  }

  @Post(':id/notes')
  @UseGuards(JwtAuthGuard, TenantGuard)
  addNote(
    @Param('id') id: string,
    @CurrentOrg('id') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.clientsService.addNote(id, orgId, userId, dto.content);
  }
}
