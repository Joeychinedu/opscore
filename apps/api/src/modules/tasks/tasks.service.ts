import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { PaginationDto, paginationMeta, parsePagination } from '../../common/dto/pagination.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    orgId: string,
    query: PaginationDto & {
      search?: string;
      projectId?: string;
      assigneeId?: string;
      status?: string;
      priority?: string;
    },
  ) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);
    const { search, projectId, assigneeId, status, priority } = query;

    const where: any = { orgId };

    if (projectId) {
      where.projectId = projectId;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          project: { select: { id: true, name: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, page, limit) };
  }

  async findById(id: string, orgId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, orgId },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        project: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(orgId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        status: dto.status as any,
        priority: dto.priority as any,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        orgId,
      },
    });
  }

  async update(id: string, orgId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id, orgId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const data: any = { ...dto };
    if (dto.dueDate) {
      data.dueDate = new Date(dto.dueDate);
    }

    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, orgId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, orgId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.delete({ where: { id } });
  }
}
