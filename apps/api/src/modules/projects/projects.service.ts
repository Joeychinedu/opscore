import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { PaginationDto, paginationMeta, parsePagination } from '../../common/dto/pagination.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    orgId: string,
    query: PaginationDto & { search?: string; status?: string; clientId?: string },
  ) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);
    const { search, status, clientId } = query;

    const where: any = { orgId };

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: { select: { id: true, name: true } },
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, page, limit) };
  }

  async findById(id: string, orgId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, orgId },
      include: {
        client: true,
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        members: true,
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async create(orgId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status as any,
        clientId: dto.clientId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        budget: dto.budget,
        orgId,
      },
    });
  }

  async update(id: string, orgId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findFirst({
      where: { id, orgId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const data: any = { ...dto };
    if (dto.startDate) {
      data.startDate = new Date(dto.startDate);
    }
    if (dto.dueDate) {
      data.dueDate = new Date(dto.dueDate);
    }

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, orgId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, orgId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.project.delete({ where: { id } });
  }

  async addMember(projectId: string, orgId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, orgId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId,
      },
    });
  }

  async removeMember(projectId: string, orgId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, orgId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }
}
