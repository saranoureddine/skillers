import {
  IsNotEmpty,
  IsInt,
  IsString,
  IsOptional,
  IsIn,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateReportStatusDto {
  @ApiProperty({
    description: 'Report ID',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  report_id: number;

  @ApiProperty({
    description: 'New status for the report',
    example: 'reviewed',
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
  })
  @IsNotEmpty()
  @IsIn(['pending', 'reviewed', 'resolved', 'dismissed'])
  status: string;

  @ApiPropertyOptional({
    description: 'Resolution notes from the reviewer',
    example: 'Report reviewed and user warned.',
  })
  @IsOptional()
  @IsString()
  resolution_notes?: string;
}
