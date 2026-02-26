import { IsNotEmpty, IsInt, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateGroupDto {
  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  groupId: number;

  @ApiPropertyOptional({
    description: 'Group name',
    example: 'Web Developers',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Group description',
    example: 'A group for web developers to share knowledge',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Whether group is public',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  @Type(() => Number)
  isPublic?: number;

  @ApiPropertyOptional({
    description: 'Cover image path',
    example: '/uploads/groups/cover.jpg',
  })
  @IsOptional()
  @IsString()
  coverImage?: string;
}
