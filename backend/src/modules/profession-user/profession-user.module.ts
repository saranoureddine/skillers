import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ProfessionUserEntity } from './entities/profession-user.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ProfCategoryEntity } from '../prof-categories/entities/prof-category.entity';

// Controllers
import { ProfessionUserController } from './controllers/profession-user.controller';
import { ProfessionUserPublicController } from './controllers/profession-user.public.controller';
import { ProfessionUserAdminController } from './controllers/profession-user.admin.controller';

// Services
import { ProfessionUserService } from './services/profession-user.service';
import { ProfessionUserPublicService } from './services/profession-user.public.service';
import { ProfessionUserAdminService } from './services/profession-user.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProfessionUserEntity, UserEntity, ProfCategoryEntity])],
  controllers: [
    ProfessionUserController,
    ProfessionUserPublicController,
    ProfessionUserAdminController,
  ],
  providers: [
    ProfessionUserService,
    ProfessionUserPublicService,
    ProfessionUserAdminService,
  ],
  exports: [ProfessionUserService],
})
export class ProfessionUserModule {}
