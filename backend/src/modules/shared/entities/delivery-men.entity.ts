import { Column, Entity, Index, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Delivery Men Entity
 * Table: delivery_men
 */
@Entity('delivery_men')
@Index(['isActive'])
@Index(['cityId'])
export class DeliveryMenEntity {
  @ApiProperty({
    description: 'Delivery Man ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    maxLength: 100,
  })
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    maxLength: 100,
  })
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+9611234567',
    maxLength: 50,
  })
  @Column({ name: 'phone_number', type: 'varchar', length: 50 })
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Delivery category ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'delivery_category', type: 'int', nullable: true })
  deliveryCategory: number | null;

  @ApiPropertyOptional({
    description: 'Start working hour',
    example: '08:00:00',
    nullable: true,
  })
  @Column({ name: 'start_working_hour', type: 'time', nullable: true })
  startWorkingHour: string | null;

  @ApiPropertyOptional({
    description: 'End working hour',
    example: '18:00:00',
    nullable: true,
  })
  @Column({ name: 'end_working_hour', type: 'time', nullable: true })
  endWorkingHour: string | null;

  @ApiProperty({
    description: 'Is active (1 = active, 0 = inactive)',
    example: 1,
    default: 1,
  })
  @Column({ name: 'isActive', type: 'tinyint', default: 1 })
  isActive: number;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Fast and reliable delivery service',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    description: 'City ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'city_id', type: 'int', nullable: true })
  cityId: number | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
