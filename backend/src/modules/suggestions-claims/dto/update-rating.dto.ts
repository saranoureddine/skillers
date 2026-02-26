import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateRatingDto {
  @ApiProperty({
    description: 'Rating value (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  rating: number;
}
