import { IsNotEmpty, IsArray, ValidateNested, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({
    description: 'Profession ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  id: number;

  @ApiProperty({
    description: 'Sort order',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  sortOrder: number;
}

export class SaveOrderDto {
  @ApiProperty({
    description: 'Array of profession order items',
    type: [OrderItemDto],
    example: [
      { id: 1, sortOrder: 1 },
      { id: 2, sortOrder: 2 },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderList: OrderItemDto[];
}
