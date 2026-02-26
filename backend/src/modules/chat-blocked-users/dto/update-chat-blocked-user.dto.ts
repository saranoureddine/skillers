import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChatBlockedUserDto {
  @ApiPropertyOptional({
    description: 'User ID who is blocking',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  blockerId?: string;

  @ApiPropertyOptional({
    description: 'User ID who is being blocked',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  blockedId?: string;
}
