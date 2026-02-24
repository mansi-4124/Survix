import { Injectable } from '@nestjs/common';
import { IEmailService } from '../domain/interfaces/email-service.interface';
import { EmailSenderService } from 'src/common/email/email.service';

@Injectable()
export class EmailService implements IEmailService {
  constructor(private readonly emailSender: EmailSenderService) {}

  async sendOtp(email: string, otp: string): Promise<void> {
    await this.emailSender.sendMail({
      to: email,
      subject: 'Your Survix verification code',
      text: `Your verification code is ${otp}. It will expire in 5 minutes.`,
      html: `<p>Your verification code is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
    });
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    await this.emailSender.sendMail({
      to: email,
      subject: 'Reset your Survix password',
      text: `Use this token to reset your password: ${token}. If you did not request this, you can ignore this email.`,
      html: `<p>Use this token to reset your password:</p><p><strong>${token}</strong></p><p>If you did not request this, you can ignore this email.</p>`,
    });
  }
}
