import { Test, TestingModule } from '@nestjs/testing';
import { ListingStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PropertiesExpiryService } from './properties-expiry.service';

describe('PropertiesExpiryService', () => {
  let service: PropertiesExpiryService;
  let prisma: { property: { updateMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      property: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesExpiryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PropertiesExpiryService>(PropertiesExpiryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('flips overdue ACTIVE listings to EXPIRED', async () => {
    prisma.property.updateMany.mockResolvedValue({ count: 3 });

    await service.expireOverdueListings();

    expect(prisma.property.updateMany).toHaveBeenCalledTimes(1);
    const updateManyCalls = prisma.property.updateMany.mock
      .calls as Prisma.PropertyUpdateManyArgs[][];
    const call = updateManyCalls[0][0];
    expect(call.where?.status).toBe(ListingStatus.ACTIVE);
    expect(
      (call.where?.endDate as { lte: Date } | undefined)?.lte,
    ).toBeInstanceOf(Date);
    expect(call.data).toEqual({ status: ListingStatus.EXPIRED });
  });

  it('does not throw when nothing is overdue', async () => {
    prisma.property.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.expireOverdueListings()).resolves.toBeUndefined();
  });
});
