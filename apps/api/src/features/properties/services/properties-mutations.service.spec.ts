import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AlertMatchingService } from '../../alerts/alert-matching.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { PropertiesMutationsService } from './properties-mutations.service';
import { PropertiesQuotaService } from './properties-quota.service';

// Covers only the alert-matching hook: every path that makes a listing
// ACTIVE must notify matching alerts, and drafts must not.
describe('PropertiesMutationsService alert matching', () => {
  let service: PropertiesMutationsService;

  const property = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  };
  const identity = {
    findUnique: jest.fn().mockResolvedValue({ type: 'INDIVIDUAL' }),
  };
  const prisma = {
    property,
    identity,
    $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn({ property })),
  };
  const quotaService = {
    resolvePublishQuota: jest.fn().mockResolvedValue({
      planSlotId: null,
      durationDays: 10,
      maxImagesPerAd: 5,
      featuredDays: 0,
      prioritySearch: false,
    }),
  };
  const alertMatching = { notifyMatchesForProperty: jest.fn() };

  const dto = { images: [] } as unknown as CreatePropertyDto;

  beforeEach(async () => {
    jest.clearAllMocks();
    // referenceNumber uniqueness check, then ownership lookups
    property.findUnique.mockResolvedValue(null);
    property.updateMany.mockResolvedValue({ count: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesMutationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PropertiesQuotaService, useValue: quotaService },
        { provide: AlertMatchingService, useValue: alertMatching },
      ],
    }).compile();
    service = module.get(PropertiesMutationsService);
  });

  const owned = (status: string) =>
    property.findUnique.mockResolvedValue({
      id: 'prop-1',
      identityId: 'identity-1',
      status,
      images: [],
    });

  it('notifies after publishing a new listing', async () => {
    property.create.mockResolvedValue({ id: 'prop-1' });

    await service.create('identity-1', { ...dto, isDraft: false });

    expect(alertMatching.notifyMatchesForProperty).toHaveBeenCalledWith(
      'prop-1',
    );
  });

  it('stamps publishedAt when an ad goes live, never on a draft', async () => {
    property.create.mockResolvedValue({ id: 'prop-1' });
    await service.create('identity-1', { ...dto, isDraft: false });
    await service.create('identity-1', { ...dto, isDraft: true });

    const [[live], [draft]] = property.create.mock.calls as [
      { data: { publishedAt?: Date } },
    ][];
    expect(live.data.publishedAt).toBeInstanceOf(Date);
    expect(draft.data.publishedAt).toBeUndefined();

    owned('DRAFT');
    property.update.mockResolvedValue({ id: 'prop-1' });
    await service.update('identity-1', 'prop-1', { isDraft: false });
    const [[published]] = property.update.mock.calls as [
      { data: { publishedAt?: Date } },
    ][];
    expect(published.data.publishedAt).toBeInstanceOf(Date);
  });

  it('does not notify when saving a draft', async () => {
    property.create.mockResolvedValue({ id: 'prop-1' });

    await service.create('identity-1', { ...dto, isDraft: true });

    expect(alertMatching.notifyMatchesForProperty).not.toHaveBeenCalled();
  });

  it('notifies after publishing a draft', async () => {
    owned('DRAFT');
    property.update.mockResolvedValue({ id: 'prop-1' });

    await service.update('identity-1', 'prop-1', { isDraft: false });

    expect(alertMatching.notifyMatchesForProperty).toHaveBeenCalledWith(
      'prop-1',
    );
  });

  it('does not reactivate (or notify for) an edit of an archived listing', async () => {
    owned('EXPIRED');
    property.update.mockResolvedValue({ id: 'prop-1' });

    await service.update('identity-1', 'prop-1', { isDraft: false });

    // Going live again is renew()'s job: it spends a credit and sets dates
    expect(property.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'EXPIRED' }) as unknown,
      }),
    );
    expect(alertMatching.notifyMatchesForProperty).not.toHaveBeenCalled();
  });

  it('does not notify for a plain edit of an active listing', async () => {
    owned('ACTIVE');
    property.update.mockResolvedValue({ id: 'prop-1' });

    await service.update('identity-1', 'prop-1', { description: 'x' });

    expect(alertMatching.notifyMatchesForProperty).not.toHaveBeenCalled();
  });

  it('notifies after renewing a listing', async () => {
    owned('EXPIRED');
    property.update.mockResolvedValue({ id: 'prop-1' });

    await service.renew('identity-1', 'prop-1');

    expect(alertMatching.notifyMatchesForProperty).toHaveBeenCalledWith(
      'prop-1',
    );
  });
});

