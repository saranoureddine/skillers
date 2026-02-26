import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProfessionDto {
  @ApiProperty({
    description: 'Profession name',
    example: 'Software Engineer',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Profession name in Arabic',
    example: 'مهندس برمجيات',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiPropertyOptional({
    description: 'Profession description',
    example: 'Develops software applications',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Profession description in Arabic',
    example: 'يطور تطبيقات البرمجيات',
  })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({
    description: 'Category ID (parent category)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Icon attachment ID',
    example: 123,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  iconAttachmentId?: number;
}
