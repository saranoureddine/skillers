import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CheckResetCodeAgUserDto {
  @ApiProperty({
    description: 'Phone number',
    example: '1234567',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiPropertyOptional({
    description: 'Country code',
    example: '+961',
    default: '+961',
  })
  @IsString()
  @IsOptional()
  country_code?: string;

  @ApiProperty({
    description: 'Reset code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
