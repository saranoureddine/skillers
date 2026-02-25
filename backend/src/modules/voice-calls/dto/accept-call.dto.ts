import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptCallDto {
  @ApiProperty({
    description: 'Call ID to accept',
    example: 'call_507f1f77bcf86cd799439011_1234567890',
  })
  @IsNotEmpty()
  @IsString()
  callId: string;
}
