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
      create: jest.fn(),
    },
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

  it('activate marks the given identity active', async () => {
    await service.activate('i-1');

    expect(mockPrismaService.identity.update).toHaveBeenCalledWith({
      where: { id: 'i-1' },
      data: { isActive: true },
    });
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
