import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TestFcmDeliveryDto {
  @ApiProperty({
    description: 'Receiver user ID for testing',
    example: '507f1f77bcf86cd799439012',
  })
  @IsNotEmpty()
  @IsString()
  receiverId: string;
}
