import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IdentityType } from '@prisma/client';
import { IdentityTypeGuard } from './identity-type.guard';
import type { RequestUser } from '../../features/auth/strategies/jwt.strategy';

describe('IdentityTypeGuard', () => {
  let guard: IdentityTypeGuard;
  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new IdentityTypeGuard(mockReflector as unknown as Reflector);
  });

  const buildContext = (user?: Partial<RequestUser>): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  it('allows the request through when no @RequireIdentityType metadata is set', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(buildContext());

    expect(result).toBe(true);
  });

  it('allows the request through when the metadata is an empty array', () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);

    const result = guard.canActivate(buildContext());

    expect(result).toBe(true);
  });

  it('throws ForbiddenException when there is no request.user', () => {
    mockReflector.getAllAndOverride.mockReturnValue([IdentityType.INDIVIDUAL]);

    expect(() => guard.canActivate(buildContext(undefined))).toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when request.user has no identityType', () => {
    mockReflector.getAllAndOverride.mockReturnValue([IdentityType.INDIVIDUAL]);

    expect(() => guard.canActivate(buildContext({ userId: 'user-1' }))).toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException with an Arabic message when identityType does not match', () => {
    mockReflector.getAllAndOverride.mockReturnValue([IdentityType.INDIVIDUAL]);

    expect(() =>
      guard.canActivate(buildContext({ identityType: IdentityType.COMPANY })),
    ).toThrow('هذه الميزة متاحة فقط لـ: فرد');
  });

  it('joins multiple required type names with "أو" when more than one type is allowed', () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      IdentityType.INDIVIDUAL,
      IdentityType.COMPANY,
    ]);

    expect(() =>
      guard.canActivate(buildContext({ identityType: IdentityType.OFFICE })),
    ).toThrow('هذه الميزة متاحة فقط لـ: فرد أو شركة');
  });

  it('returns true when identityType matches one of the required types', () => {
    mockReflector.getAllAndOverride.mockReturnValue([IdentityType.INDIVIDUAL]);

    const result = guard.canActivate(
      buildContext({ identityType: IdentityType.INDIVIDUAL }),
    );

    expect(result).toBe(true);
  });
});
