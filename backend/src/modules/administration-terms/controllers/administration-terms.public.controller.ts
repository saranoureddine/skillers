import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdministrationTermsPublicService } from '../services/administration-terms.public.service';
import {
  CreateAdministrationTermDto,
  UpdateAdministrationTermDto,
  GetAdministrationTermDto,
  GetAllAdministrationTermsDto,
  DeleteAdministrationTermDto,
} from '../dto';
import { Public } from '../../../common/decorators/public.decorator';
import { AdministrationTermsPublicControllerDocs } from '../docs/administration-terms.swagger';

/**
 * Public Administration Terms Controller — handles all administration terms endpoints matching Yii API
 * All routes prefixed with /public/administration-terms
 */
@Controller('public/administration-terms')
@AdministrationTermsPublicControllerDocs.controller()
export class AdministrationTermsPublicController {
  constructor(
    private readonly administrationTermsPublicService: AdministrationTermsPublicService,
  ) {}

  /**
   * Helper method to extract and validate token
   */
  private async validateToken(req: Request): Promise<string> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.administrationTermsPublicService.findUserByToken(
      token,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('create-administration-term')
  @Public() // Temporarily public - will validate token manually
  @AdministrationTermsPublicControllerDocs.createAdministrationTerm()
  async createAdministrationTerm(
    @Req() req: Request,
    @Body() dto: CreateAdministrationTermDto,
  ) {
    const createdBy = await this.validateToken(req);
    return this.administrationTermsPublicService.createAdministrationTerm(
      createdBy,
      dto,
    );
  }

  @Post('update-administration-term')
  @Public() // Temporarily public - will validate token manually
  @AdministrationTermsPublicControllerDocs.updateAdministrationTerm()
  async updateAdministrationTerm(
    @Req() req: Request,
    @Query() query: GetAdministrationTermDto,
    @Body() dto: UpdateAdministrationTermDto,
  ) {
    const updatedBy = await this.validateToken(req);
    return this.administrationTermsPublicService.updateAdministrationTerm(
      query.id,
      updatedBy,
      dto,
    );
  }

  @Get('get-administration-term')
  @Public() // Temporarily public - will validate token manually
  @AdministrationTermsPublicControllerDocs.getAdministrationTerm()
  async getAdministrationTerm(
    @Req() req: Request,
    @Query() dto: GetAdministrationTermDto,
  ) {
    await this.validateToken(req); // Validate token
    return this.administrationTermsPublicService.getAdministrationTerm(dto);
  }

  @Get('get-all-administration-terms')
  @Public() // Temporarily public - will validate token manually
  @AdministrationTermsPublicControllerDocs.getAllAdministrationTerms()
  async getAllAdministrationTerms(
    @Req() req: Request,
    @Query() dto: GetAllAdministrationTermsDto,
  ) {
    await this.validateToken(req); // Validate token
    return this.administrationTermsPublicService.getAllAdministrationTerms(dto);
  }

  @Delete('delete-administration-term')
  @Public() // Temporarily public - will validate token manually
  @AdministrationTermsPublicControllerDocs.deleteAdministrationTerm()
  async deleteAdministrationTerm(
    @Req() req: Request,
    @Query() dto: DeleteAdministrationTermDto,
  ) {
    await this.validateToken(req); // Validate token
    return this.administrationTermsPublicService.deleteAdministrationTerm(dto);
  }
}
