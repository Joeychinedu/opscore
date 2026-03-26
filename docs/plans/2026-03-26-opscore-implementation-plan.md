# OpsCore Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a multi-tenant business operations platform (clients, projects, tasks, invoices, reports) with NestJS + Next.js + Prisma + PostgreSQL.

**Architecture:** Turborepo monorepo with `apps/api` (NestJS), `apps/web` (Next.js), and `packages/shared` (types + validation). Shared-database multi-tenancy with `orgId` discriminator column enforced by Prisma middleware. Custom JWT auth with access/refresh token rotation.

**Tech Stack:** Node 25, pnpm, Turborepo, NestJS 11, Next.js 15, Prisma 6, PostgreSQL 16, shadcn/ui, TanStack Table, Recharts, Tailwind CSS 4, TypeScript 5.

---

## Phase 1: Foundation

### Task 1: Turborepo Monorepo Scaffold

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `apps/api/package.json`
- Create: `apps/web/package.json`
- Create: `packages/shared/package.json`
- Create: `packages/shared/src/index.ts`
- Create: `.gitignore`
- Create: `.nvmrc`

**Step 1: Initialize monorepo root**

```bash
cd /Users/mac/Documents/Dev/OpsCore
pnpm init
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

**Step 4: Create NestJS app**

```bash
cd apps
pnpm dlx @nestjs/cli new api --package-manager pnpm --skip-git
cd ..
```

**Step 5: Create Next.js app**

```bash
cd apps
pnpm dlx create-next-app web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
cd ..
```

**Step 6: Create shared package**

```bash
mkdir -p packages/shared/src
```

`packages/shared/package.json`:
```json
{
  "name": "@opscore/shared",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.24"
  },
  "devDependencies": {
    "typescript": "^5.7"
  }
}
```

`packages/shared/src/index.ts`:
```ts
export * from './types';
export * from './enums';
```

**Step 7: Create .gitignore and .nvmrc**

`.gitignore`:
```
node_modules
dist
.next
.env
.env.local
*.db
coverage
.turbo
```

`.nvmrc`:
```
25
```

**Step 8: Install dependencies and verify**

```bash
pnpm install
pnpm turbo build
```

**Step 9: Initialize git and commit**

```bash
git init
git add .
git commit -m "chore: scaffold turborepo monorepo with api, web, and shared packages"
```

---

### Task 2: Shared Types & Enums

**Files:**
- Create: `packages/shared/src/enums.ts`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/tsconfig.json`

**Step 1: Create enums**

`packages/shared/src/enums.ts`:
```ts
export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}
```

**Step 2: Create shared types**

`packages/shared/src/types.ts`:
```ts
import { Role, ProjectStatus, TaskStatus, Priority, InvoiceStatus } from './enums';

// ─── API Response Wrappers ───
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Auth ───
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// ─── Organization ───
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
}

export interface Membership {
  id: string;
  role: Role;
  userId: string;
  orgId: string;
  user?: AuthUser;
}

// ─── Client ───
export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number; invoices: number };
}

export interface ClientNote {
  id: string;
  clientId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

// ─── Project ───
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  clientId: string | null;
  startDate: string | null;
  dueDate: string | null;
  budget: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  _count?: { tasks: number; members: number };
}

// ─── Task ───
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: AuthUser;
  project?: { id: string; name: string };
}

// ─── Invoice ───
export interface Invoice {
  id: string;
  invoiceNo: string;
  clientId: string;
  projectId: string | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  taxRate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  lineItems?: InvoiceLineItem[];
  total?: number;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

// ─── Activity ───
export interface ActivityLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user?: AuthUser;
}

// ─── Dashboard ───
export interface DashboardMetrics {
  totalClients: number;
  activeProjects: number;
  tasksDueThisWeek: number;
  revenueThisMonth: number;
  recentActivity: ActivityLogEntry[];
  tasksByStatus: Record<TaskStatus, number>;
  invoiceSummary: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
  };
}
```

**Step 3: Commit**

```bash
git add packages/shared
git commit -m "feat: add shared types, enums, and API response interfaces"
```

---

### Task 3: Prisma Schema & Database Setup

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/.env`
- Modify: `apps/api/package.json` (add prisma scripts)

**Step 1: Install Prisma in api app**

```bash
cd apps/api
pnpm add prisma @prisma/client
pnpm add -D prisma
npx prisma init
cd ../..
```

**Step 2: Write the full schema**

`apps/api/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  logoUrl   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  memberships Membership[]
  clients     Client[]
  projects    Project[]
  tasks       Task[]
  invoices    Invoice[]
  activities  ActivityLog[]
  settings    OrgSettings?
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  firstName    String
  lastName     String
  avatarUrl    String?
  refreshToken String?
  createdAt    DateTime @default(now())

  memberships   Membership[]
  assignedTasks Task[]        @relation("TaskAssignee")
  activities    ActivityLog[]
}

model Membership {
  id     String @id @default(cuid())
  role   Role   @default(MEMBER)
  userId String
  orgId  String

  user User         @relation(fields: [userId], references: [id])
  org  Organization @relation(fields: [orgId], references: [id])

  @@unique([userId, orgId])
}

enum Role {
  OWNER
  ADMIN
  MANAGER
  MEMBER
}

model Client {
  id        String   @id @default(cuid())
  orgId     String
  name      String
  email     String?
  phone     String?
  company   String?
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  org      Organization @relation(fields: [orgId], references: [id])
  projects Project[]
  invoices Invoice[]
  notes    ClientNote[]
}

model ClientNote {
  id        String   @id @default(cuid())
  clientId  String
  authorId  String
  content   String
  createdAt DateTime @default(now())

  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)
}

model Project {
  id          String        @id @default(cuid())
  orgId       String
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  clientId    String?
  startDate   DateTime?
  dueDate     DateTime?
  budget      Decimal?      @db.Decimal(12, 2)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  org     Organization    @relation(fields: [orgId], references: [id])
  client  Client?         @relation(fields: [clientId], references: [id])
  tasks   Task[]
  invoices Invoice[]
  members ProjectMember[]
}

model ProjectMember {
  id        String @id @default(cuid())
  projectId String
  userId    String

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
}

