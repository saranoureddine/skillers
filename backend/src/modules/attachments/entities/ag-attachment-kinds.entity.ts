import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgAttachmentKinds Entity matching Yii AgAttachmentKinds model structure
 * Table: ag_attachment_kinds
 */
@Entity('ag_attachment_kinds')
export class AgAttachmentKindsEntity {
  @ApiProperty({
    description: 'Attachment kind ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Name',
    example: 'Main Image',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    description: 'Arabic label',
    example: 'الصورة الرئيسية',
    maxLength: 100,
  })
  @Column({ name: 'arabic_label', type: 'varchar', length: 100 })
  arabicLabel: string;

  @ApiProperty({
    description: 'Has thumbnail flag',
    example: 1,
  })
  @Column({ name: 'has_thumb', type: 'tinyint' })
  hasThumb: number;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated timestamp (note: typo in Yii model - uodated_at)',
    example: '2026-02-24T12:00:00.000Z',
  })
  @Column({ name: 'uodated_at', type: 'datetime' })
  uodatedAt: Date;

  @ApiPropertyOptional({
    description: 'User ID who locked the record',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'locked_by', type: 'int', nullable: true })
  lockedBy: number | null;

  @ApiPropertyOptional({
    description: 'User ID who created the record',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  @ApiPropertyOptional({
    description: 'User ID who updated the record',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null;

  @ApiProperty({
    description: 'Record update timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
