import { IsNotEmpty, IsInt, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UploadCategoryImageDto {
  @ApiProperty({
    description: 'Category ID',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  category_id: number;

  @ApiPropertyOptional({
    description: 'Type of category (category or subcategory)',
    example: 'category',
    enum: ['category', 'subcategory'],
    default: 'category',
  })
  @IsOptional()
  @IsString()
  @IsIn(['category', 'subcategory'])
  type?: string = 'category';
}
