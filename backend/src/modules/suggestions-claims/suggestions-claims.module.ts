import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { SuggestionsClaimsEntity } from './entities/suggestions-claims.entity';
import { SuggestionsClaimsRatingsEntity } from './entities/suggestions-claims-ratings.entity';
import { UserEntity } from '../users/entities/user.entity';

// Controllers
import { SuggestionsClaimsController } from './controllers/suggestions-claims.controller';
import { SuggestionsClaimsPublicController } from './controllers/suggestions-claims.public.controller';
import { SuggestionsClaimsAdminController } from './controllers/suggestions-claims.admin.controller';

// Services
import { SuggestionsClaimsService } from './services/suggestions-claims.service';
import { SuggestionsClaimsPublicService } from './services/suggestions-claims.public.service';
import { SuggestionsClaimsAdminService } from './services/suggestions-claims.admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SuggestionsClaimsEntity,
      SuggestionsClaimsRatingsEntity,
      UserEntity,
    ]),
  ],
  controllers: [
    SuggestionsClaimsController,
    SuggestionsClaimsPublicController,
    SuggestionsClaimsAdminController,
  ],
  providers: [
    SuggestionsClaimsService,
    SuggestionsClaimsPublicService,
    SuggestionsClaimsAdminService,
  ],
  exports: [SuggestionsClaimsService],
})
export class SuggestionsClaimsModule {}