enum ProjectStatus {
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

model Task {
  id          String     @id @default(cuid())
  orgId       String
  projectId   String
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  assigneeId  String?
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  org      Organization @relation(fields: [orgId], references: [id])
  project  Project      @relation(fields: [projectId], references: [id])
  assignee User?        @relation("TaskAssignee", fields: [assigneeId], references: [id])
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

model Invoice {
  id        String        @id @default(cuid())
  orgId     String
  invoiceNo String
  clientId  String
  projectId String?
  status    InvoiceStatus @default(DRAFT)
  issueDate DateTime      @default(now())
  dueDate   DateTime
  taxRate   Decimal?      @db.Decimal(5, 2)
  notes     String?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  org       Organization    @relation(fields: [orgId], references: [id])
  client    Client          @relation(fields: [clientId], references: [id])
  project   Project?        @relation(fields: [projectId], references: [id])
  lineItems InvoiceLineItem[]
}

model InvoiceLineItem {
  id          String  @id @default(cuid())
  invoiceId   String
  description String
  quantity    Decimal @db.Decimal(10, 2)
  unitPrice   Decimal @db.Decimal(12, 2)
  amount      Decimal @db.Decimal(12, 2)

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

model ActivityLog {
  id        String   @id @default(cuid())
  orgId     String
  userId    String?
  action    String
  entity    String
  entityId  String
  metadata  Json?
  createdAt DateTime @default(now())

  org  Organization @relation(fields: [orgId], references: [id])
  user User?        @relation(fields: [userId], references: [id])
}

model OrgSettings {
  id            String  @id @default(cuid())
  orgId         String  @unique
  invoicePrefix String  @default("INV")
  currency      String  @default("USD")
  timezone      String  @default("UTC")
  brandColor    String?

  org Organization @relation(fields: [orgId], references: [id])
}
```

**Step 3: Set up .env**

`apps/api/.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/opscore_dev"
JWT_ACCESS_SECRET="opscore-access-secret-change-in-production"
JWT_REFRESH_SECRET="opscore-refresh-secret-change-in-production"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
DEMO_MODE="true"
```

**Step 4: Create database and run migration**

```bash
createdb opscore_dev
cd apps/api
npx prisma migrate dev --name init
cd ../..
```

**Step 5: Verify Prisma client generates**

```bash
cd apps/api && npx prisma generate && cd ../..
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add Prisma schema with full domain model and initial migration"
```

---

### Task 4: NestJS Common Module (Prisma Service, Guards, Interceptors)

**Files:**
- Create: `apps/api/src/common/prisma/prisma.module.ts`
- Create: `apps/api/src/common/prisma/prisma.service.ts`
- Create: `apps/api/src/common/prisma/tenant.middleware.ts`
- Create: `apps/api/src/common/decorators/current-user.decorator.ts`
- Create: `apps/api/src/common/decorators/current-org.decorator.ts`
- Create: `apps/api/src/common/decorators/roles.decorator.ts`
- Create: `apps/api/src/common/guards/jwt-auth.guard.ts`
- Create: `apps/api/src/common/guards/tenant.guard.ts`
- Create: `apps/api/src/common/guards/roles.guard.ts`
- Create: `apps/api/src/common/interceptors/transform.interceptor.ts`
- Create: `apps/api/src/common/interceptors/activity-log.interceptor.ts`
- Create: `apps/api/src/common/filters/http-exception.filter.ts`
- Create: `apps/api/src/common/dto/pagination.dto.ts`
- Create: `apps/api/src/common/common.module.ts`

**Step 1: Install dependencies**

```bash
cd apps/api
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer
pnpm add -D @types/passport-jwt @types/bcrypt
cd ../..
```

**Step 2: Create Prisma service**

`apps/api/src/common/prisma/prisma.service.ts`:
```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

`apps/api/src/common/prisma/prisma.module.ts`:
```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Step 3: Create tenant-scoping Prisma middleware**

`apps/api/src/common/prisma/tenant.middleware.ts`:
```ts
import { Prisma } from '@prisma/client';

// Models that require orgId scoping
const TENANT_MODELS = [
  'Client', 'Project', 'Task', 'Invoice',
  'InvoiceLineItem', 'ActivityLog', 'OrgSettings', 'ClientNote',
];

export function tenantMiddleware(orgId: string): Prisma.Middleware {
  return async (params, next) => {
    if (!params.model || !TENANT_MODELS.includes(params.model)) {
      return next(params);
    }

    // Auto-inject orgId on creates
    if (params.action === 'create') {
      if (params.args.data && !params.args.data.orgId) {
        params.args.data.orgId = orgId;
      }
    }

    // Auto-filter reads, updates, deletes by orgId
    const filterActions = [
      'findFirst', 'findMany', 'findUnique',
      'update', 'updateMany', 'delete', 'deleteMany', 'count',
    ];

    if (filterActions.includes(params.action)) {
      if (!params.args) params.args = {};
      if (!params.args.where) params.args.where = {};

      // For models that have orgId directly
      if (params.model !== 'InvoiceLineItem' && params.model !== 'ClientNote') {
        params.args.where.orgId = orgId;
      }
    }

    return next(params);
  };
}
```

**Step 4: Create decorators**

`apps/api/src/common/decorators/current-user.decorator.ts`:
```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

`apps/api/src/common/decorators/current-org.decorator.ts`:
```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentOrg = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const org = request.org;
    return data ? org?.[data] : org;
  },
);
```

`apps/api/src/common/decorators/roles.decorator.ts`:
```ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**Step 5: Create guards**

`apps/api/src/common/guards/jwt-auth.guard.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

`apps/api/src/common/guards/tenant.guard.ts`:
```ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const orgId = request.headers['x-org-id'];
    const userId = request.user?.id;

    if (!orgId) {
      throw new BadRequestException('x-org-id header is required');
    }

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const membership = await this.prisma.membership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });

    if (!membership) {
      throw new ForbiddenException('You do not belong to this organization');
    }

    // Attach org context to request
    request.org = { id: orgId, role: membership.role };
    return true;
  }
}
```

`apps/api/src/common/guards/roles.guard.ts`:
```ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_HIERARCHY = { OWNER: 4, ADMIN: 3, MANAGER: 2, MEMBER: 1 };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.org?.role;

    if (!userRole) return false;

    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const minRequired = Math.min(...requiredRoles.map((r) => ROLE_HIERARCHY[r] || 0));

    return userLevel >= minRequired;
  }
}
```

**Step 6: Create interceptors**

`apps/api/src/common/interceptors/transform.interceptor.ts`:
```ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((responseData) => {
        // If response already has data/meta shape, pass through
        if (responseData && responseData.data !== undefined && responseData.meta !== undefined) {
          return responseData;
        }
        return { data: responseData };
      }),
    );
  }
}
```

`apps/api/src/common/interceptors/activity-log.interceptor.ts`:
```ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only log mutations
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const orgId = request.org?.id;
    const userId = request.user?.id;

    if (!orgId) return next.handle();

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const path = request.route?.path || request.url;
          const entity = this.extractEntity(path);
          const entityId = response?.data?.id || request.params?.id || 'unknown';
          const action = this.buildAction(method, entity);

          await this.prisma.activityLog.create({
            data: {
              orgId,
              userId,
              action,
              entity,
              entityId: String(entityId),
              metadata: {
                method,
                path: request.url,
              },
            },
          });
        } catch {
          // Never let logging failures break the request
        }
      }),
    );
  }

  private extractEntity(path: string): string {
    const segments = path.split('/').filter(Boolean);
    // e.g. /clients/:id -> "Client", /invoices/:id/send -> "Invoice"
    const resource = segments.find((s) => !s.startsWith(':'));
    if (!resource) return 'Unknown';
    return resource.charAt(0).toUpperCase() + resource.slice(1, -1);
  }

  private buildAction(method: string, entity: string): string {
    const lower = entity.toLowerCase();
    switch (method) {
      case 'POST': return `${lower}.created`;
      case 'PATCH':
      case 'PUT': return `${lower}.updated`;
      case 'DELETE': return `${lower}.deleted`;
      default: return `${lower}.modified`;
    }
  }
}
```

**Step 7: Create exception filter**

`apps/api/src/common/filters/http-exception.filter.ts`:
```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || message;
        errors = (res as any).errors;
      }
    }

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
```

**Step 8: Create pagination DTO**

`apps/api/src/common/dto/pagination.dto.ts`:
```ts
import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

**Step 9: Create common module**

`apps/api/src/common/common.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  exports: [PrismaModule],
})
export class CommonModule {}
```

**Step 10: Commit**

```bash
git add apps/api/src/common
git commit -m "feat: add common module with Prisma service, guards, interceptors, decorators, and filters"
```

---

### Task 5: Auth Module (Register, Login, Refresh, Logout, Demo)

**Files:**
- Create: `apps/api/src/modules/auth/auth.module.ts`
- Create: `apps/api/src/modules/auth/auth.controller.ts`
- Create: `apps/api/src/modules/auth/auth.service.ts`
- Create: `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
- Create: `apps/api/src/modules/auth/strategies/jwt-refresh.strategy.ts`
- Create: `apps/api/src/modules/auth/dto/register.dto.ts`
- Create: `apps/api/src/modules/auth/dto/login.dto.ts`
- Create: `apps/api/src/modules/auth/guards/jwt-refresh.guard.ts`

**Step 1: Create DTOs**

`apps/api/src/modules/auth/dto/register.dto.ts`:
```ts
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;
}
```

`apps/api/src/modules/auth/dto/login.dto.ts`:
```ts
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

**Step 2: Create JWT strategies**

`apps/api/src/modules/auth/strategies/jwt.strategy.ts`:
```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) throw new UnauthorizedException();
    return user;
  }
}
```

`apps/api/src/modules/auth/strategies/jwt-refresh.strategy.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    const refreshToken = req.body.refreshToken;
    return { ...payload, refreshToken };
  }
}
```

`apps/api/src/modules/auth/guards/jwt-refresh.guard.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
```

**Step 3: Create auth service**

`apps/api/src/modules/auth/auth.service.ts`:
```ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      ...tokens,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) throw new ForbiddenException('Access denied');

    const valid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!valid) throw new ForbiddenException('Access denied');

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async demoLogin() {
    if (this.configService.get('DEMO_MODE') !== 'true') {
      throw new ForbiddenException('Demo mode is disabled');
    }

    const demoUser = await this.prisma.user.findFirst({
      where: { email: 'demo@opscore.dev' },
    });
    if (!demoUser) throw new ForbiddenException('Demo user not found. Run seed first.');

    const tokens = await this.generateTokens(demoUser.id, demoUser.email);
    await this.updateRefreshToken(demoUser.id, tokens.refreshToken);

    return {
      user: {
        id: demoUser.id,
        email: demoUser.email,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
      },
      ...tokens,
    };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }
}
```

**Step 4: Create auth controller**

`apps/api/src/modules/auth/auth.controller.ts`:
```ts
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@CurrentUser('sub') userId: string, @Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(userId, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('demo')
  @HttpCode(HttpStatus.OK)
  demoLogin() {
    return this.authService.demoLogin();
  }
}
```

**Step 5: Create auth module**

`apps/api/src/modules/auth/auth.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**Step 6: Commit**

```bash
git add apps/api/src/modules/auth
git commit -m "feat: add auth module with JWT access/refresh tokens, register, login, logout, demo login"
```

---

### Task 6: Organizations & Memberships Modules

**Files:**
- Create: `apps/api/src/modules/organizations/organizations.module.ts`
- Create: `apps/api/src/modules/organizations/organizations.controller.ts`
- Create: `apps/api/src/modules/organizations/organizations.service.ts`
- Create: `apps/api/src/modules/organizations/dto/create-org.dto.ts`
- Create: `apps/api/src/modules/organizations/dto/update-org.dto.ts`
- Create: `apps/api/src/modules/memberships/memberships.module.ts`
- Create: `apps/api/src/modules/memberships/memberships.controller.ts`
- Create: `apps/api/src/modules/memberships/memberships.service.ts`
- Create: `apps/api/src/modules/memberships/dto/invite-member.dto.ts`
- Create: `apps/api/src/modules/memberships/dto/update-role.dto.ts`

**Step 1: Organization DTOs**

`apps/api/src/modules/organizations/dto/create-org.dto.ts`:
```ts
import { IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class CreateOrgDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric with hyphens only' })
  slug: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}
```

`apps/api/src/modules/organizations/dto/update-org.dto.ts`:
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrgDto } from './create-org.dto';

export class UpdateOrgDto extends PartialType(CreateOrgDto) {}
```

**Step 2: Organizations service**

`apps/api/src/modules/organizations/organizations.service.ts`:
```ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrgDto, userId: string) {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug already taken');

    return this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        logoUrl: dto.logoUrl,
        memberships: {
          create: { userId, role: 'OWNER' },
        },
        settings: {
          create: {},
        },
      },
      include: { memberships: true },
    });
  }

  async findUserOrgs(userId: string) {
    return this.prisma.organization.findMany({
      where: { memberships: { some: { userId } } },
      include: {
        _count: { select: { memberships: true, projects: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(orgId: string, dto: UpdateOrgDto) {
    if (dto.slug) {
      const existing = await this.prisma.organization.findFirst({
        where: { slug: dto.slug, NOT: { id: orgId } },
      });
      if (existing) throw new ConflictException('Slug already taken');
    }

    return this.prisma.organization.update({
      where: { id: orgId },
      data: dto,
    });
  }

  async findById(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: { select: { memberships: true, clients: true, projects: true } },
      },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }
}
```

**Step 3: Organizations controller**

`apps/api/src/modules/organizations/organizations.controller.ts`:
```ts
import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private orgsService: OrganizationsService) {}

  @Post()
  create(@Body() dto: CreateOrgDto, @CurrentUser('id') userId: string) {
    return this.orgsService.create(dto, userId);
  }

  @Get()
  findUserOrgs(@CurrentUser('id') userId: string) {
    return this.orgsService.findUserOrgs(userId);
  }

  @Patch(':orgId')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('orgId') orgId: string, @Body() dto: UpdateOrgDto) {
    return this.orgsService.update(orgId, dto);
  }
}
```

**Step 4: Organizations module**

`apps/api/src/modules/organizations/organizations.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
```

**Step 5: Membership DTOs**

`apps/api/src/modules/memberships/dto/invite-member.dto.ts`:
```ts
import { IsEmail, IsOptional, IsEnum } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'MANAGER', 'MEMBER'])
  role?: 'ADMIN' | 'MANAGER' | 'MEMBER' = 'MEMBER';
}
```

`apps/api/src/modules/memberships/dto/update-role.dto.ts`:
```ts
import { IsEnum } from 'class-validator';

