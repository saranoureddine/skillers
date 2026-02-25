import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetVoiceCallsDto {
  @ApiPropertyOptional({
    description: 'Chat conversation ID',
    example: '123',
  })
  @IsOptional()
  @IsString()
  chatId?: string;

  @ApiPropertyOptional({
    description: 'First user ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  userOne?: string;

  @ApiPropertyOptional({
    description: 'Second user ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsString()
  userTwo?: string;
}
