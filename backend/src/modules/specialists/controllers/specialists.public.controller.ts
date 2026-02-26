import { Controller, Post, Body } from '@nestjs/common';
import { SpecialistsPublicService } from '../services/specialists.public.service';
import { AddSpecialistDto } from '../dto/add-specialist.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { SpecialistsPublicControllerDocs } from '../docs/specialists.swagger';

/**
 * Public Specialists Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/specialists
 */
@Controller('public/specialists')
@SpecialistsPublicControllerDocs.controller()
export class SpecialistsPublicController {
  constructor(
    private readonly specialistsPublicService: SpecialistsPublicService,
  ) {}

  @Post('add-specialist')
  @Public() // Temporarily public - will validate token manually
  @SpecialistsPublicControllerDocs.addSpecialist()
  async addSpecialist(@Body() dto: AddSpecialistDto) {
    return this.specialistsPublicService.addSpecialist(dto);
  }
}
