import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetPaginatedMessagesDto {
  @ApiProperty({
    description: 'First user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  userOne: string;

  @ApiProperty({
    description: 'Second user ID',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  userTwo: string;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Limit for pagination',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
