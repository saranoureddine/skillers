import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * User Subscription Entity
 * Table: user_subscriptions
 */
@Entity('user_subscriptions')
@Index(['userId', 'status'])
@Index(['subscriptionPlanId'])
export class UserSubscriptionEntity {
  @ApiProperty({
    description: 'Subscription ID',
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
    description: 'Subscription plan ID',
    example: 1,
  })
  @Column({ name: 'subscription_plan_id', type: 'int' })
  subscriptionPlanId: number;

  @ApiProperty({
    description: 'Payment method',
    example: 'Visa',
    enum: ['Visa', 'Mastercard', 'Apple Pay', 'Bank Transfer'],
  })
  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  paymentMethod: string;

  @ApiProperty({
    description: 'Subscription type',
    example: 'new',
    enum: ['new', 'renewal'],
  })
  @Column({ name: 'subscription_type', type: 'varchar', length: 20 })
  subscriptionType: string;

  @ApiProperty({
    description: 'Status (0 = inactive, 1 = active)',
    example: 1,
    default: 1,
  })
  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ name: 'start_date', type: 'datetime' })
  startDate: Date;

  @ApiProperty({
    description: 'Subscription end date',
    example: '2024-01-31T00:00:00.000Z',
  })
  @Column({ name: 'end_date', type: 'datetime' })
  endDate: Date;

  @ApiProperty({
    description: 'Amount paid',
    example: 99.99,
  })
  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number;

  @ApiPropertyOptional({
    description: 'Currency ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'currency_id', type: 'int', nullable: true })
  currencyId: number | null;

  @ApiPropertyOptional({
    description: 'Transaction ID',
    example: 'txn_123456',
    nullable: true,
  })
  @Column({ name: 'transaction_id', type: 'varchar', length: 255, nullable: true })
  transactionId: string | null;

  @ApiPropertyOptional({
    description: 'Notes',
    example: 'Payment received',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

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
}
