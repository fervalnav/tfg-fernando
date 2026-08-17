import type { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn((options: unknown) => {
  void options;
  return { sendMail: mockSendMail };
});

jest.mock('nodemailer', () => ({
  createTransport: (options: unknown) => mockCreateTransport(options),
}));

describe('EmailService', () => {
  beforeEach(() => {
    mockSendMail.mockReset().mockResolvedValue(undefined);
    mockCreateTransport.mockClear();
  });

  it('enables authenticated TLS and uses the configured sender', async () => {
    const service = new EmailService(
      config({
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_SECURE: 'false',
        SMTP_IGNORE_TLS: 'false',
        SMTP_REQUIRE_TLS: 'true',
        SMTP_USER: 'lia',
        SMTP_PASSWORD: 'secret',
        SMTP_FROM: 'no-reply@example.com',
      }),
    );

    await service.sendMail({ to: 'user@example.com', subject: 'Invitation', html: '<p>Join</p>' });

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        ignoreTLS: false,
        requireTLS: true,
        auth: { user: 'lia', pass: 'secret' },
      }),
    );
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: '"LIA" <no-reply@example.com>', to: 'user@example.com' }),
    );
  });
});

function config(values: Record<string, string | number>): ConfigService {
  return {
    get: jest.fn((key: string, defaultValue: unknown) => values[key] ?? defaultValue),
  } as unknown as ConfigService;
}
