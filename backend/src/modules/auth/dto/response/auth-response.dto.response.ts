import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto.response';
import { AuthTokensDto } from './auth-tokens.dto.response';

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens: AuthTokensDto;
}
