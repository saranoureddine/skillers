import {
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetSuggestionsDto {
  @ApiPropertyOptional({
    description: 'Type: suggestion or claim',
    example: 'suggestion',
    enum: ['suggestion', 'claim'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['suggestion', 'claim'])
  type?: 'suggestion' | 'claim';

  @ApiPropertyOptional({
    description: 'City ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  city_id?: number;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
