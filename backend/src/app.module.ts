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

// Components
import { ComponentsModule } from './components/components.module';

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
import { ProfLikesModule } from './modules/prof-likes/prof-likes.module';
import { ProfGroupsModule } from './modules/prof-groups/prof-groups.module';
import { ProfFollowModule } from './modules/prof-follow/prof-follow.module';
import { ProfessionUserModule } from './modules/profession-user/profession-user.module';
import { ProfCategoriesModule } from './modules/prof-categories/prof-categories.module';
import { ProfessionsModule } from './modules/professions/professions.module';
import { CitiesMembersModule } from './modules/cities-members/cities-members.module';
import { ProfSearchModule } from './modules/prof-search/prof-search.module';
import { ProfReportsModule } from './modules/prof-reports/prof-reports.module';
import { ProfFeedModule } from './modules/prof-feed/prof-feed.module';
import { ProfNotificationsModule } from './modules/prof-notifications/prof-notifications.module';
import { BookingPackagesModule } from './modules/booking-packages/booking-packages.module';
import { ProfessionalAvailabilityModule } from './modules/professional-availability/professional-availability.module';
import { SpecialistsModule } from './modules/specialists/specialists.module';
import { ChatConversationsModule } from './modules/chat-conversations/chat-conversations.module';
import { ChatDeletedMessagesModule } from './modules/chat-deleted-messages/chat-deleted-messages.module';
import { ChatBlockedUsersModule } from './modules/chat-blocked-users/chat-blocked-users.module';
import { ChatMessagesModule } from './modules/chat-messages/chat-messages.module';
import { WebSocketManageModule } from './modules/websocket-manage/websocket-manage.module';
import { SuggestionsClaimsModule } from './modules/suggestions-claims/suggestions-claims.module';
import { AgUsersModule } from './modules/ag-users/ag-users.module';

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

    // Components (Global shared components)
    ComponentsModule,

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
    ProfLikesModule, // Professional likes management
    ProfGroupsModule, // Professional groups management
    ProfFollowModule, // Professional follow/unfollow/block/mute management
    ProfessionUserModule, // Profession user management (user-profession relationships)
    ProfCategoriesModule, // Profession categories and subcategories
    ProfessionsModule, // Professions management
    CitiesMembersModule, // City members (mayors, council members, etc.)
    ProfSearchModule, // Professional search functionality
    ProfReportsModule, // Professional reports (user, post, comment reporting)
    ProfFeedModule, // Professional feed (personalized feed, timeline, trending, etc.)
    ProfNotificationsModule, // Professional notifications (like, comment, follow, etc.)
    BookingPackagesModule, // Booking packages management
    ProfessionalAvailabilityModule, // Professional availability management
    SpecialistsModule, // Specialists management
    ChatConversationsModule, // Chat conversations management
    ChatDeletedMessagesModule, // Chat deleted messages management
    ChatBlockedUsersModule, // Chat blocked users management
    ChatMessagesModule, // Chat messages management
    WebSocketManageModule, // WebSocket server process management
    SuggestionsClaimsModule, // Suggestions and claims management
    AgUsersModule, // Admin users (ag_users) management
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
