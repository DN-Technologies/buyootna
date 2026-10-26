import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { TestingCredentialKind } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { DocsLoginLimiterService } from '../docs-portal/docs-login-limiter.service';
import { TestingAuditService } from './testing-audit.service';
import { TestingTokenService } from './testing-token.service';

// Compared against when no password is set yet, so an unset portal takes
// as long to refuse as a wrong password (no timing hint either way)
const DUMMY_HASH = bcrypt.hashSync('no-password-set', 10);

/** Sign-in with the portal's password, and setting its passwords. */
@Injectable()
export class TestingPortalService {
  private readonly logger = new Logger(TestingPortalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TestingTokenService,
    private readonly limiter: DocsLoginLimiterService,
    private readonly audit: TestingAuditService,
  ) {}

  async login(password: string, name: string, ip?: string) {
    const limitKey = `${ip ?? 'unknown'}:testing`;
    this.limiter.assertAllowed(limitKey);

    const credential = await this.prisma.testingCredential.findUnique({
      where: { kind: TestingCredentialKind.LOGIN },
    });
    const matches = await bcrypt.compare(
      password,
      credential?.passwordHash ?? DUMMY_HASH,
    );
    if (!credential || !matches) {
      this.limiter.recordFailure(limitKey);
      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    this.limiter.reset(limitKey);
    await this.audit.record({ actorName: name, action: 'SIGN_IN', ip });
    return {
      accessToken: this.tokens.sign({ name }, credential.updatedAt.getTime()),
      user: { name },
    };
  }

  /** Whether the danger password matches (asked again before destructive tools). */
  async checkDangerPassword(password: string): Promise<boolean> {
    const credential = await this.prisma.testingCredential.findUnique({
      where: { kind: TestingCredentialKind.DANGER },
    });
    const matches = await bcrypt.compare(
      password,
      credential?.passwordHash ?? DUMMY_HASH,
    );
    return !!credential && matches;
  }

  /** Sets (or rotates) a password; a new LOGIN one signs everyone out. */
  async setPassword(
    kind: TestingCredentialKind,
    password: string,
    updatedBy: string,
  ) {
    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.testingCredential.upsert({
      where: { kind },
      create: { kind, passwordHash, updatedBy },
      update: { passwordHash, updatedBy },
    });
    this.logger.log(`Testing ${kind} password set by ${updatedBy}`);
    return { kind, updatedBy };
  }
}
