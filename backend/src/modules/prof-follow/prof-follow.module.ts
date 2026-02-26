import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ProfFollowEntity } from './entities/prof-follow.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ProfNotificationEntity } from '../prof-notifications/entities/prof-notification.entity';

// Controllers
import { ProfFollowController } from './controllers/prof-follow.controller';
import { ProfFollowPublicController } from './controllers/prof-follow.public.controller';
import { ProfFollowAdminController } from './controllers/prof-follow.admin.controller';

// Services
import { ProfFollowService } from './services/prof-follow.service';
import { ProfFollowPublicService } from './services/prof-follow.public.service';
import { ProfFollowAdminService } from './services/prof-follow.admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfFollowEntity,
      UserEntity,
      ProfNotificationEntity,
    ]),
  ],
  controllers: [
    ProfFollowController,
    ProfFollowPublicController,
    ProfFollowAdminController,
  ],
  providers: [
    ProfFollowService,
    ProfFollowPublicService,
    ProfFollowAdminService,
  ],
  exports: [ProfFollowService],
})
export class ProfFollowModule {}
