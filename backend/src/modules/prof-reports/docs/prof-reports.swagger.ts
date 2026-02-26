import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import {
  CreateReportDto,
  GetReportsDto,
  GetReportDto,
  UpdateReportStatusDto,
  GetUserReportsDto,
  GetReportsAgainstUserDto,
} from '../dto';
import { ApiErrorResponses } from '../../../common/swagger';

// ============================================================================
// Public ProfReports Controller Documentation
// ============================================================================

export const ProfReportsPublicControllerDocs = {
  /**
   * Controller-level decorators for public prof reports controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Reports'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/prof-reports/create-report - Create a new report
   */
  createReport: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create a report',
        description:
          'Submit a report for a user, post, or comment. Prevents duplicate reports within 24 hours.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: CreateReportDto }),
      ApiResponse({
        status: 201,
        description: 'Report created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Report submitted successfully' },
            report_id: { type: 'number', example: 1 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/prof-reports/get-reports - Get all reports (admin)
   */
  getReports: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all reports',
        description:
          'Retrieve all reports with optional filtering by status, type, and reason. Admin function.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetReportsDto }),
      ApiResponse({
        status: 200,
        description: 'Reports retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            reports: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 100 },
                pages: { type: 'number', example: 5 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-reports/get-report - Get a specific report (admin)
   */
  getReport: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get a specific report',
        description: 'Retrieve details of a specific report by ID. Admin function.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetReportDto }),
      ApiResponse({
        status: 200,
        description: 'Report retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            report: { type: 'object', properties: {} },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * POST /api/public/prof-reports/update-report-status - Update report status (admin)
   */
  updateReportStatus: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update report status',
        description:
          'Update the status of a report (pending, reviewed, resolved, dismissed). Admin function.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: UpdateReportStatusDto }),
      ApiResponse({
        status: 200,
        description: 'Report status updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Report status updated successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/prof-reports/get-user-reports - Get user's reports
   */
  getUserReports: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user reports',
        description: 'Retrieve all reports submitted by the authenticated user.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetUserReportsDto }),
      ApiResponse({
        status: 200,
        description: 'User reports retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            reports: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 10 },
                pages: { type: 'number', example: 1 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-reports/get-reports-against-user - Get reports against a user (admin)
   */
  getReportsAgainstUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get reports against a user',
        description: 'Retrieve all reports filed against a specific user. Admin function.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetReportsAgainstUserDto }),
      ApiResponse({
        status: 200,
        description: 'Reports retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            reports: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 5 },
                pages: { type: 'number', example: 1 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/prof-reports/get-report-stats - Get report statistics (admin)
   */
  getReportStats: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get report statistics',
        description:
          'Retrieve statistics about reports including counts by status, type, reason, and time periods. Admin function.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            stats: {
              type: 'object',
              properties: {
                total_reports: { type: 'number', example: 500 },
                pending_reports: { type: 'number', example: 50 },
                reviewed_reports: { type: 'number', example: 200 },
                resolved_reports: { type: 'number', example: 200 },
                dismissed_reports: { type: 'number', example: 50 },
                reports_by_type: { type: 'array', items: {} },
                reports_by_reason: { type: 'array', items: {} },
                reports_today: { type: 'number', example: 10 },
                reports_this_week: { type: 'number', example: 50 },
                reports_this_month: { type: 'number', example: 200 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),
};
