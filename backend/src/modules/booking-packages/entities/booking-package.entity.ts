import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * BookingPackage Entity matching Yii BookingPackage model structure
 * Table: booking_packages
 */
@Entity('booking_packages')
export class BookingPackageEntity {
  @ApiProperty({
    description: 'Package ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Package title',
    example: 'Basic Package',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({
    description: 'Package description',
    example: 'This is a basic booking package',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Icon image URL or path',
    example: 'https://example.com/icons/package.png',
    maxLength: 255,
  })
  @Column({ name: 'icon_image', type: 'varchar', length: 255 })
  iconImage: string;
}
