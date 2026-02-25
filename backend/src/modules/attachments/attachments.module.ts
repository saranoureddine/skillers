import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgAttachmentEntity } from './entities/ag-attachment.entity';
import { AgAttachmentDeleteEntity } from './entities/ag-attachment-delete.entity';
import { AgAttachmentKindsEntity } from './entities/ag-attachment-kinds.entity';

/**
 * Attachments Module
 * 
 * This module provides shared entities for file attachments.
 * These entities are used across multiple modules but don't have dedicated controllers.
 * 
 * Entities:
 * - AgAttachmentEntity: Main attachment storage
 * - AgAttachmentDeleteEntity: Tracks deleted attachments
 * - AgAttachmentKindsEntity: Attachment type definitions
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgAttachmentEntity,
      AgAttachmentDeleteEntity,
      AgAttachmentKindsEntity,
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule], // Export TypeOrmModule so other modules can use these entities
})
export class AttachmentsModule {}
