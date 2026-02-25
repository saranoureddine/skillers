import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { UserEntity } from './entities/user.entity';
import { UserReviewEntity } from './entities/user-review.entity';

// Controllers
import { UsersController, UsersPublicController, UsersAdminController } from './controllers/users.public.controller';

// Services
import { UsersService } from './services/users.service';
import { UsersAdminService } from './services/users.admin.service';
import { UsersPublicService } from './services/users.public.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserReviewEntity])],
  controllers: [UsersController, UsersAdminController, UsersPublicController],
  providers: [UsersService, UsersAdminService, UsersPublicService],
  exports: [UsersService],
})
export class UsersModule {}
