import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchProfessionsDto {
  @ApiPropertyOptional({
    description: 'Search term for profession name or description',
    example: 'doctor',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Category ID to filter by',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number;

  @ApiPropertyOptional({
    description: 'Parent category ID to filter by',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parent_category_id?: number;

  @ApiPropertyOptional({
    description: 'Minimum number of users in profession',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min_users?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of users in profession',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max_users?: number;

  @ApiPropertyOptional({
    description: 'Sort by field: name, users_count, sort_order, created_at',
    example: 'name',
    enum: ['name', 'users_count', 'sort_order', 'created_at'],
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'users_count', 'sort_order', 'created_at'])
  sort_by?: string = 'name';

  @ApiPropertyOptional({
    description: 'Sort order: ASC or DESC',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort_order?: string = 'ASC';

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
