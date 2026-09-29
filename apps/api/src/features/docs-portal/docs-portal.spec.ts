import {
  ExecutionContext,
  ForbiddenException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DocsRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { DocsAuthGuard } from './docs-auth.guard';
import { DOCS_ROLES_KEY } from './docs-portal.constants';
import { DocsLoginLimiterService } from './docs-login-limiter.service';
import { DocsPortalService } from './docs-portal.service';
import { DocsTokenService } from './docs-token.service';

const SECRET = 'docs-secret-for-tests-0123456789abcdef';
const SET_AT = new Date('2026-09-29T10:00:00Z');

describe('docs portal access', () => {
  let prisma: {
    docsRoleCredential: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let tokens: DocsTokenService;
  let limiter: DocsLoginLimiterService;
  let service: DocsPortalService;
  let qaHash: string;

  beforeAll(async () => {
    qaHash = await bcrypt.hash('correct horse battery', 4);
  });

  beforeEach(() => {
    process.env.DOCS_JWT_SECRET = SECRET;
    prisma = {
      docsRoleCredential: {
        findUnique: jest.fn(({ where }: { where: { role: DocsRole } }) =>
          Promise.resolve(
            where.role === DocsRole.QA
              ? { role: DocsRole.QA, passwordHash: qaHash, updatedAt: SET_AT }
              : null,
          ),
        ),
        upsert: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    tokens = new DocsTokenService();
    limiter = new DocsLoginLimiterService();
    service = new DocsPortalService(
      prisma as unknown as PrismaService,
      tokens,
      limiter,
    );
  });

  describe('login', () => {
    it('signs in with the role password and names the person', async () => {
      const result = await service.login(
        DocsRole.QA,
        'correct horse battery',
        'Sara',
        '1.1.1.1',
      );

      expect(result.user).toEqual({ role: DocsRole.QA, name: 'Sara' });
      expect(tokens.verify(result.accessToken)).toMatchObject({
        role: DocsRole.QA,
        name: 'Sara',
        kind: 'docs',
        ver: SET_AT.getTime(),
      });
    });

    it('refuses a wrong password, and a role with no password set', async () => {
      await expect(
        service.login(DocsRole.QA, 'wrong', 'Sara', '1.1.1.1'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        service.login(DocsRole.ADMIN, 'anything', 'Sara', '1.1.1.1'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('locks an IP out of a role after 5 wrong passwords', async () => {
      for (let i = 0; i < 5; i++) {
        await expect(
          service.login(DocsRole.QA, 'wrong', 'x', '2.2.2.2'),
        ).rejects.toBeInstanceOf(UnauthorizedException);
      }
      // Even the right password is refused while locked
      await expect(
        service.login(DocsRole.QA, 'correct horse battery', 'x', '2.2.2.2'),
      ).rejects.toBeInstanceOf(HttpException);
      await expect(
        service.login(DocsRole.QA, 'correct horse battery', 'x', '2.2.2.2'),
      ).rejects.toMatchObject({ status: 429 });
      // Another IP is unaffected
      await expect(
        service.login(DocsRole.QA, 'correct horse battery', 'x', '3.3.3.3'),
      ).resolves.toBeDefined();
    });

    it('lets the lock expire after 15 minutes', () => {
      const t0 = Date.now();
      for (let i = 0; i < 5; i++) limiter.recordFailure('k', t0);
      expect(() => limiter.assertAllowed('k', t0)).toThrow(HttpException);
      expect(() =>
        limiter.assertAllowed('k', t0 + 15 * 60 * 1000 + 1),
      ).not.toThrow();
    });
  });

  describe('tokens', () => {
    it('rejects an app token signed with the app secret', () => {
      const appToken = new JwtService().sign(
        { sub: 'user-1', ident: 'i-1', type: 'INDIVIDUAL' },
        { secret: 'the-app-jwt-secret-is-different-000000' },
      );
      expect(tokens.verify(appToken)).toBeNull();
    });

    it('rejects a token signed with the docs secret but not marked as docs', () => {
      const forged = new JwtService().sign(
        { role: 'ADMIN', name: 'x', ver: SET_AT.getTime() },
        { secret: SECRET },
      );
      expect(tokens.verify(forged)).toBeNull();
    });

    it('refuses to work without a strong DOCS_JWT_SECRET', () => {
      process.env.DOCS_JWT_SECRET = 'short';
      expect(() =>
        tokens.sign({ role: DocsRole.QA, name: 'x' }, SET_AT.getTime()),
      ).toThrow('بوابة التوثيق غير مهيأة');
    });
  });

  describe('DocsAuthGuard', () => {
    const contextFor = (token: string | null, roles?: DocsRole[]) => {
      const request: Record<string, unknown> = {
        headers: token ? { authorization: `Bearer ${token}` } : {},
      };
      const reflector = {
        getAllAndOverride: jest.fn((key: string) =>
          key === DOCS_ROLES_KEY ? roles : undefined,
        ),
      } as unknown as Reflector;
      const guard = new DocsAuthGuard(
        reflector,
        tokens,
        prisma as unknown as PrismaService,
      );
      const ctx = {
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => undefined,
        getClass: () => undefined,
      } as unknown as ExecutionContext;
      return { guard, ctx, request };
    };
    const qaToken = () =>
      tokens.sign({ role: DocsRole.QA, name: 'Sara' }, SET_AT.getTime());

    it('lets a signed-in role through and exposes who it is', async () => {
      const { guard, ctx, request } = contextFor(qaToken());
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(request.docsUser).toEqual({ role: DocsRole.QA, name: 'Sara' });
    });

    it('refuses no token', async () => {
      const { guard, ctx } = contextFor(null);
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('refuses a role the route is not open to', async () => {
      const { guard, ctx } = contextFor(qaToken(), [DocsRole.ADMIN]);
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('signs a role out once its password has been changed', async () => {
      const token = qaToken();
      prisma.docsRoleCredential.findUnique.mockResolvedValue({
        updatedAt: new Date(SET_AT.getTime() + 60_000),
      });
      const { guard, ctx } = contextFor(token);
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  it('stores only a hash when a password is set', async () => {
    await service.setPassword(
      DocsRole.CLIENT,
      'a-long-client-password',
      'Admin',
    );

    const [args] = prisma.docsRoleCredential.upsert.mock.calls[0] as [
      { create: { passwordHash: string; updatedBy: string } },
    ];
    expect(args.create.passwordHash).not.toContain('a-long-client-password');
    await expect(
      bcrypt.compare('a-long-client-password', args.create.passwordHash),
    ).resolves.toBe(true);
    expect(args.create.updatedBy).toBe('Admin');
  });
});
