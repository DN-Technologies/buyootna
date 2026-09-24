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
  };
  const prisma = {
    property,
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

  it('notifies when an edit reactivates an expired listing', async () => {
    owned('EXPIRED');
    property.update.mockResolvedValue({ id: 'prop-1' });

    await service.update('identity-1', 'prop-1', { isDraft: false });

    expect(alertMatching.notifyMatchesForProperty).toHaveBeenCalledWith(
      'prop-1',
    );
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
