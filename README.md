# OpsCore

A modern multi-tenant business operations platform for agencies and consultancies to manage clients, projects, tasks, invoices, and team performance.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend:** NestJS, TypeScript, Prisma 7, PostgreSQL
- **Auth:** Custom JWT with access/refresh token rotation
- **Monorepo:** Turborepo with pnpm workspaces

## Features

- Multi-tenant workspace management with role-based access (Owner, Admin, Manager, Member)
- Client relationship management with notes and history
- Project tracking with team assignment and progress metrics
- Task management with priority, status filtering, and assignment
- Invoice generation with line items and PDF export
- Dashboard with real-time metrics and charts
- Revenue, project, team, and invoice analytics reports
- Activity audit log
- Professional landing page with pricing tiers
- Demo login for instant exploration

## Quick Start

### Prerequisites

- Node.js 25+
- pnpm 10+
- PostgreSQL 16+

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url> opscore
   cd opscore
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up the database:
   ```bash
   createdb opscore_dev
   cd apps/api
   cp .env.example .env
   # Edit .env with your database URL if needed
   npx prisma migrate dev
   npx prisma db seed
   cd ../..
   ```

4. Start development servers:
   ```bash
   pnpm dev
   ```

   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000/api

### Demo Credentials

- **Email:** demo@opscore.dev
- **Password:** password123
- **Workspace:** Acme Agency

## Project Structure

```
opscore/
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── common/       # Guards, interceptors, decorators, Prisma
│   │   │   └── modules/      # Auth, clients, projects, tasks, invoices, etc.
│   │   └── prisma/           # Schema, migrations, seed
│   └── web/                  # Next.js frontend
│       └── src/
│           ├── app/          # Pages (marketing, auth, app routes)
│           ├── components/   # Reusable UI components
│           └── lib/          # API client, stores, utilities
├── packages/
│   └── shared/               # Shared types and enums
├── turbo.json
└── pnpm-workspace.yaml
```

## Architecture

### Multi-Tenancy

Shared database with `orgId` discriminator column. Tenant isolation enforced by:
- **TenantGuard** — validates `x-org-id` header against user membership
- **Prisma middleware** — auto-filters queries by orgId
- **RolesGuard** — role hierarchy (Owner > Admin > Manager > Member)

### Authentication

Custom JWT implementation with:
- Access tokens (15min expiry)
- Refresh tokens (7-day expiry, hashed in database)
- Token rotation on refresh
- Demo login endpoint for portfolio showcase

### API Design

RESTful endpoints under `/api/` prefix. All tenant-scoped routes require `x-org-id` header. Responses wrapped in `{ data, meta }` format with consistent pagination.

## License

MIT
