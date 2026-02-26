import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfessionsPublicService } from '../services/professions.public.service';
import { GetProfessionsDto } from '../dto/get-professions.dto';
import { GetProfessionDto } from '../dto/get-profession.dto';
import { CreateProfessionDto } from '../dto/create-profession.dto';
import { UpdateProfessionDto } from '../dto/update-profession.dto';
import { DeleteProfessionDto } from '../dto/delete-profession.dto';
import { GetProfessionsByCategoryDto } from '../dto/get-professions-by-category.dto';
import { SaveOrderDto } from '../dto/save-order.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfessionsPublicControllerDocs } from '../docs/professions.swagger';

/**
 * Public Professions Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/professions
 */
@Controller('public/professions')
@ProfessionsPublicControllerDocs.controller()
export class ProfessionsPublicController {
  constructor(
    private readonly professionsPublicService: ProfessionsPublicService,
  ) {}

  @Get('get-professions')
  @Public() // Temporarily public - will validate token manually
  @ProfessionsPublicControllerDocs.getProfessions()
  async getProfessions(
    @Query() dto: GetProfessionsDto,
    @Req() req: Request,
  ) {
    const languageCode = (req.headers['language'] as string) || 'en';
    const userAgent = req.headers['user-agent'] || '';
    const platform = (req.headers['x-platform'] as string) || '';

    return this.professionsPublicService.getProfessions(dto, languageCode, userAgent, platform);
  }

  @Post('get-profession')
  @Public() // Temporarily public - will validate token manually
  @ProfessionsPublicControllerDocs.getProfession()
  async getProfession(@Body() dto: GetProfessionDto, @Req() req: Request) {
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionsPublicService.getProfession(dto, languageCode);
  }

  @Post('create-profession')
  @Public() // Temporarily public - will validate token manually
  @ProfessionsPublicControllerDocs.createProfession()
  async createProfession(@Body() dto: CreateProfessionDto, @Req() req: Request) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.professionsPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionsPublicService.createProfession(dto, user.id, languageCode);
  }

  @Post('update-profession')
  @Public() // Temporarily public - will validate token manually
  @ProfessionsPublicControllerDocs.updateProfession()
  async updateProfession(@Body() dto: UpdateProfessionDto, @Req() req: Request) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.professionsPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionsPublicService.updateProfession(dto, user.id, languageCode);
  }

  @Post('delete-profession')
  @Public() // Temporarily public - will validate token manually
  @ProfessionsPublicControllerDocs.deleteProfession()
  async deleteProfession(@Body() dto: DeleteProfessionDto, @Req() req: Request) {
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionsPublicService.deleteProfession(dto, languageCode);
  }

  @Post('get-professions-by-category')
  @Public() // Temporarily public - will validate token manually
  @ProfessionsPublicControllerDocs.getProfessionsByCategory()
  async getProfessionsByCategory(@Body() dto: GetProfessionsByCategoryDto, @Req() req: Request) {
    const languageCode = (req.headers['language'] as string) || 'en';
    const userAgent = req.headers['user-agent'] || '';
    const platform = (req.headers['x-platform'] as string) || '';

    return this.professionsPublicService.getProfessionsByCategory(dto, languageCode, userAgent, platform);
  }

  @Post('save-order')
  @Public() // Temporarily public - will validate token manually
  @ProfessionsPublicControllerDocs.saveOrder()
  async saveOrder(@Body() dto: SaveOrderDto, @Req() req: Request) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.professionsPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionsPublicService.saveOrder(dto, user.id, languageCode);
  }
}
