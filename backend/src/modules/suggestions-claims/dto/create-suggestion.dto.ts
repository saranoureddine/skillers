import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsEnum,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSuggestionDto {
  @ApiProperty({
    description: 'Category ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  category_id: number;

  @ApiProperty({
    description: 'City ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  city_id: number;

  @ApiProperty({
    description: 'Details/Description',
    example: 'This is a suggestion about improving the city infrastructure.',
  })
  @IsNotEmpty()
  @IsString()
  details: string;

  @ApiProperty({
    description: 'Type: suggestion or claim',
    example: 'suggestion',
    enum: ['suggestion', 'claim'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['suggestion', 'claim'])
  type: 'suggestion' | 'claim';
}
