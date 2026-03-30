import { RefreshSession } from '../types/refresh-session.type';

export interface ISessionStore {
  create(session: RefreshSession): Promise<RefreshSession>;
  findBySessionId(sessionId: string): Promise<RefreshSession | null>;
  update(
    sessionId: string,
    data: {
      refreshTokenHash: string;
      expiresAt: Date;
      userAgent?: string;
      ipAddress?: string;
    },
  ): Promise<void>;
  delete(sessionId: string): Promise<void>;
  deleteAllByUser(userId: string): Promise<void>;
  deleteOldestByUser(userId: string, keepLatest: number): Promise<void>;
}
