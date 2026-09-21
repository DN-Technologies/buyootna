import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { PrismaService } from 'src/core/prisma/prisma.service';

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const userFindUnique = jest.fn();
  const identityFindFirst = jest.fn();
  const sessionFindUnique = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: userFindUnique },
            identity: { findFirst: identityFindFirst },
            session: { findUnique: sessionFindUnique },
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  const basePayload = {
    sub: 'user-1',
    ident: 'identity-1',
    type: 'INDIVIDUAL' as const,
  };

  const user = {
    id: 'user-1',
    password: 'hashed',
    isDisabled: false,
    isBlocked: false,
    isAdmin: false,
  };

  const identity = { id: 'identity-1', userId: 'user-1', type: 'INDIVIDUAL' };

  it('validates a legacy token without an sid claim and never touches the session table', async () => {
    userFindUnique.mockResolvedValue(user);
    identityFindFirst.mockResolvedValue(identity);

    const result = await strategy.validate(basePayload);

    expect(result.userId).toBe('user-1');
    expect(result.sessionId).toBeUndefined();
    expect(sessionFindUnique).not.toHaveBeenCalled();
  });

  it('validates a token whose sid points at an existing session owned by the user', async () => {
    userFindUnique.mockResolvedValue(user);
    sessionFindUnique.mockResolvedValue({ userId: 'user-1' });
    identityFindFirst.mockResolvedValue(identity);

    const result = await strategy.validate({
      ...basePayload,
      sid: 'session-1',
    });

    expect(result.sessionId).toBe('session-1');
    expect(sessionFindUnique).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      select: { userId: true },
    });
  });

  it('rejects a token whose session was revoked (device removed) with 401', async () => {
    userFindUnique.mockResolvedValue(user);
    sessionFindUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ ...basePayload, sid: 'session-1' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(identityFindFirst).not.toHaveBeenCalled();
  });

  it('rejects a token whose sid belongs to another user with 401', async () => {
    userFindUnique.mockResolvedValue(user);
    sessionFindUnique.mockResolvedValue({ userId: 'someone-else' });

    await expect(
      strategy.validate({ ...basePayload, sid: 'session-1' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(identityFindFirst).not.toHaveBeenCalled();
  });
});
