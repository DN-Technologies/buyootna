import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('DevicesService Unit Tests', () => {
  let service: DevicesService;

  const mockPrismaService = {
    session: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        { provide: PrismaService, useValue: mockPrismaService },
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
    it('excludes exactly the given currentSessionId, without querying for the most-recent session', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.revokeAllExceptCurrent(
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

      const result = await service.revokeAllExceptCurrent('user-1');

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

      const result = await service.revokeAllExceptCurrent('user-1');

      expect(mockPrismaService.session.deleteMany).not.toHaveBeenCalled();
      expect(result).toEqual({ count: 0 });
    });
  });
});
