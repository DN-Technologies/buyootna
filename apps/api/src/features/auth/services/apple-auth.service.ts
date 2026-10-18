import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import appleSignin from 'apple-signin-auth';
import { VerifiedSocialProfile } from './google-auth.service';

@Injectable()
export class AppleAuthService {
  private readonly logger = new Logger(AppleAuthService.name);
  // The app bundle IDs Apple tokens may be issued to. Comma-separated, so
  // the old and the new iOS bundle both sign in while users move over
  private readonly clientIds: string[];

  constructor() {
    this.clientIds = (process.env.APPLE_CLIENT_ID ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (this.clientIds.length === 0) {
      this.logger.warn(
        'APPLE_CLIENT_ID missing in environment variables. Apple Sign-In is disabled.',
      );
    }
  }

  async verifyIdentityToken(
    identityToken: string,
  ): Promise<VerifiedSocialProfile> {
    if (this.clientIds.length === 0) {
      throw new UnauthorizedException(
        'تسجيل الدخول عبر Apple غير مُفعّل حالياً',
      );
    }

    try {
      const payload = await appleSignin.verifyIdToken(identityToken, {
        audience: this.clientIds,
      });

      return { providerId: payload.sub, email: payload.email };
    } catch (err) {
      this.logger.warn('Failed to verify Apple identity token', err as Error);
      throw new UnauthorizedException('فشل التحقق من حساب Apple');
    }
  }
}
