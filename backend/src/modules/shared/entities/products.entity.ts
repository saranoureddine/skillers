import { Column, Entity, Index, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Products Entity matching Yii Products model structure
 * Table: products
 */
@Entity('products')
@Index(['showHide'])
@Index(['userId'])
@Index(['storeId'])
export class ProductsEntity {
  @ApiProperty({
    description: 'Product ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 13',
    maxLength: 255,
  })
  @Column({ name: 'product_name', type: 'varchar', length: 255 })
  productName: string;

  @ApiPropertyOptional({
    description: 'Product name (Arabic)',
    example: 'آيفون 13',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'product_name_ar', type: 'varchar', length: 255, nullable: true })
  productNameAr: string | null;

  @ApiPropertyOptional({
    description: 'Barcode',
    example: '1234567890',
    maxLength: 50,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string | null;

  @ApiProperty({
    description: 'Product description',
    example: 'Brand new iPhone 13',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiPropertyOptional({
    description: 'Product description (Arabic)',
    example: 'آيفون 13 جديد',
    nullable: true,
  })
  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr: string | null;

  @ApiPropertyOptional({
    description: 'Quantity',
    example: 10,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  quantity: number | null;

  @ApiProperty({
    description: 'Boolean percent discount (1 = percent, 0 = fixed)',
    example: 1,
    default: 0,
  })
  @Column({ name: 'boolean_percent_discount', type: 'tinyint', default: 0 })
  booleanPercentDiscount: number;

  @ApiProperty({
    description: 'Sales discount amount',
    example: 10.5,
    default: 0,
  })
  @Column({ name: 'sales_discount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  salesDiscount: number;

  @ApiProperty({
    description: 'Is free (1 = free, 0 = paid)',
    example: 0,
    default: 0,
  })
  @Column({ type: 'tinyint', default: 0 })
  free: number;

  @ApiPropertyOptional({
    description: 'Product price',
    example: 999.99,
    nullable: true,
  })
  @Column({ name: 'product_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  productPrice: number | null;

  @ApiPropertyOptional({
    description: 'Product brand ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'product_brand', type: 'varchar', length: 20, nullable: true })
  productBrand: string | null;

  @ApiPropertyOptional({
    description: 'Product condition',
    example: 'New',
    nullable: true,
  })
  @Column({ name: 'product_condition', type: 'text', nullable: true })
  productCondition: string | null;

  @ApiPropertyOptional({
    description: 'Product slug',
    example: 'iphone-13',
    maxLength: 20,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  slug: string | null;

  @ApiPropertyOptional({
    description: 'Store ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'store_id', type: 'varchar', length: 20, nullable: true })
  storeId: string | null;

  @ApiPropertyOptional({
    description: 'User ID (for marketplace products)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20, nullable: true })
  userId: string | null;

  @ApiPropertyOptional({
    description: 'Flash ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'flash_id', type: 'varchar', length: 20, nullable: true })
  flashId: string | null;

  @ApiPropertyOptional({
    description: 'View duration in days',
    example: 30,
    nullable: true,
  })
  @Column({ name: 'view_duration', type: 'text', nullable: true })
  viewDuration: string | null;

  @ApiProperty({
    description: 'Main image path',
    example: '/uploads/products/iphone13.jpg',
    maxLength: 255,
  })
  @Column({ name: 'main_image', type: 'varchar', length: 255 })
  mainImage: string;

  @ApiProperty({
    description: 'Show/Hide flag (1 = show, 0 = hide)',
    example: 1,
    default: 1,
  })
  @Column({ name: 'show_hide', type: 'tinyint', default: 1 })
  showHide: number;

  @ApiPropertyOptional({
    description: 'Attachment counter',
    example: 0,
    nullable: true,
  })
  @Column({ name: 'attachment_counter', type: 'int', nullable: true })
  attachmentCounter: number | null;

  @ApiPropertyOptional({
    description: 'Locked by user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'locked_by', type: 'varchar', length: 20, nullable: true })
  lockedBy: string | null;

  @ApiProperty({
    description: 'Created by user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'created_by', type: 'varchar', length: 20 })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'Updated by user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'varchar', length: 20, nullable: true })
  updatedBy: string | null;

  @ApiProperty({
    description: 'Center number',
    example: 1,
  })
  @Column({ name: 'center_num', type: 'int' })
  centerNum: number;

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
