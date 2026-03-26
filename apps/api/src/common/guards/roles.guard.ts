import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 4,
  ADMIN: 3,
  MANAGER: 2,
  MEMBER: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole: string | undefined = request.org?.role;

    if (!userRole) {
      throw new ForbiddenException('No organization role found');
    }

    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredLevel = Math.min(
      ...requiredRoles.map((r) => ROLE_HIERARCHY[r] ?? 0),
    );

    if (userLevel < requiredLevel) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }
}
