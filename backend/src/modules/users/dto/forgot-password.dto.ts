import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Phone number',
    example: '1234567',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Country code',
    example: '+961',
  })
  @IsNotEmpty()
  @IsString()
  countryCode: string;
}
