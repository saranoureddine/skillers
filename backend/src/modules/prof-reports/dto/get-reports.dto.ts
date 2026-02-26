import { IsOptional, IsString, IsInt, IsIn, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetReportsDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    example: 'pending',
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
  })
  @IsOptional()
  @IsIn(['pending', 'reviewed', 'resolved', 'dismissed'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by report type',
    example: 'user',
    enum: ['user', 'post', 'comment'],
  })
  @IsOptional()
  @IsIn(['user', 'post', 'comment'])
  report_type?: string;

  @ApiPropertyOptional({
    description: 'Filter by reason',
    example: 'spam',
    enum: ['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other'],
  })
  @IsOptional()
  @IsIn(['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other'])
  reason?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
