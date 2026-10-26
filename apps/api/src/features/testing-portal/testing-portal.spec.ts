import { HttpException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DocsLoginLimiterService } from '../docs-portal/docs-login-limiter.service';
import { TestingAuthGuard } from './testing-auth.guard';
import { TestingPortalService } from './testing-portal.service';
import { TestingTokenService } from './testing-token.service';

const SECRET = 'x'.repeat(40);

describe('Testing portal sign-in', () => {
  const updatedAt = new Date('2026-10-26T10:00:00Z');
  let prisma: { testingCredential: { findUnique: jest.Mock } };
  let audit: { record: jest.Mock };
  let service: TestingPortalService;
  const tokens = new TestingTokenService();

  beforeAll(async () => {
    process.env.TESTING_JWT_SECRET = SECRET;
  });

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('correct-horse-1', 4);
    prisma = {
      testingCredential: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ kind: 'LOGIN', passwordHash, updatedAt }),
      },
    };
    audit = { record: jest.fn() };
    service = new TestingPortalService(
      prisma as never,
      tokens,
      new DocsLoginLimiterService(),
      audit as never,
    );
  });

  it('signs a tester in, records it, and the token passes the guard', async () => {
    const result = await service.login(
      'correct-horse-1',
      'Ahmed (QA)',
      '1.2.3.4',
    );
    expect(result.user).toEqual({ name: 'Ahmed (QA)' });
    expect(audit.record).toHaveBeenCalledWith({
      actorName: 'Ahmed (QA)',
      action: 'SIGN_IN',
      ip: '1.2.3.4',
    });

    const guard = new TestingAuthGuard(tokens, prisma as never);
    const request = {
      headers: { authorization: `Bearer ${result.accessToken}` },
    } as never;
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as never;
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('refuses a wrong password and locks the IP after 5 tries', async () => {
    for (let i = 0; i < 5; i++) {
      await expect(service.login('wrong', 'X', '9.9.9.9')).rejects.toThrow(
        UnauthorizedException,
      );
    }
    await expect(
      service.login('correct-horse-1', 'X', '9.9.9.9'),
    ).rejects.toThrow(HttpException);
  });

  it('refuses when no password is set yet', async () => {
    prisma.testingCredential.findUnique.mockResolvedValue(null);
    await expect(service.login('anything', 'X')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('signs everyone out when the password changes (token version)', async () => {
    const { accessToken } = await service.login('correct-horse-1', 'Ahmed');
    prisma.testingCredential.findUnique.mockResolvedValue({
      updatedAt: new Date('2026-10-27T10:00:00Z'),
    });
    const guard = new TestingAuthGuard(tokens, prisma as never);
    const request = {
      headers: { authorization: `Bearer ${accessToken}` },
    } as never;
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as never;
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("doesn't accept a docs-portal token", async () => {
    const guard = new TestingAuthGuard(tokens, prisma as never);
    const docsToken = new JwtService().sign(
      { name: 'X', kind: 'docs', ver: updatedAt.getTime() },
      { secret: SECRET },
    );
    const request = {
      headers: { authorization: `Bearer ${docsToken}` },
    } as never;
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as never;
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
