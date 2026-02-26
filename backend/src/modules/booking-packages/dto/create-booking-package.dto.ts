import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingPackageDto {
  @ApiProperty({
    description: 'Package title',
    example: 'Basic Package',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Package description',
    example: 'This is a basic booking package',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Icon image URL or path',
    example: 'https://example.com/icons/package.png',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  icon_image: string;
}
