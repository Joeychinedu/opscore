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
