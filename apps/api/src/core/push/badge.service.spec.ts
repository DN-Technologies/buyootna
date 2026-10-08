import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from './badge.service';

describe('BadgeService', () => {
  const prisma = {
    $queryRaw: jest.fn(),
    notification: { count: jest.fn() },
  };
  const service = new BadgeService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it("adds the persona's unread chat messages to the account's unread notifications", async () => {
    prisma.$queryRaw.mockResolvedValue([{ count: 5n }]);
    prisma.notification.count.mockResolvedValue(2);

    expect(await service.countFor('u1', 'i1')).toEqual({
      count: 7,
      chats: 5,
      notifications: 2,
    });
    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { userId: 'u1', isRead: false },
    });
    // Only messages from others, after the last read, not deleted on this side
    const sql = (prisma.$queryRaw.mock.calls[0][0] as string[]).join('?');
    expect(sql).toContain('"senderIdentityId" IS DISTINCT FROM');
    expect(sql).toContain('"lastReadAt"');
    expect(sql).toContain('"MessageHidden"');
  });

  it('counts only notifications when the device has no active persona', async () => {
    prisma.notification.count.mockResolvedValue(3);
    expect(await service.countFor('u1', null)).toEqual({
      count: 3,
      chats: 0,
      notifications: 3,
    });
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });
});
