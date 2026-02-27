import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class GetAllAgUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search term (searches in user_name, first_name, last_name, user_id, phone, email)',
    example: 'john',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'City IDs filter (can be array, comma-separated string, or single value)',
    example: [1, 2, 3],
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'number' } },
      { type: 'number' },
    ],
  })
  @IsOptional()
  city_ids?: string | number | number[];

  @ApiPropertyOptional({
    description: 'Role filter (group name)',
    example: 'Admin',
  })
  @IsString()
  @IsOptional()
  role?: string;

  // Support Yii's 'per-page' parameter (maps to limit)
  @ApiPropertyOptional({
    description: 'Items per page (Yii uses per-page)',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  'per-page'?: number;
}
