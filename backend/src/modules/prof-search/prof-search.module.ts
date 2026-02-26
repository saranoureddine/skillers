import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { ProfCategoryEntity } from '../prof-categories/entities/prof-category.entity';
import { ProfPostEntity } from '../prof-posts/entities/prof-post.entity';
import { AgAttachmentEntity } from '../attachments/entities/ag-attachment.entity';
import { CityEntity } from '../cities-members/entities/city.entity';
import { ProfSearchPublicService } from './services/prof-search.public.service';
import { ProfSearchPublicController } from './controllers/prof-search.public.controller';
import { CommonModule } from '../../common/common.module'; // For UtilsService

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ProfCategoryEntity,
      ProfPostEntity,
      AgAttachmentEntity,
      CityEntity,
    ]),
    CommonModule, // Provides UtilsService
  ],
  providers: [ProfSearchPublicService],
  controllers: [ProfSearchPublicController],
  exports: [ProfSearchPublicService],
})
export class ProfSearchModule {}
