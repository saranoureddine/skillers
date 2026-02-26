import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateSuggestionDto {
  @ApiPropertyOptional({
    description: 'Category ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  category_id?: number;

  @ApiPropertyOptional({
    description: 'City ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  city_id?: number;

  @ApiPropertyOptional({
    description: 'Details/Description',
    example: 'Updated suggestion details.',
  })
  @IsOptional()
  @IsString()
  details?: string;

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
    description: 'Status: pending, accepted, rejected, resolved',
    example: 'accepted',
    enum: ['pending', 'accepted', 'rejected', 'resolved'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'accepted', 'rejected', 'resolved'])
  status?: 'pending' | 'accepted' | 'rejected' | 'resolved';
}
