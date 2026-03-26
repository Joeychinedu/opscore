import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, IsIn } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}

export function paginationMeta(
  total: number,
  page: number,
  limit: number,
): { total: number; page: number; limit: number; totalPages: number } {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
