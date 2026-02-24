import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptInviteDtoRequest {
  @ApiProperty({
    description: 'Raw invite token sent via email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

