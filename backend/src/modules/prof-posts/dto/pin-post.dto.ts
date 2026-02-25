import { IsNotEmpty, IsInt, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PinPostDto {
  @ApiProperty({
    description: 'Post ID',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  post_id: number;

  @ApiProperty({
    description: 'Is pinned flag (1 = pin, 0 = unpin)',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  is_pinned: number;
}
