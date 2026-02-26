import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Options,
  Query,
  Param,
  Req,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfessionalAvailabilityPublicService } from '../services/professional-availability.public.service';
import { CreateProfessionalAvailabilityDto } from '../dto/create-professional-availability.dto';
import { UpdateProfessionalAvailabilityDto } from '../dto/update-professional-availability.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfessionalAvailabilityPublicControllerDocs } from '../docs/professional-availability.swagger';

/**
 * Public Professional Availability Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/professional-availability
 */
@Controller('public/professional-availability')
@ProfessionalAvailabilityPublicControllerDocs.controller()
export class ProfessionalAvailabilityPublicController {
  constructor(
    private readonly availabilityPublicService: ProfessionalAvailabilityPublicService,
  ) {}

  @Get('check-professional-status')
  @Public() // Temporarily public - will validate token manually
  @ProfessionalAvailabilityPublicControllerDocs.checkProfessionalStatus()
  async checkProfessionalStatus(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    const languageCode = (req.headers['language'] as string) || 'en';
    
    if (!authHeader) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
        debug_info: {
          auth_user: null,
          getUserIdFromToken_result: null,
          has_authorization_header: false,
        },
      });
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
        debug_info: {
          auth_user: null,
          getUserIdFromToken_result: null,
          has_authorization_header: true,
        },
      });
    }

    const user = await this.availabilityPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
        debug_info: {
          auth_user: null,
          getUserIdFromToken_result: null,
          has_authorization_header: true,
        },
      });
    }

    return this.availabilityPublicService.checkProfessionalStatus(user.id);
  }

  @Post('set-availability')
  @Public() // Temporarily public - will validate token manually
  @ProfessionalAvailabilityPublicControllerDocs.setAvailability()
  async setAvailability(@Req() req: Request, @Body() body: any) {
    const authHeader = req.headers.authorization;
    const languageCode = (req.headers['language'] as string) || 'en';
    
    if (!authHeader) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const user = await this.availabilityPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    // Yii expects { availability_slots: [...] } format
    // Transform to DTO format
    const dto: CreateProfessionalAvailabilityDto = {
      availabilitySlots: (body.availability_slots || []).map((slot: any) => ({
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time,
        slotDuration: slot.slot_duration,
        maxAppointmentsPerSlot: slot.max_appointments_per_slot,
        isActive: slot.is_active,
      })),
    };
    
    return this.availabilityPublicService.setAvailability(user.id, dto, languageCode);
  }

  @Get('get-my-availability')
  @Public() // Temporarily public - will validate token manually
  @ProfessionalAvailabilityPublicControllerDocs.getMyAvailability()
  async getMyAvailability(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    const languageCode = (req.headers['language'] as string) || 'en';
    
    if (!authHeader) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const user = await this.availabilityPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    return this.availabilityPublicService.getMyAvailability(user.id, languageCode);
  }

  @Get('get-availability')
  @Public() // Temporarily public - will validate token manually
  @ProfessionalAvailabilityPublicControllerDocs.getAvailability()
  async getAvailability(@Req() req: Request, @Query('user_id') targetUserId?: string) {
    const authHeader = req.headers.authorization;
    const languageCode = (req.headers['language'] as string) || 'en';
    
    if (!authHeader) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const user = await this.availabilityPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    return this.availabilityPublicService.getAvailability(user.id, targetUserId, languageCode);
  }

  @Put('update-availability')
  @Patch('update-availability')
  @Public() // Temporarily public - will validate token manually
  @ProfessionalAvailabilityPublicControllerDocs.updateAvailability()
  async updateAvailability(@Req() req: Request, @Body() body: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const user = await this.availabilityPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const languageCode = (req.headers['language'] as string) || 'en';
    
    // Yii expects { availability_id, update_data } format
    // Transform to DTO format
    const dto: UpdateProfessionalAvailabilityDto = {
      availabilityId: body.availability_id,
      ...body.update_data,
    };
    
    return this.availabilityPublicService.updateAvailability(user.id, dto, languageCode);
  }

  @Delete('delete-availability')
  @Public() // Temporarily public - will validate token manually
  @ProfessionalAvailabilityPublicControllerDocs.deleteAvailability()
  async deleteAvailability(@Req() req: Request, @Query('availability_id') availabilityId: string) {
    const authHeader = req.headers.authorization;
    const languageCode = (req.headers['language'] as string) || 'en';
    
    if (!authHeader) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const user = await this.availabilityPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    return this.availabilityPublicService.deleteAvailability(user.id, Number(availabilityId), languageCode);
  }

  @Post('toggle-availability')
  @Public() // Temporarily public - will validate token manually
  @ProfessionalAvailabilityPublicControllerDocs.toggleAvailability()
  async toggleAvailability(
    @Req() req: Request,
    @Body() body: { availability_id: number; is_active: number },
  ) {
    const authHeader = req.headers.authorization;
    const languageCode = (req.headers['language'] as string) || 'en';
    
    if (!authHeader) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    const user = await this.availabilityPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed. Please check your token.',
      });
    }

    return this.availabilityPublicService.toggleAvailability(
      user.id,
      body.availability_id,
      body.is_active,
      languageCode,
    );
  }

  @Options()
  @HttpCode(HttpStatus.OK)
  async options() {
    // CORS preflight handler - matches Yii actionOptions()
    return [];
  }
}
