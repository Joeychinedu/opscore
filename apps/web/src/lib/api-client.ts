const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { message: string }).message)
      : `Request failed with status ${status}`);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private accessToken: string | null = null;
  private orgId: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  setOrgId(id: string | null) {
    this.orgId = id;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (this.orgId) {
      headers['x-org-id'] = this.orgId;
    }

    let res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // On 401, attempt token refresh
    if (res.status === 401 && typeof window !== 'undefined') {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        // Update the Authorization header and retry
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        res = await fetch(`${API_BASE}${path}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
      }
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      throw new ApiError(res.status, errBody);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return undefined as T;
    }

    const json = await res.json();
    // Unwrap the TransformInterceptor { data: ... } wrapper
    return json.data !== undefined ? json.data : json;
  }

  private async tryRefresh(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const json = await res.json();
      const data = json.data ?? json;
      this.accessToken = data.accessToken;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  del<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

export const api = new ApiClient();
