import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ChatDeletedMessageEntity } from './entities/chat-deleted-message.entity';

// Controllers
import { ChatDeletedMessagesController } from './controllers/chat-deleted-messages.controller';
import { ChatDeletedMessagesPublicController } from './controllers/chat-deleted-messages.public.controller';
import { ChatDeletedMessagesAdminController } from './controllers/chat-deleted-messages.admin.controller';

// Services
import { ChatDeletedMessagesService } from './services/chat-deleted-messages.service';
import { ChatDeletedMessagesPublicService } from './services/chat-deleted-messages.public.service';
import { ChatDeletedMessagesAdminService } from './services/chat-deleted-messages.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatDeletedMessageEntity])],
  controllers: [
    ChatDeletedMessagesController,
    ChatDeletedMessagesPublicController,
    ChatDeletedMessagesAdminController,
  ],
  providers: [
    ChatDeletedMessagesService,
    ChatDeletedMessagesPublicService,
    ChatDeletedMessagesAdminService,
  ],
  exports: [ChatDeletedMessagesService],
})
export class ChatDeletedMessagesModule {}
