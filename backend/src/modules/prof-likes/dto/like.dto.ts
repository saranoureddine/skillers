import { IsNotEmpty, IsString, IsInt, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LikeDto {
  @ApiProperty({
    description: 'Type of item to like',
    example: 'post',
    enum: ['post', 'comment'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['post', 'comment'])
  likeableType: string;

  @ApiProperty({
    description: 'ID of the item to like',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  likeableId: number;
}
