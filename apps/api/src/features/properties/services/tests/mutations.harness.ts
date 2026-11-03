/**
 * Shared setup for the PropertiesMutationsService specs (mutations.*.spec.ts):
 * the mocked database, quota and alert services, a fresh service before each
 * test, and the helpers most tests need. Each spec still sets what it is
 * about in its own beforeEach, which runs after this one.
 */
import { Prisma } from '@prisma/client';
import { Test } from '@nestjs/testing';

import { PrismaService } from 'src/core/prisma/prisma.service';

import { AlertMatchingService } from '../../../alerts/alert-matching.service';
import { CreatePropertyDto } from '../../dto/create-property.dto';
import { PropertiesMutationsService } from '../properties-mutations.service';
import { PropertiesQuotaService } from '../properties-quota.service';

export const OWNER = 'identity-1';
export const AD = 'prop-1';
export const DAY_MS = 24 * 60 * 60 * 1000;

/** The smallest create body: no photos. */
export const dto = { images: [] } as unknown as CreatePropertyDto;

/** What publishing spends by default: the free ad, 10 days, nothing extra. */
export const FREE_QUOTA = {
  planSlotId: null,
  durationDays: 10,
  maxImagesPerAd: 5,
  featuredDays: 0,
  prioritySearch: false,
};

/** A silver package: 30 days, 10 photos, 5 days featured, priority. */
export const SILVER_QUOTA = {
  planSlotId: 'slot-silver',
  durationDays: 30,
  maxImagesPerAd: 10,
  featuredDays: 5,
  prioritySearch: true,
};

/** Prisma's error for a unique index (a repeated submissionKey). */
export const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
  });

/**
 * Call inside a describe: registers the beforeEach that resets every mock,
 * sets the defaults (an individual, no existing ad, the free quota) and
 * builds a new service. Read `service` from the result inside tests.
 */
export function setupMutationsService() {
  const property = {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  };
  const identity = { findUnique: jest.fn() };
  const prisma = {
    property,
    identity,
    $transaction: jest.fn(),
  };
  const quotaService = { resolvePublishQuota: jest.fn() };
  const alertMatching = { notifyMatchesForProperty: jest.fn() };

  const harness = {
    prisma,
    property,
    identity,
    quotaService,
    alertMatching,
    service: undefined as unknown as PropertiesMutationsService,

    /** The ad being edited belongs to `identityId`, with this status. */
    owned(
      status: string,
      over: Record<string, unknown> = {},
      identityId = OWNER,
    ) {
      property.findUnique.mockResolvedValue({
        id: AD,
        identityId,
        status,
        images: [],
        ...over,
      });
    },

    /** The `data` of every property.create call, in order. */
    created: () =>
      (property.create.mock.calls as [{ data: Record<string, unknown> }][]).map(
        ([args]) => args.data,
      ),

    /** The `data` of every property.update call, in order. */
    updated: () =>
      (property.update.mock.calls as [{ data: Record<string, unknown> }][]).map(
        ([args]) => args.data,
      ),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation((fn: (tx: unknown) => unknown) =>
      fn({ property }),
    );
    identity.findUnique.mockResolvedValue({ type: 'INDIVIDUAL' });
    // The referenceNumber uniqueness check, then ownership lookups
    property.findUnique.mockResolvedValue(null);
    property.create.mockResolvedValue({ id: AD });
    property.update.mockResolvedValue({ id: AD });
    property.updateMany.mockResolvedValue({ count: 1 });
    quotaService.resolvePublishQuota.mockResolvedValue(FREE_QUOTA);

    const module = await Test.createTestingModule({
      providers: [
        PropertiesMutationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PropertiesQuotaService, useValue: quotaService },
        { provide: AlertMatchingService, useValue: alertMatching },
      ],
    }).compile();
    harness.service = module.get(PropertiesMutationsService);
  });

  return harness;
}
