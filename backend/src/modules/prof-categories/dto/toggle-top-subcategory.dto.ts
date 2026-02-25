import { IsNotEmpty, IsInt, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ToggleTopSubcategoryDto {
  @ApiProperty({
    description: 'Subcategory ID',
    example: 5,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  subcategory_id: number;

  @ApiProperty({
    description: 'Whether to mark as top (0 or 1)',
    example: 1,
    enum: [0, 1],
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  is_top: number;
}
