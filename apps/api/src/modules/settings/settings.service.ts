import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(orgId: string) {
    const settings = await this.prisma.orgSettings.findUnique({
      where: { orgId },
    });

    if (!settings) {
      // Create default settings if they don't exist
      return this.prisma.orgSettings.create({
        data: { orgId },
      });
    }

    return settings;
  }

  async updateSettings(orgId: string, dto: UpdateSettingsDto) {
    // Upsert to handle case where settings don't exist yet
    return this.prisma.orgSettings.upsert({
      where: { orgId },
      update: dto,
      create: { orgId, ...dto },
    });
  }

  async updateAccount(userId: string, dto: UpdateAccountDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: Record<string, string> = {};

    if (dto.firstName !== undefined) {
      data.firstName = dto.firstName;
    }

    if (dto.lastName !== undefined) {
      data.lastName = dto.lastName;
    }

    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return updated;
  }
}
