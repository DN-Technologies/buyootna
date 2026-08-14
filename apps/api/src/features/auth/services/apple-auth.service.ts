import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import appleSignin from 'apple-signin-auth';
import { VerifiedSocialProfile } from './google-auth.service';

@Injectable()
export class AppleAuthService {
  private readonly logger = new Logger(AppleAuthService.name);
  private readonly clientId: string | null;

  constructor() {
    this.clientId = process.env.APPLE_CLIENT_ID || null;

    if (!this.clientId) {
      this.logger.warn(
        'APPLE_CLIENT_ID missing in environment variables. Apple Sign-In is disabled.',
      );
    }
  }

  async verifyIdentityToken(
    identityToken: string,
  ): Promise<VerifiedSocialProfile> {
    if (!this.clientId) {
      throw new UnauthorizedException(
        'تسجيل الدخول عبر Apple غير مُفعّل حالياً',
      );
    }

    try {
      const payload = await appleSignin.verifyIdToken(identityToken, {
        audience: this.clientId,
      });

      return { providerId: payload.sub, email: payload.email };
    } catch (err) {
      this.logger.warn('Failed to verify Apple identity token', err as Error);
      throw new UnauthorizedException('فشل التحقق من حساب Apple');
    }
  }
}
