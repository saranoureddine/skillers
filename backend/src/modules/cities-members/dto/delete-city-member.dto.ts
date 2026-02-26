import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteCityMemberDto {
  @ApiProperty({
    description: 'City Member ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  id: string;
}
