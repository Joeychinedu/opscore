import { IsEnum } from 'class-validator';

export class UpdateRoleDto {
  @IsEnum(['ADMIN', 'MANAGER', 'MEMBER'])
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
}
