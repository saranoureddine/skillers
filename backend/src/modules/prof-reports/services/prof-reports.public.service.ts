import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual, IsNull } from 'typeorm';
import { ProfReportedUserEntity } from '../entities/prof-reported-user.entity';
import { UserEntity } from '../../users/entities/user.entity';
import {
  CreateReportDto,
  GetReportsDto,
  GetReportDto,
  UpdateReportStatusDto,
  GetUserReportsDto,
  GetReportsAgainstUserDto,
} from '../dto';
import { UtilsService } from '../../../common/services/utils.service';

/**
 * Public ProfReports service — handles all report endpoints matching Yii API
 */
@Injectable()
export class ProfReportsPublicService {
  private readonly logger = new Logger(ProfReportsPublicService.name);

  constructor(
    @InjectRepository(ProfReportedUserEntity)
    private readonly profReportedUsersRepository: Repository<ProfReportedUserEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly utilsService: UtilsService,
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
   * Create a report (actionCreateReport)
   * Matches Yii implementation exactly
   */
  async createReport(
    senderId: string,
    languageCode: string,
    dto: CreateReportDto,
  ): Promise<any> {
    try {
      // Validate required fields
      if (!dto.target_id || !dto.report_type || !dto.reason) {
        throw new BadRequestException(
          await this.utilsService.findString(
            'Target ID, report type, and reason are required',
            languageCode,
          ),
        );
      }

      // Validate report type
      if (!['user', 'post', 'comment'].includes(dto.report_type)) {
        throw new BadRequestException(
          await this.utilsService.findString('Invalid report type', languageCode),
        );
      }

      // Validate reason
      if (
        !['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other'].includes(
          dto.reason,
        )
      ) {
        throw new BadRequestException(
          await this.utilsService.findString('Invalid reason', languageCode),
        );
      }

      // Only validate user existence if reporting a user
      if (dto.report_type === 'user') {
        // Check if trying to report self
        if (dto.target_id === senderId) {
          throw new BadRequestException(
            await this.utilsService.findString('Cannot report yourself', languageCode),
          );
        }

        // Check if target user exists
        const targetUser = await this.usersRepository.findOne({
          where: { id: dto.target_id, isActivated: 1 },
        });
        if (!targetUser) {
          throw new NotFoundException(
            await this.utilsService.findString('Target user not found', languageCode),
          );
        }
      }

      // Check if already reported recently (within 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const whereCondition: any = {
        senderId: senderId,
        targetId: dto.target_id,
        reportType: dto.report_type,
        createdAt: MoreThanOrEqual(twentyFourHoursAgo),
      };

      if (dto.target_type_id) {
        whereCondition.targetTypeId = dto.target_type_id;
      } else {
        whereCondition.targetTypeId = IsNull();
      }

      const recentReport = await this.profReportedUsersRepository.findOne({
        where: whereCondition,
      });

      if (recentReport) {
        throw new BadRequestException(
          await this.utilsService.findString(
            'You have already reported this recently',
            languageCode,
          ),
        );
      }

      // Create new report
      const report = this.profReportedUsersRepository.create({
        senderId: senderId,
        targetId: dto.target_id,
        reportType: dto.report_type,
        targetTypeId: dto.target_type_id || null,
        reason: dto.reason,
        description: dto.description || null,
        status: 'pending',
      } as Partial<ProfReportedUserEntity>);

      await this.profReportedUsersRepository.save(report);

      return {
        succeeded: true,
        message: await this.utilsService.findString(
          'Report submitted successfully',
          languageCode,
        ),
        report_id: report.id,
      };
    } catch (error) {
      this.logger.error('Error in createReport:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to submit report');
    }
  }

