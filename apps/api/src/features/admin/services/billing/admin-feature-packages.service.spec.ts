import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminActionType } from '@prisma/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';
import { AdminFeaturePackagesService } from './admin-feature-packages.service';

describe('AdminFeaturePackagesService', () => {
  let service: AdminFeaturePackagesService;

  const prisma = {
    featurePackage: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const auditLog = { log: jest.fn() };

  // expect.objectContaining is typed `any`; keep assertions type-safe
  const containing = <T extends object>(shape: T): T =>
    expect.objectContaining(shape) as T;

  const week = {
    id: 'feature-week',
    label: 'تمييز لاسبوع',
    description: '',
    durationDays: 7,
    price: 3,
    sortOrder: 2,
    isActive: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminFeaturePackagesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AdminAuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = module.get(AdminFeaturePackagesService);
  });

  it('lists every package, inactive ones included, in display order', async () => {
    await service.list();

    expect(prisma.featurePackage.findMany).toHaveBeenCalledWith({
      orderBy: [{ sortOrder: 'asc' }, { durationDays: 'asc' }],
    });
  });

  it('creates a package and records who did it', async () => {
    prisma.featurePackage.create.mockResolvedValue({ ...week, id: 'new' });
    const dto = { label: 'تمييز لاسبوعين', durationDays: 14, price: 5 };

    await service.create(dto, 'admin-1');

    expect(prisma.featurePackage.create).toHaveBeenCalledWith({ data: dto });
    expect(auditLog.log).toHaveBeenCalledWith(
      containing({
        actorAdminId: 'admin-1',
        action: AdminActionType.FEATURE_PACKAGE_CREATED,
        targetId: 'new',
      }),
    );
  });

  it('updates a price and logs the old and new values', async () => {
    prisma.featurePackage.findUnique.mockResolvedValue(week);
    prisma.featurePackage.update.mockResolvedValue({ ...week, price: 4 });

    await service.update('feature-week', { price: 4 }, 'admin-1');

    expect(prisma.featurePackage.update).toHaveBeenCalledWith({
      where: { id: 'feature-week' },
      data: { price: 4 },
    });
    expect(auditLog.log).toHaveBeenCalledWith(
      containing({
        action: AdminActionType.FEATURE_PACKAGE_UPDATED,
        metadata: containing({
          before: containing({ price: 3 }),
          changes: { price: 4 },
        }),
      }),
    );
  });

  it('404s for an unknown package without writing anything', async () => {
    prisma.featurePackage.findUnique.mockResolvedValue(null);

    await expect(
      service.update('nope', { price: 1 }, 'admin-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.featurePackage.update).not.toHaveBeenCalled();
    expect(auditLog.log).not.toHaveBeenCalled();
  });
});
