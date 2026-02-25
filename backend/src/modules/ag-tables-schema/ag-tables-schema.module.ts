import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgTablesSchemaEntity } from './entities/ag-tables-schema.entity';
import { AgTablesSchemaPublicService } from './services/ag-tables-schema.public.service';
import { AgTablesSchemaPublicController } from './controllers/ag-tables-schema.public.controller';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgTablesSchemaEntity, UserEntity])],
  providers: [AgTablesSchemaPublicService],
  controllers: [AgTablesSchemaPublicController],
  exports: [AgTablesSchemaPublicService],
})
export class AgTablesSchemaModule {}
