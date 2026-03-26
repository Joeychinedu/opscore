# OpsCore — Design Document

**Date:** 2026-03-26
**Status:** Approved
**Author:** Architecture session

---

## 1. Overview

OpsCore is a multi-tenant business operations platform for managing clients, projects, tasks, invoices, team activity, and reports. It targets small-to-mid agencies and consultancies who need a unified internal operations tool.

**Primary audience for this portfolio piece:** Freelance/agency clients — visual polish, working demo, and feature breadth take priority.

**Demo strategy:** Live deployed demo with a "Try Demo" button + polished README with screenshots.

---

## 2. Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Monorepo | Turborepo (pnpm) | One clone, one install, shared types |
| Frontend | Next.js App Router, TypeScript, Tailwind | Modern SSR, file-based routing |
| UI Components | shadcn/ui | Owned components, modern B2B aesthetic |
| Backend | NestJS | Modular, guards/interceptors/pipes, enterprise patterns |
| Database | PostgreSQL | Robust, Decimal support, JSON columns for audit |
| ORM | Prisma | Type-safe, migration tooling, middleware for tenant scoping |
| Auth | Custom JWT (NestJS) | Access + refresh token rotation, bcrypt, RBAC guards |
| Multi-tenancy | Shared DB, discriminator column (orgId) | Prisma-compatible, simple for evaluators, guardrailed by middleware |
| Invoicing | Status tracking + PDF generation | Impressive demo moment without Stripe complexity |
| Real-time | Static/polling v1, WebSocket-ready architecture | Event pattern internally, ship simple for v1 |
| Charts | Recharts | Lightweight, SSR-compatible, composable |
| Tables | TanStack Table | One reusable data-table for all list pages |

---

## 3. Domain Model

```
Organization (tenant root)
├── User (global, belongs to orgs via Membership)
│   └── Membership (role: OWNER | ADMIN | MANAGER | MEMBER)
├── Client
│   ├── ContactInfo (inline fields)
│   └── ClientNote[]
├── Project
│   ├── ProjectMember[] (assigned users)
│   ├── Task[]
│   └── linked Client (optional)
├── Task
│   ├── assignee (User)
│   ├── project (Project)
│   ├── priority: LOW | MEDIUM | HIGH | URGENT
│   └── status: TODO | IN_PROGRESS | IN_REVIEW | DONE
├── Invoice
│   ├── InvoiceLineItem[]
│   ├── linked Client
│   ├── linked Project (optional)
│   └── status: DRAFT | SENT | PAID | OVERDUE | CANCELLED
├── ActivityLog (polymorphic audit trail)
└── OrgSettings (workspace config)
```

### Key modeling decisions

- **Users are global, Membership scopes them to orgs.** A consultant can belong to multiple orgs with different roles.
- **ActivityLog uses entity + entityId + action (dot notation) + metadata (JSON).** Polymorphic, no per-entity log tables.
- **InvoiceLineItem stores computed `amount`.** Denormalized for query speed and PDF generation, validated at write time.
- **Decimal for all money fields.** Never Float for currency.
- **Organization.slug** enables clean URLs (`/acme/dashboard`) and is demo-friendly.

---

## 4. Database Schema

