import { IsEmail, IsOptional, IsEnum } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'MANAGER', 'MEMBER'])
  role?: 'ADMIN' | 'MANAGER' | 'MEMBER' = 'MEMBER';
}
