import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DebugFcmDto {
  @ApiPropertyOptional({
    description: 'Test message',
    example: 'Hello test',
  })
  @IsOptional()
  @IsString()
  testMessage?: string;
}
