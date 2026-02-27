import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class ResetPasswordAgUserDto {
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
    description: 'New password (minimum 8 characters)',
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  user_password: string;
}
