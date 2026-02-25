import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmCallDeliveryDto {
  @ApiProperty({
    description: 'Call ID',
    example: 'call_507f1f77bcf86cd799439011_1234567890',
  })
  @IsNotEmpty()
  @IsString()
  callId: string;

  @ApiPropertyOptional({
    description: 'Delivery status',
    example: 'received',
    enum: ['received', 'displayed', 'ringing'],
    default: 'received',
  })
  @IsOptional()
  @IsIn(['received', 'displayed', 'ringing'])
  deliveryStatus?: string;
}
