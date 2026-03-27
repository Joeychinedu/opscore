import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentOrg } from '../../common/decorators/current-org.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  getSettings(@CurrentOrg('id') orgId: string) {
    return this.settingsService.getSettings(orgId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('ADMIN')
  updateSettings(
    @CurrentOrg('id') orgId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(orgId, dto);
  }

  @Patch('account')
  @UseGuards(JwtAuthGuard)
  updateAccount(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.settingsService.updateAccount(userId, dto);
  }
}
