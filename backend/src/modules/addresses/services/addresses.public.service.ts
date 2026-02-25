import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AddressEntity } from '../entities/address.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { AddUpdateAddressDto } from '../dto/add-update-address.dto';
import { RemoveAddressDto } from '../dto/remove-address.dto';
import * as crypto from 'crypto';

/**
 * Public/user-facing service — handles all addresses endpoints matching Yii API
 */
@Injectable()
export class AddressesPublicService {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressesRepository: Repository<AddressEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find user by token (for authentication)
   */
  async findUserByToken(token: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { token, isActivated: 1 },
    });
  }

  /**
   * Generate unique ID (20 characters)
   */
  private generateUniqueId(): string {
    return crypto.randomBytes(10).toString('hex').substring(0, 20);
  }

  /**
   * Get addresses (actionGetAddresses)
   * Matches Yii implementation exactly
   */
  async getAddresses(userId: string): Promise<any> {
    try {
      // Query matches Yii: Addresses::find()->alias("t1")->select([...])
      const addresses = await this.dataSource
        .createQueryBuilder()
        .select([
          't1.id AS address_id',
          't1.user_id AS user_id',
          't1.first_name AS first_name',
          't1.last_name AS last_name',
          't1.country_code AS country_code',
          't1.phone_number AS phone_number',
          't1.latitude AS latitude',
          't1.longitude AS longitude',
          't1.address AS address',
          't1.country_id AS country_id',
          't1.city_id AS city_id',
          't1.route_name AS route_name',
          't1.building_name AS building_name',
          't1.floor_number AS floor_number',
          't3.name AS country_name',
          't5.city_name AS city_name',
        ])
        .from('addresses', 't1')
        .leftJoin('countries', 't3', 't1.country_id = t3.id')
        .leftJoin('user_cities', 't4', 't1.user_id = t4.user_id')
        .leftJoin('cities', 't5', 't4.city_id = t5.id')
        .where('t1.user_id = :userId', { userId })
        .groupBy('t1.id')
        .getRawMany();

      // Get countries list
      const countries = await this.dataSource
        .createQueryBuilder()
        .select(['id', 'name'])
        .from('countries', 'countries')
        .orderBy('name', 'ASC')
        .getRawMany();

      return {
        succeeded: true,
        message: '',
        addresses: addresses || [],
        countries: countries || [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve addresses data');
    }
  }

  /**
   * Get selected cities (actionGetSelectedCities)
   * Matches Yii implementation exactly
   */
  async getSelectedCities(userId: string): Promise<any> {
    try {
      // Query matches Yii: UserCities::find()->alias('t1')->select([...])
      const cities = await this.dataSource
        .createQueryBuilder()
        .select(['t1.city_id AS city_id', 't2.city_name AS city_name'])
        .from('user_cities', 't1')
        .leftJoin('cities', 't2', 't2.id = t1.city_id')
        .where('t1.user_id = :userId', { userId })
        .getRawMany();

      return {
        succeeded: true,
        message: '',
        cities: cities || [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve cities data');
    }
  }

  /**
   * Add or update address (actionAddUpdateAddress)
   * Matches Yii implementation exactly
   */
  async addUpdateAddress(userId: string, dto: AddUpdateAddressDto): Promise<any> {
    try {
      // Verify user exists and is activated
      const user = await this.usersRepository.findOne({
        where: { id: userId, isActivated: 1 },
      });

      if (!user) {
        throw new NotFoundException('User not found or inactive');
      }

      let address: AddressEntity;

      if (dto.addressId) {
        // Update existing address
        const existingAddress = await this.addressesRepository.findOne({
          where: { id: dto.addressId, userId },
        });

        if (!existingAddress) {
          throw new NotFoundException('Address not found');
        }

        address = existingAddress;
      } else {
        // Create new address
        address = this.addressesRepository.create({
          id: this.generateUniqueId(),
          userId,
        } as Partial<AddressEntity>);
      }

      // Update fields
      if (dto.firstName !== undefined) address.firstName = dto.firstName;
      if (dto.lastName !== undefined) address.lastName = dto.lastName;
      if (dto.countryCode !== undefined) address.countryCode = dto.countryCode;
      if (dto.phoneNumber !== undefined) address.phoneNumber = dto.phoneNumber;
      if (dto.address !== undefined) address.address = dto.address;
      if (dto.route !== undefined) address.routeName = dto.route;
      if (dto.building !== undefined) address.buildingName = dto.building;
      if (dto.floor !== undefined) address.floorNumber = dto.floor;
      if (dto.latitude !== undefined) address.latitude = dto.latitude;
      if (dto.longitude !== undefined) address.longitude = dto.longitude;

      await this.addressesRepository.save(address);

      return {
        succeeded: true,
        message: 'address updted or added succ',
        address: address,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update or add address');
    }
  }

  /**
   * Remove address (actionRemoveAddress)
   * Matches Yii implementation exactly
   */
  async removeAddress(userId: string, dto: RemoveAddressDto): Promise<any> {
    try {
      const address = await this.addressesRepository.findOne({
        where: { id: dto.addressId, userId },
      });

      if (!address) {
        throw new NotFoundException('Address Not Found');
      }

      await this.addressesRepository.remove(address);

      return {
        succeeded: true,
        message: 'address deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove address');
    }
  }
}
