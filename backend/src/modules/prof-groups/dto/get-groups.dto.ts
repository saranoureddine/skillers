import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetGroupsDto {
  @ApiPropertyOptional({
    description: 'Category ID filter',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Public status filter',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  isPublic?: number;

  @ApiPropertyOptional({
    description: 'Search term',
    example: 'web developers',
  })
  @IsOptional()
  @IsString()
  search?: string;

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
