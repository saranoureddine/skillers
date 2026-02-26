import {
  Body,
  Controller,
  Post,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfReportsPublicService } from '../services/prof-reports.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfReportsPublicControllerDocs } from '../docs/prof-reports.swagger';
import {
  CreateReportDto,
  GetReportsDto,
  GetReportDto,
  UpdateReportStatusDto,
  GetUserReportsDto,
  GetReportsAgainstUserDto,
} from '../dto';

/**
 * Public ProfReports Controller — handles all report endpoints matching Yii API
 * All routes prefixed with /public/prof-reports
 */
@Controller('public/prof-reports')
@ProfReportsPublicControllerDocs.controller()
export class ProfReportsPublicController {
  constructor(
    private readonly profReportsPublicService: ProfReportsPublicService,
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

    const user = await this.profReportsPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('create-report')
  @Public() // Temporarily public - will validate token manually
  @ProfReportsPublicControllerDocs.createReport()
  async createReport(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
    @Body() dto: CreateReportDto,
  ) {
    const userId = await this.validateToken(req);
    return this.profReportsPublicService.createReport(userId, languageCode, dto);
  }

  @Post('get-reports')
  @Public() // Temporarily public - will validate token manually
  @ProfReportsPublicControllerDocs.getReports()
  async getReports(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
    @Body() dto: GetReportsDto,
  ) {
    await this.validateToken(req);
    return this.profReportsPublicService.getReports(languageCode, dto);
  }

  @Post('get-report')
  @Public() // Temporarily public - will validate token manually
  @ProfReportsPublicControllerDocs.getReport()
  async getReport(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
    @Body() dto: GetReportDto,
  ) {
    await this.validateToken(req);
    return this.profReportsPublicService.getReport(languageCode, dto);
  }

  @Post('update-report-status')
  @Public() // Temporarily public - will validate token manually
  @ProfReportsPublicControllerDocs.updateReportStatus()
  async updateReportStatus(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
    @Body() dto: UpdateReportStatusDto,
  ) {
    const reviewerId = await this.validateToken(req);
    return this.profReportsPublicService.updateReportStatus(
      reviewerId,
      languageCode,
      dto,
    );
  }

  @Post('get-user-reports')
  @Public() // Temporarily public - will validate token manually
  @ProfReportsPublicControllerDocs.getUserReports()
  async getUserReports(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
    @Body() dto: GetUserReportsDto,
  ) {
    const userId = await this.validateToken(req);
    return this.profReportsPublicService.getUserReports(userId, languageCode, dto);
  }

  @Post('get-reports-against-user')
  @Public() // Temporarily public - will validate token manually
  @ProfReportsPublicControllerDocs.getReportsAgainstUser()
  async getReportsAgainstUser(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
    @Body() dto: GetReportsAgainstUserDto,
  ) {
    await this.validateToken(req);
    return this.profReportsPublicService.getReportsAgainstUser(languageCode, dto);
  }

  @Post('get-report-stats')
  @Public() // Temporarily public - will validate token manually
  @ProfReportsPublicControllerDocs.getReportStats()
  async getReportStats(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
  ) {
    await this.validateToken(req);
    return this.profReportsPublicService.getReportStats(languageCode);
  }
}
