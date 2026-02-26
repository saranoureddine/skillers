import { IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DeleteSubscriptionPlanDto {
  @ApiProperty({
    description: 'Subscription plan ID',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  id: number;
}
