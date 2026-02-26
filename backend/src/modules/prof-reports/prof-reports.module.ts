import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfReportedUserEntity } from './entities/prof-reported-user.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ProfReportsPublicService } from './services/prof-reports.public.service';
import { ProfReportsPublicController } from './controllers/prof-reports.public.controller';
import { CommonModule } from '../../common/common.module'; // For UtilsService

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfReportedUserEntity, UserEntity]),
    CommonModule, // Provides UtilsService
  ],
  providers: [ProfReportsPublicService],
  controllers: [ProfReportsPublicController],
  exports: [ProfReportsPublicService],
})
export class ProfReportsModule {}
