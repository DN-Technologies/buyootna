import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { SessionsService } from './sessions.service';

describe('DevicesService Unit Tests', () => {
  let service: DevicesService;

  const mockPrismaService = {
    session: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockSessionsService = {
    deleteAllExceptCurrent: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SessionsService, useValue: mockSessionsService },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  describe('getDevices', () => {
    it('lists active sessions for the user without creating a stub session', async () => {
      const sessions = [
        { id: 'session-1', userId: 'user-1', platform: 'ios' },
        { id: 'session-2', userId: 'user-1', platform: 'android' },
      ];
      mockPrismaService.session.findMany.mockResolvedValue(sessions);

      const result = await service.getDevices('user-1');

      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isActive: true },
        orderBy: { lastActive: 'desc' },
        omit: { pushToken: true },
      });
      expect(result).toBe(sessions);
    });

    it('returns an empty list rather than fabricating a session when none exist', async () => {
      mockPrismaService.session.findMany.mockResolvedValue([]);

      const result = await service.getDevices('user-1');

      expect(result).toEqual([]);
      expect(mockPrismaService.session).not.toHaveProperty('create');
    });
  });

  describe('revokeAllExceptCurrent', () => {
    // The actual "keep only the current device" heuristic (with/without a
    // currentSessionId) now lives in SessionsService and is covered by
    // sessions.service.spec.ts -- this just checks DevicesService delegates
    // to it correctly.
    it('delegates to SessionsService.deleteAllExceptCurrent', async () => {
      mockSessionsService.deleteAllExceptCurrent.mockResolvedValue({
        count: 1,
      });

      const result = await service.revokeAllExceptCurrent(
        'user-1',
        'session-current',
      );

      expect(mockSessionsService.deleteAllExceptCurrent).toHaveBeenCalledWith(
        'user-1',
        'session-current',
      );
      expect(result).toEqual({ count: 1 });
    });
  });

  describe('setPushToken', () => {
    const token = 'ExponentPushToken[abc123]';

    it("stores the token on the caller's own session only", async () => {
      mockPrismaService.session.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.setPushToken('user-1', 'session-1', token);

      // Same device token can't stay on another session/account
      expect(mockPrismaService.session.updateMany).toHaveBeenNthCalledWith(1, {
        where: { pushToken: token, NOT: { id: 'session-1' } },
        data: { pushToken: null },
      });
      expect(mockPrismaService.session.updateMany).toHaveBeenNthCalledWith(2, {
        where: { id: 'session-1', userId: 'user-1' },
        data: { pushToken: token },
      });
      expect(result).toEqual({ success: true });
    });

    it('clears the token when null is sent', async () => {
      mockPrismaService.session.updateMany.mockResolvedValue({ count: 1 });

      await service.setPushToken('user-1', 'session-1', null);

      expect(mockPrismaService.session.updateMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.session.updateMany).toHaveBeenCalledWith({
        where: { id: 'session-1', userId: 'user-1' },
        data: { pushToken: null },
      });
    });

    it('rejects a token issued before sessions existed (no sid)', async () => {
      await expect(
        service.setPushToken('user-1', undefined, token),
      ).rejects.toThrow('يرجى تسجيل الدخول مرة أخرى');
      expect(mockPrismaService.session.updateMany).not.toHaveBeenCalled();
    });
  });
});
