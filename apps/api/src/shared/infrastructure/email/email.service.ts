import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST', 'localhost'),
      port: config.get<number>('SMTP_PORT', 1025),
      secure: false,
      ignoreTLS: true,
    });
  }

  async sendMail(params: { to: string; subject: string; html: string }): Promise<void> {
    await this.transporter.sendMail({
      from: `"TFG App" <no-reply@tfg.local>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  }
}
