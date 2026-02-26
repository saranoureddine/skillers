import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    description: 'ID of the target being reported (user, post, or comment)',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  target_id: string;

  @ApiProperty({
    description: 'Type of report: user, post, or comment',
    example: 'user',
    enum: ['user', 'post', 'comment'],
  })
  @IsNotEmpty()
  @IsIn(['user', 'post', 'comment'])
  report_type: string;

  @ApiPropertyOptional({
    description: 'Target type ID (for posts/comments)',
    example: '1',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  target_type_id?: string;

  @ApiProperty({
    description: 'Reason for the report',
    example: 'spam',
    enum: ['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other'],
  })
  @IsNotEmpty()
  @IsIn(['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other'])
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional description/details about the report',
    example: 'This user is posting spam messages repeatedly.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
