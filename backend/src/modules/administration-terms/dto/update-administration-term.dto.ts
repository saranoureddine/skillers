import {
  IsOptional,
  IsInt,
  IsBoolean,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateAdministrationTermDto {
  @ApiPropertyOptional({
    description: 'City ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cityId?: number;

  @ApiPropertyOptional({
    description: 'Administration term start year',
    example: 2020,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fromYear?: number;

  @ApiPropertyOptional({
    description: 'Administration term end year',
    example: 2024,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  toYear?: number;

  @ApiPropertyOptional({
    description: 'Whether the term is active',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

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
