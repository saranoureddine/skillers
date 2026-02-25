import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgAttachmentDelete Entity matching Yii AgAttachmentDelete model structure
 * Table: ag_attachment_delete
 */
@Entity('ag_attachment_delete')
@Index(['tableName', 'rowId'])
export class AgAttachmentDeleteEntity {
  @ApiProperty({
    description: 'Delete record ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Table name (numeric)',
    example: 210,
  })
  @Column({ name: 'table_name', type: 'int' })
  tableName: number;

  @ApiProperty({
    description: 'Row ID (numeric)',
    example: 12345,
  })
  @Column({ name: 'row_id', type: 'int' })
  rowId: number;

  @ApiPropertyOptional({
    description: 'Attachment type',
    example: 1,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  type: number | null;

  @ApiProperty({
    description: 'File path',
    example: '/uploads/users/2024/02/image.jpg',
    maxLength: 255,
  })
  @Column({ name: 'file_path', type: 'varchar', length: 255 })
  filePath: string;
}
