import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { SpecialistsAdminService } from '../services/specialists.admin.service';
import { GetSpecialistsDto } from '../dto/get-specialists.dto';
import { RemoveSpecialistDto } from '../dto/remove-specialist.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { SpecialistsAdminControllerDocs } from '../docs/specialists.swagger';

/**
 * Admin Specialists Controller — admin-only endpoints for specialists management.
 * All routes prefixed with /admin/specialists
 */
@Controller('admin/specialists')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@SpecialistsAdminControllerDocs.controller()
export class SpecialistsAdminController {
  constructor(
    private readonly specialistsAdminService: SpecialistsAdminService,
  ) {}

  @Get('admin-specialists')
  @SpecialistsAdminControllerDocs.getAllSpecialists()
  async getAllSpecialists(@Query() query: GetSpecialistsDto) {
    return this.specialistsAdminService.getAllSpecialists(query);
  }

  @Post('remove-specialist')
  @SpecialistsAdminControllerDocs.removeSpecialist()
  async removeSpecialist(@Body() dto: RemoveSpecialistDto) {
    return this.specialistsAdminService.removeSpecialist(dto);
  }
}
