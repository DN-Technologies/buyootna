import { PrismaService } from '../prisma/prisma.service';
import {
  PRESENCE_ONLINE_WINDOW_MS,
  PRESENCE_TOUCH_INTERVAL_MS,
  PresenceService,
} from './presence.service';

describe('PresenceService', () => {
  let prisma: { identity: { update: jest.Mock } };
  let presence: PresenceService;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-07T10:00:00Z') });
    prisma = { identity: { update: jest.fn().mockResolvedValue({}) } };
    presence = new PresenceService(prisma as unknown as PrismaService);
  });

  afterEach(() => jest.useRealTimers());

  const longAgo = new Date('2026-10-01T00:00:00Z');

  it('is online while a socket is connected, even with an old lastSeenAt', () => {
    presence.socketConnected('i1');
    expect(presence.presenceOf('i1', longAgo).isOnline).toBe(true);
  });

  it('stays online until the last of several sockets disconnects', () => {
    presence.socketConnected('i1');
    presence.socketConnected('i1');
    presence.socketDisconnected('i1');
    expect(presence.presenceOf('i1', longAgo).isOnline).toBe(true);

    presence.socketDisconnected('i1');
    expect(presence.presenceOf('i1', longAgo).isOnline).toBe(false);
  });

  it('counts a persona seen within the online window as online', () => {
    const recent = new Date(Date.now() - PRESENCE_ONLINE_WINDOW_MS + 1000);
    const stale = new Date(Date.now() - PRESENCE_ONLINE_WINDOW_MS - 1000);

    expect(presence.presenceOf('i1', recent)).toEqual({
      isOnline: true,
      lastSeenAt: recent.toISOString(),
    });
    expect(presence.presenceOf('i1', stale).isOnline).toBe(false);
    expect(presence.presenceOf('i1', null)).toEqual({
      isOnline: false,
      lastSeenAt: null,
    });
  });

  it('stamps lastSeenAt on connect and disconnect', () => {
    presence.socketConnected('i1');
    presence.socketDisconnected('i1');

    expect(prisma.identity.update).toHaveBeenCalledTimes(2);
    expect(prisma.identity.update).toHaveBeenCalledWith({
      where: { id: 'i1' },
      data: { lastSeenAt: new Date('2026-10-07T10:00:00Z') },
    });
  });

  it('throttles request touches to one write per interval', () => {
    presence.touch('i1');
    presence.touch('i1');
    expect(prisma.identity.update).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(PRESENCE_TOUCH_INTERVAL_MS);
    presence.touch('i1');
    expect(prisma.identity.update).toHaveBeenCalledTimes(2);
  });

  it('never throws when the write fails', async () => {
    prisma.identity.update.mockRejectedValue(new Error('db down'));
    expect(() => presence.touch('i1')).not.toThrow();
    await Promise.resolve();
  });
});
