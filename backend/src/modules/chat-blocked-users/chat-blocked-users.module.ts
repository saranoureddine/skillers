import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ChatBlockedUserEntity } from './entities/chat-blocked-user.entity';
import { UserEntity } from '../users/entities/user.entity';

// Controllers
import { ChatBlockedUsersController } from './controllers/chat-blocked-users.controller';
import { ChatBlockedUsersPublicController } from './controllers/chat-blocked-users.public.controller';
import { ChatBlockedUsersAdminController } from './controllers/chat-blocked-users.admin.controller';

// Services
import { ChatBlockedUsersService } from './services/chat-blocked-users.service';
import { ChatBlockedUsersPublicService } from './services/chat-blocked-users.public.service';
import { ChatBlockedUsersAdminService } from './services/chat-blocked-users.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatBlockedUserEntity, UserEntity])],
  controllers: [
    ChatBlockedUsersController,
    ChatBlockedUsersPublicController,
    ChatBlockedUsersAdminController,
  ],
  providers: [
    ChatBlockedUsersService,
    ChatBlockedUsersPublicService,
    ChatBlockedUsersAdminService,
  ],
  exports: [ChatBlockedUsersService],
})
export class ChatBlockedUsersModule {}
