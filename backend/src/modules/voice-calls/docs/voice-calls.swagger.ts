import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  InitiateCallDto,
  AcceptCallDto,
  DeclineCallDto,
  DismissCallDto,
  EndCallDto,
  EndCallsBetweenUsersDto,
  CallStatusDto,
  GetVoiceCallsDto,
  GetUserCallsDto,
  MissedCallDto,
  DeleteCallDto,
  UpdatePlatformDto,
  UpdateVoipTokenDto,
  TestFcmDeliveryDto,
  ConfirmCallDeliveryDto,
  SendMissedCallNotificationDto,
  TestVoipPushDto,
  DebugFcmDto,
} from '../dto';
import { ApiErrorResponses } from '../../../common/swagger';

// ============================================================================
// Public Voice Calls Controller Documentation
// ============================================================================

export const VoiceCallsPublicControllerDocs = {
  /**
   * Controller-level decorators for public voice calls controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Voice Calls'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/voice-calls/initiate-call - Initiate a voice/video call
   */
  initiateCall: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Initiate call',
        description: 'Initiate a voice or video call between two users. Creates call record and sends notification to receiver.',
      }),
      ApiBody({ type: InitiateCallDto }),
      ApiResponse({
        status: 201,
        description: 'Call initiated successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            call_id: { type: 'string', example: 'call_507f1f77bcf86cd799439011_1234567890' },
            channel_name: { type: 'string', example: 'channel_507f1f77bcf86cd799439011_1234567890' },
            token: { type: 'string', example: 'agora_token_here' },
            app_id: { type: 'string', example: 'agora_app_id' },
            type: { type: 'string', example: 'voice', enum: ['voice', 'video'] },
            receiver: { type: 'object' },
            expires_in: { type: 'number', example: 3600 },
            caller_uid: { type: 'number', example: 12345 },
            receiver_uid: { type: 'number', example: 67890 },
            uid: { type: 'number', example: 12345 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/accept-call - Accept an incoming call
   */
  acceptCall: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Accept call',
        description: 'Accept an incoming voice or video call. Updates call status and generates token for receiver.',
      }),
      ApiBody({ type: AcceptCallDto }),
      ApiResponse({
        status: 200,
        description: 'Call accepted successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Call accepted' },
            call_id: { type: 'string' },
            channel_name: { type: 'string' },
            token: { type: 'string' },
            app_id: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string', example: 'accepted' },
            receiver_uid: { type: 'number' },
            uid: { type: 'number' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/decline-call - Decline an incoming call
   */
  declineCall: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Decline call',
        description: 'Decline an incoming voice or video call.',
      }),
      ApiBody({ type: DeclineCallDto }),
      ApiResponse({
        status: 200,
        description: 'Call declined successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Call declined' },
            call_id: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string', example: 'declined' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/dismiss-call - Dismiss a call (public endpoint)
   */
  dismissCall: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Dismiss call',
        description: 'Dismiss (busy) an incoming call before accepting. Public endpoint - no auth required.',
      }),
      ApiBody({ type: DismissCallDto }),
      ApiResponse({
        status: 200,
        description: 'Call dismissed successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Call dismissed' },
            call_id: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string', example: 'declined' },
          },
        },
      }),
      ApiErrorResponses(400, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/end-call - End an active call
   */
  endCall: () =>
    applyDecorators(
      ApiOperation({
        summary: 'End call',
        description: 'End an active voice or video call. Calculates duration and updates call status.',
      }),
      ApiBody({ type: EndCallDto }),
      ApiResponse({
        status: 200,
        description: 'Call ended successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Call ended' },
            call_id: { type: 'string' },
            type: { type: 'string' },
            duration: { type: 'number', example: 300 },
            formatted_duration: { type: 'string', example: '05:00' },
            status: { type: 'string', example: 'ended' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/end-all-calls - End all active calls (admin)
   */
  endAllCalls: () =>
    applyDecorators(
      ApiOperation({
        summary: 'End all calls',
        description: 'End all active calls in the system. Admin action.',
      }),
      ApiResponse({
        status: 200,
        description: 'All calls ended successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            ended_count: { type: 'number', example: 5 },
            ended_calls: { type: 'array' },
            errors: { type: 'array' },
            admin_action: { type: 'boolean', example: true },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/voice-calls/end-all-calls-for-user - End all calls for a user
   */
  endAllCallsForUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'End all calls for user',
        description: 'End all active calls for the authenticated user.',
      }),
      ApiResponse({
        status: 200,
        description: 'User calls ended successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            ended_count: { type: 'number' },
            ended_calls: { type: 'array' },
            user: { type: 'object' },
            errors: { type: 'array' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/end-calls-between-users - End calls between two users
   */
  endCallsBetweenUsers: () =>
    applyDecorators(
      ApiOperation({
        summary: 'End calls between users',
        description: 'End all active calls between the authenticated user and another specific user.',
      }),
      ApiBody({ type: EndCallsBetweenUsersDto }),
      ApiResponse({
        status: 200,
        description: 'Calls ended successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            ended_count: { type: 'number' },
            ended_calls: { type: 'array' },
            other_user: { type: 'object' },
            errors: { type: 'array' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * GET /api/public/voice-calls/call-status - Get call status
   */
  callStatus: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get call status',
        description: 'Get the current status and details of a call.',
      }),
      ApiQuery({ name: 'call_id', type: String, required: true }),
      ApiResponse({
        status: 200,
        description: 'Call status retrieved successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            call: {
              type: 'object',
              properties: {
                call_id: { type: 'string' },
                type: { type: 'string' },
                status: { type: 'string' },
                channel_name: { type: 'string' },
                duration: { type: 'number' },
                formatted_duration: { type: 'string' },
                started_at: { type: 'string', format: 'date-time' },
                ended_at: { type: 'string', format: 'date-time', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                is_active: { type: 'boolean' },
                is_completed: { type: 'boolean' },
                caller: { type: 'object' },
                receiver: { type: 'object' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * GET /api/public/voice-calls/get-voice-calls - Get voice calls for a chat
   */
  getVoiceCalls: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get voice calls',
        description: 'Get all voice calls between two users (chat participants).',
      }),
      ApiQuery({ name: 'chat_id', type: String, required: false }),
      ApiQuery({ name: 'user_one', type: String, required: false }),
      ApiQuery({ name: 'user_two', type: String, required: false }),
      ApiResponse({
        status: 200,
        description: 'Voice calls retrieved successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            calls: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  chat_id: { type: 'string', nullable: true },
                  init_call_user_id: { type: 'string' },
                  receiver_id: { type: 'string' },
                  type: { type: 'string' },
                  duration: { type: 'number' },
                  started_at: { type: 'string', format: 'date-time', nullable: true },
                  ended_at: { type: 'string', format: 'date-time', nullable: true },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * GET /api/public/voice-calls/get-user-calls - Get all calls for a user
   */
  getUserCalls: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user calls',
        description: 'Get paginated call history for the authenticated user.',
      }),
      ApiQuery({ name: 'page', type: Number, required: false, example: 1 }),
      ApiQuery({ name: 'limit', type: Number, required: false, example: 20 }),
      ApiResponse({
        status: 200,
        description: 'User calls retrieved successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            calls: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  call_id: { type: 'string' },
                  type: { type: 'string' },
                  status: { type: 'string' },
                  direction: { type: 'string', enum: ['incoming', 'outgoing'] },
                  other_user_id: { type: 'string' },
                  other_user_name: { type: 'string' },
                  other_user_image: { type: 'string', nullable: true },
                  duration: { type: 'number' },
                  formatted_duration: { type: 'string' },
                  created_at: { type: 'string', format: 'date-time' },
                  started_at: { type: 'string', format: 'date-time', nullable: true },
                  ended_at: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                current_page: { type: 'number' },
                total_pages: { type: 'number' },
                total_count: { type: 'number' },
                limit: { type: 'number' },
                has_next: { type: 'boolean' },
                has_prev: { type: 'boolean' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/voice-calls/missed-call - Mark call as missed
   */
  missedCall: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Mark call as missed',
        description: 'Mark a ringing call as missed by the caller and stop ringing on receiver device.',
      }),
      ApiBody({ type: MissedCallDto }),
      ApiResponse({
        status: 200,
        description: 'Call marked as missed successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Call marked as missed' },
            call_id: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string', example: 'missed' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/delete-call - Delete a call from history
   */
  deleteCall: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete call',
        description: 'Delete a call from call history.',
      }),
      ApiBody({ type: DeleteCallDto }),
      ApiResponse({
        status: 200,
        description: 'Call deleted successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Call deleted from history' },
            call_id: { type: 'string' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/update-platform - Update user platform
   */
  updatePlatform: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update platform',
        description: 'Update user device platform for VoIP notifications.',
      }),
      ApiBody({ type: UpdatePlatformDto }),
      ApiResponse({
        status: 200,
        description: 'Platform updated successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Platform updated successfully' },
            platform: { type: 'string', enum: ['ios_voip', 'android_fcm'] },
            user_id: { type: 'string' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/update-voip-token - Update VoIP token
   */
  updateVoipToken: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update VoIP token',
        description: 'Update user iOS PushKit VoIP token.',
      }),
      ApiBody({ type: UpdateVoipTokenDto }),
      ApiResponse({
        status: 200,
        description: 'VoIP token updated successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'VoIP token updated successfully' },
            token_preview: { type: 'string', example: 'a1b2c3d4e5f6...' },
            platform: { type: 'string', example: 'ios_voip' },
            user_id: { type: 'string' },
            note: { type: 'string' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/test-fcm-delivery - Test FCM delivery
   */
  testFcmDelivery: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Test FCM delivery',
        description: 'Test FCM notification delivery status. Useful for debugging ringing issues.',
      }),
      ApiBody({ type: TestFcmDeliveryDto }),
      ApiResponse({
        status: 200,
        description: 'FCM test completed',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Test FCM message sent' },
            delivery_result: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/confirm-call-delivery - Confirm call delivery
   */
  confirmCallDelivery: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Confirm call delivery',
        description: 'Confirm that a call was successfully received by the receiving device. Sends confirmation back to caller.',
      }),
      ApiBody({ type: ConfirmCallDeliveryDto }),
      ApiResponse({
        status: 200,
        description: 'Delivery confirmation sent successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Delivery confirmation sent to caller' },
            call_id: { type: 'string' },
            delivery_status: { type: 'string', enum: ['received', 'displayed', 'ringing'] },
            confirmation_sent_to: { type: 'string' },
            fcm_result: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/send-missed-call-notification - Send missed call notification
   */
  sendMissedCallNotification: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Send missed call notification',
        description: 'Send missed call notification when a call times out or is not answered.',
      }),
      ApiBody({ type: SendMissedCallNotificationDto }),
      ApiResponse({
        status: 200,
        description: 'Missed call notification sent successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Missed call notification sent' },
            call_id: { type: 'string' },
            status: { type: 'string', example: 'missed' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/voice-calls/debug-fcm - Debug FCM
   */
  debugFcm: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Debug FCM',
        description: 'Debug FCM token and test notification delivery.',
      }),
      ApiBody({ type: DebugFcmDto }),
      ApiResponse({
        status: 200,
        description: 'FCM debug completed',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'FCM debug test completed' },
            token_info: { type: 'object' },
            test_result: { type: 'object' },
            recommendations: { type: 'array', items: { type: 'string' } },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/voice-calls/test-voip-push - Test VoIP push
   */
  testVoipPush: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Test VoIP push',
        description: 'Test VoIP push notification with full logging. Sends a real VoIP call notification to test APNs connectivity.',
      }),
      ApiBody({ type: TestVoipPushDto }),
      ApiResponse({
        status: 200,
        description: 'VoIP push test completed',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'VoIP push test completed' },
            test_info: { type: 'object' },
            notification_result: { type: 'object' },
            analysis: { type: 'object' },
            logs: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),
};
