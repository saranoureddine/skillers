import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfessionUserPublicService } from '../services/profession-user.public.service';
import { GetUserProfessionsDto } from '../dto/get-user-professions.dto';
import { AddUserProfessionDto } from '../dto/add-user-profession.dto';
import { UpdateUserProfessionDto } from '../dto/update-user-profession.dto';
import { UpdateUserProfessionAdminDto } from '../dto/update-user-profession-admin.dto';
import { RemoveUserProfessionDto } from '../dto/remove-user-profession.dto';
import { DeleteUserProfessionAdminDto } from '../dto/delete-user-profession-admin.dto';
import { SetPrimaryProfessionDto } from '../dto/set-primary-profession.dto';
import { GetUsersByProfessionDto } from '../dto/get-users-by-profession.dto';
import { GetUserProfessionSummaryDto } from '../dto/get-user-profession-summary.dto';
import { GetAllProfessionUsersDto } from '../dto/get-all-profession-users.dto';
import { GetRecommendedProfessionsDto } from '../dto/get-recommended-professions.dto';
import { GetNearbyProfessionalsDto } from '../dto/get-nearby-professionals.dto';
import { GetUserProfileDto } from '../dto/get-user-profile.dto';
import { GetAllUsersWithProfessionsDto } from '../dto/get-all-users-with-professions.dto';
import { GetAllProfessionalsDto } from '../dto/get-all-professionals.dto';
import { GetTopSpecialistsDto } from '../dto/get-top-specialists.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfessionUserPublicControllerDocs } from '../docs/profession-user.swagger';

/**
 * Public Profession User Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/profession-user
 */
@Controller('public/profession-user')
@ProfessionUserPublicControllerDocs.controller()
export class ProfessionUserPublicController {
  constructor(
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

  @Post('get-user-professions')
  @Public()
  @ProfessionUserPublicControllerDocs.getUserProfessions()
  async getUserProfessions(@Body() dto: GetUserProfessionsDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.getUserProfessions(dto, user.id, languageCode);
  }

  @Post('add-user-profession')
  @Public()
  @ProfessionUserPublicControllerDocs.addUserProfession()
  async addUserProfession(@Body() dto: AddUserProfessionDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.addUserProfession(dto, user.id, languageCode);
  }

  @Post('update-user-profession')
  @Public()
  @ProfessionUserPublicControllerDocs.updateUserProfession()
  async updateUserProfession(@Body() dto: UpdateUserProfessionDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.updateUserProfession(dto, user.id, languageCode);
  }

  @Post('update-user-profession-admin')
  @Public()
  @ProfessionUserPublicControllerDocs.updateUserProfessionAdmin()
  async updateUserProfessionAdmin(@Body() dto: UpdateUserProfessionAdminDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.updateUserProfessionAdmin(dto, user.id, languageCode);
  }

  @Post('remove-user-profession')
  @Public()
  @ProfessionUserPublicControllerDocs.removeUserProfession()
  async removeUserProfession(@Body() dto: RemoveUserProfessionDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.removeUserProfession(dto, user.id, languageCode);
  }

  @Post('delete-user-profession-admin')
  @Public()
  @ProfessionUserPublicControllerDocs.deleteUserProfessionAdmin()
  async deleteUserProfessionAdmin(@Body() dto: DeleteUserProfessionAdminDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.deleteUserProfessionAdmin(dto, user.id, languageCode);
  }

  @Post('set-primary-profession')
  @Public()
  @ProfessionUserPublicControllerDocs.setPrimaryProfession()
  async setPrimaryProfession(@Body() dto: SetPrimaryProfessionDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.setPrimaryProfession(dto, user.id, languageCode);
  }

  @Post('get-users-by-profession')
  @Public()
  @ProfessionUserPublicControllerDocs.getUsersByProfession()
  async getUsersByProfession(@Body() dto: GetUsersByProfessionDto, @Req() req: Request) {
    await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.getUsersByProfession(dto, languageCode);
  }

  @Post('get-user-profession-summary')
  @Public()
  @ProfessionUserPublicControllerDocs.getUserProfessionSummary()
  async getUserProfessionSummary(@Body() dto: GetUserProfessionSummaryDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    const userAgent = req.headers['user-agent'] || '';
    const platform = (req.headers['x-platform'] as string) || '';
    return this.professionUserPublicService.getUserProfessionSummary(dto, user.id, languageCode, userAgent, platform);
  }

  @Post('get-all-profession-users')
  @Public()
  @ProfessionUserPublicControllerDocs.getAllProfessionUsers()
  async getAllProfessionUsers(@Body() dto: GetAllProfessionUsersDto, @Req() req: Request) {
    await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    const userAgent = req.headers['user-agent'] || '';
    const platform = (req.headers['x-platform'] as string) || '';
    return this.professionUserPublicService.getAllProfessionUsers(dto, languageCode, userAgent, platform);
  }

  @Post('get-recommended-professions')
  @Public()
  @ProfessionUserPublicControllerDocs.getRecommendedProfessions()
  async getRecommendedProfessions(@Body() dto: GetRecommendedProfessionsDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.getRecommendedProfessions(dto, user.id, languageCode);
  }

  @Post('get-nearby-professionals')
  @Public()
  @ProfessionUserPublicControllerDocs.getNearbyProfessionals()
  async getNearbyProfessionals(@Body() dto: GetNearbyProfessionalsDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.getNearbyProfessionals(dto, user.id, languageCode);
  }

  @Post('get-user-profile')
  @Public()
  @ProfessionUserPublicControllerDocs.getUserProfile()
  async getUserProfile(@Body() dto: GetUserProfileDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.getUserProfile(dto, user.id, languageCode);
  }

  @Post('get-all-users-with-professions')
  @Public()
  @ProfessionUserPublicControllerDocs.getAllUsersWithProfessions()
  async getAllUsersWithProfessions(@Body() dto: GetAllUsersWithProfessionsDto, @Req() req: Request) {
    await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.getAllUsersWithProfessions(dto, languageCode);
  }

  @Post('get-all-professionals')
  @Public()
  @ProfessionUserPublicControllerDocs.getAllProfessionals()
  async getAllProfessionals(@Body() dto: GetAllProfessionalsDto, @Req() req: Request) {
    await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.getAllProfessionals(dto, languageCode);
  }

  @Post('get-top-specialists')
  @Public()
  @ProfessionUserPublicControllerDocs.getTopSpecialists()
  async getTopSpecialists(@Body() dto: GetTopSpecialistsDto, @Req() req: Request) {
    await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.professionUserPublicService.getTopSpecialists(dto, languageCode);
  }
}
