import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google ID token obtained from client-side Google auth',
  })
  @IsString()
  @IsNotEmpty()
  googleToken: string;
}
