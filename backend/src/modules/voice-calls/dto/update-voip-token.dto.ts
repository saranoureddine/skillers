import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVoipTokenDto {
  @ApiProperty({
    description: 'iOS PushKit VoIP token',
    example: 'a1b2c3d4e5f6...',
  })
  @IsNotEmpty()
  @IsString()
  voipToken: string;
}
