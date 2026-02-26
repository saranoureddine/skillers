import { Controller, Get } from '@nestjs/common';
import { ChatMessagesAdminService } from '../services/chat-messages.admin.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatMessagesAdminControllerDocs } from '../docs/chat-messages.swagger';

/**
 * Admin Chat Messages Controller — admin-only endpoints for chat messages management.
 * All routes prefixed with /admin/chat-messages
 */
@Controller('admin/chat-messages')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@ChatMessagesAdminControllerDocs.controller()
export class ChatMessagesAdminController {
  constructor(
    private readonly messagesAdminService: ChatMessagesAdminService,
  ) {}

  @Get('get-all')
  @ChatMessagesAdminControllerDocs.getAll()
  async getAll() {
    return this.messagesAdminService.getAllMessages();
  }

  @Get('statistics')
  @ChatMessagesAdminControllerDocs.getStatistics()
  async getStatistics() {
    return this.messagesAdminService.getStatistics();
  }
}
