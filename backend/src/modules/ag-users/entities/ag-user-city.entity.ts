import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * AgUserCity Entity - Junction table for ag_users and cities
 * Table: ag_users_cities
 */
@Entity('ag_users_cities')
export class AgUserCityEntity {
  @ApiProperty({
    description: 'ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  userId: string;

  @ApiProperty({
    description: 'City ID',
    example: 1,
  })
  @Column({ name: 'city_id', type: 'int' })
  cityId: number;
}
