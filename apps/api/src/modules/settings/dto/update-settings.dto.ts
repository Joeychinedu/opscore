import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional() @IsString() @MaxLength(10) invoicePrefix?: string;
  @IsOptional() @IsString() @MaxLength(3) currency?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() brandColor?: string;
}
