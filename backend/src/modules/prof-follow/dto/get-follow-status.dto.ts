import { IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetFollowStatusDto {
  @ApiPropertyOptional({
    description: 'Target user ID to check follow status with',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @ValidateIf((o) => !o.user_id)
  @IsString()
  target_user_id?: string;

  @ApiPropertyOptional({
    description: 'Target user ID (alternative to target_user_id)',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @ValidateIf((o) => !o.target_user_id)
  @IsString()
  user_id?: string;
}
