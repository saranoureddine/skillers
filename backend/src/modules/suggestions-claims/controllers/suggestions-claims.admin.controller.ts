import {
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SuggestionsClaimsAdminService } from '../services/suggestions-claims.admin.service';
import { SuggestionsClaimsPublicService } from '../services/suggestions-claims.public.service';
import { ReplySuggestionDto } from '../dto/reply-suggestion.dto';
import { UpdateReplyDto } from '../dto/update-reply.dto';
import { UpdateSuggestionDto } from '../dto/update-suggestion.dto';
import { UpdateRatingDto } from '../dto/update-rating.dto';
import { SuggestionsClaimsAdminControllerDocs } from '../docs/suggestions-claims.swagger';

/**
 * Admin SuggestionsClaims Controller — handles admin-only endpoints matching Yii API
 * All routes prefixed with /admin/suggestions-claims
 */
@Controller('admin/suggestions-claims')
@SuggestionsClaimsAdminControllerDocs.controller()
export class SuggestionsClaimsAdminController {
  constructor(
    private readonly suggestionsClaimsAdminService: SuggestionsClaimsAdminService,
    private readonly suggestionsClaimsPublicService: SuggestionsClaimsPublicService,
  ) {}

  /**
   * Extract token from Authorization header
   */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }
    return authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
  }

  /**
   * Get authenticated user from token
   */
  private async getAuthenticatedUser(req: Request): Promise<any> {
    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const auth = await this.suggestionsClaimsPublicService.validateToken(token);
    if (!auth.success) {
      throw new UnauthorizedException('Unauthorized');
    }

    return auth.user;
  }

  @Post('reply')
  @SuggestionsClaimsAdminControllerDocs.reply()
  async reply(@Req() req: Request, @Body() dto: ReplySuggestionDto) {
    const user = await this.getAuthenticatedUser(req);
    return this.suggestionsClaimsAdminService.replySuggestion(dto, user);
  }

  @Patch('update-reply/:id')
  @SuggestionsClaimsAdminControllerDocs.updateReply()
  async updateReply(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateReplyDto,
  ) {
    const user = await this.getAuthenticatedUser(req);
    return this.suggestionsClaimsAdminService.updateReply(id, dto, user);
  }

  @Patch('update-suggestion/:id')
  @SuggestionsClaimsAdminControllerDocs.updateSuggestion()
  async updateSuggestion(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateSuggestionDto,
  ) {
    const user = await this.getAuthenticatedUser(req);
    return this.suggestionsClaimsAdminService.updateSuggestion(id, dto, user);
  }

  @Delete('delete-suggestion/:id')
  @SuggestionsClaimsAdminControllerDocs.deleteSuggestion()
  async deleteSuggestion(@Req() req: Request, @Param('id') id: string) {
    const user = await this.getAuthenticatedUser(req);
    return this.suggestionsClaimsAdminService.deleteSuggestion(id, user);
  }

  @Patch('update-rating/:id')
  @SuggestionsClaimsAdminControllerDocs.updateRating()
  async updateRating(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateRatingDto,
  ) {
    const user = await this.getAuthenticatedUser(req);
    return this.suggestionsClaimsAdminService.updateRating(id, dto, user);
  }

  @Delete('delete-rating/:id')
  @SuggestionsClaimsAdminControllerDocs.deleteRating()
  async deleteRating(@Req() req: Request, @Param('id') id: string) {
    const user = await this.getAuthenticatedUser(req);
    return this.suggestionsClaimsAdminService.deleteRating(id, user);
  }
}
