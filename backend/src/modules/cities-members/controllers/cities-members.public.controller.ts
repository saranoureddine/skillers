import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Query,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { CitiesMembersPublicService } from '../services/cities-members.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { CitiesMembersPublicControllerDocs } from '../docs/cities-members.swagger';
import {
  CreateCityMemberDto,
  GetCityMemberDto,
  UpdateCityMemberDto,
  GetAllCityMembersDto,
  DeleteCityMemberDto,
} from '../dto';

/**
 * Public CitiesMembers Controller — handles all city members endpoints matching Yii API
 * All routes prefixed with /public/cities-members
 */
@Controller('public/cities-members')
@CitiesMembersPublicControllerDocs.controller()
export class CitiesMembersPublicController {
  constructor(
    private readonly citiesMembersPublicService: CitiesMembersPublicService,
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

    const user = await this.citiesMembersPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('create-city-member')
  @Public() // Temporarily public - will validate token manually
  @CitiesMembersPublicControllerDocs.createCityMember()
  async createCityMember(
    @Req() req: Request,
    @Body() dto: CreateCityMemberDto,
  ) {
    const userId = await this.validateToken(req);
    return this.citiesMembersPublicService.createCityMember(userId, dto);
  }

  @Get('get-city-member')
  @Public() // Temporarily public - will validate token manually
  @CitiesMembersPublicControllerDocs.getCityMember()
  async getCityMember(
    @Req() req: Request,
    @Query('id') id: string,
  ) {
    await this.validateToken(req);
    return this.citiesMembersPublicService.getCityMember({ id });
  }

  @Post('update-city-member')
  @Public() // Temporarily public - will validate token manually
  @CitiesMembersPublicControllerDocs.updateCityMember()
  async updateCityMember(
    @Req() req: Request,
    @Query('id') id: string,
    @Body() dto: Omit<UpdateCityMemberDto, 'id'>,
  ) {
    const userId = await this.validateToken(req);
    return this.citiesMembersPublicService.updateCityMember(userId, {
      ...dto,
      id,
    });
  }

  @Get('get-all-city-members')
  @Public() // Temporarily public - will validate token manually
  @CitiesMembersPublicControllerDocs.getAllCityMembers()
  async getAllCityMembers(
    @Req() req: Request,
    @Query() dto: GetAllCityMembersDto,
  ) {
    await this.validateToken(req);
    return this.citiesMembersPublicService.getAllCityMembers(dto);
  }

  @Delete('delete-city-member')
  @Public() // Temporarily public - will validate token manually
  @CitiesMembersPublicControllerDocs.deleteCityMember()
  async deleteCityMember(
    @Req() req: Request,
    @Query('id') id: string,
  ) {
    await this.validateToken(req);
    return this.citiesMembersPublicService.deleteCityMember({ id });
  }
}
