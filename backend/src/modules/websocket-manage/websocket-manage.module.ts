import { Module } from '@nestjs/common';
import { WebSocketManageController } from './controllers/websocket-manage.controller';
import { WebSocketManageService } from './services/websocket-manage.service';

@Module({
  controllers: [WebSocketManageController],
  providers: [WebSocketManageService],
  exports: [WebSocketManageService],
})
export class WebSocketManageModule {}
