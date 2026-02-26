import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsNumber,
  IsIn,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GlobalSearchDto {
  @ApiPropertyOptional({
    description: 'Search query string (minimum 1 character)',
    example: 'doctor',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Type of search: all, users, posts, groups, professions, categories',
    example: 'all',
    enum: ['all', 'users', 'posts', 'groups', 'professions', 'categories'],
    default: 'all',
  })
  @IsOptional()
  @IsIn(['all', 'users', 'posts', 'groups', 'professions', 'categories'])
  type?: string = 'all';

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

  @ApiPropertyOptional({
    description: 'Array of city IDs to filter by',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  cities?: number[];

  @ApiPropertyOptional({
    description: 'Array of category IDs to filter by',
    example: [1, 2],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  categories?: number[];

  @ApiPropertyOptional({
    description: 'Array of subcategory IDs to filter by',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  subcategories?: number[];

  @ApiPropertyOptional({
    description: 'User latitude for location-based sorting',
    example: 33.8938,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'User longitude for location-based sorting',
    example: 35.5018,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
