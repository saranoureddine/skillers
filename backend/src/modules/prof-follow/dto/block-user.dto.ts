import { IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FollowBlockUserDto {
  @ApiPropertyOptional({
    description: 'User ID to block (also accepts following_id)',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @ValidateIf((o) => !o.following_id)
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'User ID to block (alternative to user_id)',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @ValidateIf((o) => !o.user_id)
  @IsString()
  following_id?: string;
}
