import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TestVoipPushDto {
  @ApiPropertyOptional({
    description: 'Receiver user ID (defaults to authenticated user)',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsString()
  receiverId?: string;
}
