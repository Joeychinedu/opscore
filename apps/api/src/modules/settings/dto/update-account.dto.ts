import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional() @IsString() @MaxLength(50) firstName?: string;
  @IsOptional() @IsString() @MaxLength(50) lastName?: string;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(72) password?: string;
}
