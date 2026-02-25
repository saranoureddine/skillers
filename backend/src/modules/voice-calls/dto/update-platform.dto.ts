import { IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlatformDto {
  @ApiProperty({
    description: 'Device platform',
    example: 'ios_voip',
    enum: ['ios_voip', 'android_fcm'],
  })
  @IsNotEmpty()
  @IsIn(['ios_voip', 'android_fcm'])
  platform: string;
}
