import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entity
import { AddressEntity } from './entities/address.entity';
import { UserEntity } from '../users/entities/user.entity';

// Controllers
import { AddressesPublicController } from './controllers/addresses.public.controller';

// Services
import { AddressesPublicService } from './services/addresses.public.service';

@Module({
  imports: [TypeOrmModule.forFeature([AddressEntity, UserEntity])],
  controllers: [AddressesPublicController],
  providers: [AddressesPublicService],
  exports: [AddressesPublicService],
})
export class AddressesModule {}
