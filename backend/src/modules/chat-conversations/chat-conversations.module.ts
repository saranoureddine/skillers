import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ChatConversationEntity } from './entities/chat-conversation.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AgAttachmentEntity } from '../attachments/entities/ag-attachment.entity';

// Controllers
import { ChatConversationsController } from './controllers/chat-conversations.controller';
import { ChatConversationsPublicController } from './controllers/chat-conversations.public.controller';
import { ChatConversationsAdminController } from './controllers/chat-conversations.admin.controller';

// Services
import { ChatConversationsService } from './services/chat-conversations.service';
import { ChatConversationsPublicService } from './services/chat-conversations.public.service';
import { ChatConversationsAdminService } from './services/chat-conversations.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatConversationEntity, UserEntity, AgAttachmentEntity])],
  controllers: [
    ChatConversationsController,
    ChatConversationsPublicController,
    ChatConversationsAdminController,
  ],
  providers: [
    ChatConversationsService,
    ChatConversationsPublicService,
    ChatConversationsAdminService,
  ],
  exports: [ChatConversationsService],
})
export class ChatConversationsModule {}
