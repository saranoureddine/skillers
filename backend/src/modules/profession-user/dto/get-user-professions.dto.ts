import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetUserProfessionsDto {
  @ApiPropertyOptional({
    description: 'User ID (defaults to authenticated user)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
