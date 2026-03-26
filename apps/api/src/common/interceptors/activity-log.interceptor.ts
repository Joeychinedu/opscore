import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service.js';

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

const METHOD_ACTION_MAP: Record<string, string> = {
  POST: 'created',
  PATCH: 'updated',
  PUT: 'updated',
  DELETE: 'deleted',
};

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ActivityLogInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method;

    if (!MUTATION_METHODS.has(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((responseBody) => {
        this.logActivity(request, method, responseBody).catch((err) => {
          this.logger.warn(`Failed to log activity: ${err.message}`);
        });
      }),
    );
  }

  private async logActivity(
    request: Record<string, any>,
    method: string,
    responseBody: any,
  ): Promise<void> {
    const orgId: string | undefined = request.org?.id;
    const userId: string | undefined = request.user?.id;

    if (!orgId) return;

    // Extract entity from URL path, e.g. /api/clients/123 -> "client"
    const pathSegments = (request.url as string)
      .split('/')
      .filter(Boolean);

    // Find the first meaningful segment after "api" (if present)
    const apiIndex = pathSegments.indexOf('api');
    const entitySegment =
      apiIndex >= 0
        ? pathSegments[apiIndex + 1]
        : pathSegments[0];

    if (!entitySegment) return;

    // Singularize: remove trailing "s"
    const entity = entitySegment.endsWith('s')
      ? entitySegment.slice(0, -1)
      : entitySegment;

    const action = `${entity}.${METHOD_ACTION_MAP[method] ?? 'modified'}`;

    // Try to get the entity ID from the response or URL params
    const entityId =
      responseBody?.data?.id ??
      responseBody?.id ??
      request.params?.id ??
      'unknown';

    await this.prisma.activityLog.create({
      data: {
        orgId,
        userId: userId ?? null,
        action,
        entity,
        entityId: String(entityId),
        metadata: {
          method,
          path: request.url,
        },
      },
    });
  }
}
