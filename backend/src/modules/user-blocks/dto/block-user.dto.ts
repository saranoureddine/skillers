import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BlockUserDto {
  @ApiProperty({
    description: 'User ID to block',
    example: 'f98c897cbd6345478c5b',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  blocked_user_id: string;

  @ApiPropertyOptional({
    description: 'Reason for blocking',
    example: 'Inappropriate behavior',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
