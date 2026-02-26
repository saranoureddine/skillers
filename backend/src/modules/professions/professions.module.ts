import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ProfCategoryEntity } from '../prof-categories/entities/prof-category.entity';
import { UserEntity } from '../users/entities/user.entity';

// Controllers
import { ProfessionsController } from './controllers/professions.controller';
import { ProfessionsPublicController } from './controllers/professions.public.controller';
import { ProfessionsAdminController } from './controllers/professions.admin.controller';

// Services
import { ProfessionsService } from './services/professions.service';
import { ProfessionsPublicService } from './services/professions.public.service';
import { ProfessionsAdminService } from './services/professions.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProfCategoryEntity, UserEntity])],
  controllers: [
    ProfessionsController,
    ProfessionsPublicController,
    ProfessionsAdminController,
  ],
  providers: [
    ProfessionsService,
    ProfessionsPublicService,
    ProfessionsAdminService,
  ],
  exports: [ProfessionsService],
})
export class ProfessionsModule {}
