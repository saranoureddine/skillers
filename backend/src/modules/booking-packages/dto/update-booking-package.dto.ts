import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookingPackageDto {
  @ApiPropertyOptional({
    description: 'Package title',
    example: 'Basic Package',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Package description',
    example: 'This is a basic booking package',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Icon image URL or path',
    example: 'https://example.com/icons/package.png',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  icon_image?: string;
}