describe('PropertiesMutationsService.renew', () => {
  let service: PropertiesMutationsService;
  const DAY_MS = 24 * 60 * 60 * 1000;

  const property = {
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  };
  const identity = {
    findUnique: jest.fn().mockResolvedValue({ type: 'INDIVIDUAL' }),
  };
  const prisma = {
    property,
    identity,
    $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn({ property })),
  };
  const quotaService = { resolvePublishQuota: jest.fn() };
  const alertMatching = { notifyMatchesForProperty: jest.fn() };

  const owned = (status: string) =>
    property.findUnique.mockResolvedValue({
      id: 'prop-1',
      identityId: 'identity-1',
      status,
      images: ['a.jpg', 'b.jpg'],
    });

  const silverQuota = {
    planSlotId: 'slot-silver',
    durationDays: 30,
    maxImagesPerAd: 10,
    featuredDays: 5,
    prioritySearch: true,
  };

  // What the final update wrote
  const written = () =>
    (
      property.update.mock.calls as [
        {
          data: Record<string, unknown> & {
            publishedAt: Date;
            endDate: Date;
            featuredUntil: Date | null;
          };
        },
      ][]
    )[0][0].data;

  beforeEach(async () => {
    jest.clearAllMocks();
    property.updateMany.mockResolvedValue({ count: 1 });
    property.update.mockResolvedValue({ id: 'prop-1', status: 'ACTIVE' });
    quotaService.resolvePublishQuota.mockResolvedValue(silverQuota);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesMutationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PropertiesQuotaService, useValue: quotaService },
        { provide: AlertMatchingService, useValue: alertMatching },
      ],
    }).compile();
    service = module.get(PropertiesMutationsService);
  });

  it.each(['EXPIRED', 'CLOSED'])(
    'republishes a %s ad with the picked credit and fresh dates',
    async (status) => {
      owned(status);
      const before = Date.now();

      const result = await service.renew('identity-1', 'prop-1', 'slot-silver');

      expect(property.updateMany).toHaveBeenCalledWith({
        where: { id: 'prop-1', status: { in: ['EXPIRED', 'CLOSED'] } },
        data: { status: 'ACTIVE' },
      });
      expect(quotaService.resolvePublishQuota).toHaveBeenCalledWith(
        'identity-1',
        'slot-silver',
        2,
        expect.anything(),
      );
      const data = written();
      expect(data).toMatchObject({
        status: 'ACTIVE',
        planSlotId: 'slot-silver',
        isFeatured: true,
        isPriority: true,
      });
      expect(data.publishedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(data.endDate.getTime() - data.publishedAt.getTime()).toBe(
        30 * DAY_MS,
      );
      expect(data.featuredUntil!.getTime() - data.publishedAt.getTime()).toBe(
        5 * DAY_MS,
      );
      expect(result.message).toBe('تم تجديد نشر الإعلان بنجاح');
      expect(alertMatching.notifyMatchesForProperty).toHaveBeenCalledWith(
        'prop-1',
      );
    },
  );

  it.each(['ACTIVE', 'DRAFT'])(
    'refuses a %s ad without spending a credit',
    async (status) => {
      owned(status);

      await expect(
        service.renew('identity-1', 'prop-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(quotaService.resolvePublishQuota).not.toHaveBeenCalled();
      expect(property.updateMany).not.toHaveBeenCalled();
    },
  );

  it('refuses a second, concurrent republish without spending a credit', async () => {
    owned('EXPIRED');
    property.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.renew('identity-1', 'prop-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(quotaService.resolvePublishQuota).not.toHaveBeenCalled();
    expect(property.update).not.toHaveBeenCalled();
    expect(alertMatching.notifyMatchesForProperty).not.toHaveBeenCalled();
  });

  it('lets a spending failure abort the republish (the transaction rolls back)', async () => {
    owned('EXPIRED');
    quotaService.resolvePublishQuota.mockRejectedValue(
      new ForbiddenException('ليس لديك رصيد إعلانات نشط.'),
    );

    await expect(service.renew('identity-1', 'prop-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(property.update).not.toHaveBeenCalled();
    expect(alertMatching.notifyMatchesForProperty).not.toHaveBeenCalled();
  });
});

describe('PropertiesMutationsService approval gate', () => {
  const property = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  };
  const identity = { findUnique: jest.fn() };
  const prisma = {
    property,
    identity,
    $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn({ property })),
  };
  const quotaService = { resolvePublishQuota: jest.fn() };
  let service: PropertiesMutationsService;

  const pendingCompany = {
    type: 'COMPANY',
    companyData: { status: 'PENDING' },
    officeData: null,
  };
  const dto = { images: [] } as unknown as CreatePropertyDto;

  beforeEach(async () => {
    jest.clearAllMocks();
    identity.findUnique.mockResolvedValue(pendingCompany);
    property.findUnique.mockResolvedValue(null);
    property.create.mockResolvedValue({ id: 'draft-1', status: 'DRAFT' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesMutationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PropertiesQuotaService, useValue: quotaService },
        {
          provide: AlertMatchingService,
          useValue: { notifyMatchesForProperty: jest.fn() },
        },
      ],
    }).compile();
    service = module.get(PropertiesMutationsService);
  });

  it('refuses publishing for a company under review, without spending a credit', async () => {
    await expect(
      service.create('company-1', { ...dto, isDraft: false }),
    ).rejects.toThrow(ForbiddenException);
    expect(quotaService.resolvePublishQuota).not.toHaveBeenCalled();
  });

  it('still lets a company under review save a draft', async () => {
    await expect(
      service.create('company-1', { ...dto, isDraft: true }),
    ).resolves.toBeDefined();
  });

  it('refuses publishing a draft and republishing for a company under review', async () => {
    property.findUnique.mockResolvedValue({
      id: 'prop-1',
      identityId: 'company-1',
      status: 'DRAFT',
      images: [],
    });
    await expect(
      service.update('company-1', 'prop-1', { isDraft: false }),
    ).rejects.toThrow(ForbiddenException);

    property.findUnique.mockResolvedValue({
      id: 'prop-1',
      identityId: 'company-1',
      status: 'EXPIRED',
      images: [],
    });
    await expect(service.renew('company-1', 'prop-1')).rejects.toThrow(
      ForbiddenException,
    );
    expect(property.updateMany).not.toHaveBeenCalled();
  });
});
