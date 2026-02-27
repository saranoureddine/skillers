import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { AgUserEntity } from './entities/ag-user.entity';
import { AgUserCityEntity } from './entities/ag-user-city.entity';
import { AgUserStoreEntity } from './entities/ag-user-store.entity';

// Controllers
import { AgUsersAdminController } from './controllers/ag-users.admin.controller';

// Services
import { AgUsersAdminService } from './services/ag-users.admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgUserEntity, AgUserCityEntity, AgUserStoreEntity]),
  ],
  controllers: [AgUsersAdminController],
  providers: [AgUsersAdminService],
  exports: [AgUsersAdminService],
})
export class AgUsersModule {}
