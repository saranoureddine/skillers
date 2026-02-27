import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { UtilsService } from './services/utils.service';
import { UserEntity } from '../modules/users/entities/user.entity';
import { AgAttachmentEntity } from '../modules/attachments/entities/ag-attachment.entity';
import { AgUserEntity } from '../modules/ag-users/entities/ag-user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Common Module
 * 
 * Provides global utility services and common functionality
 * that can be used across all modules.
 */
@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      UserEntity,
      AgAttachmentEntity,
      AgUserEntity, // Needed for token strategy validation
    ]),
  ],
  providers: [UtilsService, JwtStrategy],
  exports: [UtilsService, PassportModule, JwtStrategy],
})
export class CommonModule {}
