import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ProfessionalAvailabilityEntity } from './entities/professional-availability.entity';
import { UserEntity } from '../users/entities/user.entity';

// Controllers
import { ProfessionalAvailabilityController } from './controllers/professional-availability.controller';
import { ProfessionalAvailabilityPublicController } from './controllers/professional-availability.public.controller';
import { ProfessionalAvailabilityAdminController } from './controllers/professional-availability.admin.controller';

// Services
import { ProfessionalAvailabilityService } from './services/professional-availability.service';
import { ProfessionalAvailabilityPublicService } from './services/professional-availability.public.service';
import { ProfessionalAvailabilityAdminService } from './services/professional-availability.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProfessionalAvailabilityEntity, UserEntity])],
  controllers: [
    ProfessionalAvailabilityController,
    ProfessionalAvailabilityPublicController,
    ProfessionalAvailabilityAdminController,
  ],
  providers: [
    ProfessionalAvailabilityService,
    ProfessionalAvailabilityPublicService,
    ProfessionalAvailabilityAdminService,
  ],
  exports: [ProfessionalAvailabilityService],
})
export class ProfessionalAvailabilityModule {}
