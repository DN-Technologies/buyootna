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
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    property: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      alert: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      property: { findMany: jest.fn().mockResolvedValue([]) },
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
        include: { _count: { select: { matches: true } } },
      });
    });

    it('returns matchCount instead of the raw _count', async () => {
      prisma.alert.findMany.mockResolvedValue([
        { id: 'alert-1', isActive: true, _count: { matches: 3 } },
      ]);

      const [alert] = await service.findMine('identity-1');

      expect(alert).toEqual({ id: 'alert-1', isActive: true, matchCount: 3 });
    });
  });

  describe('setActive', () => {
    it('updates an owned alert and returns it with matchCount', async () => {
      prisma.alert.findUnique.mockResolvedValue({
        id: 'alert-1',
        identityId: 'identity-1',
      });
      prisma.alert.update.mockResolvedValue({
        id: 'alert-1',
        isActive: false,
        _count: { matches: 0 },
      });

      const result = await service.setActive('identity-1', 'alert-1', false);

      expect(prisma.alert.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'alert-1' },
          data: { isActive: false },
        }),
      );
      expect(result).toEqual({ id: 'alert-1', isActive: false, matchCount: 0 });
    });

    it("404s for someone else's alert without updating it", async () => {
      prisma.alert.findUnique.mockResolvedValue({
        id: 'alert-1',
        identityId: 'someone-else',
      });

      await expect(
        service.setActive('identity-1', 'alert-1', false),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.alert.update).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const dto = {
      type: 'PROPERTIES',
      operationType: 'RENT',
      governorateId: 'hawally',
      areaId: 'hawally_2',
      categoryId: 'apartment',
      rentValue: 600,
    } as CreateAlertDto;

    it('replaces the criteria, clearing fields the form left out', async () => {
      prisma.alert.findUnique.mockResolvedValue({
        id: 'alert-1',
        identityId: 'identity-1',
      });
      prisma.alert.update.mockResolvedValue({
        id: 'alert-1',
        _count: { matches: 2 },
      });

      const result = await service.update('identity-1', 'alert-1', dto);

      const { data } = prisma.alert.update.mock.calls[0][0];
      expect(data).toEqual(
        expect.objectContaining({
          operationType: 'RENT',
          areaId: 'hawally_2',
          rentValue: 600,
          price: null,
          rooms: null,
          amenities: [],
          startDate: null,
        }),
      );
      // Pause state and ownership are not part of an edit
      expect(data).not.toHaveProperty('isActive');
      expect(data).not.toHaveProperty('identityId');
      expect(result).toEqual({ id: 'alert-1', matchCount: 2 });
    });

    it("404s for someone else's alert without updating it", async () => {
      prisma.alert.findUnique.mockResolvedValue({
        id: 'alert-1',
        identityId: 'someone-else',
      });

      await expect(
        service.update('identity-1', 'alert-1', dto),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.alert.update).not.toHaveBeenCalled();
    });
  });

  describe('setAllActive', () => {
    it("only updates the current identity's alerts", async () => {
      prisma.alert.updateMany.mockResolvedValue({ count: 4 });

      const result = await service.setAllActive('identity-1', false);

      expect(prisma.alert.updateMany).toHaveBeenCalledWith({
        where: { identityId: 'identity-1' },
        data: { isActive: false },
      });
      expect(result).toEqual({ count: 4 });
    });
  });

  describe('findMatches', () => {
    it("404s for someone else's alert without querying listings", async () => {
      prisma.alert.findUnique.mockResolvedValue(null);

      await expect(service.findMatches('identity-1', 'x')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.property.findMany).not.toHaveBeenCalled();
    });

    it("queries live listings matching the alert, excluding the owner's", async () => {
      prisma.alert.findUnique.mockResolvedValue({
        id: 'alert-1',
        identityId: 'identity-1',
        type: 'PROPERTIES',
        operationType: 'RENT',
        governorateId: 'hawally',
        areaId: null,
        categoryId: 'apartment',
        rentValue: 500,
        price: null,
        areaSize: null,
        rooms: null,
        baths: null,
        floors: null,
        requestYear: null,
        requiredYear: null,
        startDate: null,
        endDate: null,
      });

      await service.findMatches('identity-1', 'alert-1');

      const { where, take } = prisma.property.findMany.mock.calls[0][0];
      expect(take).toBe(50);
      expect(where.AND).toEqual(
        expect.arrayContaining([
          {
            governorateId: 'hawally',
            type: 'RENT',
            category: 'APARTMENT',
            price: { lte: 500 },
          },
          { status: 'ACTIVE', isHidden: false },
          { NOT: { identityId: 'identity-1' } },
        ]),
      );
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
