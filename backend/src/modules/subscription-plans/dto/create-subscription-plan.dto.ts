import { IsNotEmpty, IsString, IsNumber, IsInt, Min, IsOptional, MaxLength, Max, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSubscriptionPlanDto {
  @ApiProperty({
    description: 'Plan name (English)',
    example: 'Premium Plan',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Plan name (Arabic)',
    example: 'خطة مميزة',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name_ar: string;

  @ApiPropertyOptional({
    description: 'Plan description (English)',
    example: 'Premium features for professionals',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Plan description (Arabic)',
    example: 'ميزات مميزة للمحترفين',
  })
  @IsOptional()
  @IsString()
  description_ar?: string;

  @ApiProperty({
    description: 'Plan price',
    example: 99.99,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Number of days for the subscription',
    example: 30,
    minimum: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  number_days: number;

  @ApiPropertyOptional({
    description: 'Currency ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  currency_id?: number;

  @ApiPropertyOptional({
    description: 'Status (0 = inactive, 1 = active)',
    example: 1,
    default: 1,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsInt()
  @IsIn([0, 1])
  status?: number;
}
