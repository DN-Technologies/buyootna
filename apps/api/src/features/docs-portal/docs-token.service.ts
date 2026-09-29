import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DocsTokenPayload, DocsUser } from './docs-portal.constants';

const TOKEN_TTL = '12h';

/**
 * Signs and checks docs-portal tokens with their own secret
 * (DOCS_JWT_SECRET), so a docs token is never accepted by the app's
 * JwtStrategy and an app token is never accepted here.
 */
@Injectable()
export class DocsTokenService {
  private readonly jwt = new JwtService();

  private secret(): string {
    const secret = process.env.DOCS_JWT_SECRET;
    // No fallback: a guessable secret would let anyone mint an admin token
    if (!secret || secret.length < 32) {
      throw new ServiceUnavailableException('بوابة التوثيق غير مهيأة');
    }
    return secret;
  }

  sign(user: DocsUser, passwordVersion: number): string {
    const payload: DocsTokenPayload = {
      ...user,
      kind: 'docs',
      ver: passwordVersion,
    };
    return this.jwt.sign(payload, {
      secret: this.secret(),
      expiresIn: TOKEN_TTL,
    });
  }

  /** The token's claims, or null for an invalid/expired/foreign token. */
  verify(token: string): DocsTokenPayload | null {
    try {
      const payload = this.jwt.verify<DocsTokenPayload>(token, {
        secret: this.secret(),
      });
      return payload.kind === 'docs' ? payload : null;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      return null;
    }
  }
}
