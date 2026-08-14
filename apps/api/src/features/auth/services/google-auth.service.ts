import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client, LoginTicket } from 'google-auth-library';

export interface VerifiedSocialProfile {
  providerId: string;
  email?: string;
}

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private readonly client: OAuth2Client;
  private readonly clientId: string | null;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || null;
    this.client = new OAuth2Client();

    if (!this.clientId) {
      this.logger.warn(
        'GOOGLE_CLIENT_ID missing in environment variables. Google Sign-In is disabled.',
      );
    }
  }

  async verifyIdToken(idToken: string): Promise<VerifiedSocialProfile> {
    if (!this.clientId) {
      throw new UnauthorizedException(
        'تسجيل الدخول عبر Google غير مُفعّل حالياً',
      );
    }

    let ticket: LoginTicket;

    try {
      ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });
    } catch (err) {
      this.logger.warn('Failed to verify Google ID token', err as Error);
      throw new UnauthorizedException('فشل التحقق من حساب Google');
    }

    const payload = ticket.getPayload();

    if (!payload?.sub) {
      throw new UnauthorizedException('فشل التحقق من حساب Google');
    }

    return { providerId: payload.sub, email: payload.email };
  }
}
