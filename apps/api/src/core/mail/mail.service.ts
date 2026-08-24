import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resendClient: Resend | null = null;
  private readonly fromAddress: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromAddress =
      process.env.RESEND_FROM_EMAIL ?? 'Buyootna <no-reply@buyootna.com>';

    if (apiKey) {
      this.resendClient = new Resend(apiKey);
      this.logger.log('Resend client initialized successfully');
    } else {
      this.logger.warn(
        'RESEND_API_KEY missing in environment variables. Falling back to mock mail mode.',
      );
    }
  }

  /** True when RESEND_API_KEY is unset and sendMail only logs instead of sending. */
  get isMockMode(): boolean {
    return this.resendClient === null;
  }

  async sendMail(options: SendMailOptions): Promise<{ success: boolean }> {
    if (!this.resendClient) {
      this.logger.warn(
        `[MOCK MAIL] Resend is disabled or unconfigured. Would send "${options.subject}" to ${options.to}`,
      );
      return { success: true };
    }

    try {
      const { data, error } = await this.resendClient.emails.send({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        this.logger.error(
          `Failed to send email to ${options.to}: ${error.message}`,
        );
        throw new Error(error.message);
      }

      this.logger.log(`Email sent to ${options.to}. id: ${data?.id}`);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${options.to}: ${message}`);
      throw error;
    }
  }
}
