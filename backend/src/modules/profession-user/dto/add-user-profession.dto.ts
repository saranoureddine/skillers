import { IsNotEmpty, IsArray, ValidateNested, IsOptional, IsString, IsInt, IsIn, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProfessionItemDto {
  @ApiProperty({
    description: 'Profession ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  professionId: number;

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
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  @Type(() => Number)
  isPrimary?: number;
}

export class AddUserProfessionDto {
  @ApiPropertyOptional({
    description: 'User ID (for admin functionality)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Array of professions to add',
    type: [ProfessionItemDto],
    example: [
      { professionId: 1, experienceYears: 5, isPrimary: 1 },
      { professionId: 2, experienceYears: 3, isPrimary: 0 },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfessionItemDto)
  professions: ProfessionItemDto[];

  @ApiPropertyOptional({
    description: 'User location',
    example: 'Beirut, Lebanon',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Spoken languages (array or JSON string)',
    example: ['en', 'ar'],
  })
  @IsOptional()
  spokenLanguage?: string[] | string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Experienced professional',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'PDF CV reference (URL or JSON)',
    example: 'https://example.com/cv.pdf',
  })
  @IsOptional()
  @IsString()
  pdfCv?: string;

  @ApiPropertyOptional({
    description: 'Cover video guidelines (video or photo metadata)',
    example: '{"url": "https://example.com/video.mp4"}',
  })
  @IsOptional()
  coverVideoGuidelines?: string;

  @ApiPropertyOptional({
    description: 'Cover video guidelines type',
    example: 'video',
    enum: ['video', 'photo'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['video', 'photo'])
  coverVideoGuidelinesType?: string;
}
