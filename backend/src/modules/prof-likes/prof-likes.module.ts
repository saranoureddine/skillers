import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ProfLikeEntity } from './entities/prof-like.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ProfPostEntity } from '../prof-posts/entities/prof-post.entity';
import { ProfCommentEntity } from '../prof-posts/entities/prof-comment.entity';

// Controllers
import { ProfLikesController } from './controllers/prof-likes.controller';
import { ProfLikesPublicController } from './controllers/prof-likes.public.controller';
import { ProfLikesAdminController } from './controllers/prof-likes.admin.controller';

// Services
import { ProfLikesService } from './services/prof-likes.service';
import { ProfLikesPublicService } from './services/prof-likes.public.service';
import { ProfLikesAdminService } from './services/prof-likes.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProfLikeEntity, UserEntity, ProfPostEntity, ProfCommentEntity])],
  controllers: [
    ProfLikesController,
    ProfLikesPublicController,
    ProfLikesAdminController,
  ],
  providers: [
    ProfLikesService,
    ProfLikesPublicService,
    ProfLikesAdminService,
  ],
  exports: [ProfLikesService],
})
export class ProfLikesModule {}
