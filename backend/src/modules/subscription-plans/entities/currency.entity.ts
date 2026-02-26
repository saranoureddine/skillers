import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Currency Entity matching Yii Currencies model structure
 * Table: currencies
 */
@Entity('currencies')
export class CurrencyEntity {
  @ApiProperty({
    description: 'Currency ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Currency name (English)',
    example: 'US Dollar',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Currency name (Arabic)',
    example: 'دولار أمريكي',
    maxLength: 255,
  })
  @Column({ name: 'name_ar', type: 'varchar', length: 255 })
  nameAr: string;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
    maxLength: 10,
  })
  @Column({ type: 'varchar', length: 10 })
  code: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: '$',
    maxLength: 10,
  })
  @Column({ type: 'varchar', length: 10 })
  symbol: string;
}
