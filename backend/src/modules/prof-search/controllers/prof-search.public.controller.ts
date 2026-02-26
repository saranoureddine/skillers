import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfSearchPublicService } from '../services/prof-search.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfSearchPublicControllerDocs } from '../docs/prof-search.swagger';
import {
  GlobalSearchDto,
  SearchProfessionsDto,
  SearchUsersByProfessionDto,
  GetProfessionTrendsDto,
} from '../dto';

/**
 * Public ProfSearch Controller — handles all search endpoints matching Yii API
 * All routes prefixed with /public/prof-search
 */
@Controller('public/prof-search')
@ProfSearchPublicControllerDocs.controller()
export class ProfSearchPublicController {
  constructor(
    private readonly profSearchPublicService: ProfSearchPublicService,
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

    const user = await this.profSearchPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('global-search')
  @Public() // Temporarily public - will validate token manually
  @ProfSearchPublicControllerDocs.globalSearch()
  async globalSearch(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
    @Body() dto: GlobalSearchDto,
  ) {
    const userId = await this.validateToken(req);
    return this.profSearchPublicService.globalSearch(userId, languageCode, dto);
  }

  @Post('search-professions')
  @Public() // Temporarily public - will validate token manually
  @ProfSearchPublicControllerDocs.searchProfessions()
  async searchProfessions(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
    @Body() dto: SearchProfessionsDto,
  ) {
    await this.validateToken(req);
    return this.profSearchPublicService.searchProfessions(languageCode, dto);
  }

  @Post('search-users-by-profession')
  @Public() // Temporarily public - will validate token manually
  @ProfSearchPublicControllerDocs.searchUsersByProfession()
  async searchUsersByProfession(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
    @Body() dto: SearchUsersByProfessionDto,
  ) {
    const userId = await this.validateToken(req);
    return this.profSearchPublicService.searchUsersByProfession(
      userId,
      languageCode,
      dto,
    );
  }

  @Post('get-profession-stats')
  @Public() // Temporarily public - will validate token manually
  @ProfSearchPublicControllerDocs.getProfessionStats()
  async getProfessionStats(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
  ) {
    await this.validateToken(req);
    return this.profSearchPublicService.getProfessionStats(languageCode);
  }

  @Post('get-profession-suggestions')
  @Public() // Temporarily public - will validate token manually
  @ProfSearchPublicControllerDocs.getProfessionSuggestions()
  async getProfessionSuggestions(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
  ) {
    const userId = await this.validateToken(req);
    return this.profSearchPublicService.getProfessionSuggestions(
      userId,
      languageCode,
    );
  }

  @Post('get-profession-trends')
  @Public() // Temporarily public - will validate token manually
  @ProfSearchPublicControllerDocs.getProfessionTrends()
  async getProfessionTrends(
    @Req() req: Request,
    @Headers('Language') languageCode: string = 'en',
    @Body() dto: GetProfessionTrendsDto,
  ) {
    await this.validateToken(req);
    return this.profSearchPublicService.getProfessionTrends(languageCode, dto);
  }
}
