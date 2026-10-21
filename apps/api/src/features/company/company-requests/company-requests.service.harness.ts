/**
 * Shared setup for the CompanyRequestsService specs (lists, create, company
 * actions, requester): the request fixtures, a Prisma mock rebuilt before
 * each test, and a fresh CompanyRequestsService. Each spec still mocks the
 * subscription rules itself (jest.mock only reliably applies in the test
 * file that calls it).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRequestsService } from './company-requests.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PushService } from '../../../core/push/push.service';
import { NotificationsService } from '../../notifications/notifications.service';

export const baseClientIdentity = {
  id: 'client-1',
  userId: 'user-client',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  user: { phone: '+96590000000', whatsapp: '+96590000000' },
  individualData: { name: 'نواف الجارحي', avatarUrl: 'https://x/a.jpg' },
  officeData: null,
  companyData: null,
  receivedReviews: [{ rating: 4 }, { rating: 5 }],
};

export const baseRequest = {
  id: 'req-1',
  clientIdentityId: 'client-1',
  targetIdentityId: 'company-1',
  acceptedByIdentityId: null,
  title: 'تشطيب محل',
  category: 'تشطيب',
  priceRange: null,
  location: 'السالمية',
  latitude: null,
  longitude: null,
  offerType: null,
  images: [],
  description: 'وصف الطلب',
  status: 'PENDING',
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  updatedAt: new Date('2026-02-01T00:00:00.000Z'),
  clientIdentity: baseClientIdentity,
  targetIdentity: null,
  acceptedByIdentity: null,
  offers: [],
};

export const mockNotifications = { create: jest.fn().mockResolvedValue({}) };
export const mockPush = {
  sendToTokens: jest.fn().mockResolvedValue(undefined),
};

export interface PrismaMock {
  companyRequest: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    updateMany: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
    count: jest.Mock;
    groupBy: jest.Mock;
    deleteMany: jest.Mock;
  };
  requestOffer: {
    upsert: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
    count: jest.Mock;
  };
  $transaction: jest.Mock;
  identity: { findUnique: jest.Mock };
  companyIdentityData: { findUnique: jest.Mock };
  requestDismissal: { upsert: jest.Mock };
  requestBookmark: { upsert: jest.Mock; deleteMany: jest.Mock };
  session: { findMany: jest.Mock };
}

function createPrisma(): PrismaMock {
  return {
    companyRequest: {
      findMany: jest.fn().mockResolvedValue([baseRequest]),
      findUnique: jest.fn().mockResolvedValue(baseRequest),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue(baseRequest),
      create: jest.fn().mockResolvedValue(baseRequest),
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn().mockResolvedValue([]),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    requestOffer: {
      upsert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
    },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    // The provider's specialty: none unless a test sets one
    requestDismissal: { upsert: jest.fn().mockResolvedValue({}) },
    requestBookmark: {
      upsert: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    session: { findMany: jest.fn().mockResolvedValue([]) },
    companyIdentityData: {
      findUnique: jest.fn().mockResolvedValue({ specialty: null }),
    },
    // The caller/target: an approved company unless a test says otherwise
    identity: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'company-1',
        type: 'COMPANY',
        companyData: { status: 'APPROVED' },
        officeData: null,
      }),
    },
  };
}

/**
 * Call inside a describe: registers the beforeEach that rebuilds the Prisma
 * mock and CompanyRequestsService; read `service` and `prisma` from the
 * result in a beforeEach of your own (both are new objects every test).
 */
export function setupCompanyRequestsService() {
  const harness = {
    service: undefined as unknown as CompanyRequestsService,
    prisma: undefined as unknown as PrismaMock,
  };

  beforeEach(async () => {
    const prisma = createPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyRequestsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: PushService, useValue: mockPush },
      ],
    }).compile();

    harness.prisma = prisma;
    harness.service = module.get<CompanyRequestsService>(
      CompanyRequestsService,
    );
  });

  return harness;
}
