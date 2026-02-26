import {
  Body,
  Controller,
  Post,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { WebSocketManageService } from '../services/websocket-manage.service';
import { WebSocketManageDto } from '../dto';
import { Public } from '../../../common/decorators/public.decorator';
import { WebSocketManageControllerDocs } from '../docs/websocket-manage.swagger';

/**
 * WebSocket Management Controller — handles WebSocket server process management
 * Matches Yii WebSocketManageController implementation
 * All routes require X-WS-Admin-Token header for authentication
 */
@Controller('websocket-manage')
@WebSocketManageControllerDocs.controller()
export class WebSocketManageController {
  constructor(private readonly webSocketManageService: WebSocketManageService) {}

  /**
   * Helper method to validate authentication token
   */
  private validateAuth(token: string | undefined): void {
    if (!this.webSocketManageService.authenticate(token)) {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  @Post('start')
  @Public() // Bypass JWT, but we validate X-WS-Admin-Token manually
  @WebSocketManageControllerDocs.start()
  async start(
    @Headers('X-WS-Admin-Token') token: string,
    @Body() dto: WebSocketManageDto,
  ) {
    this.validateAuth(token);
    const port = dto.port || 8092;
    return this.webSocketManageService.start(port);
  }

  @Post('stop')
  @Public() // Bypass JWT, but we validate X-WS-Admin-Token manually
  @WebSocketManageControllerDocs.stop()
  async stop(
    @Headers('X-WS-Admin-Token') token: string,
    @Body() dto: WebSocketManageDto,
  ) {
    this.validateAuth(token);
    const port = dto.port || 8092;
    return this.webSocketManageService.stop(port);
  }

  @Post('status')
  @Public() // Bypass JWT, but we validate X-WS-Admin-Token manually
  @WebSocketManageControllerDocs.status()
  async status(
    @Headers('X-WS-Admin-Token') token: string,
    @Body() dto: WebSocketManageDto,
  ) {
    this.validateAuth(token);
    const port = dto.port || 8092;
    return this.webSocketManageService.status(port);
  }

  @Post('force-kill')
  @Public() // Bypass JWT, but we validate X-WS-Admin-Token manually
  @WebSocketManageControllerDocs.forceKill()
  async forceKill(
    @Headers('X-WS-Admin-Token') token: string,
    @Body() dto: WebSocketManageDto,
  ) {
    this.validateAuth(token);
    const port = dto.port || 8092;
    return this.webSocketManageService.forceKill(port);
  }
}
