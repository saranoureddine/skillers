import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RateSuggestionDto {
  @ApiProperty({
    description: 'Suggestion/Claim ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  suggestion_id: string;

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