```prisma
// ─── Tenant Root ───
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  logoUrl     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  memberships Membership[]
  clients     Client[]
  projects    Project[]
  tasks       Task[]
  invoices    Invoice[]
  activities  ActivityLog[]
  settings    OrgSettings?
}

// ─── Users & Membership ───
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  firstName     String
  lastName      String
  avatarUrl     String?
  refreshToken  String?
  createdAt     DateTime @default(now())

  memberships   Membership[]
  assignedTasks Task[]     @relation("TaskAssignee")
  activities    ActivityLog[]
}

model Membership {
  id     String         @id @default(cuid())
  role   Role           @default(MEMBER)
  user   User           @relation(fields: [userId], references: [id])
  userId String
  org    Organization   @relation(fields: [orgId], references: [id])
  orgId  String

  @@unique([userId, orgId])
}

enum Role {
  OWNER
  ADMIN
  MANAGER
  MEMBER
}

// ─── Clients ───
model Client {
  id          String   @id @default(cuid())
  orgId       String
  org         Organization @relation(fields: [orgId], references: [id])
  name        String
  email       String?
  phone       String?
  company     String?
  address     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  projects    Project[]
  invoices    Invoice[]
  notes       ClientNote[]
}

model ClientNote {
  id        String   @id @default(cuid())
  clientId  String
  client    Client   @relation(fields: [clientId], references: [id])
  authorId  String
  content   String
  createdAt DateTime @default(now())
}

// ─── Projects ───
model Project {
  id          String        @id @default(cuid())
  orgId       String
  org         Organization  @relation(fields: [orgId], references: [id])
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  clientId    String?
  client      Client?       @relation(fields: [clientId], references: [id])
  startDate   DateTime?
  dueDate     DateTime?
  budget      Decimal?      @db.Decimal(12,2)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  tasks       Task[]
  invoices    Invoice[]
  members     ProjectMember[]
}

model ProjectMember {
  id        String  @id @default(cuid())
  projectId String
  project   Project @relation(fields: [projectId], references: [id])
  userId    String

  @@unique([projectId, userId])
}

enum ProjectStatus {
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

// ─── Tasks ───
model Task {
  id          String       @id @default(cuid())
  orgId       String
  org         Organization @relation(fields: [orgId], references: [id])
  projectId   String
  project     Project      @relation(fields: [projectId], references: [id])
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    Priority     @default(MEDIUM)
  assigneeId  String?
  assignee    User?        @relation("TaskAssignee", fields: [assigneeId], references: [id])
  dueDate     DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

// ─── Invoices ───
model Invoice {
  id          String        @id @default(cuid())
  orgId       String
  org         Organization  @relation(fields: [orgId], references: [id])
  invoiceNo   String
  clientId    String
  client      Client        @relation(fields: [clientId], references: [id])
  projectId   String?
  project     Project?      @relation(fields: [projectId], references: [id])
  status      InvoiceStatus @default(DRAFT)
  issueDate   DateTime      @default(now())
  dueDate     DateTime
  taxRate     Decimal?      @db.Decimal(5,2)
  notes       String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  lineItems   InvoiceLineItem[]
}

model InvoiceLineItem {
  id          String  @id @default(cuid())
  invoiceId   String
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description String
  quantity    Decimal @db.Decimal(10,2)
  unitPrice   Decimal @db.Decimal(12,2)
  amount      Decimal @db.Decimal(12,2)
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

// ─── Audit Trail ───
model ActivityLog {
  id        String       @id @default(cuid())
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id])
  userId    String?
  user      User?        @relation(fields: [userId], references: [id])
  action    String
  entity    String
  entityId  String
  metadata  Json?
  createdAt DateTime     @default(now())
}

// ─── Org Settings ───
model OrgSettings {
  id              String       @id @default(cuid())
  orgId           String       @unique
  org             Organization @relation(fields: [orgId], references: [id])
  invoicePrefix   String       @default("INV")
  currency        String       @default("USD")
  timezone        String       @default("UTC")
  brandColor      String?
}
```

---

## 5. Multi-Tenancy Architecture

**Approach:** Shared database with `orgId` discriminator column on all tenant-owned tables.

**Guardrails:**

1. **Prisma middleware** — auto-appends `orgId` to all `findMany`, `findFirst`, `update`, `updateMany`, `delete`, `deleteMany` operations. Services never manually filter by tenant.
2. **TenantGuard** — extracts `orgId` from `x-org-id` request header, verifies the authenticated user has a Membership in that org, attaches `orgId` and `role` to the request object.
3. **RolesGuard** — checks the user's role in the current org against the `@Roles()` decorator on the endpoint.
4. **Integration tests** — verify that User A in Org 1 cannot access Org 2's data.

**Request lifecycle:**
```
Request → JwtAuthGuard → TenantGuard → RolesGuard (optional)
        → Controller → Service → Prisma (middleware auto-scopes)
        → ActivityLogInterceptor → TransformInterceptor → Response
```

**Tenant ID transport:** `x-org-id` header, set by the frontend's API client after org selection. Cleaner than URL prefix, same security.

---

## 6. Backend Module Map

```
apps/api/src/
├── common/          (guards, interceptors, filters, decorators, Prisma service)
├── modules/
│   ├── auth/        (register, login, refresh, logout, demo-login)
│   ├── organizations/ (create, list user's orgs, update)
│   ├── memberships/ (invite, remove, change role)
│   ├── clients/     (CRUD + notes + pagination)
│   ├── projects/    (CRUD + member assignment)
│   ├── tasks/       (CRUD + filters)
│   ├── invoices/    (CRUD + line items + status transitions + PDF)
│   ├── dashboard/   (aggregated metrics)
│   ├── reports/     (revenue, projects, team, invoices)
│   ├── activity/    (audit log query)
│   └── settings/    (org settings CRUD)
└── seed/            (realistic data for 2 orgs)
```

