import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Options,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingPackagesPublicService } from '../services/booking-packages.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { BookingPackagesPublicControllerDocs } from '../docs/booking-packages.swagger';
import { CreateBookingPackageDto, UpdateBookingPackageDto } from '../dto';

/**
 * Public BookingPackages Controller — handles all booking packages endpoints matching Yii API
 * All routes prefixed with /public/booking-packages
 */
@Controller('public/booking-packages')
@Public() // No authentication required (matching Yii implementation)
@BookingPackagesPublicControllerDocs.controller()
export class BookingPackagesPublicController {
  constructor(
    private readonly bookingPackagesPublicService: BookingPackagesPublicService,
  ) {}

  @Get()
  @BookingPackagesPublicControllerDocs.getAllPackages()
  async getAllPackages() {
    return this.bookingPackagesPublicService.getAllPackages();
  }

  @Get(':id')
  @BookingPackagesPublicControllerDocs.getPackageById()
  async getPackageById(@Param('id', ParseIntPipe) id: number) {
    return this.bookingPackagesPublicService.getPackageById(id);
  }

  @Post()
  @HttpCode(HttpStatus.OK) // Yii returns 200, not 201
  @BookingPackagesPublicControllerDocs.createPackage()
  async createPackage(@Body() dto: CreateBookingPackageDto) {
    return this.bookingPackagesPublicService.createPackage(dto);
  }

  @Put(':id')
  @Patch(':id')
  @BookingPackagesPublicControllerDocs.updatePackage()
  async updatePackage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingPackageDto,
  ) {
    return this.bookingPackagesPublicService.updatePackage(id, dto);
  }

  @Delete(':id')
  @BookingPackagesPublicControllerDocs.deletePackage()
  async deletePackage(@Param('id', ParseIntPipe) id: number) {
    return this.bookingPackagesPublicService.deletePackage(id);
  }

  @Options()
  @HttpCode(HttpStatus.OK)
  async options() {
    // CORS preflight handler - matches Yii actionOptions()
    return [];
  }
}
