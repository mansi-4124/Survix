export type OtpPayload = {
  email: string;
  hashedOtp: string;
  expiresAt: Date;
};
