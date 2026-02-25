import { IsNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DeleteUserDto {
  @ApiProperty({
    description: 'User ID or array of user IDs',
    example: ['507f1f77bcf86cd799439011'],
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } },
    ],
  })
  @IsNotEmpty()
  id: string | string[];
}
