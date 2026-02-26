import { Controller, Get } from '@nestjs/common';
import { ChatDeletedMessagesAdminService } from '../services/chat-deleted-messages.admin.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatDeletedMessagesAdminControllerDocs } from '../docs/chat-deleted-messages.swagger';

/**
 * Admin Chat Deleted Messages Controller — admin-only endpoints for chat deleted messages management.
 * All routes prefixed with /admin/chat-deleted-messages
 */
@Controller('admin/chat-deleted-messages')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@ChatDeletedMessagesAdminControllerDocs.controller()
export class ChatDeletedMessagesAdminController {
  constructor(
    private readonly deletedMessagesAdminService: ChatDeletedMessagesAdminService,
  ) {}

  @Get('get-all')
  @ChatDeletedMessagesAdminControllerDocs.getAll()
  async getAll() {
    return this.deletedMessagesAdminService.getAllDeleted();
  }

  @Get('statistics')
  @ChatDeletedMessagesAdminControllerDocs.getStatistics()
  async getStatistics() {
    return this.deletedMessagesAdminService.getStatistics();
  }
}
