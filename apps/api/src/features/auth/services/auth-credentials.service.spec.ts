import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  AuthCredentialsService,
  INVALID_CREDENTIALS_MESSAGE,
} from './auth-credentials.service';

// Real bcrypt, wrapped so calls can be counted
jest.mock('bcrypt', () => {
  const actual = jest.requireActual<typeof import('bcrypt')>('bcrypt');
  return { ...actual, compare: jest.fn(actual.compare) };
});

describe('AuthCredentialsService timing', () => {
  let service: AuthCredentialsService;
  const prisma = { user: { findFirst: jest.fn() } };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthCredentialsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AuthCredentialsService);
  });

  it('runs a real bcrypt comparison even when the identifier is unknown', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.validateUser('missing@example.com', 'whatever'),
    ).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE);

    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    const [, hash] = (bcrypt.compare as jest.Mock).mock.calls[0] as [
      string,
      string,
    ];
    // Same cost as real password hashes, so both paths take equally long
    expect(hash).toMatch(/^\$2[aby]\$10\$/);
  });

  it('compares against the stored hash when the account exists', async () => {
    const stored = await bcrypt.hash('correct-password', 10);
    prisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      password: stored,
      isDisabled: false,
      isBlocked: false,
      isAdmin: false,
    });

    await expect(
      service.validateUser('a@example.com', 'wrong-password'),
    ).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE);

    expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', stored);
  });
});
