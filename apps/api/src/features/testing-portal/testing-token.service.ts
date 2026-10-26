import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TestingTokenPayload, TestingUser } from './testing-portal.constants';

const TOKEN_TTL = '12h';

/**
 * Signs and checks testing-portal tokens with their own secret
 * (TESTING_JWT_SECRET), so they're never accepted by the app or the docs
 * portal, and theirs never here.
 */
@Injectable()
export class TestingTokenService {
  private readonly jwt = new JwtService();

  private secret(): string {
    const secret = process.env.TESTING_JWT_SECRET;
    // No fallback: a guessable secret would let anyone mint a token
    if (!secret || secret.length < 32) {
      throw new ServiceUnavailableException('بوابة الاختبار غير مهيأة');
    }
    return secret;
  }

  sign(user: TestingUser, passwordVersion: number): string {
    const payload: TestingTokenPayload = {
      ...user,
      kind: 'testing',
      ver: passwordVersion,
    };
    return this.jwt.sign(payload, {
      secret: this.secret(),
      expiresIn: TOKEN_TTL,
    });
  }

  /** The token's claims, or null for an invalid/expired/foreign token. */
  verify(token: string): TestingTokenPayload | null {
    try {
      const payload = this.jwt.verify<TestingTokenPayload>(token, {
        secret: this.secret(),
      });
      return payload.kind === 'testing' ? payload : null;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      return null;
    }
  }
}
