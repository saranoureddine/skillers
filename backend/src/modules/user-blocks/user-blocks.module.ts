import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entity
import { UserBlockEntity } from './entities/user-block.entity';
import { UserEntity } from '../users/entities/user.entity';

// Controllers
import { UserBlocksPublicController } from './controllers/user-blocks.public.controller';

// Services
import { UserBlocksPublicService } from './services/user-blocks.public.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserBlockEntity, UserEntity])],
  controllers: [UserBlocksPublicController],
  providers: [UserBlocksPublicService],
  exports: [UserBlocksPublicService],
})
export class UserBlocksModule {}
