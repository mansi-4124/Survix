import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDto {
  @ApiProperty({
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token (httpOnly cookie is preferred)',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Access token expiration in seconds',
    example: 900,
  })
  accessTokenExpiresIn: number;

  @ApiProperty({
    description: 'Refresh token expiration in seconds',
    example: 604800,
  })
  refreshTokenExpiresIn: number;
}
