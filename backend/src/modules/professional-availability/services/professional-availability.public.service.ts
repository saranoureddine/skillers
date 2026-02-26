import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProfessionalAvailabilityEntity } from '../entities/professional-availability.entity';
import { CreateProfessionalAvailabilityDto, AvailabilitySlotDto } from '../dto/create-professional-availability.dto';
import { UpdateProfessionalAvailabilityDto } from '../dto/update-professional-availability.dto';
import { UserEntity } from '../../users/entities/user.entity';
import { ProfessionalAvailabilityService } from './professional-availability.service';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class ProfessionalAvailabilityPublicService {
  constructor(
    @InjectRepository(ProfessionalAvailabilityEntity)
    private readonly availabilityRepository: Repository<ProfessionalAvailabilityEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly availabilityService: ProfessionalAvailabilityService,
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
   * Validate that user is a professional
   * Matches Yii validateProfessionalUser() exactly
   */
  async validateProfessionalUser(userId: string, languageCode = 'en'): Promise<void> {
    const isProfessional = await this.availabilityService.isProfessionalUser(userId);
    if (!isProfessional) {
      throw new ForbiddenException({
        success: false,
        message: languageCode === 'ar'
          ? 'تم رفض الوصول. يمكن للمستخدمين المحترفين فقط إدارة التوفر.'
          : 'Access denied. Only professional users can manage availability.',
        error_code: 'NOT_PROFESSIONAL',
      });
    }
  }

  /**
   * Check professional status
   * Matches Yii actionCheckProfessionalStatus() exactly
   */
  async checkProfessionalStatus(userId: string): Promise<any> {
    const isProfessional = await this.availabilityService.isProfessionalUser(userId);
    const professions = isProfessional
      ? await this.availabilityService.getProfessionalUserDetails(userId)
      : [];

    return {
      success: true,
      data: {
        user_id: userId,
        is_professional: isProfessional,
        professions: professions,
        can_manage_availability: isProfessional,
      },
    };
  }

  /**
   * Set availability (replaces all existing availability)
   */
  async setAvailability(
    userId: string,
    dto: CreateProfessionalAvailabilityDto,
    languageCode = 'en',
  ): Promise<any> {
    // Validate professional user
    await this.validateProfessionalUser(userId, languageCode);

    const { availabilitySlots } = dto;

    if (!availabilitySlots || availabilitySlots.length === 0) {
      throw new BadRequestException({
        success: false,
        message: languageCode === 'ar' ? 'يرجى تقديم فترات التوفر' : 'Please provide availability slots',
      });
    }

    // Validate slots
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (let i = 0; i < availabilitySlots.length; i++) {
      const slot = availabilitySlots[i];
      if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
        throw new BadRequestException({
          success: false,
          message: languageCode === 'ar'
            ? `فترة غير صالحة في الفهرس ${i}: day_of_week و start_time و end_time مطلوبة`
            : `Invalid slot at index ${i}: day_of_week, start_time, and end_time are required`,
        });
      }

      if (!validDays.includes(slot.dayOfWeek.toLowerCase())) {
        throw new BadRequestException({
          success: false,
          message: languageCode === 'ar'
            ? `day_of_week غير صالح في الفهرس ${i}. يجب أن يكون واحدًا من: ${validDays.join(', ')}`
            : `Invalid day_of_week at index ${i}. Must be one of: ${validDays.join(', ')}`,
        });
      }

      // Validate time format and range
      const startTime = slot.startTime;
      const endTime = slot.endTime;
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw new BadRequestException({
          success: false,
          message: languageCode === 'ar'
            ? `تنسيق الوقت غير صالح في الفهرس ${i}. استخدم تنسيق HH:MM (مثل 09:00، 14:30)`
            : `Invalid time format at index ${i}. Use HH:MM format (e.g., 09:00, 14:30)`,
        });
      }

      // Convert to Date for comparison
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;

      if (startTotal >= endTotal) {
        throw new BadRequestException({
          success: false,
          message: languageCode === 'ar'
            ? `نطاق الوقت غير صالح في الفهرس ${i}: يجب أن يكون end_time بعد start_time`
            : `Invalid time range at index ${i}: end_time must be after start_time`,
        });
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete existing availability
      await queryRunner.manager.delete(ProfessionalAvailabilityEntity, { userId });

      // Insert new availability slots
      const savedSlots: any[] = [];
      for (const slot of availabilitySlots) {
        const availability = queryRunner.manager.create(ProfessionalAvailabilityEntity, {
          userId,
          dayOfWeek: slot.dayOfWeek.toLowerCase(),
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotDuration: slot.slotDuration ?? 60,
          maxAppointmentsPerSlot: slot.maxAppointmentsPerSlot ?? 1,
          isActive: slot.isActive ?? 1,
        });

        const saved = await queryRunner.manager.save(availability);
        savedSlots.push({
          id: saved.id,
          dayOfWeek: saved.dayOfWeek,
          startTime: saved.startTime,
          endTime: saved.endTime,
          slotDuration: saved.slotDuration,
          maxAppointmentsPerSlot: saved.maxAppointmentsPerSlot,
          isActive: saved.isActive,
        });
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message:
          languageCode === 'ar' ? 'تم تعيين التوفر بنجاح' : 'Availability set successfully',
        data: {
          slots_count: savedSlots.length,
          user_id: userId,
          slots: savedSlots.map(slot => ({
            id: slot.id,
            day_of_week: slot.dayOfWeek,
            start_time: slot.startTime,
            end_time: slot.endTime,
            slot_duration: slot.slotDuration,
            max_appointments_per_slot: slot.maxAppointmentsPerSlot,
            is_active: slot.isActive,
          })),
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException({
        success: false,
        message: languageCode === 'ar' ? 'فشل في تعيين التوفر' : 'Failed to set availability',
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get my availability
   */
  async getMyAvailability(userId: string, languageCode = 'en'): Promise<any> {
    // Validate professional user
    await this.validateProfessionalUser(userId, languageCode);

    try {
      const availability = await this.availabilityService.getAvailabilityOrderedByDay(userId);

      // Transform to match Yii response format (snake_case)
      const availabilitySlots = availability.map(slot => ({
        id: slot.id,
        user_id: slot.userId,
        day_of_week: slot.dayOfWeek,
        start_time: slot.startTime,
        end_time: slot.endTime,
        slot_duration: slot.slotDuration,
        max_appointments_per_slot: slot.maxAppointmentsPerSlot,
        is_active: slot.isActive,
        created_at: slot.createdAt,
        updated_at: slot.updatedAt,
      }));

      return {
        success: true,
        data: {
          user_id: userId,
          availability_slots: availabilitySlots,
          total_slots: availabilitySlots.length,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: languageCode === 'ar' ? 'فشل في استرجاع التوفر' : 'Failed to retrieve availability',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get availability for a user (can be current user or another user)
   */
  async getAvailability(currentUserId: string, targetUserId?: string, languageCode = 'en'): Promise<any> {
    const userId = targetUserId || currentUserId;

    try {
      const isProfessional = await this.availabilityService.isProfessionalUser(userId);

      if (!isProfessional) {
        return {
          success: true,
          data: {
            user_id: userId,
            is_professional: false,
            availability_slots: [],
            message: 'User is not a professional',
          },
        };
      }

      const availability = await this.availabilityService.getAvailabilityOrderedByDay(userId);

      // Transform to match Yii response format (snake_case)
      const availabilitySlots = availability.map(slot => ({
        id: slot.id,
        user_id: slot.userId,
        day_of_week: slot.dayOfWeek,
        start_time: slot.startTime,
        end_time: slot.endTime,
        slot_duration: slot.slotDuration,
        max_appointments_per_slot: slot.maxAppointmentsPerSlot,
        is_active: slot.isActive,
        created_at: slot.createdAt,
        updated_at: slot.updatedAt,
      }));

      return {
        success: true,
        data: {
          user_id: userId,
          is_professional: true,
          availability_slots: availabilitySlots,
          total_slots: availabilitySlots.length,
        },
        };
      } catch (error) {
        throw new InternalServerErrorException({
          success: false,
          message: languageCode === 'ar' ? 'فشل في استرجاع التوفر' : 'Failed to retrieve availability',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

  /**
   * Update availability
   * Matches Yii actionUpdateAvailability() exactly
   */
  async updateAvailability(
    userId: string,
    dto: UpdateProfessionalAvailabilityDto,
    languageCode = 'en',
  ): Promise<any> {
    // Validate professional user
    await this.validateProfessionalUser(userId, languageCode);

    const { availabilityId, ...updateData } = dto;

    if (!availabilityId || Object.keys(updateData).length === 0) {
      throw new BadRequestException({
        success: false,
        message: languageCode === 'ar'
          ? 'availability_id و update_data مطلوبان'
          : 'availability_id and update_data are required',
      });
    }

    // Transform camelCase to snake_case for database fields
    const dbUpdateData: any = {};
    if (updateData.dayOfWeek !== undefined) dbUpdateData.day_of_week = updateData.dayOfWeek.toLowerCase();
    if (updateData.startTime !== undefined) dbUpdateData.start_time = updateData.startTime;
    if (updateData.endTime !== undefined) dbUpdateData.end_time = updateData.endTime;
    if (updateData.slotDuration !== undefined) dbUpdateData.slot_duration = updateData.slotDuration;
    if (updateData.maxAppointmentsPerSlot !== undefined) dbUpdateData.max_appointments_per_slot = updateData.maxAppointmentsPerSlot;
    if (updateData.isActive !== undefined) dbUpdateData.is_active = updateData.isActive;

    try {
      // Use raw query to match Yii implementation exactly
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(ProfessionalAvailabilityEntity)
        .set(dbUpdateData)
        .where('id = :id', { id: availabilityId })
        .andWhere('userId = :userId', { userId })
        .execute();

      await queryRunner.release();

      if (result.affected === 0) {
        throw new NotFoundException({
          success: false,
          message: languageCode === 'ar'
            ? 'لم يتم العثور على فترات التوفر أو تم رفض الوصول'
            : 'Availability slot not found or access denied',
        });
      }

      return {
        success: true,
        message:
          languageCode === 'ar' ? 'تم تحديث التوفر بنجاح' : 'Availability updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        message: languageCode === 'ar' ? 'فشل في تحديث التوفر' : 'Failed to update availability',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Delete availability
   * Matches Yii actionDeleteAvailability() exactly
   */
  async deleteAvailability(userId: string, availabilityId: number, languageCode = 'en'): Promise<any> {
    // Validate professional user
    await this.validateProfessionalUser(userId, languageCode);

    if (!availabilityId) {
      throw new BadRequestException({
        success: false,
        message: languageCode === 'ar' ? 'availability_id مطلوب' : 'availability_id is required',
      });
    }

    try {
      // Ensure user owns this availability
      const result = await this.availabilityRepository.delete({ id: availabilityId, userId });

      if (result.affected === 0) {
        throw new NotFoundException({
          success: false,
          message: languageCode === 'ar'
            ? 'لم يتم العثور على فترات التوفر أو تم رفض الوصول'
            : 'Availability slot not found or access denied',
        });
      }

      return {
        success: true,
        message:
          languageCode === 'ar' ? 'تم حذف التوفر بنجاح' : 'Availability deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        message: languageCode === 'ar' ? 'فشل في حذف التوفر' : 'Failed to delete availability',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Toggle availability
   * Matches Yii actionToggleAvailability() exactly
   */
  async toggleAvailability(
    userId: string,
    availabilityId: number,
    isActive: number,
    languageCode = 'en',
  ): Promise<any> {
    // Validate professional user
    await this.validateProfessionalUser(userId, languageCode);

    if (!availabilityId || isActive === null || isActive === undefined) {
      throw new BadRequestException({
        success: false,
        message: languageCode === 'ar'
          ? 'availability_id و is_active مطلوبان'
          : 'availability_id and is_active are required',
      });
    }

    try {
      // Use raw query to match Yii implementation exactly
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(ProfessionalAvailabilityEntity)
        .set({
          isActive: isActive ? 1 : 0,
          updatedAt: new Date(),
        })
        .where('id = :id', { id: availabilityId })
        .andWhere('userId = :userId', { userId })
        .execute();

      await queryRunner.release();

      if (result.affected === 0) {
        throw new NotFoundException({
          success: false,
          message: languageCode === 'ar'
            ? 'لم يتم العثور على فترات التوفر أو تم رفض الوصول'
            : 'Availability slot not found or access denied',
        });
      }

      const status = isActive ? 'enabled' : 'disabled';
      return {
        success: true,
        message:
          languageCode === 'ar'
            ? `تم ${status === 'enabled' ? 'تفعيل' : 'تعطيل'} التوفر بنجاح`
            : `Availability ${status} successfully`,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        message: languageCode === 'ar' ? 'فشل في تبديل التوفر' : 'Failed to toggle availability',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
