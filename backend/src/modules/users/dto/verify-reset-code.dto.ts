import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyResetCodeDto {
  @ApiProperty({
    description: 'Reset code (6 digits)',
    example: '123456',
    pattern: '^\\d{6}$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Reset code must be 6 digits' })
  resetCode: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '1234567',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Country code',
    example: '+961',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;
}
