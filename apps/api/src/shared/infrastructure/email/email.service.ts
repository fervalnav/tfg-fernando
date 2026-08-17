import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASSWORD');
    const secure = config.get<string>('SMTP_SECURE', 'false') === 'true';

    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST', 'localhost'),
      port: config.get<number>('SMTP_PORT', 1025),
      secure,
      ignoreTLS: config.get<string>('SMTP_IGNORE_TLS', 'false') === 'true',
      requireTLS: config.get<string>('SMTP_REQUIRE_TLS', 'false') === 'true',
      auth: user && pass ? { user, pass } : undefined,
    });
    this.from = config.get<string>('SMTP_FROM', 'no-reply@tfg.local');
  }

  async sendMail(params: { to: string; subject: string; html: string }): Promise<void> {
    await this.transporter.sendMail({
      from: `"LIA" <${this.from}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  }
}
