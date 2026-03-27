import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueReport(orgId: string, from?: string, to?: string) {
    const now = new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const toDate = to ? new Date(to) : now;

    // Get all PAID invoices in range with their line items
    const paidInvoices = await this.prisma.invoice.findMany({
      where: {
        orgId,
        status: 'PAID',
        issueDate: { gte: fromDate, lte: toDate },
      },
      include: {
        lineItems: { select: { amount: true } },
      },
      orderBy: { issueDate: 'asc' },
    });

    // Group revenue by month
    const monthlyMap = new Map<string, number>();
    let totalRevenue = 0;

    for (const invoice of paidInvoices) {
      const invoiceTotal = invoice.lineItems.reduce(
        (sum, item) => sum + Number(item.amount),
        0,
      );
      totalRevenue += invoiceTotal;

      const date = new Date(invoice.issueDate);
      const monthKey = date.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + invoiceTotal);
    }

    const monthly = Array.from(monthlyMap.entries()).map(
      ([month, revenue]) => ({
        month,
        revenue,
      }),
    );

    const monthCount = monthly.length || 1;

    return {
      monthly,
      totalRevenue,
      averagePerMonth: totalRevenue / monthCount,
      paidInvoiceCount: paidInvoices.length,
    };
  }

  async getProjectReport(orgId: string) {
    // Count projects by status
    const statusCounts = await this.prisma.project.groupBy({
      by: ['status'],
      where: { orgId },
      _count: { status: true },
    });

    const projectsByStatus: Record<string, number> = {};
    for (const row of statusCounts) {
      projectsByStatus[row.status] = row._count.status;
    }

    // All projects with task counts
    const projects = await this.prisma.project.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        status: true,
        _count: { select: { tasks: true } },
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Average tasks per project
    const totalTasks = projects.reduce((sum, p) => sum + p._count.tasks, 0);
    const averageTasksPerProject =
      projects.length > 0 ? totalTasks / projects.length : 0;

    // Projects with completion percentage
    const projectsWithCompletion = projects.map((p) => {
      const total = p._count.tasks;
      const done = p.tasks.filter((t) => t.status === 'DONE').length;
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        totalTasks: total,
        completedTasks: done,
        completionPercentage: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });

    // Top 5 projects by task count
    const topByTaskCount = [...projectsWithCompletion]
      .sort((a, b) => b.totalTasks - a.totalTasks)
      .slice(0, 5);

    return {
      projectsByStatus,
      averageTasksPerProject,
      projects: projectsWithCompletion,
      topByTaskCount,
    };
  }

  async getTeamReport(orgId: string) {
    // Get all members of the org
    const memberships = await this.prisma.membership.findMany({
      where: { orgId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // For each member, get task stats
    const teamStats = await Promise.all(
      memberships.map(async (m) => {
        const [assigned, completed, inProgress] = await Promise.all([
          this.prisma.task.count({
            where: { orgId, assigneeId: m.user.id },
          }),
          this.prisma.task.count({
            where: { orgId, assigneeId: m.user.id, status: 'DONE' },
          }),
          this.prisma.task.count({
            where: { orgId, assigneeId: m.user.id, status: 'IN_PROGRESS' },
          }),
        ]);

        return {
          user: m.user,
          role: m.role,
          tasksAssigned: assigned,
          tasksCompleted: completed,
          tasksInProgress: inProgress,
        };
      }),
    );

    // Sort by tasks completed desc
    teamStats.sort((a, b) => b.tasksCompleted - a.tasksCompleted);

    return teamStats;
  }

  async getInvoiceReport(orgId: string) {
    const [invoiceCounts, allInvoices, recentInvoices] = await Promise.all([
      // Count by status
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: { orgId },
        _count: { status: true },
      }),

      // All invoices for amount calculations (SENT, OVERDUE, PAID)
      this.prisma.invoice.findMany({
        where: {
          orgId,
          status: { in: ['SENT', 'OVERDUE', 'PAID'] },
        },
        include: {
          lineItems: { select: { amount: true } },
        },
      }),

      // Recent invoices
      this.prisma.invoice.findMany({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          client: { select: { id: true, name: true } },
          lineItems: { select: { amount: true } },
        },
      }),
    ]);

    // Count by status
    const countByStatus: Record<string, number> = {};
    for (const row of invoiceCounts) {
      countByStatus[row.status.toLowerCase()] = row._count.status;
    }

    // Calculate totals
    let totalOutstanding = 0;
    let totalOverdue = 0;
    let totalPaidDays = 0;
    let paidCount = 0;
    const now = new Date();

    for (const invoice of allInvoices) {
      const invoiceTotal = invoice.lineItems.reduce(
        (sum, item) => sum + Number(item.amount),
        0,
      );

      if (invoice.status === 'SENT' || invoice.status === 'OVERDUE') {
        totalOutstanding += invoiceTotal;
      }

      if (invoice.status === 'OVERDUE') {
        totalOverdue += invoiceTotal;
      }

      if (invoice.status === 'PAID') {
        // Approximate days to payment using issueDate
        const issueDate = new Date(invoice.issueDate);
        const diffMs = now.getTime() - issueDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        totalPaidDays += diffDays;
        paidCount++;
      }
    }

    const averageDaysToPayment =
      paidCount > 0 ? Math.round(totalPaidDays / paidCount) : 0;

    // Format recent invoices with amounts
    const recent = recentInvoices.map((inv) => ({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      status: inv.status,
      client: inv.client,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      amount: inv.lineItems.reduce(
        (sum, item) => sum + Number(item.amount),
        0,
      ),
    }));

    return {
      totalOutstanding,
      totalOverdue,
      countByStatus,
      averageDaysToPayment,
      recentInvoices: recent,
    };
  }
}
