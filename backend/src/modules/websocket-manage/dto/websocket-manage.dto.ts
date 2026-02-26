import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class WebSocketManageDto {
  @ApiPropertyOptional({
    description: 'WebSocket server port',
    example: 8092,
    default: 8092,
    minimum: 1024,
    maximum: 65535,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1024)
  @Max(65535)
  port?: number;
}
