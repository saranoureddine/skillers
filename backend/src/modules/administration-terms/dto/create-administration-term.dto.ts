import {
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAdministrationTermDto {
  @ApiProperty({
    description: 'City ID',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  cityId: number;

  @ApiProperty({
    description: 'Administration term start year',
    example: 2020,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  fromYear: number;

  @ApiProperty({
    description: 'Administration term end year',
    example: 2024,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  toYear: number;

  @ApiProperty({
    description: 'Whether the term is active',
    example: true,
  })
  @IsNotEmpty()
  @Type(() => Boolean)
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Title in English',
    example: 'Administration Term 2020-2024',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ValidateIf((o) => o.titleEn !== '')
  titleEn?: string;

  @ApiPropertyOptional({
    description: 'Title in Arabic',
    example: 'فترة الإدارة 2020-2024',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ValidateIf((o) => o.titleAr !== '')
  titleAr?: string;

  @ApiPropertyOptional({
    description: 'Description in English',
    example: 'Administration term description',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.descriptionEn !== '')
  descriptionEn?: string;

  @ApiPropertyOptional({
    description: 'Description in Arabic',
    example: 'وصف فترة الإدارة',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.descriptionAr !== '')
  descriptionAr?: string;
}
