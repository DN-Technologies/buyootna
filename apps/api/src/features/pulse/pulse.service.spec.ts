import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { CompanyRequestsService } from '../company/company-requests/company-requests.service';
import { PulseService } from './pulse.service';

const NOW = new Date('2026-10-24T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

describe('PulseService', () => {
  let service: PulseService;
  let prisma: {
    requestOffer: { findMany: jest.Mock };
    property: { findMany: jest.Mock };
    identity: { findMany: jest.Mock };
    invoice: { findFirst: jest.Mock };
    companySubscription: { findMany: jest.Mock };
    userPlanSlot: { aggregate: jest.Mock };
    story: { findFirst: jest.Mock };
    storyView: { count: jest.Mock };
  };
  let alerts: { findUnseenMatches: jest.Mock };
  let requests: { findMine: jest.Mock };

  beforeEach(async () => {
    prisma = {
      requestOffer: { findMany: jest.fn().mockResolvedValue([]) },
      property: { findMany: jest.fn().mockResolvedValue([]) },
      identity: { findMany: jest.fn().mockResolvedValue([]) },
      invoice: { findFirst: jest.fn().mockResolvedValue(null) },
      companySubscription: { findMany: jest.fn().mockResolvedValue([]) },
      userPlanSlot: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { adsRemaining: 5 } }),
      },
      story: { findFirst: jest.fn().mockResolvedValue(null) },
      storyView: { count: jest.fn().mockResolvedValue(0) },
    };
    requests = { findMine: jest.fn().mockResolvedValue([]) };
    alerts = {
      findUnseenMatches: jest
        .fn()
        .mockResolvedValue({ count: 0, alertId: null }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PulseService,
        { provide: PrismaService, useValue: prisma },
        { provide: AlertsService, useValue: alerts },
        { provide: CompanyRequestsService, useValue: requests },
      ],
    }).compile();

    service = module.get(PulseService);
  });

  it('is empty when nothing is going on', async () => {
    await expect(service.forIdentity('me', 'INDIVIDUAL', NOW)).resolves.toEqual(
      { items: [] },
    );
  });

  it('lists everything in priority order: offers, expiring ads, matches, stories', async () => {
    prisma.requestOffer.findMany.mockResolvedValue([
      { requestId: 'r1' },
      { requestId: 'r1' },
    ]);
    prisma.property.findMany.mockResolvedValue([
      { id: 'p1', endDate: new Date(NOW.getTime() + 2.5 * DAY) },
    ]);
    alerts.findUnseenMatches.mockResolvedValue({ count: 4, alertId: 'a1' });
    prisma.identity.findMany.mockResolvedValue([
      { id: 'c1', companyData: { logoUrl: 'logo.png' }, officeData: null },
      { id: 'o1', companyData: null, officeData: { logoUrl: null } },
    ]);

    const { items } = await service.forIdentity('me', 'INDIVIDUAL', NOW);

    expect(items).toEqual([
      { kind: 'requestOffers', count: 2, refId: 'r1', tone: 'gold' },
      { kind: 'adExpiring', count: 1, refId: 'p1', daysLeft: 2, tone: 'gold' },
      { kind: 'alertMatches', count: 4, refId: 'a1', tone: 'gold' },
      {
        kind: 'providerStory',
        count: 2,
        refId: 'c1',
        avatarUrl: 'logo.png',
        tone: 'gold',
      },
    ]);
  });

  it('only counts offers awaiting my answer on my open requests', async () => {
    await service.forIdentity('me', 'INDIVIDUAL', NOW);

    expect(prisma.requestOffer.findMany).toHaveBeenCalledWith({
      where: {
        status: 'SENT',
        request: { clientIdentityId: 'me', status: 'PENDING' },
      },
      select: { requestId: true },
    });
  });

  it('offers on several requests have no single target', async () => {
    prisma.requestOffer.findMany.mockResolvedValue([
      { requestId: 'r1' },
      { requestId: 'r2' },
    ]);

    const { items } = await service.forIdentity('me', 'INDIVIDUAL', NOW);

    expect(items[0]).toMatchObject({ kind: 'requestOffers', refId: null });
  });

  it('looks 3 days ahead for my live ads, and goes amber under 2 days', async () => {
    prisma.property.findMany.mockResolvedValue([
      { id: 'p1', endDate: new Date(NOW.getTime() + 0.5 * DAY) },
      { id: 'p2', endDate: new Date(NOW.getTime() + 2 * DAY) },
    ]);

    const { items } = await service.forIdentity('me', 'INDIVIDUAL', NOW);

    expect(prisma.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          identityId: 'me',
          status: 'ACTIVE',
          endDate: { gt: NOW, lte: new Date(NOW.getTime() + 3 * DAY) },
        },
        orderBy: { endDate: 'asc' },
      }),
    );
    expect(items[0]).toEqual({
      kind: 'adExpiring',
      count: 2,
      refId: null,
      daysLeft: 0,
      tone: 'amber',
    });
  });

  it("only saved, visible authors' live stories I haven't watched", async () => {
    await service.forIdentity('me', 'INDIVIDUAL', NOW);

    const { where } = prisma.identity.findMany.mock.calls[0][0];
    expect(where).toMatchObject({
      user: { isDisabled: false, isBlocked: false },
      favoritedByUsers: { some: { identityId: 'me' } },
      stories: {
        some: {
          status: 'ACTIVE',
          expiresAt: { gt: NOW },
          views: { none: { viewerIdentityId: 'me' } },
        },
      },
    });
  });

  describe('company', () => {
    it('is empty when nothing is going on', async () => {
      await expect(service.forIdentity('co', 'COMPANY', NOW)).resolves.toEqual({
        items: [],
      });
      expect(prisma.requestOffer.findMany).toHaveBeenCalledTimes(1);
    });

    it('lists billing, private requests, accepted offers, new public requests, my story', async () => {
      prisma.companySubscription.findMany.mockResolvedValue([
        {
          kind: 'TRIAL',
          companyPlanId: null,
          endsAt: new Date(NOW.getTime() + 3 * DAY),
          companyPlan: null,
        },
      ]);
      requests.findMine.mockImplementation((_id, { scope }) =>
        Promise.resolve(
          scope === 'company'
            ? [{ id: 'q1', createdAt: NOW }]
            : [
                {
                  id: 'p1',
                  createdAt: new Date(NOW.getTime() - 2 * 60 * 60 * 1000),
                },
                { id: 'p2', createdAt: new Date(NOW.getTime() - 2 * DAY) },
              ],
        ),
      );
      prisma.requestOffer.findMany.mockResolvedValue([{ requestId: 'r9' }]);
      prisma.story.findFirst.mockResolvedValue({
        expiresAt: new Date(NOW.getTime() + 9.5 * 60 * 60 * 1000),
      });
      prisma.storyView.count.mockResolvedValue(128);

      const { items } = await service.forIdentity('co', 'COMPANY', NOW);

      expect(items).toEqual([
        { kind: 'billing', count: 1, refId: null, daysLeft: 3, tone: 'amber' },
        { kind: 'privateRequests', count: 1, refId: 'q1', tone: 'gold' },
        { kind: 'offerAccepted', count: 1, refId: 'r9', tone: 'gold' },
        // Only the one from the last day
        { kind: 'publicRequests', count: 1, refId: 'p1', tone: 'gold' },
        {
          kind: 'myStory',
          count: 128,
          refId: 'co',
          hoursLeft: 9,
          tone: 'gold',
        },
      ]);
      expect(requests.findMine).toHaveBeenCalledWith('co', {
        scope: 'company',
        status: 'pending',
      });
      expect(requests.findMine).toHaveBeenCalledWith('co', {
        scope: 'public',
        status: 'pending',
      });
    });

    it('an overdue invoice or an expired plan is red', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: 'inv' });
      const { items } = await service.forIdentity('co', 'COMPANY', NOW);
      expect(items[0]).toEqual({
        kind: 'billing',
        count: 1,
        refId: null,
        tone: 'red',
      });

      prisma.invoice.findFirst.mockResolvedValue(null);
      prisma.companySubscription.findMany.mockResolvedValue([
        {
          kind: 'PAID',
          companyPlanId: 'plan',
          endsAt: new Date(NOW.getTime() - DAY),
          companyPlan: null,
        },
      ]);
      const expired = await service.forIdentity('co', 'COMPANY', NOW);
      expect(expired.items[0]).toMatchObject({ kind: 'billing', tone: 'red' });
    });

    it('a plan with more than 5 days left says nothing', async () => {
      prisma.companySubscription.findMany.mockResolvedValue([
        {
          kind: 'PAID',
          companyPlanId: 'plan',
          endsAt: new Date(NOW.getTime() + 20 * DAY),
          companyPlan: null,
        },
      ]);
      const { items } = await service.forIdentity('co', 'COMPANY', NOW);
      expect(items).toEqual([]);
    });

    it('only its recently accepted offers on unfinished requests', async () => {
      await service.forIdentity('co', 'COMPANY', NOW);
      expect(prisma.requestOffer.findMany).toHaveBeenCalledWith({
        where: {
          providerIdentityId: 'co',
          status: 'ACCEPTED',
          updatedAt: { gte: new Date(NOW.getTime() - 3 * DAY) },
          request: { completedAt: null },
        },
        select: { requestId: true },
      });
    });
  });

  describe('office', () => {
    it('is empty with credits left and nothing expiring', async () => {
      await expect(service.forIdentity('of', 'OFFICE', NOW)).resolves.toEqual({
        items: [],
      });
      expect(requests.findMine).not.toHaveBeenCalled();
    });

    it('credits running out (red at none, amber at one), expiring ads, my story', async () => {
      prisma.userPlanSlot.aggregate.mockResolvedValue({
        _sum: { adsRemaining: null },
      });
      prisma.property.findMany.mockResolvedValue([
        { id: 'ad', endDate: new Date(NOW.getTime() + 1.2 * DAY) },
      ]);
      prisma.story.findFirst.mockResolvedValue({
        expiresAt: new Date(NOW.getTime() + 23 * 60 * 60 * 1000),
      });
      prisma.storyView.count.mockResolvedValue(4);

      const { items } = await service.forIdentity('of', 'OFFICE', NOW);

      expect(items).toEqual([
        { kind: 'adCredits', count: 0, refId: null, tone: 'red' },
        {
          kind: 'adExpiring',
          count: 1,
          refId: 'ad',
          daysLeft: 1,
          tone: 'amber',
        },
        { kind: 'myStory', count: 4, refId: 'of', hoursLeft: 23, tone: 'gold' },
      ]);

      prisma.userPlanSlot.aggregate.mockResolvedValue({
        _sum: { adsRemaining: 1 },
      });
      const one = await service.forIdentity('of', 'OFFICE', NOW);
      expect(one.items[0]).toMatchObject({
        kind: 'adCredits',
        count: 1,
        tone: 'amber',
      });
    });

    it('counts views on its own live stories only', async () => {
      await service.forIdentity('of', 'OFFICE', NOW);
      expect(prisma.storyView.count).toHaveBeenCalledWith({
        where: {
          story: { identityId: 'of', status: 'ACTIVE', expiresAt: { gt: NOW } },
        },
      });
    });
  });
});
