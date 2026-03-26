import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const orgId = request.headers['x-org-id'] as string | undefined;
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
      throw new ForbiddenException(
        'You do not belong to this organization',
      );
    }

    request.org = { id: orgId, role: membership.role };
    return true;
  }
}
