import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatDeletedMessageEntity } from '../entities/chat-deleted-message.entity';
import { CreateChatDeletedMessageDto } from '../dto/create-chat-deleted-message.dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Chat Deleted Messages Controller Documentation
// ============================================================================

export const ChatDeletedMessagesControllerDocs = {
  /**
   * Controller-level decorators for shared chat deleted messages controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Deleted Messages'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/chat-deleted-messages/:id - Get deleted message by ID
   */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get deleted message by ID',
        description: 'Retrieve a single deleted message by its ID. Accessible by authenticated users.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Deleted message ID',
        example: 1,
      }),
      ApiItemResponse(ChatDeletedMessageEntity, 'Deleted message retrieved successfully'),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Public Chat Deleted Messages Controller Documentation
// ============================================================================

export const ChatDeletedMessagesPublicControllerDocs = {
  /**
   * Controller-level decorators for public chat deleted messages controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Deleted Messages'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/public/chat-deleted-messages/get-all-deleted - Get all deleted messages
   */
  getAllDeleted: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all deleted messages',
        description: 'Retrieve all deleted message records. Accessible by authenticated users.',
      }),
      ApiResponse({
        status: 200,
        description: 'Deleted messages retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            deleted_messages: {
              type: 'array',
              items: { $ref: '#/components/schemas/ChatDeletedMessageEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * GET /api/public/chat-deleted-messages/get-deleted-by-id/:id - Get deleted message by ID
   */
  getDeletedById: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get deleted message by ID',
        description: 'Retrieve a single deleted message by its ID.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Deleted message ID',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Deleted message retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            deleted_message: { $ref: '#/components/schemas/ChatDeletedMessageEntity' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * POST /api/public/chat-deleted-messages/create-deleted - Create deleted message
   */
  createDeleted: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create deleted message',
        description: 'Mark a message as deleted. Updates chat_messages table and creates a deleted message record.',
      }),
      ApiBody({ type: CreateChatDeletedMessageDto }),
      ApiResponse({
        status: 200,
        description: 'Deleted message created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Deleted message created successfully' },
            deleted_message: { $ref: '#/components/schemas/ChatDeletedMessageEntity' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),
};

// ============================================================================
// Admin Chat Deleted Messages Controller Documentation
// ============================================================================

export const ChatDeletedMessagesAdminControllerDocs = {
  /**
   * Controller-level decorators for admin chat deleted messages controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Deleted Messages'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/chat-deleted-messages/get-all - Get all deleted messages (admin)
   */
  getAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all deleted messages',
        description: 'Retrieve all deleted message records. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Deleted messages retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ChatDeletedMessageEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),

  /**
   * GET /api/admin/chat-deleted-messages/statistics - Get statistics (admin)
   */
  getStatistics: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get deleted messages statistics',
        description: 'Get statistics about deleted messages. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
          properties: {
            total: { type: 'number', example: 100 },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),
};
