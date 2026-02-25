import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfPostEntity } from './entities/prof-post.entity';
import { ProfCommentEntity } from './entities/prof-comment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ProfPostsPublicService } from './services/prof-posts.public.service';
import { ProfCommentsPublicService } from './services/prof-comments.public.service';
import { ProfPostsPublicController } from './controllers/prof-posts.public.controller';
import { ProfCommentsPublicController } from './controllers/prof-comments.public.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfPostEntity,
      ProfCommentEntity,
      UserEntity,
    ]),
  ],
  controllers: [ProfPostsPublicController, ProfCommentsPublicController],
  providers: [ProfPostsPublicService, ProfCommentsPublicService],
  exports: [ProfPostsPublicService, ProfCommentsPublicService],
})
export class ProfPostsModule {}
