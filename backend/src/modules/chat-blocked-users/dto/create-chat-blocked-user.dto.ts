import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatBlockedUserDto {
  @ApiProperty({
    description: 'User ID who is blocking',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  blockerId: string;

  @ApiProperty({
    description: 'User ID who is being blocked',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  blockedId: string;
}
