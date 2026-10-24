import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { PulseService } from './pulse.service';

const NOW = new Date('2026-10-24T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

describe('PulseService', () => {
  let service: PulseService;
  let prisma: {
    requestOffer: { findMany: jest.Mock };
    property: { findMany: jest.Mock };
    identity: { findMany: jest.Mock };
  };
  let alerts: { findUnseenMatches: jest.Mock };

  beforeEach(async () => {
    prisma = {
      requestOffer: { findMany: jest.fn().mockResolvedValue([]) },
      property: { findMany: jest.fn().mockResolvedValue([]) },
      identity: { findMany: jest.fn().mockResolvedValue([]) },
    };
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
      ],
    }).compile();

    service = module.get(PulseService);
  });

  it('is empty when nothing is going on', async () => {
    await expect(service.forIdentity('me', 'INDIVIDUAL', NOW)).resolves.toEqual(
      { items: [] },
    );
  });

  it('is empty for companies and offices (not built yet)', async () => {
    await expect(service.forIdentity('me', 'COMPANY', NOW)).resolves.toEqual({
      items: [],
    });
    expect(prisma.requestOffer.findMany).not.toHaveBeenCalled();
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
});
