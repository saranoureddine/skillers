import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AvailabilitySlotDto {
  @ApiProperty({
    description: 'Day of week',
    example: 'monday',
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  })
  @IsNotEmpty()
  @IsString()
  dayOfWeek: string;

  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '09:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format (e.g., 09:00, 14:30)',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:MM format',
    example: '17:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format (e.g., 09:00, 14:30)',
  })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Slot duration in minutes',
    example: 60,
    default: 60,
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
    default: 1,
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
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  isActive?: number;
}

export class CreateProfessionalAvailabilityDto {
  @ApiProperty({
    description: 'Array of availability slots',
    type: [AvailabilitySlotDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  availabilitySlots: AvailabilitySlotDto[];
}
