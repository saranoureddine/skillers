import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { ChatMessageEntity } from '../entities/chat-message.entity';
import { CreateChatMessageDto } from '../dto/create-chat-message.dto';
import { UpdateChatMessageDto } from '../dto/update-chat-message.dto';
import { DeleteChatMessageDto } from '../dto/delete-chat-message.dto';
import { GetMessagesBetweenUsersDto } from '../dto/get-messages-between-users.dto';
import { GetPaginatedMessagesDto } from '../dto/get-paginated-messages.dto';
import { UploadAttachmentDto } from '../dto/upload-attachment.dto';
import { DeleteConversationDto } from '../dto/delete-conversation.dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Chat Messages Controller Documentation
// ============================================================================

export const ChatMessagesControllerDocs = {
  /**
   * Controller-level decorators for shared chat messages controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Messages'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/chat-messages/:id - Get message by ID
   */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get message by ID',
        description: 'Retrieve a single message by its ID. Accessible by authenticated users.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Message ID',
        example: 1,
      }),
      ApiItemResponse(ChatMessageEntity, 'Message retrieved successfully'),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Public Chat Messages Controller Documentation
// ============================================================================

export const ChatMessagesPublicControllerDocs = {
  /**
   * Controller-level decorators for public chat messages controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Messages'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/public/chat-messages/get-all-messages - Get all messages
   */
  getAllMessages: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all messages',
        description: 'Retrieve all chat messages. Accessible by authenticated users.',
      }),
      ApiResponse({
        status: 200,
        description: 'Messages retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            messages: {
              type: 'array',
              items: { $ref: '#/components/schemas/ChatMessageEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * GET /api/public/chat-messages/get-message-by-id/:id - Get message by ID
   */
  getMessageById: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get message by ID',
        description: 'Retrieve a single message by its ID.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Message ID',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Message retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { $ref: '#/components/schemas/ChatMessageEntity' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * GET /api/public/chat-messages/get-messages-between-users - Get messages between users
   */
  getMessagesBetweenUsers: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get messages between two users',
        description: 'Retrieve all messages exchanged between two users.',
      }),
      ApiQuery({
        name: 'userOne',
        type: String,
        description: 'First user ID',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiQuery({
        name: 'userTwo',
        type: String,
        description: 'Second user ID',
        example: '507f1f77bcf86cd799439012',
      }),
      ApiResponse({
        status: 200,
        description: 'Messages retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            messages: { type: 'array', items: { type: 'object' } },
            conversation_info: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/chat-messages/create-message - Create message
   */
  createMessage: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create message',
        description: 'Create a new chat message. Automatically creates conversation if it doesn\'t exist. Includes Centrifugo broadcast and push notification.',
      }),
      ApiBody({ type: CreateChatMessageDto }),
      ApiResponse({
        status: 200,
        description: 'Message created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Message created successfully' },
            chat_message: { type: 'object' },
            broadcast_status: { type: 'object' },
            notification_status: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * PATCH /api/public/chat-messages/update-message/:id - Update message
   */
  updateMessage: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update message',
        description: 'Update/edit a message. Only the sender can edit their own messages. Includes Centrifugo broadcast.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Message ID',
        example: 1,
      }),
      ApiQuery({
        name: 'user_id',
        type: String,
        description: 'User ID who is editing the message',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiBody({ type: UpdateChatMessageDto }),
      ApiResponse({
        status: 200,
        description: 'Message updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Message updated successfully' },
            edit_data: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * DELETE /api/public/chat-messages/delete-message/:id - Delete message
   */
  deleteMessage: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete message',
        description: 'Soft delete a message (marks as deleted_by). Only sender or receiver can delete. Includes Centrifugo broadcast.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Message ID',
        example: 1,
      }),
      ApiQuery({
        name: 'user_id',
        type: String,
        description: 'User ID who is deleting the message',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiResponse({
        status: 200,
        description: 'Message deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Message deleted successfully' },
            delete_data: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 403, 404, 500),
    ),

  /**
   * POST /api/public/chat-messages/upload-attachment - Upload attachment
   */
  uploadAttachment: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Upload attachment and create message',
        description: 'Upload a file (image, video, document, audio) and create a message with the attachment. Includes Centrifugo broadcast and push notification.',
      }),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        schema: {
          type: 'object',
          properties: {
            senderId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            receiverId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            conversationId: { type: 'number', example: 1 },
            messageType: { type: 'string', enum: ['image', 'video', 'document', 'audio', 'voice'], example: 'image' },
            message: { type: 'string', example: 'Check this out!' },
            reply: { type: 'number', example: 1 },
            productId: { type: 'string', example: '507f1f77bcf86cd799439013' },
            file: {
              type: 'string',
              format: 'binary',
              description: 'File to upload',
            },
          },
        },
      }),
      ApiResponse({
        status: 200,
        description: 'Message with attachment created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Message with attachment created successfully' },
            chat_message: { type: 'object' },
            broadcast_status: { type: 'object' },
            notification_status: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * GET /api/public/chat-messages/get-paginated-messages - Get paginated messages
   */
  getPaginatedMessages: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get paginated messages with voice calls',
        description: 'Retrieve paginated messages between two users, including voice calls. Messages and voice calls are combined and sorted by timestamp.',
      }),
      ApiQuery({
        name: 'userOne',
        type: String,
        description: 'First user ID',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiQuery({
        name: 'userTwo',
        type: String,
        description: 'Second user ID',
        example: '507f1f77bcf86cd799439012',
      }),
      ApiQuery({
        name: 'offset',
        type: Number,
        required: false,
        description: 'Offset for pagination (default: 0)',
        example: 0,
      }),
      ApiQuery({
        name: 'limit',
        type: Number,
        required: false,
        description: 'Limit for pagination (default: 20)',
        example: 20,
      }),
      ApiResponse({
        status: 200,
        description: 'Messages retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            type: { type: 'string', example: 'messages_list' },
            messages: { type: 'array', items: { type: 'object' } },
            pagination: { type: 'object' },
            conversation_info: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/chat-messages/delete-conversation - Delete conversation
   */
  deleteConversation: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete conversation',
        description: 'Delete an entire conversation and all its messages. Hard delete. Includes Centrifugo broadcast.',
      }),
      ApiBody({ type: DeleteConversationDto }),
      ApiResponse({
        status: 200,
        description: 'Conversation deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Conversation deleted successfully' },
            conversation_id: { type: 'number', example: 1 },
            deleted_by: { type: 'string', example: '507f1f77bcf86cd799439011' },
            messages_deleted: { type: 'number', example: 10 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),
};

// ============================================================================
// Admin Chat Messages Controller Documentation
// ============================================================================

export const ChatMessagesAdminControllerDocs = {
  /**
   * Controller-level decorators for admin chat messages controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Messages'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/chat-messages/get-all - Get all messages (admin)
   */
  getAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all messages',
        description: 'Retrieve all chat messages. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Messages retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ChatMessageEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),

  /**
   * GET /api/admin/chat-messages/statistics - Get statistics (admin)
   */
  getStatistics: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get messages statistics',
        description: 'Get statistics about chat messages. Admin only.',
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
