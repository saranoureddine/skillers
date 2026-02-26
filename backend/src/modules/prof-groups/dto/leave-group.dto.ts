import { IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LeaveGroupDto {
  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  groupId: number;
}
