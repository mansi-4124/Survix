import { Injectable } from '@nestjs/common';
import { IEmailService } from '../domain/interfaces/email-service.interface';
import { EmailSenderService } from 'src/common/email/email.service';
import { buildSurvixEmailHtml } from 'src/common/email/email-template';

@Injectable()
export class EmailService implements IEmailService {
  constructor(private readonly emailSender: EmailSenderService) {}

  async sendOtp(email: string, otp: string): Promise<void> {
    const verifyUrl = `${process.env.FRONTEND_URL ?? ''}/verify-email?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`;
    await this.emailSender.sendMail({
      to: email,
      subject: 'Your Survix verification code',
      text: `Your verification code is ${otp}. It will expire in 5 minutes.`,
      html: buildSurvixEmailHtml({
        heading: 'Verify Your Email',
        body: `Your verification code is ${otp}. It will expire in 5 minutes.`,
        actionLabel: 'Verify Email',
        actionUrl: verifyUrl,
      }),
    });
  }

  async sendPasswordReset(
    email: string,
    userId: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL ?? ''}/reset-password?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`;
    await this.emailSender.sendMail({
      to: email,
      subject: 'Reset your Survix password',
      text: `Click on this button to redirect to the reset password page`,
      html: buildSurvixEmailHtml({
        heading: 'Reset Your Password',
        body: `Click the button below to reset your password.`,
        actionLabel: 'Reset Password',
        actionUrl: resetUrl,
      }),
    });
  }
}
