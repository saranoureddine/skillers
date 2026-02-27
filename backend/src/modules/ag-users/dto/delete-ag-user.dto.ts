import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class DeleteAgUserDto {
  @ApiProperty({
    description: 'User ID(s) - can be string, array, or comma-separated string',
    example: '507f1f77bcf86cd799439011',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } },
    ],
  })
  @IsNotEmpty()
  id: string | string[];
}
