import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Services
import { CredentialHelperService } from './credential-helper.service';
import { MaintenanceConfigService } from './maintenance-config.service';
import { MaintenanceCacheService } from './maintenance-cache.service';
import { JwtHelperService } from './jwt-helper.service';
import { AgoraTokenBuilderService } from './agora-token-builder.service';
import { AgoraService } from './agora.service';
import { CentrifugoService } from './centrifugo.service';
import { WebSocketNotifierService } from './websocket-notifier.service';
import { WebSocketServerService } from './websocket-server.service';
import { WebSocketClientService } from './websocket-client.service';
import { ChatWebSocketServerService } from './chat-websocket-server.service';

// Guards & Interceptors
import { AccessControlGuard } from './access-control.guard';
import { RequestLoggerInterceptor } from './request-logger.interceptor';

/**
 * Components Module
 * Global module providing shared components/services
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    // Utility Services
    CredentialHelperService,
    MaintenanceConfigService,
    MaintenanceCacheService,
    JwtHelperService,

    // WebSocket Services
    WebSocketServerService,
    WebSocketClientService,
    WebSocketNotifierService,
    ChatWebSocketServerService,

    // Agora Services
    AgoraTokenBuilderService,
    AgoraService,

    // Centrifugo Service
    CentrifugoService,

    // Guards & Interceptors
    AccessControlGuard,
    RequestLoggerInterceptor,
  ],
  exports: [
    // Utility Services
    CredentialHelperService,
    MaintenanceConfigService,
    MaintenanceCacheService,
    JwtHelperService,

    // WebSocket Services
    WebSocketServerService,
    WebSocketClientService,
    WebSocketNotifierService,
    ChatWebSocketServerService,

    // Agora Services
    AgoraTokenBuilderService,
    AgoraService,

    // Centrifugo Service
    CentrifugoService,

    // Guards & Interceptors
    AccessControlGuard,
    RequestLoggerInterceptor,
  ],
})
export class ComponentsModule {}
