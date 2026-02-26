import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { UserEntity } from '../users/entities/user.entity';

// Controllers
import { SpecialistsController } from './controllers/specialists.controller';
import { SpecialistsPublicController } from './controllers/specialists.public.controller';
import { SpecialistsAdminController } from './controllers/specialists.admin.controller';

// Services
import { SpecialistsService } from './services/specialists.service';
import { SpecialistsPublicService } from './services/specialists.public.service';
import { SpecialistsAdminService } from './services/specialists.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [
    SpecialistsController,
    SpecialistsPublicController,
    SpecialistsAdminController,
  ],
  providers: [
    SpecialistsService,
    SpecialistsPublicService,
    SpecialistsAdminService,
  ],
  exports: [SpecialistsService],
})
export class SpecialistsModule {}
