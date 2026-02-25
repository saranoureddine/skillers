import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Table ID or table name',
    example: 'users',
  })
  @IsNotEmpty()
  @IsString()
  tableId: string;

  @ApiPropertyOptional({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.groupId)
  userId?: string;

  @ApiPropertyOptional({
    description: 'Group ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ValidateIf((o) => !o.userId)
  groupId?: number;

  @ApiPropertyOptional({
    description: 'Can create permission',
    example: 1,
    enum: [0, 1],
    default: 0,
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
    default: 0,
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
    default: 0,
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
    default: 0,
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
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  centerNum?: number;

  @ApiPropertyOptional({
    description: 'Permission ID (auto-generated if not provided)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  id?: string;
}
