import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

type SendMailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);
  private readonly transporter: ReturnType<
    typeof nodemailer.createTransport
  > | null;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const service = this.configService.get<string>('EMAIL_SERVICE') ?? 'gmail';
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASSWORD');

    if (!user || !pass) {
      this.logger.warn(
        'Email credentials are not fully configured. Emails will not be sent.',
      );
    }

    this.fromAddress = user ?? 'no-reply@example.com';

    this.transporter =
      user && pass
        ? nodemailer.createTransport({
            service,
            auth: {
              user,
              pass,
            },
          })
        : null;
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `Skipping email to ${options.to} because transporter is not configured`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${(error as Error).message}`,
      );
    }
  }
}
