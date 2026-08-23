import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: Twilio.Twilio | null = null;
  private serviceSid: string | null = null;
  // Dev-only: codes generated in mock SMS mode (Twilio unconfigured), keyed
  // by formatted phone number, so checkVerification can validate them.
  private readonly mockCodes = new Map<string, string>();

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (accountSid && authToken && serviceSid) {
      try {
        this.twilioClient = Twilio(accountSid, authToken);
        this.serviceSid = serviceSid;
        this.logger.log('Twilio Verify client initialized successfully');
      } catch (err) {
        this.logger.error('Failed to initialize Twilio client:', err);
      }
    } else {
      this.logger.warn(
        'Twilio credentials missing in environment variables. Falling back to mock SMS mode.',
      );
    }
  }

  /**
   * Format phone numbers into standard E.164 format.
   * Defaults Kuwait 8-digit numbers to +965.
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    if (cleaned.startsWith('00')) {
      return '+' + cleaned.substring(2);
    }
    // Handle local 8-digit Kuwait numbers (e.g. 99998888 -> +96599998888)
    if (cleaned.length === 8) {
      return `+965${cleaned}`;
    }
    return `+${cleaned}`;
  }

  /**
   * Send an OTP verification SMS using Twilio Verify API.
   */
  async sendVerification(phone: string): Promise<{ success: boolean }> {
    const formattedPhone = this.formatPhoneNumber(phone);

    if (!this.twilioClient || !this.serviceSid) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.mockCodes.set(formattedPhone, code);
      this.logger.warn(
        `[MOCK SMS] Twilio is disabled or unconfigured. OTP code for ${formattedPhone}: ${code}`,
      );
      return { success: true };
    }

    try {
      const verification = await this.twilioClient.verify.v2
        .services(this.serviceSid)
        .verifications.create({
          to: formattedPhone,
          channel: 'sms',
        });

      this.logger.log(
        `Twilio OTP verification sent to ${formattedPhone}. Status: ${verification.status}`,
      );
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send Twilio verification to ${formattedPhone}: ${message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check an OTP verification code using Twilio Verify API.
   */
  async checkVerification(phone: string, code: string): Promise<boolean> {
    const formattedPhone = this.formatPhoneNumber(phone);

    if (!this.twilioClient || !this.serviceSid) {
      const expectedCode = this.mockCodes.get(formattedPhone);
      const isValid = !!expectedCode && expectedCode === code;
      this.logger.warn(
        `[MOCK SMS] Twilio is unconfigured. Verification check for ${formattedPhone} with code ${code}: ${isValid ? 'valid' : 'invalid'}.`,
      );
      if (isValid) {
        this.mockCodes.delete(formattedPhone);
      }
      return isValid;
    }

    try {
      const check = await this.twilioClient.verify.v2
        .services(this.serviceSid)
        .verificationChecks.create({
          to: formattedPhone,
          code,
        });

      this.logger.log(
        `Twilio verification check for ${formattedPhone}. Status: ${check.status}`,
      );
      return check.status === 'approved';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to verify Twilio OTP for ${formattedPhone}: ${message}`,
        error,
      );
      return false;
    }
  }
}
