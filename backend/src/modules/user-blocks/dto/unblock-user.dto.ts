import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnblockUserDto {
  @ApiProperty({
    description: 'User ID to unblock',
    example: 'f98c897cbd6345478c5b',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  blockedUserId: string;
}
