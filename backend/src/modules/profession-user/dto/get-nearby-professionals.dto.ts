import { IsOptional, IsInt, IsString, IsNumber, IsBoolean, IsIn, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetNearbyProfessionalsDto {
  @ApiPropertyOptional({
    description: 'Profession ID filter',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  professionId?: number;

  @ApiPropertyOptional({
    description: 'Category ID filter',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Subcategory ID filter',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  subCategoryId?: number;

  @ApiPropertyOptional({
    description: 'City ID filter',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  cityId?: number;

  @ApiPropertyOptional({
    description: 'Search radius in kilometers',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  radius?: number;

  @ApiPropertyOptional({
    description: 'Latitude for coordinate-based search',
    example: 33.8938,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude for coordinate-based search',
    example: 35.5018,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Include self in results',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeSelf?: boolean;

  @ApiPropertyOptional({
    description: 'Verification status filter',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  isVerified?: number;

  @ApiPropertyOptional({
    description: 'Minimum experience years',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minExperience?: number;

  @ApiPropertyOptional({
    description: 'Maximum experience years',
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxExperience?: number;

  @ApiPropertyOptional({
    description: 'Search term',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'distance',
    enum: ['distance', 'experience', 'verified', 'name', 'created', 'primary'],
    default: 'distance',
  })
  @IsOptional()
  @IsString()
  @IsIn(['distance', 'experience', 'verified', 'name', 'created', 'primary'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
