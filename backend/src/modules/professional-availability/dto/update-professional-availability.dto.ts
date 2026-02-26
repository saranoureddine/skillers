import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsString,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProfessionalAvailabilityDto {
  @ApiProperty({
    description: 'Availability slot ID to update',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  availabilityId: number;

  @ApiPropertyOptional({
    description: 'Day of week',
    example: 'monday',
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  })
  @IsOptional()
  @IsString()
  dayOfWeek?: string;

  @ApiPropertyOptional({
    description: 'Start time in HH:MM format',
    example: '09:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format (e.g., 09:00, 14:30)',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time in HH:MM format',
    example: '17:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format (e.g., 09:00, 14:30)',
  })
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Slot duration in minutes',
    example: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  @Type(() => Number)
  slotDuration?: number;

  @ApiPropertyOptional({
    description: 'Maximum appointments per slot',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  maxAppointmentsPerSlot?: number;

  @ApiPropertyOptional({
    description: 'Whether the availability slot is active',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  isActive?: number;
}
