export type PasswordResetPayload = {
  userId: string;
  hashedToken: string;
  expiresAt: Date;
};
