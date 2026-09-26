import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('SessionsService Unit Tests', () => {
  let service: SessionsService;

  const mockPrismaService = {
    session: {
      create: jest.fn(),
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  describe('upsertSession', () => {
    it('upserts on (userId, deviceId) when a deviceId is given, deriving the device name from the model', async () => {
      mockPrismaService.session.upsert.mockResolvedValue({ id: 'session-1' });

      await service.upsertSession('user-1', {
        deviceId: 'device-1',
        platform: 'ios',
        deviceModel: 'iPhone 13 Pro Max',
        ip: '1.2.3.4',
        userAgent: 'test-agent',
      });

      expect(mockPrismaService.session.upsert).toHaveBeenCalledWith({
        where: { userId_deviceId: { userId: 'user-1', deviceId: 'device-1' } },
        create: expect.objectContaining({
          userId: 'user-1',
          deviceId: 'device-1',
          platform: 'ios',
          deviceModel: 'iPhone 13 Pro Max',
          deviceName: 'iPhone 13 Pro Max',
          ipAddress: '1.2.3.4',
          userAgent: 'test-agent',
        }) as unknown,
        update: expect.objectContaining({
          platform: 'ios',
          deviceModel: 'iPhone 13 Pro Max',
          deviceName: 'iPhone 13 Pro Max',
          isActive: true,
        }) as unknown,
      });
    });

    it('falls back to a generic per-platform label when no deviceModel is given', async () => {
      mockPrismaService.session.upsert.mockResolvedValue({ id: 'session-1' });

      await service.upsertSession('user-1', {
        deviceId: 'device-1',
        platform: 'android',
      });

      expect(mockPrismaService.session.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            deviceName: 'جهاز أندرويد',
          }) as unknown,
        }) as unknown,
      );
    });

    it('falls back to a plain create with no upsert key when no deviceId is given', async () => {
      mockPrismaService.session.create.mockResolvedValue({ id: 'session-1' });

      await service.upsertSession('user-1', { platform: 'ios' });

      expect(mockPrismaService.session.upsert).not.toHaveBeenCalled();
      expect(mockPrismaService.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          deviceName: 'آيفون',
        }) as unknown,
      });
    });

    it('flags a device the account has not used before as new', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);
      mockPrismaService.session.upsert.mockResolvedValue({ id: 'session-2' });

      const result = await service.upsertSession('user-1', {
        deviceId: 'device-2',
      });

      expect(mockPrismaService.session.findUnique).toHaveBeenCalledWith({
        where: { userId_deviceId: { userId: 'user-1', deviceId: 'device-2' } },
        select: { id: true },
      });
      expect(result).toEqual({ id: 'session-2', isNewDevice: true });
    });

    it('does not flag a returning device as new', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue({
        id: 'session-1',
      });
      mockPrismaService.session.upsert.mockResolvedValue({ id: 'session-1' });

      const result = await service.upsertSession('user-1', {
        deviceId: 'device-1',
      });

      expect(result.isNewDevice).toBe(false);
    });

    it('treats a login without a deviceId as a new device', async () => {
      mockPrismaService.session.create.mockResolvedValue({ id: 'session-3' });

      const result = await service.upsertSession('user-1', {});

      expect(result.isNewDevice).toBe(true);
    });
  });

  describe('deleteAllExceptCurrent', () => {
    it('excludes exactly the given currentSessionId, without querying for the most-recent session', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.deleteAllExceptCurrent(
        'user-1',
        'session-current',
      );

      expect(mockPrismaService.session.findFirst).not.toHaveBeenCalled();
      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', id: { not: 'session-current' } },
      });
      expect(result).toEqual({ count: 1 });
    });

    it('falls back to the most-recently-active session when no currentSessionId is given', async () => {
      mockPrismaService.session.findFirst.mockResolvedValue({
        id: 'session-latest',
      });
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.deleteAllExceptCurrent('user-1');

      expect(mockPrismaService.session.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1', isActive: true },
        orderBy: { lastActive: 'desc' },
      });
      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', id: { not: 'session-latest' } },
      });
      expect(result).toEqual({ count: 2 });
    });

    it('does nothing when no currentSessionId is given and no session exists at all', async () => {
      mockPrismaService.session.findFirst.mockResolvedValue(null);

      const result = await service.deleteAllExceptCurrent('user-1');

      expect(mockPrismaService.session.deleteMany).not.toHaveBeenCalled();
      expect(result).toEqual({ count: 0 });
    });
  });

  describe('touchLastActive', () => {
    it('updates the session lastActive timestamp', async () => {
      mockPrismaService.session.update.mockResolvedValue({ id: 'session-1' });

      await service.touchLastActive('session-1');

      expect(mockPrismaService.session.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: { lastActive: expect.any(Date) as unknown },
      });
    });

    it('swallows an update failure (e.g. a stale/missing sessionId) without throwing', async () => {
      mockPrismaService.session.update.mockRejectedValue(
        new Error('not found'),
      );

      await expect(
        service.touchLastActive('missing-session'),
      ).resolves.toBeUndefined();
    });
  });
});
