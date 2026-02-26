import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfGroupEntity } from '../entities/prof-group.entity';
import { CreateGroupDto } from '../dto/create-group.dto';
import { GetGroupsDto } from '../dto/get-groups.dto';
import { GetGroupDto } from '../dto/get-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { DeleteGroupDto } from '../dto/delete-group.dto';
import { JoinGroupDto } from '../dto/join-group.dto';
import { LeaveGroupDto } from '../dto/leave-group.dto';
import { GetGroupMembersDto } from '../dto/get-group-members.dto';
import { GetUserGroupsDto } from '../dto/get-user-groups.dto';
import { SyncCountsDto } from '../dto/sync-counts.dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Prof Groups Controller Documentation
// ============================================================================

export const ProfGroupsControllerDocs = {
  /**
   * Controller-level decorators for shared prof groups controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Groups'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/prof-groups/:id - Get group by ID
   */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get group by ID',
        description: 'Retrieve a single group by its ID. Accessible by authenticated users.',
      }),
      ApiItemResponse(ProfGroupEntity, 'Group retrieved successfully'),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Public Prof Groups Controller Documentation
// ============================================================================

export const ProfGroupsPublicControllerDocs = {
  /**
   * Controller-level decorators for public prof groups controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Groups'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/prof-groups/create-group - Create a new professional group
   */
  createGroup: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create a new professional group',
        description: 'Create a new professional group. The creator automatically becomes the admin member.',
      }),
      ApiBody({ type: CreateGroupDto }),
      ApiResponse({
        status: 201,
        description: 'Group created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Group created successfully' },
            group_id: { type: 'number', example: 1 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/prof-groups/get-groups - Get groups with filtering and pagination
   */
  getGroups: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get groups with filtering and pagination',
        description: 'Retrieve paginated list of groups with filters (category, public status, search).',
      }),
      ApiBody({ type: GetGroupsDto }),
      ApiResponse({
        status: 200,
        description: 'Groups retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            groups: { type: 'array', items: { type: 'object' } },
            pagination: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-groups/get-group - Get a specific group with details
   */
  getGroup: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get a specific group with details',
        description: 'Retrieve detailed information about a specific group. Requires group to be public or user to be a member.',
      }),
      ApiBody({ type: GetGroupDto }),
      ApiResponse({
        status: 200,
        description: 'Group retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            group: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-groups/update-group - Update a group
   */
  updateGroup: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update a group',
        description: 'Update group information. Requires user to be owner or admin.',
      }),
      ApiBody({ type: UpdateGroupDto }),
      ApiResponse({
        status: 200,
        description: 'Group updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Group updated successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-groups/delete-group - Delete a group
   */
  deleteGroup: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete a group',
        description: 'Soft delete a group. Only the group owner can delete the group.',
      }),
      ApiBody({ type: DeleteGroupDto }),
      ApiResponse({
        status: 200,
        description: 'Group deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Group deleted successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-groups/join-group - Join a group
   */
  joinGroup: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Join a group',
        description: 'Join a professional group. If user was previously a member, reactivates membership.',
      }),
      ApiBody({ type: JoinGroupDto }),
      ApiResponse({
        status: 200,
        description: 'Joined group successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Joined group successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 409, 500),
    ),

  /**
   * POST /api/public/prof-groups/leave-group - Leave a group
   */
  leaveGroup: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Leave a group',
        description: 'Leave a professional group. Group owner cannot leave the group.',
      }),
      ApiBody({ type: LeaveGroupDto }),
      ApiResponse({
        status: 200,
        description: 'Left group successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Left group successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/prof-groups/get-group-members - Get group members
   */
  getGroupMembers: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get group members',
        description: 'Retrieve paginated list of group members. Requires group to be public or user to be a member.',
      }),
      ApiBody({ type: GetGroupMembersDto }),
      ApiResponse({
        status: 200,
        description: 'Group members retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            members: { type: 'array', items: { type: 'object' } },
            pagination: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-groups/get-user-groups - Get user's groups
   */
  getUserGroups: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user\'s groups',
        description: 'Retrieve paginated list of groups that a user is a member of.',
      }),
      ApiBody({ type: GetUserGroupsDto }),
      ApiResponse({
        status: 200,
        description: 'User groups retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            groups: { type: 'array', items: { type: 'object' } },
            pagination: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-groups/sync-counts - Sync group counts
   */
  syncCounts: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Sync group counts',
        description: 'Recalculate and sync members_count and posts_count for a group. Requires user to be admin or owner.',
      }),
      ApiBody({ type: SyncCountsDto }),
      ApiResponse({
        status: 200,
        description: 'Counts synced successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Counts synced successfully' },
            members_count: { type: 'number', example: 50 },
            posts_count: { type: 'number', example: 100 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),
};

// ============================================================================
// Admin Prof Groups Controller Documentation
// ============================================================================

export const ProfGroupsAdminControllerDocs = {
  /**
   * Controller-level decorators for admin prof groups controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Groups'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/prof-groups/get-all - Get all groups (admin)
   */
  getAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all groups',
        description: 'Retrieve all groups. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Groups retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProfGroupEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),

  /**
   * GET /api/admin/prof-groups/statistics - Get statistics (admin)
   */
  getStatistics: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get groups statistics',
        description: 'Get statistics about groups. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
          properties: {
            total: { type: 'number', example: 100 },
            active: { type: 'number', example: 95 },
            inactive: { type: 'number', example: 5 },
            public: { type: 'number', example: 70 },
            private: { type: 'number', example: 25 },
            total_members: { type: 'number', example: 1000 },
            total_posts: { type: 'number', example: 5000 },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),
};
