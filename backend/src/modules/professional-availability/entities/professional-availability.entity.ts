import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../users/entities/user.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

/**
 * Professional Availability Entity matching Yii ProfessionalAvailability model structure
 * Table: professional_availability
 */
@Entity('professional_availability')
@Index(['userId', 'dayOfWeek', 'startTime', 'endTime'], { unique: true })
export class ProfessionalAvailabilityEntity extends BaseEntity {
  @ApiProperty({
    description: 'User ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 255,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  @Index()
  userId: string;

  @ApiProperty({
    description: 'Day of week',
    example: 'monday',
    enum: DayOfWeek,
  })
  @Column({ name: 'day_of_week', type: 'varchar', length: 10 })
  dayOfWeek: string;

  @ApiProperty({
    description: 'Start time (HH:MM:SS format)',
    example: '09:00:00',
  })
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @ApiProperty({
    description: 'End time (HH:MM:SS format)',
    example: '17:00:00',
  })
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Slot duration in minutes',
    example: 60,
    default: 60,
  })
  @Column({ name: 'slot_duration', type: 'int', default: 60 })
  slotDuration: number;

  @ApiPropertyOptional({
    description: 'Whether the availability slot is active',
    example: 1,
    default: 1,
  })
  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;

  @ApiPropertyOptional({
    description: 'Maximum appointments per slot',
    example: 1,
    default: 1,
  })
  @Column({ name: 'max_appointments_per_slot', type: 'int', default: 1 })
  maxAppointmentsPerSlot: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;
}
