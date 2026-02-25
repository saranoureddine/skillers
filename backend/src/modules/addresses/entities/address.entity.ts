import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Address Entity matching Yii Addresses model structure
 * Table: addresses
 */
@Entity('addresses')
@Index(['userId'])
export class AddressEntity {
  @ApiProperty({
    description: 'Address ID (20 character string)',
    example: 'e87b786bac5234367b4a',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiPropertyOptional({
    description: 'Country ID',
    example: '1',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'country_id', type: 'varchar', length: 20, nullable: true })
  countryId: string | null;

  @ApiPropertyOptional({
    description: 'City ID',
    example: '1',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'city_id', type: 'varchar', length: 20, nullable: true })
  cityId: string | null;

  @ApiProperty({
    description: 'User ID',
    example: 'e87b786bac5234367b4a',
    maxLength: 20,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  userId: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    maxLength: 50,
  })
  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    maxLength: 50,
  })
  @Column({ name: 'last_name', type: 'varchar', length: 50 })
  lastName: string;

  @ApiProperty({
    description: 'Country code',
    example: '+961',
    maxLength: 100,
  })
  @Column({ name: 'country_code', type: 'varchar', length: 100 })
  countryCode: string;

  @ApiProperty({
    description: 'Phone number',
    example: '1234567',
    maxLength: 50,
  })
  @Column({ name: 'phone_number', type: 'varchar', length: 50 })
  phoneNumber: string;

  @ApiProperty({
    description: 'Address',
    example: '123 Main Street',
    maxLength: 200,
  })
  @Column({ type: 'varchar', length: 200 })
  address: string;

  @ApiProperty({
    description: 'Route name',
    example: 'Route 1',
  })
  @Column({ name: 'route_name', type: 'varchar', length: 255 })
  routeName: string;

  @ApiProperty({
    description: 'Building name',
    example: 'Building A',
    maxLength: 255,
  })
  @Column({ name: 'building_name', type: 'varchar', length: 255 })
  buildingName: string;

  @ApiProperty({
    description: 'Floor number',
    example: 5,
  })
  @Column({ name: 'floor_number', type: 'int' })
  floorNumber: number;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 33.8938,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 35.5018,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;
}
