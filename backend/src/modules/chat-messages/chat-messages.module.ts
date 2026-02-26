import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ChatMessageEntity } from './entities/chat-message.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AgAttachmentEntity } from '../attachments/entities/ag-attachment.entity';

// Controllers
import { ChatMessagesController } from './controllers/chat-messages.controller';
import { ChatMessagesPublicController } from './controllers/chat-messages.public.controller';
import { ChatMessagesAdminController } from './controllers/chat-messages.admin.controller';

// Services
import { ChatMessagesService } from './services/chat-messages.service';
import { ChatMessagesPublicService } from './services/chat-messages.public.service';
import { ChatMessagesAdminService } from './services/chat-messages.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessageEntity, UserEntity, AgAttachmentEntity])],
  controllers: [
    ChatMessagesController,
    ChatMessagesPublicController,
    ChatMessagesAdminController,
  ],
  providers: [
    ChatMessagesService,
    ChatMessagesPublicService,
    ChatMessagesAdminService,
  ],
  exports: [ChatMessagesService],
})
export class ChatMessagesModule {}
