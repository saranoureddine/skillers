import { IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetGroupDto {
  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  groupId: number;
}
