import { Controller, Get } from '@nestjs/common';
import { ProfGroupsAdminService } from '../services/prof-groups.admin.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfGroupsAdminControllerDocs } from '../docs/prof-groups.swagger';

/**
 * Admin Prof Groups Controller — admin-only endpoints for prof groups management.
 * All routes prefixed with /admin/prof-groups
 */
@Controller('admin/prof-groups')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@ProfGroupsAdminControllerDocs.controller()
export class ProfGroupsAdminController {
  constructor(
    private readonly groupsAdminService: ProfGroupsAdminService,
  ) {}

  @Get('get-all')
  @ProfGroupsAdminControllerDocs.getAll()
  async getAll() {
    return this.groupsAdminService.getAllGroups();
  }

  @Get('statistics')
  @ProfGroupsAdminControllerDocs.getStatistics()
  async getStatistics() {
    return this.groupsAdminService.getStatistics();
  }
}