### API Routes

```
# Auth (public)
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/demo

# Organizations (authenticated, no org context needed)
POST   /organizations
GET    /organizations
PATCH  /organizations/:orgId

# All routes below require x-org-id header

# Members
GET    /members
POST   /members/invite
PATCH  /members/:id/role
DELETE /members/:id

# Clients
GET    /clients
POST   /clients
GET    /clients/:id
PATCH  /clients/:id
DELETE /clients/:id
POST   /clients/:id/notes

# Projects
GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id
POST   /projects/:id/members
DELETE /projects/:id/members/:uid

# Tasks
GET    /tasks
POST   /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id

# Invoices
GET    /invoices
POST   /invoices
GET    /invoices/:id
PATCH  /invoices/:id
POST   /invoices/:id/send
POST   /invoices/:id/mark-paid
GET    /invoices/:id/pdf

# Dashboard & Reports
GET    /dashboard
GET    /reports/revenue
GET    /reports/projects
GET    /reports/team
GET    /reports/invoices

# Activity
GET    /activity

# Settings
GET    /settings
PATCH  /settings
```

---

## 7. Frontend Route Map

```
apps/web/src/app/
├── (marketing)/              # Public: landing, pricing
├── (auth)/                   # Login, register, forgot-password
├── (app)/                    # Authenticated app shell
│   ├── select-org/
│   ├── create-org/
│   ├── dashboard/
│   ├── clients/              # list, new, [id], [id]/edit
│   ├── projects/             # list, new, [id], [id]/edit
│   ├── tasks/                # list, [id]
│   ├── invoices/             # list, new, [id], [id]/edit
│   ├── team/                 # members, activity
│   ├── reports/              # overview, revenue, projects, team, invoices
│   └── settings/             # general, branding, notifications, account
```

### Layout system

- **(marketing)** — marketing header + footer, no sidebar
- **(auth)** — centered card layout with brand mark
- **(app)** — collapsible sidebar + topbar + content area with page header

### Reusable component library

- `data-table.tsx` — TanStack Table + shadcn, powers all list pages
- `data-filters.tsx` — filter bar (dropdowns, search, clear)
- `pagination.tsx` — URL-synced page controls
- `empty-state.tsx` — icon + message + CTA
- `stat-card.tsx` — metric card with trend arrow
- `form-field.tsx` — react-hook-form wrapper
- `loading-skeleton.tsx` — shimmer placeholders per page type
- `area-chart.tsx`, `bar-chart.tsx`, `donut-chart.tsx` — Recharts wrappers

---

## 8. Implementation Roadmap

### Phase 1: Foundation
Turborepo setup, Prisma schema + migrations, NestJS common module, auth module (JWT + refresh), organizations + memberships, tenant guard + Prisma middleware, seed script (2 orgs, 4 users), Next.js auth pages + providers, org selection.

**Checkpoint:** Register → create org → log in → see empty app shell.

### Phase 2: Core CRUD
Clients, projects, tasks backend modules. Shared data-table component. All list/create/detail/edit pages for clients, projects, tasks. Expanded seed data.

**Checkpoint:** Full client → project → task workflow. Polished tables with filters and pagination.

### Phase 3: Invoicing + PDF
Invoice backend module with line items and status transitions. PDF generation service. Invoice pages with line item builder and preview. PDF download.

**Checkpoint:** Create invoice → add line items → send → download professional PDF.

### Phase 4: Dashboard + Reports + Activity
Dashboard aggregation service. Activity log interceptor + query endpoint. Reports module (revenue, projects, team, invoices). Dashboard page with stat cards, task list, activity feed. Report pages with charts.

**Checkpoint:** Dashboard shows real aggregated data. Reports have meaningful charts.

### Phase 5: Settings + Polish + Landing
Settings pages. Landing page with hero, features, pricing, CTA. Demo login flow. Empty states, skeletons, toasts, error boundaries. Responsive sidebar. README with screenshots.

**Checkpoint:** Production-quality feel end to end.

### Phase 6: Deployment
Docker Compose for local dev. API deployment (Railway/Render). Frontend deployment (Vercel). Environment docs. GitHub Actions CI (lint + type-check + build).

### Out of scope (v1)
- Email sending (invites in-app only)
- File uploads (URLs only)
- WebSocket real-time
- Kanban board view
- Multi-currency
- 2FA
- Dark mode
