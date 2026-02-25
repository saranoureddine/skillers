import {
  IsOptional,
  IsInt,
  IsString,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    description: 'Can create permission',
    example: 1,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  create?: number;

  @ApiPropertyOptional({
    description: 'Can view permission',
    example: 1,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  view?: number;

  @ApiPropertyOptional({
    description: 'Can update permission',
    example: 1,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  update?: number;

  @ApiPropertyOptional({
    description: 'Can delete permission',
    example: 0,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  delete?: number;

  @ApiPropertyOptional({
    description: 'Permission condition',
    example: 'status = active',
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    description: 'Center number',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  centerNum?: number;
}
