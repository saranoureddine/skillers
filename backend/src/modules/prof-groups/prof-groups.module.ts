import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ProfGroupEntity } from './entities/prof-group.entity';
import { ProfGroupMemberEntity } from './entities/prof-group-member.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ProfCategoryEntity } from '../prof-categories/entities/prof-category.entity';

// Controllers
import { ProfGroupsController } from './controllers/prof-groups.controller';
import { ProfGroupsPublicController } from './controllers/prof-groups.public.controller';
import { ProfGroupsAdminController } from './controllers/prof-groups.admin.controller';

// Services
import { ProfGroupsService } from './services/prof-groups.service';
import { ProfGroupsPublicService } from './services/prof-groups.public.service';
import { ProfGroupsAdminService } from './services/prof-groups.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProfGroupEntity, ProfGroupMemberEntity, UserEntity, ProfCategoryEntity])],
  controllers: [
    ProfGroupsController,
    ProfGroupsPublicController,
    ProfGroupsAdminController,
  ],
  providers: [
    ProfGroupsService,
    ProfGroupsPublicService,
    ProfGroupsAdminService,
  ],
  exports: [ProfGroupsService],
})
export class ProfGroupsModule {}
