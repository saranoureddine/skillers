import { IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetAllUsersWithProfessionsDto {
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
  subcategoryId?: number;
}
