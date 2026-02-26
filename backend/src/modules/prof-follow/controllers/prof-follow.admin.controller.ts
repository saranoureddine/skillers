import { Controller, Get } from '@nestjs/common';
import { ProfFollowAdminService } from '../services/prof-follow.admin.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfFollowAdminControllerDocs } from '../docs/prof-follow.swagger';

/**
 * Admin Prof Follow Controller — admin-only endpoints for prof follow management.
 * All routes prefixed with /admin/prof-follow
 */
@Controller('admin/prof-follow')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@ProfFollowAdminControllerDocs.controller()
export class ProfFollowAdminController {
  constructor(
    private readonly followAdminService: ProfFollowAdminService,
  ) {}

  @Get('get-all')
  @ProfFollowAdminControllerDocs.getAll()
  async getAll() {
    return this.followAdminService.getAllFollows();
  }

  @Get('statistics')
  @ProfFollowAdminControllerDocs.getStatistics()
  async getStatistics() {
    return this.followAdminService.getStatistics();
  }
}
