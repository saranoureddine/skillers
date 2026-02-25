import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Post ID',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  post_id: number;

  @ApiProperty({
    description: 'Comment content',
    example: 'Great post! Thanks for sharing.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID (for replies)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parent_id?: number;
}
