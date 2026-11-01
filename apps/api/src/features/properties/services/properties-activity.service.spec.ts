import { PrismaService } from 'src/core/prisma/prisma.service';

import { PropertiesActivityService } from './properties-activity.service';

describe('PropertiesActivityService.getMyActivity', () => {
  const prisma = {
    property: { updateMany: jest.fn(), findMany: jest.fn() },
    favorite: { groupBy: jest.fn() },
    conversation: { groupBy: jest.fn() },
  };
  const service = new PropertiesActivityService(
    prisma as unknown as PrismaService,
  );
  const ad = (id: string) => ({ id, type: 'SALE', images: [], views: 7 });

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.favorite.groupBy.mockResolvedValue([]);
    prisma.conversation.groupBy.mockResolvedValue([]);
  });

  it("returns each ad's real saves and chats", async () => {
    prisma.property.findMany.mockResolvedValue([ad('a'), ad('b')]);
    prisma.favorite.groupBy.mockResolvedValue([
      { propertyId: 'a', _count: { _all: 3 } },
    ]);
    prisma.conversation.groupBy.mockResolvedValue([
      { propertyId: 'b', _count: { _all: 2 } },
    ]);

    const [first, second] = await service.getMyActivity('me');

    expect(first).toMatchObject({ id: 'a', favoritesCount: 3, chatsCount: 0 });
    expect(second).toMatchObject({ id: 'b', favoritesCount: 0, chatsCount: 2 });
  });

  it('counts only chats with a message, for these ads, in one query each', async () => {
    prisma.property.findMany.mockResolvedValue([ad('a'), ad('b')]);

    await service.getMyActivity('me');

    expect(prisma.conversation.groupBy).toHaveBeenCalledTimes(1);
    expect(prisma.conversation.groupBy).toHaveBeenCalledWith({
      by: ['propertyId'],
      where: { propertyId: { in: ['a', 'b'] }, messages: { some: {} } },
      _count: { _all: true },
    });
    expect(prisma.favorite.groupBy).toHaveBeenCalledTimes(1);
  });

  it('skips the counts when there are no ads', async () => {
    prisma.property.findMany.mockResolvedValue([]);

    await expect(service.getMyActivity('me')).resolves.toEqual([]);
    expect(prisma.favorite.groupBy).not.toHaveBeenCalled();
    expect(prisma.conversation.groupBy).not.toHaveBeenCalled();
  });
});
