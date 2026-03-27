import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { PaginationDto, paginationMeta, parsePagination } from '../../common/dto/pagination.dto.js';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    orgId: string,
    query: PaginationDto & { entity?: string; action?: string },
  ) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);
    const { entity, action } = query;

    const where: any = { orgId };

    if (entity) {
      where.entity = entity;
    }

    if (action) {
      where.action = action;
    }

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, page, limit) };
  }

  async create(
    orgId: string,
    userId: string,
    data: { action: string; entity: string; entityId: string; metadata?: any },
  ) {
    return this.prisma.activityLog.create({
      data: {
        orgId,
        userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        metadata: data.metadata ?? undefined,
      },
    });
  }
}
