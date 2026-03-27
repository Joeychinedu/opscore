import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';
import { PaginationDto, paginationMeta } from '../../common/dto/pagination.dto.js';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, query: PaginationDto & { search?: string }) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { orgId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy || 'createdAt']: sortOrder },
        include: {
          _count: {
            select: {
              projects: true,
              invoices: true,
            },
          },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, page, limit) };
  }

  async findById(id: string, orgId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, orgId },
      include: {
        projects: { take: 10, orderBy: { createdAt: 'desc' } },
        invoices: { take: 10, orderBy: { createdAt: 'desc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async create(orgId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        ...dto,
        orgId,
      },
    });
  }

  async update(id: string, orgId: string, dto: UpdateClientDto) {
    const client = await this.prisma.client.findFirst({
      where: { id, orgId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.client.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, orgId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, orgId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.client.delete({ where: { id } });
  }

  async addNote(clientId: string, orgId: string, authorId: string, content: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, orgId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.clientNote.create({
      data: {
        clientId,
        authorId,
        content,
      },
    });
  }
}