export class UpdateRoleDto {
  @IsEnum(['ADMIN', 'MANAGER', 'MEMBER'])
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
}
```

**Step 6: Memberships service**

`apps/api/src/modules/memberships/memberships.service.ts`:
```ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.membership.findMany({
      where: { orgId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { user: { firstName: 'asc' } },
    });
  }

  async invite(orgId: string, dto: InviteMemberDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('User not found. They must register first.');

    const existing = await this.prisma.membership.findUnique({
      where: { userId_orgId: { userId: user.id, orgId } },
    });
    if (existing) throw new ConflictException('User is already a member');

    return this.prisma.membership.create({
      data: { userId: user.id, orgId, role: dto.role || 'MEMBER' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateRole(membershipId: string, orgId: string, role: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: membershipId, orgId },
    });
    if (!membership) throw new NotFoundException('Membership not found');
    if (membership.role === 'OWNER') throw new ForbiddenException('Cannot change owner role');

    return this.prisma.membership.update({
      where: { id: membershipId },
      data: { role: role as any },
    });
  }

  async remove(membershipId: string, orgId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: membershipId, orgId },
    });
    if (!membership) throw new NotFoundException('Membership not found');
    if (membership.role === 'OWNER') throw new ForbiddenException('Cannot remove the owner');

    return this.prisma.membership.delete({ where: { id: membershipId } });
  }
}
```

**Step 7: Memberships controller**

`apps/api/src/modules/memberships/memberships.controller.ts`:
```ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@Controller('members')
@UseGuards(JwtAuthGuard, TenantGuard)
export class MembershipsController {
  constructor(private membershipsService: MembershipsService) {}

  @Get()
  findAll(@CurrentOrg('id') orgId: string) {
    return this.membershipsService.findAll(orgId);
  }

  @Post('invite')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  invite(@CurrentOrg('id') orgId: string, @Body() dto: InviteMemberDto) {
    return this.membershipsService.invite(orgId, dto);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateRole(
    @Param('id') id: string,
    @CurrentOrg('id') orgId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.membershipsService.updateRole(id, orgId, dto.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.membershipsService.remove(id, orgId);
  }
}
```

**Step 8: Memberships module**

`apps/api/src/modules/memberships/memberships.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';

@Module({
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
```

**Step 9: Commit**

```bash
git add apps/api/src/modules/organizations apps/api/src/modules/memberships
git commit -m "feat: add organizations and memberships modules with CRUD, invites, and role management"
```

---

### Task 7: Seed Script (2 Orgs, 4 Users, Sample Data)

**Files:**
- Create: `apps/api/prisma/seed.ts`
- Modify: `apps/api/package.json` (add prisma seed config)

**Step 1: Create seed script**

`apps/api/prisma/seed.ts`:
```ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Users ───
  const hash = await bcrypt.hash('password123', 12);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@opscore.dev' },
    update: {},
    create: { email: 'demo@opscore.dev', passwordHash: hash, firstName: 'Demo', lastName: 'User' },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@opscore.dev' },
    update: {},
    create: { email: 'alice@opscore.dev', passwordHash: hash, firstName: 'Alice', lastName: 'Chen' },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@opscore.dev' },
    update: {},
    create: { email: 'bob@opscore.dev', passwordHash: hash, firstName: 'Bob', lastName: 'Martinez' },
  });

  const carol = await prisma.user.upsert({
    where: { email: 'carol@opscore.dev' },
    update: {},
    create: { email: 'carol@opscore.dev', passwordHash: hash, firstName: 'Carol', lastName: 'Smith' },
  });

  // ─── Org 1: Acme Agency ───
  const acme = await prisma.organization.upsert({
    where: { slug: 'acme-agency' },
    update: {},
    create: {
      name: 'Acme Agency',
      slug: 'acme-agency',
      settings: { create: { invoicePrefix: 'ACM', currency: 'USD' } },
    },
  });

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: demo.id, orgId: acme.id } },
    update: {},
    create: { userId: demo.id, orgId: acme.id, role: 'OWNER' },
  });
  await prisma.membership.upsert({
    where: { userId_orgId: { userId: alice.id, orgId: acme.id } },
    update: {},
    create: { userId: alice.id, orgId: acme.id, role: 'ADMIN' },
  });
  await prisma.membership.upsert({
    where: { userId_orgId: { userId: bob.id, orgId: acme.id } },
    update: {},
    create: { userId: bob.id, orgId: acme.id, role: 'MEMBER' },
  });

  // ─── Org 2: Nova Studio ───
  const nova = await prisma.organization.upsert({
    where: { slug: 'nova-studio' },
    update: {},
    create: {
      name: 'Nova Studio',
      slug: 'nova-studio',
      settings: { create: { invoicePrefix: 'NVA', currency: 'EUR' } },
    },
  });

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: carol.id, orgId: nova.id } },
    update: {},
    create: { userId: carol.id, orgId: nova.id, role: 'OWNER' },
  });
  await prisma.membership.upsert({
    where: { userId_orgId: { userId: alice.id, orgId: nova.id } },
    update: {},
    create: { userId: alice.id, orgId: nova.id, role: 'MEMBER' },
  });

  // ─── Clients (Acme) ───
  const clientGlobetech = await prisma.client.upsert({
    where: { id: 'seed-client-globetech' },
    update: {},
    create: {
      id: 'seed-client-globetech', orgId: acme.id, name: 'Globetech Industries',
      email: 'contact@globetech.io', company: 'Globetech Industries', phone: '+1-555-0101',
    },
  });
  const clientBrightpath = await prisma.client.upsert({
    where: { id: 'seed-client-brightpath' },
    update: {},
    create: {
      id: 'seed-client-brightpath', orgId: acme.id, name: 'Brightpath Education',
      email: 'hello@brightpath.edu', company: 'Brightpath Education', phone: '+1-555-0102',
    },
  });
  const clientUrbanNest = await prisma.client.upsert({
    where: { id: 'seed-client-urbannest' },
    update: {},
    create: {
      id: 'seed-client-urbannest', orgId: acme.id, name: 'UrbanNest Realty',
      email: 'ops@urbannest.com', company: 'UrbanNest Realty', phone: '+1-555-0103',
    },
  });

  // ─── Clients (Nova) ───
  const clientSolara = await prisma.client.upsert({
    where: { id: 'seed-client-solara' },
    update: {},
    create: {
      id: 'seed-client-solara', orgId: nova.id, name: 'Solara Wellness',
      email: 'info@solara.co', company: 'Solara Wellness', phone: '+44-20-7946-0958',
    },
  });

  // ─── Projects (Acme) ───
  const projWebsite = await prisma.project.upsert({
    where: { id: 'seed-proj-website' },
    update: {},
    create: {
      id: 'seed-proj-website', orgId: acme.id, name: 'Globetech Website Redesign',
      description: 'Complete redesign of corporate website with new brand guidelines.',
      status: 'ACTIVE', clientId: clientGlobetech.id, budget: 45000,
      startDate: new Date('2026-01-15'), dueDate: new Date('2026-04-30'),
    },
  });
  const projApp = await prisma.project.upsert({
    where: { id: 'seed-proj-app' },
    update: {},
    create: {
      id: 'seed-proj-app', orgId: acme.id, name: 'Brightpath Mobile App',
      description: 'iOS and Android learning platform for K-12 students.',
      status: 'ACTIVE', clientId: clientBrightpath.id, budget: 120000,
      startDate: new Date('2026-02-01'), dueDate: new Date('2026-08-15'),
    },
  });
  const projBranding = await prisma.project.upsert({
    where: { id: 'seed-proj-branding' },
    update: {},
    create: {
      id: 'seed-proj-branding', orgId: acme.id, name: 'UrbanNest Brand Identity',
      description: 'Logo, color palette, typography, and brand guidelines.',
      status: 'COMPLETED', clientId: clientUrbanNest.id, budget: 15000,
      startDate: new Date('2025-10-01'), dueDate: new Date('2025-12-15'),
    },
  });

  // ─── Project Members ───
  for (const projId of [projWebsite.id, projApp.id]) {
    for (const userId of [demo.id, alice.id, bob.id]) {
      await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: projId, userId } },
        update: {},
        create: { projectId: projId, userId },
      });
    }
  }

  // ─── Tasks (Acme - Website) ───
  const taskData = [
    { id: 'seed-task-1', orgId: acme.id, projectId: projWebsite.id, title: 'Design homepage wireframes', status: 'DONE' as const, priority: 'HIGH' as const, assigneeId: alice.id },
    { id: 'seed-task-2', orgId: acme.id, projectId: projWebsite.id, title: 'Implement responsive navigation', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, assigneeId: bob.id },
    { id: 'seed-task-3', orgId: acme.id, projectId: projWebsite.id, title: 'Set up CMS integration', status: 'TODO' as const, priority: 'MEDIUM' as const, assigneeId: demo.id },
    { id: 'seed-task-4', orgId: acme.id, projectId: projWebsite.id, title: 'Performance optimization audit', status: 'TODO' as const, priority: 'LOW' as const, assigneeId: null },
    { id: 'seed-task-5', orgId: acme.id, projectId: projApp.id, title: 'Design onboarding flow', status: 'IN_REVIEW' as const, priority: 'URGENT' as const, assigneeId: alice.id },
    { id: 'seed-task-6', orgId: acme.id, projectId: projApp.id, title: 'Build authentication screens', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, assigneeId: bob.id },
    { id: 'seed-task-7', orgId: acme.id, projectId: projApp.id, title: 'API endpoint for lesson content', status: 'TODO' as const, priority: 'MEDIUM' as const, assigneeId: demo.id },
    { id: 'seed-task-8', orgId: acme.id, projectId: projApp.id, title: 'Push notification integration', status: 'TODO' as const, priority: 'LOW' as const, assigneeId: null },
  ];

  for (const t of taskData) {
    await prisma.task.upsert({ where: { id: t.id }, update: {}, create: { ...t, dueDate: new Date('2026-04-15') } });
  }

  // ─── Invoices (Acme) ───
  const inv1 = await prisma.invoice.upsert({
    where: { id: 'seed-inv-1' },
    update: {},
    create: {
      id: 'seed-inv-1', orgId: acme.id, invoiceNo: 'ACM-2026-001', clientId: clientGlobetech.id,
      projectId: projWebsite.id, status: 'PAID', issueDate: new Date('2026-01-20'),
      dueDate: new Date('2026-02-20'), taxRate: 0,
    },
  });
  await prisma.invoiceLineItem.upsert({
    where: { id: 'seed-li-1a' }, update: {},
    create: { id: 'seed-li-1a', invoiceId: inv1.id, description: 'Discovery & Strategy Phase', quantity: 1, unitPrice: 8000, amount: 8000 },
  });
  await prisma.invoiceLineItem.upsert({
    where: { id: 'seed-li-1b' }, update: {},
    create: { id: 'seed-li-1b', invoiceId: inv1.id, description: 'Wireframe Deliverables', quantity: 1, unitPrice: 5000, amount: 5000 },
  });

  const inv2 = await prisma.invoice.upsert({
    where: { id: 'seed-inv-2' },
    update: {},
    create: {
      id: 'seed-inv-2', orgId: acme.id, invoiceNo: 'ACM-2026-002', clientId: clientGlobetech.id,
      projectId: projWebsite.id, status: 'SENT', issueDate: new Date('2026-03-01'),
      dueDate: new Date('2026-04-01'), taxRate: 0,
    },
  });
  await prisma.invoiceLineItem.upsert({
    where: { id: 'seed-li-2a' }, update: {},
    create: { id: 'seed-li-2a', invoiceId: inv2.id, description: 'Frontend Development - Phase 1', quantity: 80, unitPrice: 150, amount: 12000 },
  });

  const inv3 = await prisma.invoice.upsert({
    where: { id: 'seed-inv-3' },
    update: {},
    create: {
      id: 'seed-inv-3', orgId: acme.id, invoiceNo: 'ACM-2026-003', clientId: clientBrightpath.id,
      projectId: projApp.id, status: 'DRAFT', issueDate: new Date('2026-03-15'),
      dueDate: new Date('2026-04-15'), taxRate: 8.5,
    },
  });
  await prisma.invoiceLineItem.upsert({
    where: { id: 'seed-li-3a' }, update: {},
    create: { id: 'seed-li-3a', invoiceId: inv3.id, description: 'Mobile App - Sprint 1', quantity: 120, unitPrice: 175, amount: 21000 },
  });
  await prisma.invoiceLineItem.upsert({
    where: { id: 'seed-li-3b' }, update: {},
    create: { id: 'seed-li-3b', invoiceId: inv3.id, description: 'UX Research & Testing', quantity: 1, unitPrice: 4500, amount: 4500 },
  });

  const inv4 = await prisma.invoice.upsert({
    where: { id: 'seed-inv-4' },
    update: {},
    create: {
      id: 'seed-inv-4', orgId: acme.id, invoiceNo: 'ACM-2026-004', clientId: clientUrbanNest.id,
      projectId: projBranding.id, status: 'OVERDUE', issueDate: new Date('2025-12-20'),
      dueDate: new Date('2026-01-20'), taxRate: 0,
    },
  });
  await prisma.invoiceLineItem.upsert({
    where: { id: 'seed-li-4a' }, update: {},
    create: { id: 'seed-li-4a', invoiceId: inv4.id, description: 'Complete Brand Identity Package', quantity: 1, unitPrice: 15000, amount: 15000 },
  });

  // ─── Activity Logs (Acme) ───
  const activities = [
    { orgId: acme.id, userId: demo.id, action: 'project.created', entity: 'Project', entityId: projWebsite.id, metadata: { name: 'Globetech Website Redesign' } },
    { orgId: acme.id, userId: alice.id, action: 'task.status_changed', entity: 'Task', entityId: 'seed-task-1', metadata: { from: 'IN_PROGRESS', to: 'DONE' } },
    { orgId: acme.id, userId: demo.id, action: 'invoice.created', entity: 'Invoice', entityId: inv1.id, metadata: { invoiceNo: 'ACM-2026-001' } },
    { orgId: acme.id, userId: bob.id, action: 'task.status_changed', entity: 'Task', entityId: 'seed-task-2', metadata: { from: 'TODO', to: 'IN_PROGRESS' } },
    { orgId: acme.id, userId: demo.id, action: 'invoice.marked_paid', entity: 'Invoice', entityId: inv1.id, metadata: { invoiceNo: 'ACM-2026-001', amount: 13000 } },
    { orgId: acme.id, userId: alice.id, action: 'client.created', entity: 'Client', entityId: clientBrightpath.id, metadata: { name: 'Brightpath Education' } },
  ];

  for (const a of activities) {
    await prisma.activityLog.create({ data: a as any });
  }

  console.log('Seed complete!');
  console.log('Demo login: demo@opscore.dev / password123');
  console.log('Orgs: acme-agency, nova-studio');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

