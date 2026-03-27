import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;
}
