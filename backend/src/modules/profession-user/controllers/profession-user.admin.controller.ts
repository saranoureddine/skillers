import { Controller, Get, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ProfessionUserAdminService } from '../services/profession-user.admin.service';
import { ProfessionUserPublicService } from '../services/profession-user.public.service';
import { VerifyUserProfessionDto } from '../dto/verify-user-profession.dto';
import { BulkVerifyProfessionsDto } from '../dto/bulk-verify-professions.dto';
import { TopSpecialistDto } from '../dto/top-specialist.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfessionUserAdminControllerDocs } from '../docs/profession-user.swagger';

/**
 * Admin Profession User Controller — admin-only endpoints for profession user management.
 * All routes prefixed with /admin/profession-user
 */
@Controller('admin/profession-user')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@ProfessionUserAdminControllerDocs.controller()
export class ProfessionUserAdminController {
  constructor(
    private readonly professionUserAdminService: ProfessionUserAdminService,
    private readonly professionUserPublicService: ProfessionUserPublicService,
  ) {}

  private async getAuthenticatedUser(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.professionUserPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }

  @Get('get-all')
  @ProfessionUserAdminControllerDocs.getAll()
  async getAll() {
    return this.professionUserAdminService.getAllProfessionUsers();
  }

  @Get('statistics')
  @ProfessionUserAdminControllerDocs.getStatistics()
  async getStatistics() {
    return this.professionUserAdminService.getStatistics();
  }

  @Post('verify-user-profession')
  @ProfessionUserAdminControllerDocs.verifyUserProfession()
  async verifyUserProfession(@Body() dto: VerifyUserProfessionDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserAdminService.verifyUserProfession(dto, user.id, languageCode);
  }

  @Post('bulk-verify-professions')
  @ProfessionUserAdminControllerDocs.bulkVerifyProfessions()
  async bulkVerifyProfessions(@Body() dto: BulkVerifyProfessionsDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserAdminService.bulkVerifyProfessions(dto, user.id, languageCode);
  }

  @Post('add-top-specialist')
  @ProfessionUserAdminControllerDocs.addTopSpecialist()
  async addTopSpecialist(@Body() dto: TopSpecialistDto, @Req() req: Request) {
    await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserAdminService.addTopSpecialist(dto, languageCode);
  }

  @Post('remove-top-specialist')
  @ProfessionUserAdminControllerDocs.removeTopSpecialist()
  async removeTopSpecialist(@Body() dto: TopSpecialistDto, @Req() req: Request) {
    await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserAdminService.removeTopSpecialist(dto, languageCode);
  }
}
