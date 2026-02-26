import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { WebSocketManageDto } from '../dto';
import { ApiErrorResponses } from '../../../common/swagger';

// ============================================================================
// WebSocket Management Controller Documentation
// ============================================================================

export const WebSocketManageControllerDocs = {
  /**
   * Controller-level decorators
   */
  controller: () =>
    applyDecorators(
      ApiTags('WebSocket Management'),
      ApiHeader({
        name: 'X-WS-Admin-Token',
        description: 'WebSocket management authentication token',
        required: true,
        example: 'your-secret-token',
      }),
    ),

  /**
   * POST /websocket-manage/start - Start WebSocket server
   */
  start: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Start WebSocket server',
        description: 'Start the WebSocket server on the specified port. Requires X-WS-Admin-Token header.',
      }),
      ApiBody({ type: WebSocketManageDto }),
      ApiResponse({
        status: 200,
        description: 'Server started successfully or already running',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Started' },
            pid: { type: 'number', nullable: true, example: 12345 },
            port: { type: 'number', example: 8092 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /websocket-manage/stop - Stop WebSocket server
   */
  stop: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Stop WebSocket server',
        description: 'Gracefully stop the WebSocket server. Requires X-WS-Admin-Token header.',
      }),
      ApiBody({ type: WebSocketManageDto }),
      ApiResponse({
        status: 200,
        description: 'Server stopped successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Stopped' },
            killed: { type: 'array', items: { type: 'number' }, example: [12345] },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /websocket-manage/status - Get WebSocket server status
   */
  status: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get WebSocket server status',
        description: 'Check if the WebSocket server is running. Requires X-WS-Admin-Token header.',
      }),
      ApiBody({ type: WebSocketManageDto }),
      ApiResponse({
        status: 200,
        description: 'Status retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            running: { type: 'boolean', example: true },
            pid: { type: 'number', nullable: true, example: 12345 },
            port: { type: 'number', example: 8092 },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /websocket-manage/force-kill - Force kill WebSocket processes
   */
  forceKill: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Force kill WebSocket processes',
        description: 'Forcefully kill all processes listening on the specified port. Requires X-WS-Admin-Token header.',
      }),
      ApiBody({ type: WebSocketManageDto }),
      ApiResponse({
        status: 200,
        description: 'Processes killed successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Force kill completed' },
            port: { type: 'number', example: 8092 },
            killed: { type: 'array', items: { type: 'number' }, example: [12345] },
            remaining: { type: 'array', items: { type: 'number' }, example: [] },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),
};
