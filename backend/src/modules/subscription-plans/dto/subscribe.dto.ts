import { IsNotEmpty, IsInt, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubscribeDto {
  @ApiProperty({
    description: 'Subscription plan ID',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  subscription_plan_id: number;

  @ApiPropertyOptional({
    description: 'Payment method',
    example: 'Visa',
    enum: ['Visa', 'Mastercard', 'Apple Pay', 'Bank Transfer'],
    default: 'Bank Transfer',
  })
  @IsOptional()
  @IsString()
  @IsIn(['Visa', 'Mastercard', 'Apple Pay', 'Bank Transfer'])
  payment_method?: string;

  @ApiPropertyOptional({
    description: 'Subscription type',
    example: 'new',
    enum: ['new', 'renewal'],
    default: 'new',
  })
  @IsOptional()
  @IsString()
  @IsIn(['new', 'renewal'])
  subscription_type?: string;

  @ApiPropertyOptional({
    description: 'Transaction ID',
    example: 'txn_123456',
  })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiPropertyOptional({
    description: 'Notes',
    example: 'Payment received',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
