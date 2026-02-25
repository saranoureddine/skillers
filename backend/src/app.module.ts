import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Config
import { appConfig, databaseConfig } from './config';

// Database
import { DatabaseModule } from './database/database.module';

// Common
import { CommonModule } from './common/common.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Feature Modules
import { UsersModule } from './modules/users/users.module';
import { UserBlocksModule } from './modules/user-blocks/user-blocks.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { VoiceCallsModule } from './modules/voice-calls/voice-calls.module';
import { AdministrationTermsModule } from './modules/administration-terms/administration-terms.module';
import { AgTablesSchemaModule } from './modules/ag-tables-schema/ag-tables-schema.module';
import { AgPermissionsModule } from './modules/ag-permissions/ag-permissions.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { BoardsModule } from './modules/boards/boards.module';
import { SharedModule } from './modules/shared/shared.module';
import { ProfPostsModule } from './modules/prof-posts/prof-posts.module';

@Module({
  imports: [
    // Global Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env'],
    }),

    // Database
    DatabaseModule,

    // Common (Global utilities)
    CommonModule,

    // Feature Modules
    UsersModule,
    UserBlocksModule,
    AddressesModule,
    VoiceCallsModule,
    AdministrationTermsModule,
    AgTablesSchemaModule,
    AgPermissionsModule,
    AttachmentsModule, // Shared entities for file attachments
    BoardsModule, // Shared entities for board management
    SharedModule, // Shared entities (chats, dashboard, etc.)
    ProfPostsModule, // Professional posts and comments
  ],
  providers: [
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },

    // Global Response Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    // Global Logging Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    // Global Auth Guard (JWT)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // Global Roles Guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
