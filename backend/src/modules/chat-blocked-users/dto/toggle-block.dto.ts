import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleBlockDto {
  @ApiProperty({
    description: 'User ID to block/unblock',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  blockedId: string;
}
