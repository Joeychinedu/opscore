import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoicePdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePdf(invoiceId: string, orgId: string): Promise<Buffer> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, orgId },
      include: {
        client: true,
        project: true,
        lineItems: true,
        org: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const subtotal = invoice.lineItems.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );
    const taxRate = invoice.taxRate ? Number(invoice.taxRate) : 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('INVOICE', 50, 50);

      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Invoice No: ${invoice.invoiceNo}`, 50, 90)
        .text(`Status: ${invoice.status}`, 50, 108)
        .text(
          `Issue Date: ${invoice.issueDate.toLocaleDateString()}`,
          50,
          126,
        )
        .text(
          `Due Date: ${invoice.dueDate.toLocaleDateString()}`,
          50,
          144,
        );

      // From (Org)
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('From', 350, 90);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(invoice.org.name, 350, 108);

      // Bill To
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Bill To', 50, 185);

      let billToY = 205;
      doc.fontSize(10).font('Helvetica');
      doc.text(invoice.client.name, 50, billToY);
      billToY += 16;
      if (invoice.client.email) {
        doc.text(invoice.client.email, 50, billToY);
        billToY += 16;
      }
      if (invoice.client.address) {
        doc.text(invoice.client.address, 50, billToY);
        billToY += 16;
      }

      if (invoice.project) {
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(`Project: ${invoice.project.name}`, 350, 205);
      }

      // Line items table
      const tableTop = Math.max(billToY + 30, 280);

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Description', 50, tableTop);
      doc.text('Qty', 300, tableTop, { width: 60, align: 'right' });
      doc.text('Unit Price', 370, tableTop, { width: 80, align: 'right' });
      doc.text('Amount', 460, tableTop, { width: 80, align: 'right' });

      // Header line
      doc
        .moveTo(50, tableTop + 16)
        .lineTo(540, tableTop + 16)
        .stroke();

      // Table rows
      let rowY = tableTop + 24;
      doc.font('Helvetica').fontSize(10);

      for (const item of invoice.lineItems) {
        doc.text(item.description, 50, rowY, { width: 240 });
        doc.text(String(Number(item.quantity)), 300, rowY, {
          width: 60,
          align: 'right',
        });
        doc.text(Number(item.unitPrice).toFixed(2), 370, rowY, {
          width: 80,
          align: 'right',
        });
        doc.text(Number(item.amount).toFixed(2), 460, rowY, {
          width: 80,
          align: 'right',
        });
        rowY += 20;
      }

      // Separator
      doc.moveTo(50, rowY + 4).lineTo(540, rowY + 4).stroke();

      // Subtotal, Tax, Total
      rowY += 16;
      doc.font('Helvetica').fontSize(10);
      doc.text('Subtotal:', 370, rowY, { width: 80, align: 'right' });
      doc.text(subtotal.toFixed(2), 460, rowY, {
        width: 80,
        align: 'right',
      });

      if (taxRate > 0) {
        rowY += 18;
        doc.text(`Tax (${taxRate}%):`, 370, rowY, {
          width: 80,
          align: 'right',
        });
        doc.text(taxAmount.toFixed(2), 460, rowY, {
          width: 80,
          align: 'right',
        });
      }

      rowY += 18;
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('Total:', 370, rowY, { width: 80, align: 'right' });
      doc.text(total.toFixed(2), 460, rowY, {
        width: 80,
        align: 'right',
      });

      // Notes
      if (invoice.notes) {
        rowY += 40;
        doc.font('Helvetica-Bold').fontSize(11).text('Notes', 50, rowY);
        rowY += 18;
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(invoice.notes, 50, rowY, { width: 490 });
      }

      doc.end();
    });
  }
}
