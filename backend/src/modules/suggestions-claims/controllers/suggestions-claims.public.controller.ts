import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { SuggestionsClaimsPublicService } from '../services/suggestions-claims.public.service';
import { CreateSuggestionDto } from '../dto/create-suggestion.dto';
import { GetSuggestionsDto } from '../dto/get-suggestions.dto';
import { RateSuggestionDto } from '../dto/rate-suggestion.dto';
import { GetSuggestionRatingsDto } from '../dto/get-suggestion-ratings.dto';
import { SuggestionsClaimsPublicControllerDocs } from '../docs/suggestions-claims.swagger';

/**
 * Public SuggestionsClaims Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/suggestions-claims
 */
@Controller('public/suggestions-claims')
@SuggestionsClaimsPublicControllerDocs.controller()
export class SuggestionsClaimsPublicController {
  constructor(
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
    // Strip optional "Bearer " or "Token " prefix (case-insensitive)
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

  @Post('add-suggestion')
  @SuggestionsClaimsPublicControllerDocs.addSuggestion()
  async addSuggestion(@Req() req: Request, @Body() dto: CreateSuggestionDto) {
    const user = await this.getAuthenticatedUser(req);
    return this.suggestionsClaimsPublicService.addSuggestion(dto, user);
  }

  @Get('get-suggestion-by-id/:id')
  @Public() // Can be accessed with or without authentication
  @SuggestionsClaimsPublicControllerDocs.getSuggestionById()
  async getSuggestionById(@Req() req: Request, @Param('id') id: string) {
    const token = this.extractToken(req);
    let user = null;
    if (token) {
      const auth = await this.suggestionsClaimsPublicService.validateToken(token);
      if (auth.success) {
        user = auth.user;
      }
    }
    return this.suggestionsClaimsPublicService.getSuggestionById(id, user);
  }

  @Post('get-suggestions')
  @SuggestionsClaimsPublicControllerDocs.getSuggestions()
  async getSuggestions(@Req() req: Request, @Body() dto: GetSuggestionsDto) {
    const user = await this.getAuthenticatedUser(req);
    return this.suggestionsClaimsPublicService.getSuggestions(dto, user);
  }

  @Post('rate-suggestion')
  @SuggestionsClaimsPublicControllerDocs.rateSuggestion()
  async rateSuggestion(@Req() req: Request, @Body() dto: RateSuggestionDto) {
    const user = await this.getAuthenticatedUser(req);
    return this.suggestionsClaimsPublicService.rateSuggestion(dto, user);
  }

  @Get('get-user-rating/:suggestion_id')
  @SuggestionsClaimsPublicControllerDocs.getUserRating()
  async getUserRating(@Req() req: Request, @Param('suggestion_id') suggestionId: string) {
    const user = await this.getAuthenticatedUser(req);
    return this.suggestionsClaimsPublicService.getUserRating(suggestionId, user);
  }

  @Post('get-suggestion-ratings/:suggestion_id')
  @SuggestionsClaimsPublicControllerDocs.getSuggestionRatings()
  async getSuggestionRatings(
    @Req() req: Request,
    @Param('suggestion_id') suggestionId: string,
    @Body() dto: GetSuggestionRatingsDto,
  ) {
    await this.getAuthenticatedUser(req); // Require auth but don't use user
    return this.suggestionsClaimsPublicService.getSuggestionRatings(suggestionId, dto);
  }
}
