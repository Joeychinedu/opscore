import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.membership.findMany({
      where: { orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    });
  }

  async invite(orgId: string, dto: InviteMemberDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const existing = await this.prisma.membership.findUnique({
      where: { userId_orgId: { userId: user.id, orgId } },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this organization');
    }

    return this.prisma.membership.create({
      data: {
        userId: user.id,
        orgId,
        role: dto.role ?? 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async updateRole(membershipId: string, orgId: string, role: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: membershipId, orgId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.role === 'OWNER') {
      throw new ForbiddenException('Cannot change the role of an owner');
    }

    return this.prisma.membership.update({
      where: { id: membershipId },
      data: { role: role as any },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async remove(membershipId: string, orgId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: membershipId, orgId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.role === 'OWNER') {
      throw new ForbiddenException('Cannot remove the owner of an organization');
    }

    return this.prisma.membership.delete({
      where: { id: membershipId },
    });
  }
}
