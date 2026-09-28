import { PrismaService } from '../../core/prisma/prisma.service';
import { FavoritesService } from './favorites.service';

describe('FavoritesService clear/restore (saved ads)', () => {
  const prisma = {
    favorite: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    property: { findMany: jest.fn() },
  };
  const service = new FavoritesService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('clears every saved ad and returns their ids for undo', async () => {
    prisma.favorite.findMany.mockResolvedValue([
      { propertyId: 'a' },
      { propertyId: 'b' },
    ]);

    await expect(service.clearProperties('me')).resolves.toEqual({
      ids: ['a', 'b'],
    });
    expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
      where: { identityId: 'me', propertyId: { in: ['a', 'b'] } },
    });
  });

  it('restores them, skipping ads deleted in the meantime', async () => {
    prisma.property.findMany.mockResolvedValue([{ id: 'a' }]);

    await expect(service.restoreProperties('me', ['a', 'b'])).resolves.toEqual({
      ids: ['a'],
    });
    expect(prisma.favorite.createMany).toHaveBeenCalledWith({
      data: [{ identityId: 'me', propertyId: 'a' }],
      skipDuplicates: true,
    });
  });
});
