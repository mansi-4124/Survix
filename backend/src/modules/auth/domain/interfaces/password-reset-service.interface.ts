export interface IPasswordResetService {
  storeResetToken(userId: string, rawToken: string): Promise<void>;
  verifyResetToken(userId: string, token: string): Promise<boolean>;
  clearResetToken(userId: string): Promise<void>;
}
