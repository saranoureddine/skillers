import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsService } from './services/utils.service';
import { UserEntity } from '../modules/users/entities/user.entity';
import { AgAttachmentEntity } from '../modules/attachments/entities/ag-attachment.entity';

/**
 * Common Module
 * 
 * Provides global utility services and common functionality
 * that can be used across all modules.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AgAttachmentEntity,
    ]),
  ],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class CommonModule {}
