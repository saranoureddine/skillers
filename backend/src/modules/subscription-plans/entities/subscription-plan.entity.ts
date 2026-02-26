import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrencyEntity } from './currency.entity';

/**
 * Subscription Plan Entity matching Yii SubscriptionPlans model structure
 * Table: subscription_plans
 */
@Entity('subscription_plans')
export class SubscriptionPlanEntity {
  @ApiProperty({
    description: 'Subscription plan ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Plan name (English)',
    example: 'Premium Plan',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Plan name (Arabic)',
    example: 'خطة مميزة',
    maxLength: 255,
  })
  @Column({ name: 'name_ar', type: 'varchar', length: 255 })
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Plan description (English)',
    example: 'Premium features for professionals',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Plan description (Arabic)',
    example: 'ميزات مميزة للمحترفين',
    nullable: true,
  })
  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr: string | null;

  @ApiProperty({
    description: 'Plan price',
    example: 99.99,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    description: 'Number of days for the subscription',
    example: 30,
  })
  @Column({ name: 'number_days', type: 'int' })
  numberDays: number;

  @ApiPropertyOptional({
    description: 'Currency ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'currency_id', type: 'int', nullable: true })
  currencyId: number | null;

  @ApiProperty({
    description: 'Status (0 = inactive, 1 = active)',
    example: 1,
    default: 1,
  })
  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ApiPropertyOptional({
    description: 'Created by user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'created_by', type: 'varchar', length: 20, nullable: true })
  createdBy: string | null;

  @ApiPropertyOptional({
    description: 'Updated by user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'varchar', length: 20, nullable: true })
  updatedBy: string | null;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => CurrencyEntity, { nullable: true })
  @JoinColumn({ name: 'currency_id' })
  currency: CurrencyEntity | null;
}
