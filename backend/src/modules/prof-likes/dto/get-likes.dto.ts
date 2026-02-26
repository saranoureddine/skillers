import { IsNotEmpty, IsString, IsInt, IsIn, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetLikesDto {
  @ApiProperty({
    description: 'Type of item',
    example: 'post',
    enum: ['post', 'comment'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['post', 'comment'])
  likeableType: string;

  @ApiProperty({
    description: 'ID of the item',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  likeableId: number;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
