import { RefreshSession } from '../types/refresh-session.type';

export interface ISessionStore {
  create(session: RefreshSession): Promise<RefreshSession>;
  findBySessionId(sessionId: string): Promise<RefreshSession | null>;
  delete(sessionId: string): Promise<void>;
  deleteAllByUser(userId: string): Promise<void>;
}
