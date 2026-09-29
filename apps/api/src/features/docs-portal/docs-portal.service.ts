import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DocsRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { DocsUser } from './docs-portal.constants';
import { DocsLoginLimiterService } from './docs-login-limiter.service';
import { DocsTokenService } from './docs-token.service';

// Compared against when a role has no password yet, so an unset role takes
// as long to refuse as a wrong password (no timing hint either way)
const DUMMY_HASH = bcrypt.hashSync('no-password-set', 10);

@Injectable()
export class DocsPortalService {
  private readonly logger = new Logger(DocsPortalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: DocsTokenService,
    private readonly limiter: DocsLoginLimiterService,
  ) {}

  async login(role: DocsRole, password: string, name: string, ip?: string) {
    const limitKey = `${ip ?? 'unknown'}:${role}`;
    this.limiter.assertAllowed(limitKey);

    const credential = await this.prisma.docsRoleCredential.findUnique({
      where: { role },
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
    const user: DocsUser = { role, name };
    return {
      accessToken: this.tokens.sign(user, credential.updatedAt.getTime()),
      user,
    };
  }

  /** Sets (or rotates) a role's password; the old one stops working at once. */
  async setPassword(role: DocsRole, password: string, updatedBy: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.docsRoleCredential.upsert({
      where: { role },
      create: { role, passwordHash, updatedBy },
      update: { passwordHash, updatedBy },
    });
    this.logger.log(`Docs password for ${role} set by ${updatedBy}`);
    return { role, updatedBy };
  }

  /** Which roles have a password set, and when (never the hashes). */
  listRoles() {
    return this.prisma.docsRoleCredential.findMany({
      select: { role: true, updatedBy: true, updatedAt: true },
      orderBy: { role: 'asc' },
    });
  }
}
