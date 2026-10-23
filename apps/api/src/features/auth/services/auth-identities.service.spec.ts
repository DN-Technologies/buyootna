import { Test, TestingModule } from '@nestjs/testing';
import { IdentityType } from '@prisma/client';
import { AuthIdentitiesService } from './auth-identities.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('AuthIdentitiesService Unit Tests', () => {
  let service: AuthIdentitiesService;

  const mockPrismaService = {
    identity: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    session: { findUnique: jest.fn() },
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
    $executeRaw: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthIdentitiesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthIdentitiesService>(AuthIdentitiesService);
  });

  it('findById scopes the lookup to id + userId', async () => {
    mockPrismaService.identity.findFirst.mockResolvedValue({ id: 'i-1' });

    await service.findById('i-1', 'user-1');

    expect(mockPrismaService.identity.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'i-1', userId: 'user-1' } }),
    );
  });

  it('findActive scopes the lookup to userId + isActive', async () => {
    mockPrismaService.identity.findFirst.mockResolvedValue({ id: 'i-1' });

    await service.findActive('user-1');

    expect(mockPrismaService.identity.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', isActive: true },
      }),
    );
  });

  it('findEarliest orders by createdAt ascending', async () => {
    mockPrismaService.identity.findFirst.mockResolvedValue({ id: 'i-1' });

    await service.findEarliest('user-1');

    expect(mockPrismaService.identity.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'asc' },
      }),
    );
  });

  it('markLastUsed makes the given persona the only last-used one', async () => {
    await service.markLastUsed('user-1', 'i-1');

    // One statement: on for this persona, off for the account's others
    const [strings, ...values] = mockPrismaService.$executeRaw.mock
      .calls[0] as [TemplateStringsArray, ...unknown[]];
    const sql = (strings as string[]).join('?').replace(/\s+/g, ' ');
    expect(sql).toContain('UPDATE "Identity" SET "isActive" = (id = ?)');
    expect(sql).toContain(
      'WHERE "userId" = ? AND ("isActive" = true OR id = ?)',
    );
    expect(values).toEqual(['i-1', 'user-1', 'i-1']);
  });

  it("findForDevice resumes the persona this device's session was using", async () => {
    mockPrismaService.session.findUnique.mockResolvedValue({
      activeIdentityId: 'i-2',
    });
    mockPrismaService.identity.findFirst.mockResolvedValue({ id: 'i-2' });

    await expect(service.findForDevice('user-1', 'device-a')).resolves.toEqual({
      id: 'i-2',
    });
    expect(mockPrismaService.session.findUnique).toHaveBeenCalledWith({
      where: { userId_deviceId: { userId: 'user-1', deviceId: 'device-a' } },
      select: { activeIdentityId: true },
    });
    // Scoped to the account, so a stale id can't leak another user's persona
    expect(mockPrismaService.identity.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'i-2', userId: 'user-1' } }),
    );
  });

  it('findForDevice returns null without a deviceId or a remembered persona', async () => {
    await expect(service.findForDevice('user-1')).resolves.toBeNull();
    mockPrismaService.session.findUnique.mockResolvedValue({
      activeIdentityId: null,
    });
    await expect(
      service.findForDevice('user-1', 'device-a'),
    ).resolves.toBeNull();
    expect(mockPrismaService.identity.findFirst).not.toHaveBeenCalled();
  });

  it('listAll returns every identity for the user, ordered by createdAt ascending', async () => {
    mockPrismaService.identity.findMany.mockResolvedValue([{ id: 'i-1' }]);

    const result = await service.listAll('user-1');

    expect(mockPrismaService.identity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'asc' },
      }),
    );
    expect(result).toEqual([{ id: 'i-1' }]);
  });

  it('createDefaultForOrphanedUser always creates an active INDIVIDUAL identity', async () => {
    mockPrismaService.identity.create.mockResolvedValue({ id: 'i-new' });

    await service.createDefaultForOrphanedUser('user-1');

    expect(mockPrismaService.identity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          type: IdentityType.INDIVIDUAL,
          isActive: true,
          individualData: { create: {} },
        }),
      }),
    );
  });
});
