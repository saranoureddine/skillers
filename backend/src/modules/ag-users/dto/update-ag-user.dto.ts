import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsEmail } from 'class-validator';

export class UpdateAgUserDto {
  @ApiPropertyOptional({
    description: 'User name',
    example: 'admin_user',
  })
  @IsString()
  @IsOptional()
  user_name?: string;

  @ApiPropertyOptional({
    description: 'User password (will be hashed)',
    example: 'NewSecurePassword123!',
  })
  @IsString()
  @IsOptional()
  user_password?: string;

  @ApiPropertyOptional({
    description: 'User role ID',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  user_role?: number;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsOptional()
  email_address?: string;

  @ApiPropertyOptional({
    description: 'Phone number one',
    example: '1234567',
  })
  @IsString()
  @IsOptional()
  phone_number_one?: string;

  @ApiPropertyOptional({
    description: 'Phone number two',
    example: '7654321',
  })
  @IsString()
  @IsOptional()
  phone_number_two?: string;

  @ApiPropertyOptional({
    description: 'Address',
    example: '123 Main St, Beirut',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-01-01',
  })
  @IsString()
  @IsOptional()
  date_of_birth?: string;

  @ApiPropertyOptional({
    description: 'Country code',
    example: '+961',
  })
  @IsString()
  @IsOptional()
  country_code?: string;

  @ApiPropertyOptional({
    description: 'Birth place',
    example: 'Beirut',
  })
  @IsString()
  @IsOptional()
  birth_place?: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Admin user description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'City IDs array (JSON string or array)',
    example: [1, 2, 3],
  })
  @IsOptional()
  cities?: string | number[];

  @ApiPropertyOptional({
    description: 'Store IDs array (JSON string or array)',
    example: ['store1', 'store2'],
  })
  @IsOptional()
  stores?: string | string[];

  @ApiPropertyOptional({
    description: 'Store ID (alternative to stores)',
    example: ['store1'],
  })
  @IsOptional()
  store_id?: string | string[];

  @ApiPropertyOptional({
    description: 'Center number',
    example: 10,
  })
  @IsInt()
  @IsOptional()
  center_num?: number;
}
