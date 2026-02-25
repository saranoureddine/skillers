import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { VoiceCallsPublicService } from '../services/voice-calls.public.service';
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
import { Public } from '../../../common/decorators/public.decorator';
import { VoiceCallsPublicControllerDocs } from '../docs/voice-calls.swagger';

/**
 * Public Voice Calls Controller — handles all voice call endpoints matching Yii API
 * All routes prefixed with /public/voice-calls
 */
@Controller('public/voice-calls')
@VoiceCallsPublicControllerDocs.controller()
export class VoiceCallsPublicController {
  constructor(
    private readonly voiceCallsPublicService: VoiceCallsPublicService,
  ) {}

  /**
   * Helper method to extract and validate token
   */
  private async validateToken(req: Request): Promise<string> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.voiceCallsPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('initiate-call')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.initiateCall()
  async initiateCall(@Req() req: Request, @Body() dto: InitiateCallDto) {
    const callerId = await this.validateToken(req);
    return this.voiceCallsPublicService.initiateCall(callerId, dto);
  }

  @Post('accept-call')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.acceptCall()
  async acceptCall(@Req() req: Request, @Body() dto: AcceptCallDto) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.acceptCall(userId, dto);
  }

  @Post('decline-call')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.declineCall()
  async declineCall(@Req() req: Request, @Body() dto: DeclineCallDto) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.declineCall(userId, dto);
  }

  @Post('dismiss-call')
  @Public() // Public endpoint - no auth required
  @VoiceCallsPublicControllerDocs.dismissCall()
  async dismissCall(@Body() dto: DismissCallDto) {
    return this.voiceCallsPublicService.dismissCall(dto);
  }

  @Post('end-call')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.endCall()
  async endCall(@Req() req: Request, @Body() dto: EndCallDto) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.endCall(userId, dto);
  }

  @Post('end-all-calls')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.endAllCalls()
  async endAllCalls(@Req() req: Request) {
    await this.validateToken(req); // Validate but don't use userId
    return this.voiceCallsPublicService.endAllCalls();
  }

  @Post('end-all-calls-for-user')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.endAllCallsForUser()
  async endAllCallsForUser(@Req() req: Request) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.endAllCallsForUser(userId);
  }

  @Post('end-calls-between-users')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.endCallsBetweenUsers()
  async endCallsBetweenUsers(
    @Req() req: Request,
    @Body() dto: EndCallsBetweenUsersDto,
  ) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.endCallsBetweenUsers(userId, dto);
  }

  @Get('call-status')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.callStatus()
  async callStatus(@Req() req: Request, @Query() dto: CallStatusDto) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.getCallStatus(userId, dto);
  }

  @Get('get-voice-calls')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.getVoiceCalls()
  async getVoiceCalls(@Req() req: Request, @Query() dto: GetVoiceCallsDto) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.getVoiceCalls(userId, dto);
  }

  @Get('get-user-calls')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.getUserCalls()
  async getUserCalls(@Req() req: Request, @Query() dto: GetUserCallsDto) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.getUserCalls(userId, dto);
  }

  @Post('missed-call')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.missedCall()
  async missedCall(@Req() req: Request, @Body() dto: MissedCallDto) {
    const callerId = await this.validateToken(req);
    return this.voiceCallsPublicService.missedCall(callerId, dto);
  }

  @Post('delete-call')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.deleteCall()
  async deleteCall(@Req() req: Request, @Body() dto: DeleteCallDto) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.deleteCall(userId, dto);
  }

  @Post('update-platform')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.updatePlatform()
  async updatePlatform(@Req() req: Request, @Body() dto: UpdatePlatformDto) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.updatePlatform(userId, dto);
  }

  @Post('update-voip-token')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.updateVoipToken()
  async updateVoipToken(@Req() req: Request, @Body() dto: UpdateVoipTokenDto) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.updateVoipToken(userId, dto);
  }

  @Post('test-fcm-delivery')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.testFcmDelivery()
  async testFcmDelivery(@Req() req: Request, @Body() dto: TestFcmDeliveryDto) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.testFcmDelivery(userId, dto);
  }

  @Post('confirm-call-delivery')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.confirmCallDelivery()
  async confirmCallDelivery(
    @Req() req: Request,
    @Body() dto: ConfirmCallDeliveryDto,
  ) {
    const receiverId = await this.validateToken(req);
    return this.voiceCallsPublicService.confirmCallDelivery(receiverId, dto);
  }

  @Post('send-missed-call-notification')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.sendMissedCallNotification()
  async sendMissedCallNotification(
    @Req() req: Request,
    @Body() dto: SendMissedCallNotificationDto,
  ) {
    const callerId = await this.validateToken(req);
    return this.voiceCallsPublicService.sendMissedCallNotification(
      callerId,
      dto,
    );
  }

  @Post('debug-fcm')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.debugFcm()
  async debugFcm(@Req() req: Request, @Body() dto: DebugFcmDto) {
    const userId = await this.validateToken(req);
    return this.voiceCallsPublicService.debugFcm(userId, dto);
  }

  @Post('test-voip-push')
  @Public() // Temporarily public - will validate token manually
  @VoiceCallsPublicControllerDocs.testVoipPush()
  async testVoipPush(@Req() req: Request, @Body() dto: TestVoipPushDto) {
    const callerId = await this.validateToken(req);
    return this.voiceCallsPublicService.testVoipPush(callerId, dto);
  }
}
