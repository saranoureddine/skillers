import { Controller, Get, Delete, Query, Param } from '@nestjs/common';
import { ProfessionalAvailabilityAdminService } from '../services/professional-availability.admin.service';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfessionalAvailabilityAdminControllerDocs } from '../docs/professional-availability.swagger';

/**
 * Admin Professional Availability Controller — admin-only endpoints for professional availability management.
 * All routes prefixed with /admin/professional-availability
 */
@Controller('admin/professional-availability')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@ProfessionalAvailabilityAdminControllerDocs.controller()
export class ProfessionalAvailabilityAdminController {
  constructor(
    private readonly availabilityAdminService: ProfessionalAvailabilityAdminService,
  ) {}

  @Get('get-all')
  @ProfessionalAvailabilityAdminControllerDocs.getAll()
  async getAll(@Query() query: PaginationQueryDto) {
    return this.availabilityAdminService.getAllAvailability(query);
  }

  @Get('get-by-user/:userId')
  @ProfessionalAvailabilityAdminControllerDocs.getByUserId()
  async getByUserId(@Param('userId') userId: string) {
    return this.availabilityAdminService.getAvailabilityByUserId(userId);
  }

  @Delete(':id')
  @ProfessionalAvailabilityAdminControllerDocs.delete()
  async delete(@Param('id') id: string) {
    await this.availabilityAdminService.deleteAvailability(Number(id));
    return { success: true, message: 'Availability deleted successfully' };
  }

  @Get('statistics')
  @ProfessionalAvailabilityAdminControllerDocs.getStatistics()
  async getStatistics() {
    return this.availabilityAdminService.getStatistics();
  }
}
