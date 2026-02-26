import { IsNotEmpty, IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DeleteUserProfessionAdminDto {
  @ApiPropertyOptional({
    description: 'User ID (for admin functionality)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Array of Profession User IDs to delete',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  professionUserIds: number[];
}
