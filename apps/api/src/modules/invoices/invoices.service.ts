import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateInvoiceDto } from './dto/update-invoice.dto.js';
import { PaginationDto, paginationMeta, parsePagination } from '../../common/dto/pagination.dto.js';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    orgId: string,
    query: PaginationDto & { status?: string; clientId?: string },
  ) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);
    const { status, clientId } = query;

    const where: any = { orgId };

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: { select: { id: true, name: true } },
          lineItems: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const invoicesWithTotal = data.map((invoice) => ({
      ...invoice,
      total: invoice.lineItems.reduce(
        (sum, item) => sum + Number(item.amount),
        0,
      ),
    }));

    return { data: invoicesWithTotal, meta: paginationMeta(total, page, limit) };
  }

  async findById(id: string, orgId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, orgId },
      include: {
        client: true,
        project: true,
        lineItems: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return {
      ...invoice,
      total: invoice.lineItems.reduce(
        (sum, item) => sum + Number(item.amount),
        0,
      ),
    };
  }

  async create(orgId: string, dto: CreateInvoiceDto) {
    const invoiceNo = await this.generateInvoiceNo(orgId);

    const lineItemsData = dto.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice,
    }));

    const invoice = await this.prisma.invoice.create({
      data: {
        orgId,
        invoiceNo,
        clientId: dto.clientId,
        projectId: dto.projectId,
        dueDate: new Date(dto.dueDate),
        taxRate: dto.taxRate ?? null,
        notes: dto.notes,
        lineItems: {
          create: lineItemsData,
        },
      },
      include: {
        client: true,
        project: true,
        lineItems: true,
      },
    });

    return {
      ...invoice,
      total: invoice.lineItems.reduce(
        (sum, item) => sum + Number(item.amount),
        0,
      ),
    };
  }

  async update(id: string, orgId: string, dto: UpdateInvoiceDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, orgId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only DRAFT invoices can be updated',
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...(dto.clientId && { clientId: dto.clientId }),
        ...(dto.projectId !== undefined && { projectId: dto.projectId }),
        ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
        ...(dto.taxRate !== undefined && {
          taxRate: dto.taxRate ?? null,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        client: true,
        project: true,
        lineItems: true,
      },
    });
  }

  async send(id: string, orgId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, orgId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only DRAFT invoices can be sent',
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'SENT' },
      include: { client: true, project: true, lineItems: true },
    });
  }

  async markPaid(id: string, orgId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, orgId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== 'SENT' && invoice.status !== 'OVERDUE') {
      throw new BadRequestException(
        'Only SENT or OVERDUE invoices can be marked as paid',
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'PAID' },
      include: { client: true, project: true, lineItems: true },
    });
  }

  private async generateInvoiceNo(orgId: string): Promise<string> {
    const settings = await this.prisma.orgSettings.findUnique({
      where: { orgId },
    });

    const prefix = settings?.invoicePrefix || 'INV';
    const year = new Date().getFullYear();

    const count = await this.prisma.invoice.count({
      where: {
        orgId,
        invoiceNo: { startsWith: `${prefix}-${year}-` },
      },
    });

    const seq = String(count + 1).padStart(3, '0');
    return `${prefix}-${year}-${seq}`;
  }
}
