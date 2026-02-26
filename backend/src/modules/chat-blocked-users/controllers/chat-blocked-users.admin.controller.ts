import { Controller, Get } from '@nestjs/common';
import { ChatBlockedUsersAdminService } from '../services/chat-blocked-users.admin.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatBlockedUsersAdminControllerDocs } from '../docs/chat-blocked-users.swagger';

/**
 * Admin Chat Blocked Users Controller — admin-only endpoints for chat blocked users management.
 * All routes prefixed with /admin/chat-blocked-users
 */
@Controller('admin/chat-blocked-users')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@ChatBlockedUsersAdminControllerDocs.controller()
export class ChatBlockedUsersAdminController {
  constructor(
    private readonly blockedUsersAdminService: ChatBlockedUsersAdminService,
  ) {}

  @Get('get-all')
  @ChatBlockedUsersAdminControllerDocs.getAll()
  async getAll() {
    return this.blockedUsersAdminService.getAllBlocked();
  }

  @Get('statistics')
  @ChatBlockedUsersAdminControllerDocs.getStatistics()
  async getStatistics() {
    return this.blockedUsersAdminService.getStatistics();
  }
}
