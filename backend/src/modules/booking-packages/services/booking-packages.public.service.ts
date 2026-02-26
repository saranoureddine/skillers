import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingPackageEntity } from '../entities/booking-package.entity';
import { CreateBookingPackageDto, UpdateBookingPackageDto } from '../dto';

/**
 * Public BookingPackages Service — handles all business logic for booking packages
 * Matches Yii BookingPackagesController implementation exactly
 */
@Injectable()
export class BookingPackagesPublicService {
  constructor(
    @InjectRepository(BookingPackageEntity)
    private readonly bookingPackagesRepository: Repository<BookingPackageEntity>,
  ) {}

  /**
   * Get all booking packages
   * Matches Yii actionIndex() exactly
   * Returns data directly (TransformInterceptor will wrap it)
   */
  async getAllPackages(): Promise<any> {
    try {
      const packages = await this.bookingPackagesRepository.find({
        order: { title: 'ASC' },
      });

      // Transform to match Yii response format (snake_case)
      const packagesArray = packages.map((pkg) => ({
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        icon_image: pkg.iconImage,
      }));

      // Return data that will be wrapped by TransformInterceptor
      // The interceptor will add { success: true, data: ..., timestamp: ... }
      // But Yii returns { success: true, data: ..., total: ... }
      // So we need to return the full structure and bypass the interceptor
      return {
        success: true,
        data: packagesArray,
        total: packagesArray.length,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to retrieve booking packages',
        error: error.message,
      });
    }
  }

  /**
   * Get single package by ID
   * Matches Yii actionView() exactly
   */
  async getPackageById(id: number): Promise<any> {
    try {
      const package_ = await this.bookingPackagesRepository.findOne({
        where: { id },
      });

      if (!package_) {
        throw new NotFoundException({
          success: false,
          message: 'Package not found',
        });
      }

      // Transform to match Yii response format (snake_case)
      return {
        success: true,
        data: {
          id: package_.id,
          title: package_.title,
          description: package_.description,
          icon_image: package_.iconImage,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to retrieve package',
        error: error.message,
      });
    }
  }

  /**
   * Create booking package
   * Matches Yii actionCreate() exactly
   */
  async createPackage(dto: CreateBookingPackageDto): Promise<any> {
    try {
      // Validate required fields (DTO validation handles this, but keeping for consistency)
      if (!dto.title || !dto.icon_image) {
        throw new BadRequestException({
          success: false,
          message: 'Title and icon_image are required fields',
        });
      }

      const package_ = this.bookingPackagesRepository.create({
        title: dto.title,
        description: dto.description || null,
        iconImage: dto.icon_image,
      } as Partial<BookingPackageEntity>);

      await this.bookingPackagesRepository.save(package_);

      // Transform to match Yii response format (snake_case)
      return {
        success: true,
        message: 'Package created successfully',
        data: {
          id: package_.id,
          title: package_.title,
          description: package_.description,
          icon_image: package_.iconImage,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to create package',
        error: error.message,
      });
    }
  }

  /**
   * Update booking package
   * Matches Yii actionUpdate() exactly
   */
  async updatePackage(id: number, dto: UpdateBookingPackageDto): Promise<any> {
    try {
      const package_ = await this.bookingPackagesRepository.findOne({
        where: { id },
      });

      if (!package_) {
        throw new NotFoundException({
          success: false,
          message: 'Package not found',
        });
      }

      // Update only provided fields
      if (dto.title !== undefined) {
        package_.title = dto.title;
      }
      if (dto.description !== undefined) {
        package_.description = dto.description;
      }
      if (dto.icon_image !== undefined) {
        package_.iconImage = dto.icon_image;
      }

      await this.bookingPackagesRepository.save(package_);

      // Transform to match Yii response format (snake_case)
      return {
        success: true,
        message: 'Package updated successfully',
        data: {
          id: package_.id,
          title: package_.title,
          description: package_.description,
          icon_image: package_.iconImage,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to update package',
        error: error.message,
      });
    }
  }

  /**
   * Delete booking package (hard delete)
   * Matches Yii actionDelete() exactly
   */
  async deletePackage(id: number): Promise<any> {
    try {
      const package_ = await this.bookingPackagesRepository.findOne({
        where: { id },
      });

      if (!package_) {
        throw new NotFoundException({
          success: false,
          message: 'Package not found',
        });
      }

      await this.bookingPackagesRepository.remove(package_);

      return {
        success: true,
        message: 'Package deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to delete package',
        error: error.message,
      });
    }
  }
}
