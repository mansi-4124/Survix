export interface IOtpService {
  generateOtp(email: string): Promise<string>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
  invalidateOtp(email: string): Promise<void>;
}
