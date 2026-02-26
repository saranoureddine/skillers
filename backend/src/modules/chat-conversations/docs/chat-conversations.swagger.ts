import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatConversationEntity } from '../entities/chat-conversation.entity';
import { CreateChatConversationDto } from '../dto/create-chat-conversation.dto';
import { UpdateChatConversationDto } from '../dto/update-chat-conversation.dto';
import { GetAllUsersDto } from '../dto/get-all-users.dto';
import { MarkConversationReadDto } from '../dto/mark-conversation-read.dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Chat Conversations Controller Documentation
// ============================================================================

export const ChatConversationsControllerDocs = {
  /**
   * Controller-level decorators for shared chat conversations controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Conversations'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/chat-conversations/:id - Get conversation by ID
   */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get conversation by ID',
        description: 'Retrieve a single conversation by its ID. Accessible by authenticated users.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Conversation ID',
        example: 1,
      }),
      ApiItemResponse(ChatConversationEntity, 'Conversation retrieved successfully'),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Public Chat Conversations Controller Documentation
// ============================================================================

export const ChatConversationsPublicControllerDocs = {
  /**
   * Controller-level decorators for public chat conversations controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Conversations'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/public/chat-conversations/get-all-users - Get all users
   */
  getAllUsers: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all users',
        description: 'Retrieve a paginated list of all users with fuzzy search for chat user selection.',
      }),
      ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Search term (searches in first name, last name, phone, email)',
        example: 'John',
      }),
      ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
        example: 1,
      }),
      ApiQuery({
        name: 'pageSize',
        required: false,
        type: Number,
        description: 'Page size (default: 50, max: 200)',
        example: 50,
      }),
      ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  full_name: { type: 'string', example: 'John Doe' },
                  phone_number: { type: 'string', example: '1234567', nullable: true },
                  email: { type: 'string', example: 'john.doe@example.com', nullable: true },
                  privacy: { type: 'string', example: 'public', enum: ['public', 'private'] },
                  profile_image: { type: 'string', example: '/uploads/users/avatar.jpg', nullable: true },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 50 },
                total: { type: 'number', example: 100 },
                pages: { type: 'number', example: 2 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * GET /api/public/chat-conversations/get-all-conservations - Get all conversations
   */
  getAllConversations: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all conversations',
        description: 'Retrieve all conversations. Accessible by authenticated users.',
      }),
      ApiResponse({
        status: 200,
        description: 'Conversations retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            conversations: {
              type: 'array',
              items: { $ref: '#/components/schemas/ChatConversationEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * GET /api/public/chat-conversations/get-conservation-by-id/:id - Get conversation by ID
   */
  getConversationById: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get conversation by ID',
        description: 'Retrieve a single conversation by its ID.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Conversation ID',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Conversation retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            conversation: { $ref: '#/components/schemas/ChatConversationEntity' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * POST /api/public/chat-conversations/create-conservation - Create conversation
   */
  createConversation: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create conversation',
        description: 'Create a new conversation between two users.',
      }),
      ApiBody({ type: CreateChatConversationDto }),
      ApiResponse({
        status: 200,
        description: 'Conversation created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Conservation created successfully' },
            conservation: { $ref: '#/components/schemas/ChatConversationEntity' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 409, 500),
    ),

  /**
   * PATCH /api/public/chat-conversations/update-conservation/:id - Update conversation
   */
  updateConversation: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update conversation',
        description: 'Update conversation status (room status, typing status, etc.).',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Conversation ID',
        example: 1,
      }),
      ApiBody({ type: UpdateChatConversationDto }),
      ApiResponse({
        status: 200,
        description: 'Conversation updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Conservation updated successfully' },
            conservation: { $ref: '#/components/schemas/ChatConversationEntity' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * DELETE /api/public/chat-conversations/delete-conservation/:id - Delete conversation
   */
  deleteConversation: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete conversation',
        description: 'Delete a conversation.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Conversation ID',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Conversation deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Conservation deleted successfully' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * GET /api/public/chat-conversations/get-user-conservations/:user_id - Get user conversations
   */
  getUserConversations: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user conversations',
        description: 'Retrieve all conversations for a user with last messages, voice calls, block status, and unread counts.',
      }),
      ApiParam({
        name: 'user_id',
        type: String,
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiResponse({
        status: 200,
        description: 'User conversations retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            conversations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  user_one: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  user_two: { type: 'string', example: '507f1f77bcf86cd799439012' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  other_user_info: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      first_name: { type: 'string' },
                      last_name: { type: 'string' },
                      phone_number: { type: 'string', nullable: true },
                      image: { type: 'string', nullable: true },
                    },
                  },
                  status: {
                    type: 'object',
                    properties: {
                      is_online: { type: 'boolean' },
                      last_seen: { type: 'string', nullable: true },
                      status_text: { type: 'string' },
                      status_hidden: { type: 'boolean' },
                    },
                  },
                  block_status: {
                    type: 'object',
                    properties: {
                      is_blocked: { type: 'boolean' },
                      i_blocked_them: { type: 'boolean' },
                      they_blocked_me: { type: 'boolean' },
                      blocked_by: { type: 'string', nullable: true },
                      can_send_messages: { type: 'boolean' },
                      will_receive_messages: { type: 'boolean' },
                    },
                  },
                  last_message: { type: 'object', nullable: true },
                  unread_count: { type: 'number', example: 5 },
                },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/chat-conversations/mark-conversation-read - Mark conversation as read
   */
  markConversationRead: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Mark conversation as read',
        description: 'Mark all unread messages in a conversation as read.',
      }),
      ApiBody({ type: MarkConversationReadDto }),
      ApiResponse({
        status: 200,
        description: 'Conversation marked as read successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Conversation marked as read' },
            conversation_id: { type: 'number', example: 1 },
            reader_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            updated_count: { type: 'number', example: 5 },
            message_ids: { type: 'array', items: { type: 'number' } },
            timestamp: { type: 'string', format: 'date-time' },
            broadcast_status: {
              type: 'object',
              properties: {
                sent: { type: 'boolean' },
                channel: { type: 'string' },
                error: { type: 'string', nullable: true },
                response: { type: 'object', nullable: true },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Admin Chat Conversations Controller Documentation
// ============================================================================

export const ChatConversationsAdminControllerDocs = {
  /**
   * Controller-level decorators for admin chat conversations controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Conversations'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/chat-conversations/get-all - Get all conversations (admin)
   */
  getAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all conversations',
        description: 'Retrieve all conversations. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Conversations retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ChatConversationEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),

  /**
   * GET /api/admin/chat-conversations/statistics - Get statistics (admin)
   */
  getStatistics: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get conversation statistics',
        description: 'Get statistics about conversations. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
          properties: {
            total: { type: 'number', example: 1000 },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),
};
