import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';

describe('AlertsService', () => {
  let service: AlertsService;
  let prisma: {
    alert: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      alert: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('scopes the new alert to the given identityId', async () => {
      const dto: CreateAlertDto = {
        type: 'PROPERTIES' as any,
        operationType: 'SALE',
        governorateId: 'capital',
      };
      prisma.alert.create.mockResolvedValue({ id: 'alert-1' });

      await service.create('identity-1', dto);

      expect(prisma.alert.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            identityId: 'identity-1',
            type: 'PROPERTIES',
            operationType: 'SALE',
            governorateId: 'capital',
          }),
        }),
      );
    });

    it('converts startDate/endDate strings to Date objects before writing', async () => {
      const dto: CreateAlertDto = {
        type: 'AUCTIONS' as any,
        governorateId: 'capital',
        startDate: '2026-10-01T00:00:00.000Z',
        endDate: '2026-10-15T00:00:00.000Z',
      };
      prisma.alert.create.mockResolvedValue({ id: 'alert-2' });

      await service.create('identity-1', dto);

      const call = prisma.alert.create.mock.calls[0][0];
      expect(call.data.startDate).toEqual(new Date('2026-10-01T00:00:00.000Z'));
      expect(call.data.endDate).toEqual(new Date('2026-10-15T00:00:00.000Z'));
    });

    it('defaults amenities to an empty array when not provided', async () => {
      const dto: CreateAlertDto = {
        type: 'PROPERTIES' as any,
        operationType: 'SALE',
        governorateId: 'capital',
      };
      prisma.alert.create.mockResolvedValue({ id: 'alert-3' });

      await service.create('identity-1', dto);

      const call = prisma.alert.create.mock.calls[0][0];
      expect(call.data.amenities).toEqual([]);
    });
  });

  describe('findMine', () => {
    it('scopes to identityId and orders by createdAt desc', async () => {
      await service.findMine('identity-1');

      expect(prisma.alert.findMany).toHaveBeenCalledWith({
        where: { identityId: 'identity-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the alert does not exist', async () => {
      prisma.alert.findUnique.mockResolvedValue(null);

      await expect(service.remove('identity-1', 'missing-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.alert.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the alert belongs to a different identity', async () => {
      prisma.alert.findUnique.mockResolvedValue({
        id: 'alert-1',
        identityId: 'someone-else',
      });

      await expect(service.remove('identity-1', 'alert-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.alert.delete).not.toHaveBeenCalled();
    });

    it('deletes the alert when it exists and belongs to the identity', async () => {
      prisma.alert.findUnique.mockResolvedValue({
        id: 'alert-1',
        identityId: 'identity-1',
      });

      const result = await service.remove('identity-1', 'alert-1');

      expect(prisma.alert.delete).toHaveBeenCalledWith({
        where: { id: 'alert-1' },
      });
      expect(result).toEqual({ message: 'تم حذف التنبيه بنجاح' });
    });
  });
});
