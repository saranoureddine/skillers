import { Controller, Get } from '@nestjs/common';
import { ChatConversationsAdminService } from '../services/chat-conversations.admin.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatConversationsAdminControllerDocs } from '../docs/chat-conversations.swagger';

/**
 * Admin Chat Conversations Controller — admin-only endpoints for chat conversations management.
 * All routes prefixed with /admin/chat-conversations
 */
@Controller('admin/chat-conversations')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@ChatConversationsAdminControllerDocs.controller()
export class ChatConversationsAdminController {
  constructor(
    private readonly conversationsAdminService: ChatConversationsAdminService,
  ) {}

  @Get('get-all')
  @ChatConversationsAdminControllerDocs.getAll()
  async getAll() {
    return this.conversationsAdminService.getAllConversations();
  }

  @Get('statistics')
  @ChatConversationsAdminControllerDocs.getStatistics()
  async getStatistics() {
    return this.conversationsAdminService.getStatistics();
  }
}
