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

export class SearchUsersByProfessionDto {
  @ApiPropertyOptional({
    description: 'Profession ID to filter by',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  profession_id?: number;

  @ApiPropertyOptional({
    description: 'Category ID to filter by',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number;

  @ApiPropertyOptional({
    description: 'Is primary profession (0 or 1)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  is_primary?: number;

  @ApiPropertyOptional({
    description: 'Is verified (0 or 1)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  is_verified?: number;

  @ApiPropertyOptional({
    description: 'Minimum years of experience',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min_experience?: number;

  @ApiPropertyOptional({
    description: 'Maximum years of experience',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max_experience?: number;

  @ApiPropertyOptional({
    description: 'Search term for user name or email',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Gender filter: male, female, other',
    example: 'male',
    enum: ['male', 'female', 'other'],
  })
  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: string;

  @ApiPropertyOptional({
    description: 'Sort by field: first_name, last_name, experience_years, is_verified, created_at',
    example: 'first_name',
    enum: ['first_name', 'last_name', 'experience_years', 'is_verified', 'created_at'],
    default: 'first_name',
  })
  @IsOptional()
  @IsIn(['first_name', 'last_name', 'experience_years', 'is_verified', 'created_at'])
  sort_by?: string = 'first_name';

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
