import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfNotificationEntity } from './entities/prof-notification.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ProfPostEntity } from '../prof-posts/entities/prof-post.entity';
import { ProfCommentEntity } from '../prof-posts/entities/prof-comment.entity';
import { ProfNotificationsPublicService } from './services/prof-notifications.public.service';
import { ProfNotificationsPublicController } from './controllers/prof-notifications.public.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfNotificationEntity,
      UserEntity,
      ProfPostEntity,
      ProfCommentEntity,
    ]),
  ],
  controllers: [ProfNotificationsPublicController],
  providers: [ProfNotificationsPublicService],
  exports: [ProfNotificationsPublicService], // Export for use in other modules (e.g., to create notifications)
})
export class ProfNotificationsModule {}