  /**
   * Get all reports with filters (actionGetReports)
   * Matches Yii implementation exactly
   */
  async getReports(languageCode: string, dto: GetReportsDto): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'pru.id',
          'pru.sender_id',
          'pru.target_id',
          'pru.report_type',
          'pru.target_type_id',
          'pru.reason',
          'pru.description',
          'pru.status',
          'pru.reviewed_by',
          'pru.reviewed_at',
          'pru.resolution_notes',
          'pru.created_at',
          'pru.updated_at',
          'sender.first_name AS sender_first_name',
          'sender.last_name AS sender_last_name',
          'sender.email AS sender_email',
          'target.first_name AS target_first_name',
          'target.last_name AS target_last_name',
          'target.email AS target_email',
          'reviewer.first_name AS reviewer_first_name',
          'reviewer.last_name AS reviewer_last_name',
        ])
        .from(ProfReportedUserEntity, 'pru')
        .leftJoin('users', 'sender', 'sender.id = pru.sender_id')
        .leftJoin('users', 'target', 'target.id = pru.target_id')
        .leftJoin('users', 'reviewer', 'reviewer.id = pru.reviewed_by');

      // Apply filters
      if (dto.status) {
        query.andWhere('pru.status = :status', { status: dto.status });
      }

      if (dto.report_type) {
        query.andWhere('pru.report_type = :reportType', { reportType: dto.report_type });
      }

      if (dto.reason) {
        query.andWhere('pru.reason = :reason', { reason: dto.reason });
      }

      const totalCount = await query.getCount();
      const reports = await query
        .orderBy('pru.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      return {
        succeeded: true,
        reports: reports,
        pagination: {
          page: page,
          limit: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error in getReports:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get reports');
    }
  }

  /**
   * Get a specific report (actionGetReport)
   * Matches Yii implementation exactly
   */
  async getReport(languageCode: string, dto: GetReportDto): Promise<any> {
    try {
      const report = await this.dataSource
        .createQueryBuilder()
        .select([
          'pru.id',
          'pru.sender_id',
          'pru.target_id',
          'pru.report_type',
          'pru.target_type_id',
          'pru.reason',
          'pru.description',
          'pru.status',
          'pru.reviewed_by',
          'pru.reviewed_at',
          'pru.resolution_notes',
          'pru.created_at',
          'pru.updated_at',
          'sender.first_name AS sender_first_name',
          'sender.last_name AS sender_last_name',
          'sender.email AS sender_email',
          'target.first_name AS target_first_name',
          'target.last_name AS target_last_name',
          'target.email AS target_email',
          'reviewer.first_name AS reviewer_first_name',
          'reviewer.last_name AS reviewer_last_name',
        ])
        .from(ProfReportedUserEntity, 'pru')
        .leftJoin('users', 'sender', 'sender.id = pru.sender_id')
        .leftJoin('users', 'target', 'target.id = pru.target_id')
        .leftJoin('users', 'reviewer', 'reviewer.id = pru.reviewed_by')
        .where('pru.id = :reportId', { reportId: dto.report_id })
        .getRawOne();

      if (!report) {
        throw new NotFoundException(
          await this.utilsService.findString('Report not found', languageCode),
        );
      }

      return {
        succeeded: true,
        report: report,
      };
    } catch (error) {
      this.logger.error('Error in getReport:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get report');
    }
  }

  /**
   * Update report status (actionUpdateReportStatus)
   * Matches Yii implementation exactly
   */
  async updateReportStatus(
    reviewerId: string,
    languageCode: string,
    dto: UpdateReportStatusDto,
  ): Promise<any> {
    try {
      if (!dto.report_id || !dto.status) {
        throw new BadRequestException(
          await this.utilsService.findString(
            'Report ID and status are required',
            languageCode,
          ),
        );
      }

      if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(dto.status)) {
        throw new BadRequestException(
          await this.utilsService.findString('Invalid status', languageCode),
        );
      }

      const report = await this.profReportedUsersRepository.findOne({
        where: { id: dto.report_id },
      });

      if (!report) {
        throw new NotFoundException(
          await this.utilsService.findString('Report not found', languageCode),
        );
      }

      report.status = dto.status;
      report.reviewedBy = reviewerId;
      report.reviewedAt = new Date();
      if (dto.resolution_notes) {
        report.resolutionNotes = dto.resolution_notes;
      }

      await this.profReportedUsersRepository.save(report);

      return {
        succeeded: true,
        message: await this.utilsService.findString(
          'Report status updated successfully',
          languageCode,
        ),
      };
    } catch (error) {
      this.logger.error('Error in updateReportStatus:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update report status');
    }
  }

  /**
   * Get user's reports (actionGetUserReports)
   * Matches Yii implementation exactly
   */
  async getUserReports(
    userId: string,
    languageCode: string,
    dto: GetUserReportsDto,
  ): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'pru.id',
          'pru.target_id',
          'pru.report_type',
          'pru.target_type_id',
          'pru.reason',
          'pru.description',
          'pru.status',
          'pru.reviewed_at',
          'pru.resolution_notes',
          'pru.created_at',
          'target.first_name AS target_first_name',
          'target.last_name AS target_last_name',
        ])
        .from(ProfReportedUserEntity, 'pru')
        .leftJoin('users', 'target', 'target.id = pru.target_id')
        .where('pru.sender_id = :userId', { userId });

      const totalCount = await query.getCount();
      const reports = await query
        .orderBy('pru.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      return {
        succeeded: true,
        reports: reports,
        pagination: {
          page: page,
          limit: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error in getUserReports:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get user reports');
    }
  }

  /**
   * Get reports against a user (actionGetReportsAgainstUser)
   * Matches Yii implementation exactly
   */
  async getReportsAgainstUser(
    languageCode: string,
    dto: GetReportsAgainstUserDto,
  ): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'pru.id',
          'pru.sender_id',
          'pru.target_id',
          'pru.report_type',
          'pru.target_type_id',
          'pru.reason',
          'pru.description',
          'pru.status',
          'pru.reviewed_by',
          'pru.reviewed_at',
          'pru.resolution_notes',
          'pru.created_at',
          'sender.first_name AS sender_first_name',
          'sender.last_name AS sender_last_name',
          'sender.email AS sender_email',
        ])
        .from(ProfReportedUserEntity, 'pru')
        .leftJoin('users', 'sender', 'sender.id = pru.sender_id')
        .where('pru.target_id = :targetUserId', { targetUserId: dto.target_user_id });

      const totalCount = await query.getCount();
      const reports = await query
        .orderBy('pru.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      return {
        succeeded: true,
        reports: reports,
        pagination: {
          page: page,
          limit: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error in getReportsAgainstUser:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get reports against user');
    }
  }

  /**
   * Get report statistics (actionGetReportStats)
   * Matches Yii implementation exactly
   */
  async getReportStats(languageCode: string): Promise<any> {
    try {
      const totalReports = await this.profReportedUsersRepository.count();
      const pendingReports = await this.profReportedUsersRepository.count({
        where: { status: 'pending' },
      });
      const reviewedReports = await this.profReportedUsersRepository.count({
        where: { status: 'reviewed' },
      });
      const resolvedReports = await this.profReportedUsersRepository.count({
        where: { status: 'resolved' },
      });
      const dismissedReports = await this.profReportedUsersRepository.count({
        where: { status: 'dismissed' },
      });

      // Reports by type
      const reportsByType = await this.dataSource.query(`
        SELECT report_type, COUNT(*) as count
        FROM prof_reported_users
        GROUP BY report_type
      `);

      // Reports by reason
      const reportsByReason = await this.dataSource.query(`
        SELECT reason, COUNT(*) as count
        FROM prof_reported_users
        GROUP BY reason
      `);

      // Reports today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const reportsToday = await this.profReportedUsersRepository.count({
        where: {
          createdAt: MoreThanOrEqual(today),
        },
      });

      // Reports this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      const reportsThisWeek = await this.profReportedUsersRepository.count({
        where: {
          createdAt: MoreThanOrEqual(weekAgo),
        },
      });

      // Reports this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const reportsThisMonth = await this.profReportedUsersRepository.count({
        where: {
          createdAt: MoreThanOrEqual(monthStart),
        },
      });

      return {
        succeeded: true,
        stats: {
          total_reports: totalReports,
          pending_reports: pendingReports,
          reviewed_reports: reviewedReports,
          resolved_reports: resolvedReports,
          dismissed_reports: dismissedReports,
          reports_by_type: reportsByType,
          reports_by_reason: reportsByReason,
          reports_today: reportsToday,
          reports_this_week: reportsThisWeek,
          reports_this_month: reportsThisMonth,
        },
      };
    } catch (error) {
      this.logger.error('Error in getReportStats:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get report statistics');
    }
  }
}
