import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MissedCallDto {
  @ApiProperty({
    description: 'Call ID to mark as missed',
    example: 'call_507f1f77bcf86cd799439011_1234567890',
  })
  @IsNotEmpty()
  @IsString()
  callId: string;
}
