import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfPostEntity } from '../prof-posts/entities/prof-post.entity';
import { ProfCommentEntity } from '../prof-posts/entities/prof-comment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ProfFeedPublicService } from './services/prof-feed.public.service';
import { ProfFeedAdminService } from './services/prof-feed.admin.service';
import { ProfFeedPublicController } from './controllers/prof-feed.public.controller';
import { ProfFeedAdminController } from './controllers/prof-feed.admin.controller';
import { UserBlocksModule } from '../user-blocks/user-blocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfPostEntity,
      ProfCommentEntity,
      UserEntity,
    ]),
    UserBlocksModule, // Import UserBlocksModule to use UserBlocksPublicService
  ],
  controllers: [ProfFeedPublicController, ProfFeedAdminController],
  providers: [ProfFeedPublicService, ProfFeedAdminService],
  exports: [ProfFeedPublicService, ProfFeedAdminService],
})
export class ProfFeedModule {}
