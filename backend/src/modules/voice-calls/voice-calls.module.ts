import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoiceCallEntity } from './entities/voice-call.entity';
import { VoiceCallsPublicService } from './services/voice-calls.public.service';
import { VoiceCallsPublicController } from './controllers/voice-calls.public.controller';
import { UserEntity } from '../users/entities/user.entity';
import { AgoraService } from './services/agora.service';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([VoiceCallEntity, UserEntity])],
  providers: [VoiceCallsPublicService, AgoraService, NotificationService],
  controllers: [VoiceCallsPublicController],
  exports: [VoiceCallsPublicService],
})
export class VoiceCallsModule {}
