import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';

export enum ProjectStatusEnum {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateProjectDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatusEnum)
  status?: ProjectStatusEnum;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;
}
