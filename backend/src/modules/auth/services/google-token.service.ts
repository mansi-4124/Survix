import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export type GoogleProfile = {
  email: string;
  name?: string;
  picture?: string;
};

@Injectable()
export class GoogleTokenService {
  private readonly client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not configured');
    }

    this.client = new OAuth2Client(clientId);
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();

      if (!payload?.email) {
        throw new UnauthorizedException('Google token did not contain email');
      }

      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