**Step 2: Add seed config to package.json**

Add to `apps/api/package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Step 3: Run seed**

```bash
cd apps/api && npx prisma db seed && cd ../..
```

**Step 4: Commit**

```bash
git add apps/api/prisma/seed.ts apps/api/package.json
git commit -m "feat: add seed script with 2 orgs, 4 users, clients, projects, tasks, and invoices"
```

---

### Task 8: Wire Up App Module & Verify Backend Boots

**Files:**
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/main.ts`

**Step 1: Update app.module.ts**

`apps/api/src/app.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { MembershipsModule } from './modules/memberships/memberships.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    AuthModule,
    OrganizationsModule,
    MembershipsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
```

**Step 2: Update main.ts**

`apps/api/src/main.ts`:
```ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT || 4000);
  console.log(`API running on http://localhost:${process.env.PORT || 4000}/api`);
}

bootstrap();
```

**Step 3: Verify it boots**

```bash
cd apps/api && pnpm run start:dev
# Should see: API running on http://localhost:4000/api
# Ctrl+C to stop
```

**Step 4: Commit**

```bash
git add apps/api/src/app.module.ts apps/api/src/main.ts
git commit -m "feat: wire up app module with auth, orgs, memberships, global pipes and filters"
```

---

### Task 9: Next.js Bootstrap (Auth Pages, Providers, API Client)

**Files:**
- Create: `apps/web/src/lib/api-client.ts`
- Create: `apps/web/src/lib/auth.ts`
- Create: `apps/web/src/lib/providers/auth-provider.tsx`
- Create: `apps/web/src/lib/providers/org-provider.tsx`
- Create: `apps/web/src/lib/hooks/use-auth.ts`
- Create: `apps/web/src/lib/hooks/use-org.ts`
- Create: `apps/web/src/lib/utils/cn.ts`
- Create: `apps/web/src/app/(auth)/layout.tsx`
- Create: `apps/web/src/app/(auth)/login/page.tsx`
- Create: `apps/web/src/app/(auth)/register/page.tsx`
- Create: `apps/web/src/app/(app)/layout.tsx`
- Create: `apps/web/src/app/(app)/select-org/page.tsx`
- Create: `apps/web/src/app/(app)/dashboard/page.tsx`

**Step 1: Install frontend deps**

```bash
cd apps/web
pnpm add zustand react-hook-form @hookform/resolvers zod sonner
pnpm add -D @types/node
cd ../..
```

**Step 2: Create utility**

`apps/web/src/lib/utils/cn.ts`:
```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 3: Create API client**

`apps/web/src/lib/api-client.ts`:
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

class ApiClient {
  private accessToken: string | null = null;
  private orgId: string | null = null;

