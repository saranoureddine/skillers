import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministrationTermEntity } from './entities/administration-term.entity';
import { AdministrationTermsPublicService } from './services/administration-terms.public.service';
import { AdministrationTermsPublicController } from './controllers/administration-terms.public.controller';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdministrationTermEntity, UserEntity])],
  providers: [AdministrationTermsPublicService],
  controllers: [AdministrationTermsPublicController],
  exports: [AdministrationTermsPublicService],
})
export class AdministrationTermsModule {}
