import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ProviderCardsService } from '../users/services/provider-cards.service';
import { ProviderFavoritesService } from './provider-favorites.service';

describe('ProviderFavoritesService', () => {
  const prisma = {
    identity: { findUnique: jest.fn(), findMany: jest.fn() },
    providerFavorite: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
      count: jest.fn(),
    },
  };
  const cards = {
    formatCompanyCards: jest.fn().mockResolvedValue([{ id: 'c1' }]),
    formatOfficeCards: jest
      .fn()
      .mockResolvedValue([{ id: 'o1', isFavorite: false }]),
  };
  const service = new ProviderFavoritesService(
    prisma as unknown as PrismaService,
    cards as unknown as ProviderCardsService,
  );

  const activeProvider = (type: string) => ({
    type,
    user: { isDisabled: false, isBlocked: false },
  });

  beforeEach(() => jest.clearAllMocks());

  describe('toggle', () => {
    it('saves a company, then unsaves it', async () => {
      prisma.identity.findUnique.mockResolvedValue(activeProvider('COMPANY'));
      prisma.providerFavorite.findUnique.mockResolvedValueOnce(null);

      await expect(service.toggle('me', 'c1')).resolves.toMatchObject({
        favorited: true,
      });
      expect(prisma.providerFavorite.create).toHaveBeenCalledWith({
        data: { identityId: 'me', providerId: 'c1' },
      });

      prisma.providerFavorite.findUnique.mockResolvedValueOnce({ id: 'f1' });
      await expect(service.toggle('me', 'c1')).resolves.toMatchObject({
        favorited: false,
      });
      expect(prisma.providerFavorite.delete).toHaveBeenCalled();
    });

    it('refuses your own identity', async () => {
      await expect(service.toggle('me', 'me')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it.each([
      [
        'an individual',
        { type: 'INDIVIDUAL', user: { isDisabled: false, isBlocked: false } },
      ],
      [
        'a suspended provider',
        { type: 'OFFICE', user: { isDisabled: true, isBlocked: false } },
      ],
      ['an unknown id', null],
    ])('refuses %s', async (_, provider) => {
      prisma.identity.findUnique.mockResolvedValue(provider);

      await expect(service.toggle('me', 'x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.providerFavorite.create).not.toHaveBeenCalled();
    });
  });

  it('lists saved companies as directory cards, hiding suspended owners', async () => {
    prisma.providerFavorite.findMany.mockResolvedValue([
      { provider: { id: 'c1' } },
    ]);
    prisma.providerFavorite.count.mockResolvedValue(11);

    const result = await service.list('me', 'COMPANY', 1, 10);

    expect(prisma.providerFavorite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          identityId: 'me',
          provider: {
            type: 'COMPANY',
            user: { isDisabled: false, isBlocked: false },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(cards.formatCompanyCards).toHaveBeenCalledWith([{ id: 'c1' }]);
    expect(result).toEqual({
      data: [{ id: 'c1' }],
      meta: { total: 11, page: 1, limit: 10, hasNextPage: true },
    });
  });

  it('marks listed offices as favorites', async () => {
    prisma.providerFavorite.findMany.mockResolvedValue([
      { provider: { id: 'o1' } },
    ]);
    prisma.providerFavorite.count.mockResolvedValue(1);

    const result = await service.list('me', 'OFFICE');

    expect(result.data).toEqual([{ id: 'o1', isFavorite: true }]);
  });

  it('clears one tab and restores exactly what it removed', async () => {
    prisma.providerFavorite.findMany.mockResolvedValue([
      { providerId: 'c1' },
      { providerId: 'c2' },
    ]);

    await expect(service.clear('me', 'COMPANY')).resolves.toEqual({
      ids: ['c1', 'c2'],
    });
    expect(prisma.providerFavorite.deleteMany).toHaveBeenCalledWith({
      where: { identityId: 'me', providerId: { in: ['c1', 'c2'] } },
    });

    prisma.identity.findMany.mockResolvedValue([{ id: 'c1' }]); // c2 was deleted
    await expect(
      service.restore('me', 'COMPANY', ['c1', 'c2']),
    ).resolves.toEqual({
      ids: ['c1'],
    });
    expect(prisma.providerFavorite.createMany).toHaveBeenCalledWith({
      data: [{ identityId: 'me', providerId: 'c1' }],
      skipDuplicates: true,
    });
  });
});
