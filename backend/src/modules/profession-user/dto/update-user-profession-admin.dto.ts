import { IsNotEmpty, IsArray, ValidateNested, IsOptional, IsString, IsInt, IsIn, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProfessionUpdateItemDto {
  @ApiPropertyOptional({
    description: 'Profession User ID (for update)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  professionUserId?: number;

  @ApiPropertyOptional({
    description: 'Profession ID (for add or update)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  professionId?: number;

  @ApiPropertyOptional({
    description: 'Years of experience',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  experienceYears?: number;

  @ApiPropertyOptional({
    description: 'Whether this is the primary profession',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  @Type(() => Number)
  isPrimary?: number;
}

export class UpdateUserProfessionAdminDto {
  @ApiPropertyOptional({
    description: 'User ID (for admin functionality)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Array of professions to update or add',
    type: [ProfessionUpdateItemDto],
    example: [
      { professionUserId: 1, experienceYears: 6, isPrimary: 1 },
      { professionId: 2, experienceYears: 3, isPrimary: 0 },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfessionUpdateItemDto)
  professions: ProfessionUpdateItemDto[];
}
