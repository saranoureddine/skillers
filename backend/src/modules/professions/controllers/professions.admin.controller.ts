import { Controller, Get } from '@nestjs/common';
import { ProfessionsAdminService } from '../services/professions.admin.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfessionsAdminControllerDocs } from '../docs/professions.swagger';

/**
 * Admin Professions Controller — admin-only endpoints for professions management.
 * All routes prefixed with /admin/professions
 */
@Controller('admin/professions')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@ProfessionsAdminControllerDocs.controller()
export class ProfessionsAdminController {
  constructor(
    private readonly professionsAdminService: ProfessionsAdminService,
  ) {}

  @Get('get-all')
  @ProfessionsAdminControllerDocs.getAll()
  async getAll() {
    return this.professionsAdminService.getAllProfessions();
  }

  @Get('statistics')
  @ProfessionsAdminControllerDocs.getStatistics()
  async getStatistics() {
    return this.professionsAdminService.getStatistics();
  }
}