  setAccessToken(token: string | null) { this.accessToken = token; }
  setOrgId(orgId: string | null) { this.orgId = orgId; }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`;
    if (this.orgId) headers['x-org-id'] = this.orgId;

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 401) {
      // Try refresh
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retry = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });
        if (!retry.ok) throw new ApiError(retry.status, await retry.json());
        return retry.json();
      }
      // Refresh failed — redirect to login
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new ApiError(401, { message: 'Unauthorized' });
    }

    if (!res.ok) throw new ApiError(res.status, await res.json());
    if (res.status === 204) return {} as T;
    return res.json();
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint); }
  post<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'POST', body }); }
  patch<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'PATCH', body }); }
  del<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.accessToken = data.data?.accessToken || data.accessToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', this.accessToken!);
        localStorage.setItem('refreshToken', data.data?.refreshToken || data.refreshToken);
      }
      return true;
    } catch { return false; }
  }
}

export class ApiError extends Error {
  constructor(public status: number, public data: any) {
    super(data?.message || `API Error ${status}`);
  }
}

export const api = new ApiClient();
```

**Step 4: Create auth store**

`apps/web/src/lib/auth.ts`:
```ts
import { create } from 'zustand';
import { api } from './api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  init: () => {
    if (typeof window === 'undefined') { set({ isLoading: false }); return; }
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      api.setAccessToken(token);
      set({ user: JSON.parse(userStr), isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post<any>('/auth/login', { email, password });
    const data = res.data || res;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    api.setAccessToken(data.accessToken);
    set({ user: data.user });
  },

  register: async (data) => {
    const res = await api.post<any>('/auth/register', data);
    const d = res.data || res;
    localStorage.setItem('accessToken', d.accessToken);
    localStorage.setItem('refreshToken', d.refreshToken);
    localStorage.setItem('user', JSON.stringify(d.user));
    api.setAccessToken(d.accessToken);
    set({ user: d.user });
  },

  demoLogin: async () => {
    const res = await api.post<any>('/auth/demo');
    const data = res.data || res;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    api.setAccessToken(data.accessToken);
    set({ user: data.user });
  },

  logout: () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('orgId');
    api.setAccessToken(null);
    api.setOrgId(null);
    set({ user: null });
  },
}));
```

**Step 5: Create org store**

`apps/web/src/lib/hooks/use-org.ts`:
```ts
import { create } from 'zustand';
import { api } from '../api-client';

interface Org {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

interface OrgState {
  currentOrg: Org | null;
  orgs: Org[];
  isLoading: boolean;
  fetchOrgs: () => Promise<void>;
  selectOrg: (org: Org) => void;
  init: () => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  currentOrg: null,
  orgs: [],
  isLoading: true,

  init: () => {
    if (typeof window === 'undefined') { set({ isLoading: false }); return; }
    const orgStr = localStorage.getItem('currentOrg');
    if (orgStr) {
      const org = JSON.parse(orgStr);
      api.setOrgId(org.id);
      set({ currentOrg: org, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  fetchOrgs: async () => {
    set({ isLoading: true });
    const res = await api.get<any>('/organizations');
    const orgs = res.data || res;
    set({ orgs, isLoading: false });
  },

  selectOrg: (org) => {
    localStorage.setItem('currentOrg', JSON.stringify(org));
    api.setOrgId(org.id);
    set({ currentOrg: org });
  },
}));
```

**Step 6: Create auth layout**

`apps/web/src/app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">OpsCore</h1>
          <p className="text-sm text-gray-500 mt-1">Business operations, simplified</p>
        </div>
        {children}
      </div>
    </div>
  );
}
```

**Step 7: Create login page (placeholder)**

`apps/web/src/app/(auth)/login/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const demoLogin = useAuthStore((s) => s.demoLogin);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/select-org');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await demoLogin();
      router.push('/select-org');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Sign in to your account</h2>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-md p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="you@company.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••" required />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-gray-900 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <div className="mt-4">
        <button onClick={handleDemo} disabled={loading}
          className="w-full border border-gray-300 text-gray-700 rounded-md py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
          Try Demo
        </button>
      </div>
      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account? <Link href="/register" className="text-blue-600 hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
```

**Step 8: Create register page (placeholder)**

`apps/web/src/app/(auth)/register/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/create-org');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Create your account</h2>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-md p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input type="text" value={form.firstName} onChange={set('firstName')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
            <input type="text" value={form.lastName} onChange={set('lastName')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={set('email')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value={form.password} onChange={set('password')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Min. 8 characters" required />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-gray-900 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
```

**Step 9: Create app layout shell (placeholder)**

`apps/web/src/app/(app)/layout.tsx`:
```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useOrgStore } from '@/lib/hooks/use-org';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, init: initAuth } = useAuthStore();
  const { init: initOrg } = useOrgStore();
  const router = useRouter();

  useEffect(() => { initAuth(); initOrg(); }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar and topbar will be built in Phase 2 */}
      <main className="p-6">{children}</main>
    </div>
  );
}
```

**Step 10: Create org select page**

`apps/web/src/app/(app)/select-org/page.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrgStore } from '@/lib/hooks/use-org';
import Link from 'next/link';

export default function SelectOrgPage() {
  const { orgs, fetchOrgs, selectOrg, isLoading } = useOrgStore();
  const router = useRouter();

  useEffect(() => { fetchOrgs(); }, []);

  const handleSelect = (org: any) => {
    selectOrg(org);
    router.push('/dashboard');
  };

  return (
    <div className="max-w-lg mx-auto mt-20">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Select a workspace</h1>
      <p className="text-sm text-gray-500 mb-6">Choose an organization to continue.</p>
      {isLoading ? (
        <div className="text-gray-400 text-sm">Loading workspaces...</div>
      ) : orgs.length === 0 ? (
        <div className="border rounded-lg p-6 text-center">
          <p className="text-gray-500 text-sm mb-4">You don&apos;t belong to any workspace yet.</p>
          <Link href="/create-org"
            className="inline-block bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800">
            Create workspace
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {orgs.map((org: any) => (
            <button key={org.id} onClick={() => handleSelect(org)}
              className="w-full text-left border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="font-medium text-gray-900">{org.name}</div>
              <div className="text-sm text-gray-500">{org.slug}</div>
            </button>
          ))}
          <Link href="/create-org" className="block text-center text-sm text-blue-600 hover:underline mt-4">
            + Create new workspace
          </Link>
        </div>
      )}
    </div>
  );
}
```

**Step 11: Create dashboard placeholder**

`apps/web/src/app/(app)/dashboard/page.tsx`:
```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Dashboard</h1>
      <p className="text-gray-500 text-sm">Dashboard content will be built in Phase 4.</p>
    </div>
  );
}
```

**Step 12: Commit**

```bash
git add apps/web/src
git commit -m "feat: add Next.js auth pages, API client, auth/org stores, and app shell"
```

**Phase 1 complete.** Checkpoint: User can register → create org → log in → see empty app shell.

---

## Phase 2: Core CRUD (Clients, Projects, Tasks)

### Task 10: Clients Backend Module

**Files:**
- Create: `apps/api/src/modules/clients/clients.module.ts`
- Create: `apps/api/src/modules/clients/clients.controller.ts`
- Create: `apps/api/src/modules/clients/clients.service.ts`
- Create: `apps/api/src/modules/clients/dto/create-client.dto.ts`
- Create: `apps/api/src/modules/clients/dto/update-client.dto.ts`
- Create: `apps/api/src/modules/clients/dto/create-note.dto.ts`
- Modify: `apps/api/src/app.module.ts` (import ClientsModule)

**Step 1: Create DTOs**

`apps/api/src/modules/clients/dto/create-client.dto.ts`:
```ts
import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateClientDto {
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() @MaxLength(100) company?: string;
  @IsOptional() @IsString() @MaxLength(200) address?: string;
}
```

`apps/api/src/modules/clients/dto/update-client.dto.ts`:
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
export class UpdateClientDto extends PartialType(CreateClientDto) {}
```

`apps/api/src/modules/clients/dto/create-note.dto.ts`:
```ts
import { IsString, MinLength } from 'class-validator';
export class CreateNoteDto {
  @IsString() @MinLength(1) content: string;
}
```

**Step 2: Create service**

`apps/api/src/modules/clients/clients.service.ts`:
```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto, paginationMeta } from '../../common/dto/pagination.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: PaginationDto & { search?: string }) {
    const { page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc', search } = query;
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
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { projects: true, invoices: true } } },
      }),
      this.prisma.client.count({ where }),
    ]);
    return { data, meta: paginationMeta(total, page, limit) };
  }

  async findById(id: string, orgId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, orgId },
      include: {
        projects: { orderBy: { createdAt: 'desc' }, take: 10 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        notes: { orderBy: { createdAt: 'desc' } },
        _count: { select: { projects: true, invoices: true } },
      },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(orgId: string, dto: CreateClientDto) {
    return this.prisma.client.create({ data: { orgId, ...dto } });
  }

  async update(id: string, orgId: string, dto: UpdateClientDto) {
    await this.findById(id, orgId);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: string, orgId: string) {
    await this.findById(id, orgId);
    return this.prisma.client.delete({ where: { id } });
  }

  async addNote(clientId: string, orgId: string, authorId: string, content: string) {
    await this.findById(clientId, orgId);
    return this.prisma.clientNote.create({ data: { clientId, authorId, content } });
  }
}
```

**Step 3: Create controller**

`apps/api/src/modules/clients/clients.controller.ts`:
```ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('clients')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  findAll(@CurrentOrg('id') orgId: string, @Query() query: PaginationDto & { search?: string }) {
    return this.clientsService.findAll(orgId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.clientsService.findById(id, orgId);
  }

  @Post()
  create(@CurrentOrg('id') orgId: string, @Body() dto: CreateClientDto) {
    return this.clientsService.create(orgId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentOrg('id') orgId: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, orgId, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.clientsService.remove(id, orgId);
  }

  @Post(':id/notes')
  addNote(@Param('id') id: string, @CurrentOrg('id') orgId: string,
    @CurrentUser('id') userId: string, @Body() dto: CreateNoteDto) {
    return this.clientsService.addNote(id, orgId, userId, dto.content);
  }
}
```

**Step 4: Create module and register in app.module.ts**

`apps/api/src/modules/clients/clients.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
```

Add `ClientsModule` to imports in `apps/api/src/app.module.ts`.

**Step 5: Commit**

```bash
git add apps/api/src/modules/clients apps/api/src/app.module.ts
git commit -m "feat: add clients module with CRUD, search, notes, and pagination"
```

---

### Task 11: Projects Backend Module

**Files:**
- Create: `apps/api/src/modules/projects/projects.module.ts`
- Create: `apps/api/src/modules/projects/projects.controller.ts`
- Create: `apps/api/src/modules/projects/projects.service.ts`
- Create: `apps/api/src/modules/projects/dto/create-project.dto.ts`
- Create: `apps/api/src/modules/projects/dto/update-project.dto.ts`

**Step 1: Create DTOs**

`apps/api/src/modules/projects/dto/create-project.dto.ts`:
```ts
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']) status?: string;
  @IsOptional() @IsString() clientId?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsNumber() budget?: number;
}
```

`apps/api/src/modules/projects/dto/update-project.dto.ts`:
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
```

**Step 2: Create service**

`apps/api/src/modules/projects/projects.service.ts`:
```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto, paginationMeta } from '../../common/dto/pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: PaginationDto & { status?: string; clientId?: string; search?: string }) {
    const { page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc', status, clientId, search } = query;
    const where: any = { orgId };
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: { select: { id: true, name: true } },
          _count: { select: { tasks: true, members: true } },
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
        client: { select: { id: true, name: true } },
        tasks: { orderBy: { createdAt: 'desc' }, include: { assignee: { select: { id: true, firstName: true, lastName: true } } } },
        members: { include: { project: false } },
        _count: { select: { tasks: true, members: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(orgId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: { orgId, ...dto, status: (dto.status as any) || 'ACTIVE' },
    });
  }

  async update(id: string, orgId: string, dto: UpdateProjectDto) {
    await this.findById(id, orgId);
    return this.prisma.project.update({ where: { id }, data: { ...dto, status: dto.status as any } });
  }

  async remove(id: string, orgId: string) {
    await this.findById(id, orgId);
    return this.prisma.project.delete({ where: { id } });
  }

  async addMember(projectId: string, orgId: string, userId: string) {
    await this.findById(projectId, orgId);
    return this.prisma.projectMember.create({ data: { projectId, userId } });
  }

  async removeMember(projectId: string, orgId: string, userId: string) {
    await this.findById(projectId, orgId);
    return this.prisma.projectMember.deleteMany({ where: { projectId, userId } });
  }
}
```

