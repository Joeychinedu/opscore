import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------
  const passwordHash = await bcrypt.hash('password123', 12);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@opscore.dev' },
    update: {},
    create: {
      id: 'seed-user-demo',
      email: 'demo@opscore.dev',
      passwordHash,
      firstName: 'Demo',
      lastName: 'User',
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@opscore.dev' },
    update: {},
    create: {
      id: 'seed-user-alice',
      email: 'alice@opscore.dev',
      passwordHash,
      firstName: 'Alice',
      lastName: 'Chen',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@opscore.dev' },
    update: {},
    create: {
      id: 'seed-user-bob',
      email: 'bob@opscore.dev',
      passwordHash,
      firstName: 'Bob',
      lastName: 'Martinez',
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: 'carol@opscore.dev' },
    update: {},
    create: {
      id: 'seed-user-carol',
      email: 'carol@opscore.dev',
      passwordHash,
      firstName: 'Carol',
      lastName: 'Smith',
    },
  });

  console.log('  Users created');

  // ---------------------------------------------------------------------------
  // Organizations
  // ---------------------------------------------------------------------------
  const acme = await prisma.organization.upsert({
    where: { slug: 'acme-agency' },
    update: {},
    create: {
      id: 'seed-org-acme',
      name: 'Acme Agency',
      slug: 'acme-agency',
    },
  });

  const nova = await prisma.organization.upsert({
    where: { slug: 'nova-studio' },
    update: {},
    create: {
      id: 'seed-org-nova',
      name: 'Nova Studio',
      slug: 'nova-studio',
    },
  });

  console.log('  Organizations created');

  // ---------------------------------------------------------------------------
  // Org Settings
  // ---------------------------------------------------------------------------
  await prisma.orgSettings.upsert({
    where: { orgId: acme.id },
    update: {},
    create: {
      id: 'seed-settings-acme',
      orgId: acme.id,
      invoicePrefix: 'ACM',
      currency: 'USD',
      timezone: 'America/New_York',
    },
  });

  await prisma.orgSettings.upsert({
    where: { orgId: nova.id },
    update: {},
    create: {
      id: 'seed-settings-nova',
      orgId: nova.id,
      invoicePrefix: 'NVA',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
    },
  });

  console.log('  Org settings created');

  // ---------------------------------------------------------------------------
  // Memberships
  // ---------------------------------------------------------------------------
  const membershipData = [
    { id: 'seed-mem-demo-acme', userId: demo.id, orgId: acme.id, role: 'OWNER' as const },
    { id: 'seed-mem-alice-acme', userId: alice.id, orgId: acme.id, role: 'ADMIN' as const },
    { id: 'seed-mem-bob-acme', userId: bob.id, orgId: acme.id, role: 'MEMBER' as const },
    { id: 'seed-mem-alice-nova', userId: alice.id, orgId: nova.id, role: 'MEMBER' as const },
    { id: 'seed-mem-carol-nova', userId: carol.id, orgId: nova.id, role: 'OWNER' as const },
  ];

  for (const m of membershipData) {
    await prisma.membership.upsert({
      where: { userId_orgId: { userId: m.userId, orgId: m.orgId } },
      update: {},
      create: m,
    });
  }

  console.log('  Memberships created');

  // ---------------------------------------------------------------------------
  // Clients
  // ---------------------------------------------------------------------------
  const globetech = await prisma.client.upsert({
    where: { id: 'seed-client-globetech' },
    update: {},
    create: {
      id: 'seed-client-globetech',
      orgId: acme.id,
      name: 'Globetech Industries',
      email: 'contact@globetech.io',
      company: 'Globetech Industries',
    },
  });

  const brightpath = await prisma.client.upsert({
    where: { id: 'seed-client-brightpath' },
    update: {},
    create: {
      id: 'seed-client-brightpath',
      orgId: acme.id,
      name: 'Brightpath Education',
      email: 'hello@brightpath.edu',
      company: 'Brightpath Education',
    },
  });

  const urbannest = await prisma.client.upsert({
    where: { id: 'seed-client-urbannest' },
    update: {},
    create: {
      id: 'seed-client-urbannest',
      orgId: acme.id,
      name: 'UrbanNest Realty',
      email: 'ops@urbannest.com',
      company: 'UrbanNest Realty',
    },
  });

  await prisma.client.upsert({
    where: { id: 'seed-client-solara' },
    update: {},
    create: {
      id: 'seed-client-solara',
      orgId: nova.id,
      name: 'Solara Wellness',
      email: 'info@solara.co',
      company: 'Solara Wellness',
    },
  });

  console.log('  Clients created');

  // ---------------------------------------------------------------------------
  // Projects
  // ---------------------------------------------------------------------------
  const websiteProject = await prisma.project.upsert({
    where: { id: 'seed-project-website' },
    update: {},
    create: {
      id: 'seed-project-website',
      orgId: acme.id,
      name: 'Globetech Website Redesign',
      description: 'Complete redesign of the Globetech corporate website with modern UI/UX.',
      status: 'ACTIVE',
      clientId: globetech.id,
      startDate: new Date('2026-01-15'),
      dueDate: new Date('2026-04-30'),
      budget: 45000,
    },
  });

  const appProject = await prisma.project.upsert({
    where: { id: 'seed-project-app' },
    update: {},
    create: {
      id: 'seed-project-app',
      orgId: acme.id,
      name: 'Brightpath Mobile App',
      description: 'Native mobile application for the Brightpath e-learning platform.',
      status: 'ACTIVE',
      clientId: brightpath.id,
      startDate: new Date('2026-02-01'),
      dueDate: new Date('2026-08-31'),
      budget: 120000,
    },
  });

  const brandingProject = await prisma.project.upsert({
    where: { id: 'seed-project-branding' },
    update: {},
    create: {
      id: 'seed-project-branding',
      orgId: acme.id,
      name: 'UrbanNest Brand Identity',
      description: 'Full brand identity package including logo, colors, and guidelines.',
      status: 'COMPLETED',
      clientId: urbannest.id,
      startDate: new Date('2025-10-01'),
      dueDate: new Date('2025-12-31'),
      budget: 15000,
    },
  });

  console.log('  Projects created');

  // ---------------------------------------------------------------------------
  // Project Members
  // ---------------------------------------------------------------------------
  const projectMemberData = [
    { id: 'seed-pm-demo-website', projectId: websiteProject.id, userId: demo.id },
    { id: 'seed-pm-alice-website', projectId: websiteProject.id, userId: alice.id },
    { id: 'seed-pm-bob-website', projectId: websiteProject.id, userId: bob.id },
    { id: 'seed-pm-demo-app', projectId: appProject.id, userId: demo.id },
    { id: 'seed-pm-alice-app', projectId: appProject.id, userId: alice.id },
    { id: 'seed-pm-bob-app', projectId: appProject.id, userId: bob.id },
  ];

  for (const pm of projectMemberData) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: pm.projectId, userId: pm.userId } },
      update: {},
      create: pm,
    });
  }

  console.log('  Project members assigned');

  // ---------------------------------------------------------------------------
  // Tasks
  // ---------------------------------------------------------------------------
  const tasksData = [
    // Website project tasks
    {
      id: 'seed-task-1',
      orgId: acme.id,
      projectId: websiteProject.id,
      title: 'Design homepage wireframes',
      status: 'DONE' as const,
      priority: 'HIGH' as const,
      assigneeId: alice.id,
    },
    {
      id: 'seed-task-2',
      orgId: acme.id,
      projectId: websiteProject.id,
      title: 'Implement responsive navigation',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      assigneeId: bob.id,
    },
    {
      id: 'seed-task-3',
      orgId: acme.id,
      projectId: websiteProject.id,
      title: 'Set up CMS integration',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      assigneeId: demo.id,
    },
    {
      id: 'seed-task-4',
      orgId: acme.id,
      projectId: websiteProject.id,
      title: 'Performance optimization audit',
      status: 'TODO' as const,
      priority: 'LOW' as const,
      assigneeId: null,
    },
    // App project tasks
    {
      id: 'seed-task-5',
      orgId: acme.id,
      projectId: appProject.id,
      title: 'Design onboarding flow',
      status: 'IN_REVIEW' as const,
      priority: 'URGENT' as const,
      assigneeId: alice.id,
    },
    {
      id: 'seed-task-6',
      orgId: acme.id,
      projectId: appProject.id,
      title: 'Build authentication screens',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      assigneeId: bob.id,
    },
    {
      id: 'seed-task-7',
      orgId: acme.id,
      projectId: appProject.id,
      title: 'API endpoint for lesson content',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      assigneeId: demo.id,
    },
    {
      id: 'seed-task-8',
      orgId: acme.id,
      projectId: appProject.id,
      title: 'Push notification integration',
      status: 'TODO' as const,
      priority: 'LOW' as const,
      assigneeId: null,
    },
  ];

  for (const t of tasksData) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }

  console.log('  Tasks created');

  // ---------------------------------------------------------------------------
  // Invoices
  // ---------------------------------------------------------------------------

  // Invoice 1: ACM-2026-001 — Globetech, Website, PAID, $13,000
  await prisma.invoice.upsert({
    where: { id: 'seed-invoice-001' },
    update: {},
    create: {
      id: 'seed-invoice-001',
      orgId: acme.id,
      invoiceNo: 'ACM-2026-001',
      clientId: globetech.id,
      projectId: websiteProject.id,
      status: 'PAID',
      issueDate: new Date('2026-01-20'),
      dueDate: new Date('2026-02-20'),
      notes: 'Phase 1 — Discovery & wireframes',
      lineItems: {
        create: [
          {
            id: 'seed-li-001a',
            description: 'UX Research & Discovery',
            quantity: 40,
            unitPrice: 175,
            amount: 7000,
          },
          {
            id: 'seed-li-001b',
            description: 'Wireframe Design',
            quantity: 40,
            unitPrice: 150,
            amount: 6000,
          },
        ],
      },
    },
  });

  // Invoice 2: ACM-2026-002 — Globetech, Website, SENT, $12,000
  await prisma.invoice.upsert({
    where: { id: 'seed-invoice-002' },
    update: {},
    create: {
      id: 'seed-invoice-002',
      orgId: acme.id,
      invoiceNo: 'ACM-2026-002',
      clientId: globetech.id,
      projectId: websiteProject.id,
      status: 'SENT',
      issueDate: new Date('2026-03-01'),
      dueDate: new Date('2026-04-01'),
      notes: 'Phase 2 — Frontend development',
      lineItems: {
        create: [
          {
            id: 'seed-li-002a',
            description: 'Frontend Development',
            quantity: 60,
            unitPrice: 200,
            amount: 12000,
          },
        ],
      },
    },
  });

  // Invoice 3: ACM-2026-003 — Brightpath, App, DRAFT, $25,500 + 8.5% tax
  await prisma.invoice.upsert({
    where: { id: 'seed-invoice-003' },
    update: {},
    create: {
      id: 'seed-invoice-003',
      orgId: acme.id,
      invoiceNo: 'ACM-2026-003',
      clientId: brightpath.id,
      projectId: appProject.id,
      status: 'DRAFT',
      issueDate: new Date('2026-03-15'),
      dueDate: new Date('2026-04-15'),
      taxRate: 8.5,
      notes: 'Mobile app — design & auth module',
      lineItems: {
        create: [
          {
            id: 'seed-li-003a',
            description: 'Mobile App UI/UX Design',
            quantity: 80,
            unitPrice: 175,
            amount: 14000,
          },
          {
            id: 'seed-li-003b',
            description: 'Authentication Module Development',
            quantity: 50,
            unitPrice: 230,
            amount: 11500,
          },
        ],
      },
    },
  });

  // Invoice 4: ACM-2026-004 — UrbanNest, Branding, OVERDUE, $15,000
  await prisma.invoice.upsert({
    where: { id: 'seed-invoice-004' },
    update: {},
    create: {
      id: 'seed-invoice-004',
      orgId: acme.id,
      invoiceNo: 'ACM-2026-004',
      clientId: urbannest.id,
      projectId: brandingProject.id,
      status: 'OVERDUE',
      issueDate: new Date('2025-12-15'),
      dueDate: new Date('2026-01-15'),
      notes: 'Brand identity — final deliverables',
      lineItems: {
        create: [
          {
            id: 'seed-li-004a',
            description: 'Complete Brand Identity Package',
            quantity: 1,
            unitPrice: 15000,
            amount: 15000,
          },
        ],
      },
    },
  });

  console.log('  Invoices created');

  // ---------------------------------------------------------------------------
  // Activity Logs
  // ---------------------------------------------------------------------------
  const activitiesData = [
    {
      id: 'seed-activity-1',
      orgId: acme.id,
      userId: demo.id,
      action: 'project.created',
      entity: 'Project',
      entityId: websiteProject.id,
      metadata: { projectName: 'Globetech Website Redesign' },
      createdAt: new Date('2026-01-15T09:00:00Z'),
    },
    {
      id: 'seed-activity-2',
      orgId: acme.id,
      userId: alice.id,
      action: 'task.status_changed',
      entity: 'Task',
      entityId: 'seed-task-1',
      metadata: { taskTitle: 'Design homepage wireframes', from: 'IN_PROGRESS', to: 'DONE' },
      createdAt: new Date('2026-02-10T14:30:00Z'),
    },
    {
      id: 'seed-activity-3',
      orgId: acme.id,
      userId: demo.id,
      action: 'invoice.created',
      entity: 'Invoice',
      entityId: 'seed-invoice-001',
      metadata: { invoiceNo: 'ACM-2026-001', amount: 13000 },
      createdAt: new Date('2026-01-20T10:00:00Z'),
    },
    {
      id: 'seed-activity-4',
      orgId: acme.id,
      userId: bob.id,
      action: 'task.status_changed',
      entity: 'Task',
      entityId: 'seed-task-2',
      metadata: { taskTitle: 'Implement responsive navigation', from: 'TODO', to: 'IN_PROGRESS' },
      createdAt: new Date('2026-03-01T11:00:00Z'),
    },
    {
      id: 'seed-activity-5',
      orgId: acme.id,
      userId: demo.id,
      action: 'invoice.marked_paid',
      entity: 'Invoice',
      entityId: 'seed-invoice-001',
      metadata: { invoiceNo: 'ACM-2026-001', amount: 13000 },
      createdAt: new Date('2026-02-18T16:00:00Z'),
    },
    {
      id: 'seed-activity-6',
      orgId: acme.id,
      userId: demo.id,
      action: 'client.created',
      entity: 'Client',
      entityId: 'seed-client-urbannest',
      metadata: { clientName: 'UrbanNest Realty' },
      createdAt: new Date('2025-09-28T09:00:00Z'),
    },
  ];

  for (const a of activitiesData) {
    await prisma.activityLog.upsert({
      where: { id: a.id },
      update: {},
      create: a,
    });
  }

  console.log('  Activity logs created');

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
