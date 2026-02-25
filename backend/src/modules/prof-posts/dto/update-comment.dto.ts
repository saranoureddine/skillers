import {
  IsNotEmpty,
  IsString,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Comment ID',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  comment_id: number;

  @ApiProperty({
    description: 'Comment content',
    example: 'Updated comment content',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
