import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AdminDeletePostDto {
  @ApiProperty({
    description: 'Post ID to delete',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  post_id: number;
}
