export interface IEmailService {
  sendOtp(email: string, otp: string): Promise<void>;
  sendPasswordReset(
    email: string,
    userId: string,
    token: string,
  ): Promise<void>;
}
