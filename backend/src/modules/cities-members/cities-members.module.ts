import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityMemberEntity } from './entities/city-member.entity';
import { CityEntity } from './entities/city.entity';
import { CitiesMembersPublicService } from './services/cities-members.public.service';
import { CitiesMembersPublicController } from './controllers/cities-members.public.controller';
import { UserEntity } from '../users/entities/user.entity'; // Import UserEntity for token validation

@Module({
  imports: [TypeOrmModule.forFeature([CityMemberEntity, CityEntity, UserEntity])], // Include CityEntity and UserEntity
  providers: [CitiesMembersPublicService],
  controllers: [CitiesMembersPublicController],
  exports: [CitiesMembersPublicService],
})
export class CitiesMembersModule {}
