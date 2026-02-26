import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSpecialistDto {
  @ApiProperty({
    description: 'User ID to add as specialist',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
