import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EndCallsBetweenUsersDto {
  @ApiProperty({
    description: 'ID of the other user',
    example: '507f1f77bcf86cd799439012',
  })
  @IsNotEmpty()
  @IsString()
  otherUserId: string;
}
