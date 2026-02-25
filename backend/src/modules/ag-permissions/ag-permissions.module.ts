import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgPermissionEntity } from './entities/ag-permission.entity';
import { AgPermissionsPublicService } from './services/ag-permissions.public.service';
import { AgPermissionsPublicController } from './controllers/ag-permissions.public.controller';
import { AgTablesSchemaEntity } from '../ag-tables-schema/entities/ag-tables-schema.entity';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgPermissionEntity,
      AgTablesSchemaEntity,
      UserEntity,
    ]),
  ],
  providers: [AgPermissionsPublicService],
  controllers: [AgPermissionsPublicController],
  exports: [AgPermissionsPublicService],
})
export class AgPermissionsModule {}
