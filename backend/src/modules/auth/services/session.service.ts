import { Inject, Injectable } from '@nestjs/common';
import { type ISessionStore } from '../domain/interfaces/session-store.interface';
import { RefreshSession } from '../domain/types/refresh-session.type';
import { type IHashingService } from '../domain/interfaces/hashing-service.interface';
import { AUTH_TOKENS } from '../auth.tokens';

@Injectable()
export class SessionService {
  constructor(
    @Inject(AUTH_TOKENS.SESSION_STORE)
    private readonly sessionStore: ISessionStore,

    @Inject(AUTH_TOKENS.HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

  async createSession(
    userId: string,
    sessionId: string,
    refreshToken: string,
    expiresIn: number,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<string> {
    const hashed = await this.hashingService.hash(refreshToken);

    const session: RefreshSession = {
      sessionId,
      userId,
      refreshTokenHash: hashed,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      createdAt: new Date(),
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    };

    const created = await this.sessionStore.create(session);

    return created.sessionId;
  }

  async validateSession(
    sessionId: string,
    refreshToken: string,
  ): Promise<RefreshSession | null> {
    const session = await this.sessionStore.findBySessionId(sessionId);
    if (!session) return null;

    const isValid = await this.hashingService.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isValid) return null;

    if (session.expiresAt < new Date()) return null;

    return session;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.sessionStore.delete(sessionId);
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    await this.sessionStore.deleteAllByUser(userId);
  }
}
