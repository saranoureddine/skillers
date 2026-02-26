import { IsOptional, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({
    description: 'Receive notifications preference',
    example: 1,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  receive_notifications?: number;

  @ApiPropertyOptional({
    description: 'Receive calls preference',
    example: 1,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  receive_calls?: number;

  @ApiPropertyOptional({
    description: 'Receive offers preference',
    example: 1,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  receive_offers?: number;

  @ApiPropertyOptional({
    description: 'Receive updates preference',
    example: 1,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  receive_updates?: number;
}
