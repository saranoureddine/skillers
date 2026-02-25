import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '../entities/prof-post.entity';

export class UpdatePostDto {
  @ApiProperty({
    description: 'Post ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  post_id: number;

  @ApiPropertyOptional({
    description: 'Post content',
    example: 'Updated post content',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Post description',
    example: 'Updated description',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Post type',
    enum: PostType,
    example: PostType.TEXT,
  })
  @IsOptional()
  @IsEnum(PostType)
  post_type?: PostType;

  @ApiPropertyOptional({
    description: 'Attachment ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  attachment_id?: number;

  @ApiPropertyOptional({
    description: 'Is public flag (1 = public, 0 = private)',
    example: 1,
  })
  @IsOptional()
  @IsIn([0, 1])
  is_public?: number;
}
