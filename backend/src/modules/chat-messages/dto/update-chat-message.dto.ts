import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChatMessageDto {
  @ApiPropertyOptional({
    description: 'Updated message content',
    example: 'Updated message text',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
