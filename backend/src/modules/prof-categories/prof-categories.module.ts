import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfCategoryEntity } from './entities/prof-category.entity';
import { ProfCategoriesPublicService } from './services/prof-categories.public.service';
import { ProfCategoriesPublicController } from './controllers/prof-categories.public.controller';
import { UserEntity } from '../users/entities/user.entity'; // Import UserEntity for token validation

@Module({
  imports: [TypeOrmModule.forFeature([ProfCategoryEntity, UserEntity])], // Include UserEntity
  providers: [ProfCategoriesPublicService],
  controllers: [ProfCategoriesPublicController],
  exports: [ProfCategoriesPublicService],
})
export class ProfCategoriesModule {}