**Step 3: Create controller**

`apps/api/src/modules/projects/projects.controller.ts`:
```ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  findAll(@CurrentOrg('id') orgId: string, @Query() query: PaginationDto & { status?: string; clientId?: string; search?: string }) {
    return this.projectsService.findAll(orgId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.projectsService.findById(id, orgId);
  }

  @Post()
  create(@CurrentOrg('id') orgId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(orgId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentOrg('id') orgId: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, orgId, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.projectsService.remove(id, orgId);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @CurrentOrg('id') orgId: string, @Body('userId') userId: string) {
    return this.projectsService.addMember(id, orgId, userId);
  }

  @Delete(':id/members/:uid')
  removeMember(@Param('id') id: string, @Param('uid') uid: string, @CurrentOrg('id') orgId: string) {
    return this.projectsService.removeMember(id, orgId, uid);
  }
}
```

**Step 4: Create module, register in app.module.ts**

`apps/api/src/modules/projects/projects.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
```

**Step 5: Commit**

```bash
git add apps/api/src/modules/projects apps/api/src/app.module.ts
git commit -m "feat: add projects module with CRUD, member assignment, filtering"
```

---

### Task 12: Tasks Backend Module

**Files:**
- Create: `apps/api/src/modules/tasks/tasks.module.ts`
- Create: `apps/api/src/modules/tasks/tasks.controller.ts`
- Create: `apps/api/src/modules/tasks/tasks.service.ts`
- Create: `apps/api/src/modules/tasks/dto/create-task.dto.ts`
- Create: `apps/api/src/modules/tasks/dto/update-task.dto.ts`

**Step 1: Create DTOs**

`apps/api/src/modules/tasks/dto/create-task.dto.ts`:
```ts
import { IsString, IsOptional, IsEnum, IsDateString, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsString() @MaxLength(200) title: string;
  @IsOptional() @IsString() description?: string;
  @IsString() projectId: string;
  @IsOptional() @IsEnum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']) status?: string;
  @IsOptional() @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']) priority?: string;
  @IsOptional() @IsString() assigneeId?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}
```

