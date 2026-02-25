import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveAddressDto {
  @ApiProperty({
    description: 'Address ID to remove',
    example: 'e87b786bac5234367b4a',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  addressId: string;
}
