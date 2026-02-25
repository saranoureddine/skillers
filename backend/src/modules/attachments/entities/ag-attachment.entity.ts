import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgAttachment Entity matching Yii AgAttachment model structure
 * Table: ag_attachment
 */
@Entity('ag_attachment')
@Index(['tableName', 'rowId'])
@Index(['tableName', 'rowId', 'type'])
export class AgAttachmentEntity {
  @ApiProperty({
    description: 'Attachment ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({
    description: 'Table name',
    example: '210',
    maxLength: 50,
    nullable: true,
  })
  @Column({ name: 'table_name', type: 'varchar', length: 50, nullable: true })
  tableName: string | null;

  @ApiPropertyOptional({
    description: 'Row ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'row_id', type: 'varchar', length: 20, nullable: true })
  rowId: string | null;

  @ApiPropertyOptional({
    description: 'Attachment type',
    example: 1,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  type: number | null;

  @ApiPropertyOptional({
    description: 'File path',
    example: '/uploads/users/2024/02/image.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'file_path', type: 'varchar', length: 255, nullable: true })
  filePath: string | null;

  @ApiPropertyOptional({
    description: 'File name',
    example: 'image.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName: string | null;

  @ApiPropertyOptional({
    description: 'File extension',
    example: 'jpg',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'file_extension', type: 'varchar', length: 20, nullable: true })
  fileExtension: string | null;

  @ApiProperty({
    description: 'CDN uploaded flag',
    example: 0,
    default: 0,
  })
  @Column({ name: 'cdn_uploaded', type: 'tinyint', default: 0 })
  cdnUploaded: number;

  @ApiProperty({
    description: 'File size',
    example: '1024',
    maxLength: 255,
  })
  @Column({ name: 'file_size', type: 'varchar', length: 255 })
  fileSize: string;

  @ApiPropertyOptional({
    description: 'Record creation timestamp',
    example: '2026-02-24T12:00:00.000Z',
    nullable: true,
  })
  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date | null;
}
