import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('NotificationsService Unit Tests', () => {
  let service: NotificationsService;

  const mockPrismaService = {
    notification: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    notificationPreferences: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('remove', () => {
    it('deletes a notification if it exists and belongs to the user', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
      });
      mockPrismaService.notification.delete.mockResolvedValue({
        id: 'notif-1',
      });

      const result = await service.remove('user-1', 'notif-1');

      expect(mockPrismaService.notification.findUnique).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
      });
      expect(mockPrismaService.notification.delete).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
      });
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException if notification does not exist', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(null);

      await expect(service.remove('user-1', 'notif-999')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.notification.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException if notification belongs to another user', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-other',
      });

      await expect(service.remove('user-1', 'notif-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.notification.delete).not.toHaveBeenCalled();
    });
  });

  describe('markAsUnread', () => {
    it('marks an owned notification as unread', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
      });
      mockPrismaService.notification.update.mockResolvedValue({
        id: 'notif-1',
        isRead: false,
      });

      const result = await service.markAsUnread('user-1', 'notif-1');

      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { isRead: false },
      });
      expect(result).toEqual({ id: 'notif-1', isRead: false });
    });

    it("404s for someone else's notification without updating it", async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue({
        id: 'notif-1',
        userId: 'someone-else',
      });

      await expect(service.markAsUnread('user-1', 'notif-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.notification.update).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('stores the link data with the notification', async () => {
      await service.create({
        userId: 'user-1',
        type: 'ALERT_MATCH',
        title: 't',
        body: 'b',
        data: { propertyId: 'prop-1' },
      });

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ data: { propertyId: 'prop-1' } }),
      });
    });
  });
});
