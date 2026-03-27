import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { InvoicesService } from './invoices.service.js';
import { InvoicePdfService } from './invoice-pdf.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateInvoiceDto } from './dto/update-invoice.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { CurrentOrg } from '../../common/decorators/current-org.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly invoicePdfService: InvoicePdfService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  findAll(
    @CurrentOrg('id') orgId: string,
    @Query() query: PaginationDto & { status?: string; clientId?: string },
  ) {
    return this.invoicesService.findAll(orgId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  create(@CurrentOrg('id') orgId: string, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(orgId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  findById(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.invoicesService.findById(id, orgId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  update(
    @Param('id') id: string,
    @CurrentOrg('id') orgId: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(id, orgId, dto);
  }

  @Post(':id/send')
  @UseGuards(JwtAuthGuard, TenantGuard)
  send(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.invoicesService.send(id, orgId);
  }

  @Post(':id/mark-paid')
  @UseGuards(JwtAuthGuard, TenantGuard)
  markPaid(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.invoicesService.markPaid(id, orgId);
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async downloadPdf(
    @Param('id') id: string,
    @CurrentOrg('id') orgId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.invoicePdfService.generatePdf(id, orgId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
