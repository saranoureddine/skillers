import { Controller, Get } from '@nestjs/common';
import { ProfLikesAdminService } from '../services/prof-likes.admin.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfLikesAdminControllerDocs } from '../docs/prof-likes.swagger';

/**
 * Admin Prof Likes Controller — admin-only endpoints for prof likes management.
 * All routes prefixed with /admin/prof-likes
 */
@Controller('admin/prof-likes')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@ProfLikesAdminControllerDocs.controller()
export class ProfLikesAdminController {
  constructor(
    private readonly likesAdminService: ProfLikesAdminService,
  ) {}

  @Get('get-all')
  @ProfLikesAdminControllerDocs.getAll()
  async getAll() {
    return this.likesAdminService.getAllLikes();
  }

  @Get('statistics')
  @ProfLikesAdminControllerDocs.getStatistics()
  async getStatistics() {
    return this.likesAdminService.getStatistics();
  }
}
