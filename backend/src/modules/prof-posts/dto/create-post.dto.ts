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

export class CreatePostDto {
  @ApiProperty({
    description: 'Post content',
    example: 'This is my first professional post!',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Post description',
    example: 'Additional details about the post',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Post type',
    enum: PostType,
    example: PostType.TEXT,
    default: PostType.TEXT,
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
    default: 1,
  })
  @IsOptional()
  @IsIn([0, 1])
  is_public?: number;
}
