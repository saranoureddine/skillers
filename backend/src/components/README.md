# Components Module

This module contains all converted Yii components as NestJS services, guards, interceptors, and decorators.

## Services

### Utility Services

- **CredentialHelperService** - Encrypts and decrypts credentials using application key
- **MaintenanceConfigService** - Central configuration for maintenance mode
- **MaintenanceCacheService** - In-memory cache for tenant maintenance status
- **JwtHelperService** - Simple JWT implementation for token generation

### WebSocket Services

- **WebSocketServerService** - Manages WebSocket connections and messaging
- **WebSocketClientService** - Client for connecting to WebSocket servers
- **WebSocketNotifierService** - Sends real-time notifications via WebSocket
- **ChatWebSocketServerService** - Chat WebSocket server for broadcasting messages

### Agora Services

- **AgoraTokenBuilderService** - Generates RTC tokens for Agora voice/video calls
- **AgoraService** - Manages Agora operations and configuration

### Centrifugo Service

- **CentrifugoService** - Real-time messaging service using Centrifugo

## Guards & Interceptors

- **AccessControlGuard** - Ensures user is authenticated (not a guest)
- **RequestLoggerInterceptor** - Logs all HTTP requests to database

## Decorators

- **Purify** - Sanitizes HTML content to prevent XSS attacks

## Usage

All services are available globally through the `ComponentsModule`. Import them in your modules:

```typescript
import { AgoraService } from '../components';

@Injectable()
export class MyService {
  constructor(private readonly agoraService: AgoraService) {}
}
```

## Notes

- Some services use in-memory stores instead of Redis (for development). Install `ioredis` for production.
- WebSocket services are simplified implementations. For full WebSocket gateway, install `@nestjs/websockets` and `ws` packages.
- JWT helper uses a simple implementation. For production, consider using `jsonwebtoken` package.

## Environment Variables

Add these to your `.env` file:

```env
# Mail Encryption
MAIL_ENCRYPTION_KEY=your_encryption_key

# Agora
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate
AGORA_TOKEN_EXPIRY=3600

# Centrifugo
CENTRIFUGO_URL=https://chatgpts.co
CENTRIFUGO_HMAC_SECRET=your_hmac_secret
CENTRIFUGO_HTTP_API_KEY=your_api_key

# WebSocket
WEBSOCKET_SERVER_URL=https://chat.brain-space.app
CHAT_WEBSOCKET_PORT=8093
REDIS_URL=redis://localhost:6379
```
