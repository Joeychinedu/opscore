import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { CreateOrgDto } from './dto/create-org.dto.js';
import { UpdateOrgDto } from './dto/update-org.dto.js';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrgDto, userId: string) {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('An organization with this slug already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          logoUrl: dto.logoUrl,
        },
      });

      await tx.membership.create({
        data: {
          userId,
          orgId: org.id,
          role: 'OWNER',
        },
      });

      await tx.orgSettings.create({
        data: {
          orgId: org.id,
        },
      });

      return org;
    });
  }

  async findUserOrgs(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        memberships: { some: { userId } },
      },
      include: {
        _count: {
          select: {
            memberships: true,
            projects: true,
          },
        },
      },
    });
  }

  async update(orgId: string, dto: UpdateOrgDto) {
    if (dto.slug) {
      const existing = await this.prisma.organization.findUnique({
        where: { slug: dto.slug },
      });

      if (existing && existing.id !== orgId) {
        throw new ConflictException('An organization with this slug already exists');
      }
    }

    return this.prisma.organization.update({
      where: { id: orgId },
      data: dto,
    });
  }

  async findById(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            memberships: true,
            projects: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }
}
