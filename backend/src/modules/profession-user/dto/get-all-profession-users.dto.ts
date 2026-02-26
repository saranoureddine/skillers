import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetAllProfessionUsersDto {
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
    description: 'Verification status filter',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  isVerified?: number;

  @ApiPropertyOptional({
    description: 'Search term',
    example: 'John',
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
