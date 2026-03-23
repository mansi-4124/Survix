import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthTokensDto {
  @ApiProperty({
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiPropertyOptional({
    description:
      'JWT refresh token. Prefer using the httpOnly cookie; this field may be omitted by configuration.',
  })
  refreshToken?: string;

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
