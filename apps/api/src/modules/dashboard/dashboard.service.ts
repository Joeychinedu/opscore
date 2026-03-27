import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(orgId: string) {
    const now = new Date();

    // Start of current week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    // End of current week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Start and end of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalClients,
      activeProjects,
      tasksDueThisWeek,
      revenueResult,
      tasksByStatusRaw,
      invoiceCounts,
      recentActivity,
      upcomingTasks,
    ] = await Promise.all([
      // Total clients
      this.prisma.client.count({ where: { orgId } }),

      // Active projects
      this.prisma.project.count({ where: { orgId, status: 'ACTIVE' } }),

      // Tasks due this week (not DONE)
      this.prisma.task.count({
        where: {
          orgId,
          status: { not: 'DONE' },
          dueDate: { gte: now, lte: endOfWeek },
        },
      }),

      // Revenue this month (sum of PAID invoice line items where issueDate is in current month)
      this.prisma.invoiceLineItem.aggregate({
        _sum: { amount: true },
        where: {
          invoice: {
            orgId,
            status: 'PAID',
            issueDate: { gte: startOfMonth, lte: endOfMonth },
          },
        },
      }),

      // Tasks grouped by status
      this.prisma.task.groupBy({
        by: ['status'],
        where: { orgId },
        _count: { status: true },
      }),

      // Invoices grouped by status
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: { orgId },
        _count: { status: true },
      }),

      // Recent activity (latest 10)
      this.prisma.activityLog.findMany({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),

      // Upcoming tasks (next 5 due, not DONE)
      this.prisma.task.findMany({
        where: {
          orgId,
          status: { not: 'DONE' },
          dueDate: { gte: now },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true } },
          project: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Build tasksByStatus object
    const tasksByStatus: Record<string, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };
    for (const row of tasksByStatusRaw) {
      tasksByStatus[row.status] = row._count.status;
    }

    // Build invoiceSummary object
    const invoiceSummary: Record<string, number> = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
    };
    for (const row of invoiceCounts) {
      const key = row.status.toLowerCase();
      if (key in invoiceSummary) {
        invoiceSummary[key] = row._count.status;
      }
    }

    const revenueThisMonth = Number(revenueResult._sum.amount ?? 0);

    return {
      totalClients,
      activeProjects,
      tasksDueThisWeek,
      revenueThisMonth,
      tasksByStatus,
      invoiceSummary,
      recentActivity,
      upcomingTasks,
    };
  }
}
