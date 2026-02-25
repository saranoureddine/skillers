import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AddressesPublicService } from '../services/addresses.public.service';
import { AddUpdateAddressDto } from '../dto/add-update-address.dto';
import { RemoveAddressDto } from '../dto/remove-address.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { AddressesPublicControllerDocs } from '../docs/addresses.swagger';

/**
 * Public Addresses Controller — handles all addresses endpoints matching Yii API
 * All routes prefixed with /public/addresses
 */
@Controller('public/addresses')
@AddressesPublicControllerDocs.controller()
export class AddressesPublicController {
  constructor(
    private readonly addressesPublicService: AddressesPublicService,
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

    const user = await this.addressesPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('get-addresses')
  @Public() // Temporarily public - will validate token manually
  @AddressesPublicControllerDocs.getAddresses()
  async getAddresses(@Req() req: Request) {
    const userId = await this.validateToken(req);
    return this.addressesPublicService.getAddresses(userId);
  }

  @Post('get-selected-cities')
  @Public() // Temporarily public - will validate token manually
  @AddressesPublicControllerDocs.getSelectedCities()
  async getSelectedCities(@Req() req: Request) {
    const userId = await this.validateToken(req);
    return this.addressesPublicService.getSelectedCities(userId);
  }

  @Post('add-update-address')
  @Public() // Temporarily public - will validate token manually
  @AddressesPublicControllerDocs.addUpdateAddress()
  async addUpdateAddress(@Req() req: Request, @Body() dto: AddUpdateAddressDto) {
    const userId = await this.validateToken(req);
    return this.addressesPublicService.addUpdateAddress(userId, dto);
  }

  @Post('remove-address')
  @Public() // Temporarily public - will validate token manually
  @AddressesPublicControllerDocs.removeAddress()
  async removeAddress(@Req() req: Request, @Body() dto: RemoveAddressDto) {
    const userId = await this.validateToken(req);
    return this.addressesPublicService.removeAddress(userId, dto);
  }
}