`apps/api/src/modules/tasks/dto/update-task.dto.ts`:
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
```

**Step 2: Create service**

`apps/api/src/modules/tasks/tasks.service.ts`:
```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto, paginationMeta } from '../../common/dto/pagination.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: PaginationDto & {
    projectId?: string; assigneeId?: string; status?: string; priority?: string; search?: string;
  }) {
    const { page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc',
      projectId, assigneeId, status, priority, search } = query;
    const where: any = { orgId };
    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
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
        assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(orgId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        orgId, title: dto.title, description: dto.description,
        projectId: dto.projectId, status: (dto.status as any) || 'TODO',
        priority: (dto.priority as any) || 'MEDIUM',
        assigneeId: dto.assigneeId, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async update(id: string, orgId: string, dto: UpdateTaskDto) {
    await this.findById(id, orgId);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status as any,
        priority: dto.priority as any,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(id: string, orgId: string) {
    await this.findById(id, orgId);
    return this.prisma.task.delete({ where: { id } });
  }
}
```

**Step 3: Create controller**

`apps/api/src/modules/tasks/tasks.controller.ts`:
```ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, TenantGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  findAll(@CurrentOrg('id') orgId: string, @Query() query: PaginationDto & {
    projectId?: string; assigneeId?: string; status?: string; priority?: string; search?: string;
  }) {
    return this.tasksService.findAll(orgId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.tasksService.findById(id, orgId);
  }

  @Post()
  create(@CurrentOrg('id') orgId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(orgId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentOrg('id') orgId: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, orgId, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('MANAGER')
  remove(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.tasksService.remove(id, orgId);
  }
}
```

**Step 4: Create module, register in app.module.ts**

`apps/api/src/modules/tasks/tasks.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
```

**Step 5: Commit**

```bash
git add apps/api/src/modules/tasks apps/api/src/app.module.ts
git commit -m "feat: add tasks module with CRUD, multi-filter support, and role-based deletion"
```

---

### Task 13: Reusable Frontend Components (DataTable, PageHeader, Sidebar)

**Files:**
- Create: `apps/web/src/components/layout/app-shell.tsx`
- Create: `apps/web/src/components/layout/sidebar.tsx`
- Create: `apps/web/src/components/layout/topbar.tsx`
- Create: `apps/web/src/components/layout/page-header.tsx`
- Create: `apps/web/src/components/data/data-table.tsx`
- Create: `apps/web/src/components/data/empty-state.tsx`
- Create: `apps/web/src/components/data/stat-card.tsx`
- Create: `apps/web/src/components/data/pagination.tsx`
- Create: `apps/web/src/components/feedback/loading-skeleton.tsx`

This task involves setting up shadcn/ui and building reusable layout + data components. These will be used across all CRUD pages.

**Step 1: Initialize shadcn/ui**

```bash
cd apps/web
pnpm dlx shadcn@latest init
# Select: New York style, Zinc base color, CSS variables: yes
pnpm dlx shadcn@latest add button input label table dialog dropdown-menu badge separator avatar sheet command
pnpm add @tanstack/react-table lucide-react
cd ../..
```

**Step 2: Create sidebar**

`apps/web/src/components/layout/sidebar.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  FileText, UsersRound, BarChart3, Settings,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Team', href: '/team', icon: UsersRound },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r bg-white flex flex-col h-screen fixed left-0 top-0">
      <div className="h-14 flex items-center px-5 border-b">
        <span className="font-bold text-lg text-gray-900">OpsCore</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

**Step 3: Create topbar**

`apps/web/src/components/layout/topbar.tsx`:
```tsx
'use client';

import { useAuthStore } from '@/lib/auth';
import { useOrgStore } from '@/lib/hooks/use-org';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const { user, logout } = useAuthStore();
  const { currentOrg } = useOrgStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 fixed top-0 left-60 right-0 z-10">
      <div className="text-sm text-gray-500">
        {currentOrg?.name || 'No workspace selected'}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{user?.firstName} {user?.lastName}</span>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">
          Sign out
        </button>
      </div>
    </header>
  );
}
```

**Step 4: Create app shell**

`apps/web/src/components/layout/app-shell.tsx`:
```tsx
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />
      <main className="ml-60 mt-14 p-6">{children}</main>
    </div>
  );
}
```

**Step 5: Create page header**

`apps/web/src/components/layout/page-header.tsx`:
```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
```

**Step 6: Create empty state**

`apps/web/src/components/data/empty-state.tsx`:
```tsx
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-gray-100 p-3 mb-4">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}
```

**Step 7: Create stat card**

`apps/web/src/components/data/stat-card.tsx`:
```tsx
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {trend && (
        <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}
```

**Step 8: Create loading skeleton**

`apps/web/src/components/feedback/loading-skeleton.tsx`:
```tsx
import { cn } from '@/lib/utils/cn';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-4" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className="h-8" />)}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
```

**Step 9: Update app layout to use AppShell**

Update `apps/web/src/app/(app)/layout.tsx` to use the new `AppShell` component:
```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useOrgStore } from '@/lib/hooks/use-org';
import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, init: initAuth } = useAuthStore();
  const { init: initOrg } = useOrgStore();
  const router = useRouter();

  useEffect(() => { initAuth(); initOrg(); }, []);
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  return <AppShell>{children}</AppShell>;
}
```

**Step 10: Commit**

```bash
git add apps/web/src/components apps/web/src/app
git commit -m "feat: add app shell with sidebar, topbar, reusable data components, and shadcn/ui setup"
```

---

### Task 14-16: Frontend CRUD Pages (Clients, Projects, Tasks)

These three tasks follow the same pattern. For brevity, the plan provides the client pages in full (Task 14) — projects and tasks follow the identical structure with their respective fields.

**Task 14: Client Pages**

**Files:**
- Create: `apps/web/src/app/(app)/clients/page.tsx`
- Create: `apps/web/src/app/(app)/clients/new/page.tsx`
- Create: `apps/web/src/app/(app)/clients/[id]/page.tsx`
- Create: `apps/web/src/app/(app)/clients/[id]/edit/page.tsx`

**Step 1: Client list page**

`apps/web/src/app/(app)/clients/page.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/data/empty-state';
import { TableSkeleton } from '@/components/feedback/loading-skeleton';
import { Users, Plus } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchClients = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get<any>(`/clients?page=${page}&limit=25&search=${search}`);
      setClients(res.data);
      setMeta(res.meta);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, [search]);

  return (
    <div>
      <PageHeader title="Clients" description="Manage your client relationships"
        action={<Link href="/clients/new" className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800"><Plus className="h-4 w-4" /> Add Client</Link>} />

      <div className="mb-4">
        <input type="text" placeholder="Search clients..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {loading ? <TableSkeleton /> : clients.length === 0 ? (
        <EmptyState icon={Users} title="No clients yet" description="Add your first client to start tracking projects and invoices."
          action={<Link href="/clients/new" className="text-sm text-blue-600 hover:underline">+ Add client</Link>} />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Company</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Projects</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c.id}`} className="text-blue-600 hover:underline font-medium">{c.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.company || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c._count?.projects || 0}</td>
                  <td className="px-4 py-3 text-gray-600">{c._count?.invoices || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta && meta.totalPages > 1 && (
            <div className="border-t px-4 py-3 flex items-center justify-between text-sm text-gray-500">
              <span>Page {meta.page} of {meta.totalPages} ({meta.total} clients)</span>
              <div className="flex gap-2">
                <button disabled={meta.page <= 1} onClick={() => fetchClients(meta.page - 1)}
                  className="px-3 py-1 border rounded-md disabled:opacity-50">Previous</button>
                <button disabled={meta.page >= meta.totalPages} onClick={() => fetchClients(meta.page + 1)}
                  className="px-3 py-1 border rounded-md disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Create client page**

`apps/web/src/app/(app)/clients/new/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';

export default function NewClientPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/clients', form);
      router.push('/clients');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-2xl">
      <PageHeader title="New Client" />
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-md p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input type="text" value={form.name} onChange={set('name')} required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input type="text" value={form.company} onChange={set('company')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={set('email')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={set('phone')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input type="text" value={form.address} onChange={set('address')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Client'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Step 3: Client detail page**

`apps/web/src/app/(app)/clients/[id]/page.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { useAuthStore } from '@/lib/auth';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    api.get<any>(`/clients/${id}`).then((res) => {
      setClient(res.data || res);
    }).finally(() => setLoading(false));
  }, [id]);

  const addNote = async () => {
    if (!noteContent.trim()) return;
    await api.post(`/clients/${id}/notes`, { content: noteContent });
    setNoteContent('');
    const res = await api.get<any>(`/clients/${id}`);
    setClient(res.data || res);
  };

  if (loading) return <div className="text-gray-400">Loading...</div>;
  if (!client) return <div className="text-red-500">Client not found</div>;

  return (
    <div>
      <PageHeader title={client.name} description={client.company || undefined}
        action={<Link href={`/clients/${id}/edit`} className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Edit</Link>} />

      <div className="grid grid-cols-3 gap-6">
        {/* Info */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-500">Email</dt><dd className="text-gray-900">{client.email || '—'}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="text-gray-900">{client.phone || '—'}</dd></div>
              <div className="col-span-2"><dt className="text-gray-500">Address</dt><dd className="text-gray-900">{client.address || '—'}</dd></div>
            </dl>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-lg border p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Projects ({client.projects?.length || 0})</h3>
            {client.projects?.length === 0 ? <p className="text-sm text-gray-500">No projects yet.</p> : (
              <div className="space-y-2">
                {client.projects?.map((p: any) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block border rounded-md p-3 hover:bg-gray-50">
                    <div className="font-medium text-sm text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.status}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Notes</h3>
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {client.notes?.length === 0 ? <p className="text-sm text-gray-500">No notes yet.</p> :
                client.notes?.map((n: any) => (
                  <div key={n.id} className="border-l-2 border-gray-200 pl-3">
                    <p className="text-sm text-gray-700">{n.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              }
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Add a note..." value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={addNote}
                className="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add apps/web/src/app
git commit -m "feat: add client list, create, detail, and edit pages"
```

**Task 15: Project Pages** — follow same pattern as Task 14, with fields: name, description, status, client (dropdown), startDate, dueDate, budget. Detail page shows task list + member avatars + progress bar.

**Task 16: Task Pages** — follow same pattern as Task 14, with fields: title, description, project (dropdown), assignee (dropdown), status, priority, dueDate. List page includes filter dropdowns for status, priority, assignee.

**Step: Commit each**

```bash
git commit -m "feat: add project list, create, detail, and edit pages"
git commit -m "feat: add task list, create, and detail pages with multi-filter support"
```

---

## Phase 3: Invoicing + PDF

### Task 17: Invoices Backend Module

**Files:**
- Create: `apps/api/src/modules/invoices/invoices.module.ts`
- Create: `apps/api/src/modules/invoices/invoices.controller.ts`
- Create: `apps/api/src/modules/invoices/invoices.service.ts`
- Create: `apps/api/src/modules/invoices/invoice-pdf.service.ts`
- Create: `apps/api/src/modules/invoices/dto/create-invoice.dto.ts`
- Create: `apps/api/src/modules/invoices/dto/update-invoice.dto.ts`

**Step 1: Install PDF dependency**

```bash
cd apps/api && pnpm add pdfkit && pnpm add -D @types/pdfkit && cd ../..
```

**Step 2: DTOs**

`apps/api/src/modules/invoices/dto/create-invoice.dto.ts`:
```ts
import { IsString, IsOptional, IsDateString, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class LineItemDto {
  @IsString() description: string;
  @IsNumber() @Min(0) quantity: number;
  @IsNumber() @Min(0) unitPrice: number;
}

export class CreateInvoiceDto {
  @IsString() clientId: string;
  @IsOptional() @IsString() projectId?: string;
  @IsDateString() dueDate: string;
  @IsOptional() @IsNumber() taxRate?: number;
  @IsOptional() @IsString() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => LineItemDto)
  lineItems: LineItemDto[];
}
```

`apps/api/src/modules/invoices/dto/update-invoice.dto.ts`:
```ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';
export class UpdateInvoiceDto extends PartialType(OmitType(CreateInvoiceDto, ['lineItems'])) {}
```

**Step 3: Service (includes auto invoice number generation)**

`apps/api/src/modules/invoices/invoices.service.ts`:
```ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PaginationDto, paginationMeta } from '../../common/dto/pagination.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: PaginationDto & { status?: string; clientId?: string }) {
    const { page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc', status, clientId } = query;
    const where: any = { orgId };
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: { select: { id: true, name: true } },
          lineItems: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const withTotals = data.map((inv) => ({
      ...inv,
      total: inv.lineItems.reduce((sum, li) => sum + Number(li.amount), 0),
    }));

    return { data: withTotals, meta: paginationMeta(total, page, limit) };
  }

  async findById(id: string, orgId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, orgId },
      include: { client: true, project: { select: { id: true, name: true } }, lineItems: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return {
      ...invoice,
      total: invoice.lineItems.reduce((sum, li) => sum + Number(li.amount), 0),
    };
  }

  async create(orgId: string, dto: CreateInvoiceDto) {
    const settings = await this.prisma.orgSettings.findUnique({ where: { orgId } });
    const prefix = settings?.invoicePrefix || 'INV';
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count({ where: { orgId } });
    const invoiceNo = `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;

    return this.prisma.invoice.create({
      data: {
        orgId, invoiceNo, clientId: dto.clientId, projectId: dto.projectId,
        dueDate: new Date(dto.dueDate), taxRate: dto.taxRate, notes: dto.notes,
        lineItems: {
          create: dto.lineItems.map((li) => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            amount: li.quantity * li.unitPrice,
          })),
        },
      },
      include: { lineItems: true },
    });
  }

  async update(id: string, orgId: string, dto: UpdateInvoiceDto) {
    const invoice = await this.findById(id, orgId);
    if (invoice.status !== 'DRAFT') throw new BadRequestException('Can only edit DRAFT invoices');
    return this.prisma.invoice.update({ where: { id }, data: dto as any });
  }

  async send(id: string, orgId: string) {
    const invoice = await this.findById(id, orgId);
    if (invoice.status !== 'DRAFT') throw new BadRequestException('Can only send DRAFT invoices');
    return this.prisma.invoice.update({ where: { id }, data: { status: 'SENT' } });
  }

  async markPaid(id: string, orgId: string) {
    const invoice = await this.findById(id, orgId);
    if (!['SENT', 'OVERDUE'].includes(invoice.status)) throw new BadRequestException('Invalid status transition');
    return this.prisma.invoice.update({ where: { id }, data: { status: 'PAID' } });
  }
}
```

**Step 4: PDF service**

`apps/api/src/modules/invoices/invoice-pdf.service.ts`:
```ts
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { InvoicesService } from './invoices.service';

@Injectable()
export class InvoicePdfService {
  constructor(private invoicesService: InvoicesService) {}

  async generatePdf(invoiceId: string, orgId: string): Promise<Buffer> {
    const invoice = await this.invoicesService.findById(invoiceId, orgId);

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).text('INVOICE', { align: 'right' });
      doc.fontSize(10).text(invoice.invoiceNo, { align: 'right' });
      doc.moveDown();

      // Client info
      doc.fontSize(12).text('Bill To:');
      doc.fontSize(10).text(invoice.client.name);
      if (invoice.client.email) doc.text(invoice.client.email);
      if (invoice.client.address) doc.text(invoice.client.address);
      doc.moveDown();

      // Dates
      doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`);
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
      doc.text(`Status: ${invoice.status}`);
      doc.moveDown();

      // Line items table
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Description', 50, tableTop);
      doc.text('Qty', 300, tableTop, { width: 60, align: 'right' });
      doc.text('Price', 370, tableTop, { width: 80, align: 'right' });
      doc.text('Amount', 460, tableTop, { width: 80, align: 'right' });
      doc.font('Helvetica');

      let y = tableTop + 20;
      doc.moveTo(50, y - 5).lineTo(540, y - 5).stroke();

      for (const item of invoice.lineItems) {
        doc.text(item.description, 50, y, { width: 240 });
        doc.text(String(item.quantity), 300, y, { width: 60, align: 'right' });
        doc.text(`$${Number(item.unitPrice).toFixed(2)}`, 370, y, { width: 80, align: 'right' });
        doc.text(`$${Number(item.amount).toFixed(2)}`, 460, y, { width: 80, align: 'right' });
        y += 20;
      }

      // Total
      doc.moveTo(50, y + 5).lineTo(540, y + 5).stroke();
      y += 15;
      const subtotal = invoice.total;
      const tax = invoice.taxRate ? subtotal * (Number(invoice.taxRate) / 100) : 0;
      const total = subtotal + tax;

      doc.font('Helvetica-Bold');
      doc.text('Subtotal:', 370, y, { width: 80, align: 'right' });
      doc.text(`$${subtotal.toFixed(2)}`, 460, y, { width: 80, align: 'right' });
      if (invoice.taxRate) {
        y += 20;
        doc.text(`Tax (${invoice.taxRate}%):`, 370, y, { width: 80, align: 'right' });
        doc.text(`$${tax.toFixed(2)}`, 460, y, { width: 80, align: 'right' });
      }
      y += 20;
      doc.fontSize(12).text('Total:', 370, y, { width: 80, align: 'right' });
      doc.text(`$${total.toFixed(2)}`, 460, y, { width: 80, align: 'right' });

      if (invoice.notes) {
        doc.moveDown(3);
        doc.fontSize(10).font('Helvetica').text('Notes:', 50);
        doc.text(invoice.notes, 50);
      }

      doc.end();
    });
  }
}
```

**Step 5: Controller and module**

`apps/api/src/modules/invoices/invoices.controller.ts`:
```ts
import { Controller, Get, Post, Patch, Param, Body, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, TenantGuard)
export class InvoicesController {
  constructor(
    private invoicesService: InvoicesService,
    private pdfService: InvoicePdfService,
  ) {}

  @Get() findAll(@CurrentOrg('id') orgId: string, @Query() query: PaginationDto & { status?: string; clientId?: string }) {
    return this.invoicesService.findAll(orgId, query);
  }

  @Get(':id') findOne(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.invoicesService.findById(id, orgId);
  }

  @Post() create(@CurrentOrg('id') orgId: string, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(orgId, dto);
  }

  @Patch(':id') update(@Param('id') id: string, @CurrentOrg('id') orgId: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, orgId, dto);
  }

  @Post(':id/send') send(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.invoicesService.send(id, orgId);
  }

  @Post(':id/mark-paid') markPaid(@Param('id') id: string, @CurrentOrg('id') orgId: string) {
    return this.invoicesService.markPaid(id, orgId);
  }

  @Get(':id/pdf') async downloadPdf(@Param('id') id: string, @CurrentOrg('id') orgId: string, @Res() res: Response) {
    const buffer = await this.pdfService.generatePdf(id, orgId);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="invoice-${id}.pdf"` });
    res.send(buffer);
  }
}
```

`apps/api/src/modules/invoices/invoices.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { InvoicePdfService } from './invoice-pdf.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicePdfService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
```

Register in `app.module.ts`.

**Step 6: Commit**

```bash
git add apps/api/src/modules/invoices apps/api/src/app.module.ts
git commit -m "feat: add invoices module with CRUD, status transitions, and PDF generation"
```

---

### Task 18: Invoice Frontend Pages

Follow same pattern as client pages. Key unique elements:

- **List page**: status badge colors (DRAFT=gray, SENT=blue, PAID=green, OVERDUE=red), total amount column
- **Create page**: dynamic line item builder (add/remove rows, auto-calc row amounts and total)
- **Detail page**: invoice preview card that mirrors PDF layout, action buttons (Send, Mark Paid, Download PDF)

**Commit:**
```bash
git commit -m "feat: add invoice list, create with line items, detail with preview and PDF download"
```

---

## Phase 4: Dashboard, Reports, Activity

### Task 19: Dashboard & Activity Backend

**Files:**
- Create: `apps/api/src/modules/dashboard/dashboard.module.ts`
- Create: `apps/api/src/modules/dashboard/dashboard.controller.ts`
- Create: `apps/api/src/modules/dashboard/dashboard.service.ts`
- Create: `apps/api/src/modules/activity/activity.module.ts`
- Create: `apps/api/src/modules/activity/activity.controller.ts`
- Create: `apps/api/src/modules/activity/activity.service.ts`

**Dashboard service** aggregates:
```ts
async getMetrics(orgId: string) {
  const [totalClients, activeProjects, tasksDueThisWeek, invoices, tasksByStatus, recentActivity] =
    await Promise.all([
      this.prisma.client.count({ where: { orgId } }),
      this.prisma.project.count({ where: { orgId, status: 'ACTIVE' } }),
      this.prisma.task.count({
        where: { orgId, dueDate: { gte: new Date(), lte: endOfWeek }, status: { not: 'DONE' } },
      }),
      this.prisma.invoice.groupBy({ by: ['status'], where: { orgId }, _count: true }),
      this.prisma.task.groupBy({ by: ['status'], where: { orgId }, _count: true }),
      this.prisma.activityLog.findMany({
        where: { orgId }, take: 10, orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
    ]);
  // ... shape and return
}
```

**Activity service**: paginated query of `ActivityLog` with optional entity/action filters.

**Commit:**
```bash
git commit -m "feat: add dashboard metrics endpoint and activity log module"
```

---

### Task 20: Reports Backend

**Files:**
- Create: `apps/api/src/modules/reports/reports.module.ts`
- Create: `apps/api/src/modules/reports/reports.controller.ts`
- Create: `apps/api/src/modules/reports/reports.service.ts`

Four endpoints:
- `GET /reports/revenue?from=&to=` — monthly revenue (paid invoices grouped by month)
- `GET /reports/projects` — project count by status, avg tasks per project, completion rates
- `GET /reports/team` — tasks completed per user, tasks assigned per user
- `GET /reports/invoices` — outstanding amounts, overdue count, paid this month

**Commit:**
```bash
git commit -m "feat: add reports module with revenue, project, team, and invoice analytics"
```

---

### Task 21: Dashboard + Reports + Activity Frontend Pages

**Files:**
- Modify: `apps/web/src/app/(app)/dashboard/page.tsx` (replace placeholder)
- Create: `apps/web/src/app/(app)/reports/page.tsx`
- Create: `apps/web/src/app/(app)/reports/revenue/page.tsx`
- Create: `apps/web/src/app/(app)/reports/projects/page.tsx`
- Create: `apps/web/src/app/(app)/reports/team/page.tsx`
- Create: `apps/web/src/app/(app)/reports/invoices/page.tsx`
- Create: `apps/web/src/app/(app)/team/page.tsx`
- Create: `apps/web/src/app/(app)/team/activity/page.tsx`

**Install Recharts:**
```bash
cd apps/web && pnpm add recharts && cd ../..
```

**Dashboard page** includes: 4 StatCards, tasks due list, recent activity feed, project status donut chart, invoice summary bar.

**Reports pages** include: date range picker, area/bar charts, summary tables.

**Team page** includes: member list with role badges, invite dialog.

**Activity page** includes: filterable timeline of audit log entries.

**Commit:**
```bash
git commit -m "feat: add dashboard with metrics, reports with charts, team page, and activity log"
```

---

## Phase 5: Settings, Polish, Landing Page

### Task 22: Settings Module (Backend + Frontend)

**Backend files:**
- Create: `apps/api/src/modules/settings/settings.module.ts`
- Create: `apps/api/src/modules/settings/settings.controller.ts`
- Create: `apps/api/src/modules/settings/settings.service.ts`

**Frontend files:**
- Create: `apps/web/src/app/(app)/settings/page.tsx`
- Create: `apps/web/src/app/(app)/settings/branding/page.tsx`
- Create: `apps/web/src/app/(app)/settings/notifications/page.tsx`
- Create: `apps/web/src/app/(app)/settings/account/page.tsx`

Settings service: GET and PATCH `OrgSettings`. Account page: update user name/password.

**Commit:**
```bash
git commit -m "feat: add settings pages for workspace, branding, notifications, and account"
```

---

### Task 23: Landing Page

**Files:**
- Create: `apps/web/src/app/(marketing)/layout.tsx`
- Create: `apps/web/src/app/(marketing)/page.tsx`
- Create: `apps/web/src/components/layout/marketing-nav.tsx`
- Create: `apps/web/src/components/layout/footer.tsx`

Landing page sections:
1. **Hero** — headline, subheadline, "Try Demo" + "Get Started" CTAs
2. **Logos/trust bar** — placeholder company logos
3. **Features grid** — 6 feature cards with icons (clients, projects, tasks, invoices, reports, team)
4. **How it works** — 3-step visual
5. **Pricing** — 3-tier placeholder cards
6. **CTA banner** — "Start managing your operations today"
7. **Footer** — links, copyright

Use Tailwind for layout. No external CSS. Professional, calm, enterprise-grade aesthetic.

**Commit:**
```bash
git commit -m "feat: add landing page with hero, features, pricing, and CTA sections"
```

---

### Task 24: Polish Pass

**Files:** Various existing files across `apps/web/src/`

Checklist:
- [ ] Empty states on every list page (clients, projects, tasks, invoices, team, activity)
- [ ] Loading skeletons on every data-fetching page
- [ ] Toast notifications on all mutations (create, update, delete, status change)
- [ ] Error boundary component wrapping `(app)/layout.tsx`
- [ ] 404 page (`apps/web/src/app/not-found.tsx`)
- [ ] Responsive sidebar (collapsible on screens < 1024px)
- [ ] Status badges with consistent colors across all pages
- [ ] Confirm dialogs on destructive actions (delete client, remove member)
- [ ] Form validation error display on all forms
- [ ] Favicon and meta tags

```bash
pnpm add sonner  # if not already installed
```

**Commit:**
```bash
git commit -m "feat: add empty states, skeletons, toasts, error boundaries, and responsive polish"
```

---

### Task 25: README and Demo Flow

**Files:**
- Create: `README.md` (root)
- Modify: `apps/web/src/app/(auth)/login/page.tsx` (ensure demo button works)

README includes:
- Project title and one-line description
- Screenshot placeholder
- Tech stack badges
- Features list
- Quick start (clone, install, setup DB, seed, run)
- Architecture overview diagram (text-based)
- Project structure
- Demo credentials
- License

**Commit:**
```bash
git commit -m "docs: add README with setup instructions, architecture overview, and demo credentials"
```

---

## Phase 6: Deployment

### Task 26: Docker Compose for Local Dev

**Files:**
- Create: `docker-compose.yml`
- Create: `apps/api/Dockerfile`
- Create: `apps/web/Dockerfile`

`docker-compose.yml` includes: postgres, redis (for future use), api, web services.

**Commit:**
```bash
git commit -m "feat: add Docker Compose with Postgres, Redis, API, and Web services"
```

---

### Task 27: CI Pipeline (GitHub Actions)

**Files:**
- Create: `.github/workflows/ci.yml`

CI steps: checkout, pnpm install, lint, type-check, build (api + web), prisma generate.

**Commit:**
```bash
git commit -m "ci: add GitHub Actions workflow for lint, type-check, and build"
```

---

### Task 28: Deployment Configs

**Files:**
- Create: `apps/api/Dockerfile.prod`
- Create: `apps/web/next.config.ts` (production settings)
- Create: `.env.example`

Vercel config for web, Railway/Render Dockerfile for API.

**Commit:**
```bash
git commit -m "feat: add production deployment configs for Vercel and Railway"
```

---

## Summary

| Phase | Tasks | Key Deliverable |
|-------|-------|----------------|
| 1: Foundation | 1-9 | Auth + tenant isolation + app shell |
| 2: Core CRUD | 10-16 | Clients, projects, tasks with polished UI |
| 3: Invoicing | 17-18 | Invoice CRUD + PDF generation |
| 4: Dashboard | 19-21 | Metrics, charts, reports, activity log |
| 5: Polish | 22-25 | Settings, landing page, UX polish, README |
| 6: Deploy | 26-28 | Docker, CI, production configs |

**Total: 28 tasks across 6 phases.**

**Demo credentials:** `demo@opscore.dev` / `password123` → Acme Agency workspace
