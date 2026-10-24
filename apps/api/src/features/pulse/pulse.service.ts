import { Injectable } from '@nestjs/common';
import { IdentityType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { CompanyRequestsService } from '../company/company-requests/company-requests.service';
import { getCompanySubscriptionState } from '../company-subscriptions/company-subscription.rules';
import { VISIBLE_AUTHOR_WHERE } from '../stories/stories.mapper';
import { PulseItemDto } from './dto/pulse-response.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
// An ad shows in the pulse from this many days before it expires
const EXPIRING_WITHIN_DAYS = 3;
// …and in amber from this many
const URGENT_DAYS = 2;
// A trial or plan shows in the pulse this many days before it ends
const BILLING_WARN_DAYS = 5;
// An offer of mine accepted this recently, and public requests this new
const RECENT_MS = 3 * DAY_MS;
const NEW_REQUEST_MS = DAY_MS;
const HOUR_MS = 60 * 60 * 1000;
const MAX_ITEMS = 6;

// The one value every row shares, or null
function sole(ids: string[]): string | null {
  const unique = new Set(ids);
  return unique.size === 1 ? ids[0] : null;
}

/**
 * The home pill's «النبض»: what is going on for the current profile right
 * now, most pressing first, as facts (the app writes the words). Each
 * profile type has its own; an item stays until it is acted on (an offer
 * answered, an ad renewed, a request replied to, a bill paid), or, for news
 * (an accepted offer, new public requests), for a few days.
 */
@Injectable()
export class PulseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: AlertsService,
    private readonly requests: CompanyRequestsService,
  ) {}

  async forIdentity(
    identityId: string,
    type: IdentityType,
    now = new Date(),
  ): Promise<{ items: PulseItemDto[] }> {
    const parts = await Promise.all(
      type === 'COMPANY'
        ? [
            this.billing(identityId, now),
            this.privateRequests(identityId),
            this.offersAccepted(identityId, now),
            this.publicRequests(identityId, now),
            this.myStory(identityId, now),
          ]
        : type === 'OFFICE'
          ? [
              this.adCredits(identityId),
              this.adsExpiring(identityId, now),
              this.myStory(identityId, now),
            ]
          : [
              this.requestOffers(identityId),
              this.adsExpiring(identityId, now),
              this.alertMatches(identityId),
              this.providerStories(identityId, now),
            ],
    );
    return {
      items: parts
        .filter((item): item is PulseItemDto => item !== null)
        .slice(0, MAX_ITEMS),
    };
  }

  // Offers on my open requests still waiting for my answer
  private async requestOffers(
    identityId: string,
  ): Promise<PulseItemDto | null> {
    const offers = await this.prisma.requestOffer.findMany({
      where: {
        status: 'SENT',
        request: { clientIdentityId: identityId, status: 'PENDING' },
      },
      select: { requestId: true },
    });
    if (offers.length === 0) return null;
    return {
      kind: 'requestOffers',
      count: offers.length,
      refId: sole(offers.map((o) => o.requestId)),
      tone: 'gold',
    };
  }

  // My live ads that expire within the next few days
  private async adsExpiring(
    identityId: string,
    now: Date,
  ): Promise<PulseItemDto | null> {
    const ads = await this.prisma.property.findMany({
      where: {
        identityId,
        status: 'ACTIVE',
        endDate: {
          gt: now,
          lte: new Date(now.getTime() + EXPIRING_WITHIN_DAYS * DAY_MS),
        },
      },
      select: { id: true, endDate: true },
      orderBy: { endDate: 'asc' },
    });
    if (ads.length === 0) return null;
    const daysLeft = Math.floor(
      (ads[0].endDate!.getTime() - now.getTime()) / DAY_MS,
    );
    return {
      kind: 'adExpiring',
      count: ads.length,
      refId: sole(ads.map((a) => a.id)),
      daysLeft,
      tone: daysLeft < URGENT_DAYS ? 'amber' : 'gold',
    };
  }

  private async alertMatches(identityId: string): Promise<PulseItemDto | null> {
    const { count, alertId } = await this.alerts.findUnseenMatches(identityId);
    if (count === 0) return null;
    return {
      kind: 'alertMatches',
      count,
      refId: alertId,
      tone: 'gold',
    };
  }

  // Saved companies and offices with a live story I haven't watched
  private async providerStories(
    identityId: string,
    now: Date,
  ): Promise<PulseItemDto | null> {
    const authors = await this.prisma.identity.findMany({
      where: {
        ...VISIBLE_AUTHOR_WHERE,
        favoritedByUsers: { some: { identityId } },
        stories: {
          some: {
            status: 'ACTIVE',
            expiresAt: { gt: now },
            views: { none: { viewerIdentityId: identityId } },
          },
        },
      },
      select: {
        id: true,
        companyData: { select: { logoUrl: true } },
        officeData: { select: { logoUrl: true } },
      },
      take: 10,
    });
    if (authors.length === 0) return null;
    const first = authors[0];
    return {
      kind: 'providerStory',
      count: authors.length,
      refId: first.id,
      avatarUrl:
        first.companyData?.logoUrl ?? first.officeData?.logoUrl ?? null,
      tone: 'gold',
    };
  }

  // Company: an overdue invoice or an expired plan (red), or a trial or
  // plan ending within a few days (amber)
  private async billing(
    identityId: string,
    now: Date,
  ): Promise<PulseItemDto | null> {
    const [overdue, subscription] = await Promise.all([
      this.prisma.invoice.findFirst({
        where: {
          identityId,
          // An abandoned subscription checkout is not a debt
          companyPlanId: null,
          OR: [
            { status: 'OVERDUE' },
            { status: 'PENDING', dueDate: { lt: now } },
          ],
        },
        select: { id: true },
      }),
      getCompanySubscriptionState(this.prisma, identityId, now),
    ]);
    if (overdue || subscription.status === 'EXPIRED') {
      return { kind: 'billing', count: 1, refId: null, tone: 'red' };
    }
    const ending =
      (subscription.status === 'TRIAL' || subscription.status === 'ACTIVE') &&
      subscription.daysLeft <= BILLING_WARN_DAYS;
    if (!ending) return null;
    return {
      kind: 'billing',
      count: 1,
      refId: null,
      daysLeft: subscription.daysLeft,
      tone: 'amber',
    };
  }

  // Company: requests sent to it directly, still open and unanswered
  private async privateRequests(
    identityId: string,
  ): Promise<PulseItemDto | null> {
    const waiting = await this.requests.findMine(identityId, {
      scope: 'company',
      status: 'pending',
    });
    if (waiting.length === 0) return null;
    return {
      kind: 'privateRequests',
      count: waiting.length,
      refId: sole(waiting.map((r) => r.id)),
      tone: 'gold',
    };
  }

  // Company: its offers a client accepted lately, on unfinished requests
  private async offersAccepted(
    identityId: string,
    now: Date,
  ): Promise<PulseItemDto | null> {
    const accepted = await this.prisma.requestOffer.findMany({
      where: {
        providerIdentityId: identityId,
        status: 'ACCEPTED',
        updatedAt: { gte: new Date(now.getTime() - RECENT_MS) },
        request: { completedAt: null },
      },
      select: { requestId: true },
    });
    if (accepted.length === 0) return null;
    return {
      kind: 'offerAccepted',
      count: accepted.length,
      refId: sole(accepted.map((o) => o.requestId)),
      tone: 'gold',
    };
  }

  // Company: open public requests of its specialty from the last day that
  // it hasn't answered or dismissed (the requests list's own rules)
  private async publicRequests(
    identityId: string,
    now: Date,
  ): Promise<PulseItemDto | null> {
    const open = await this.requests.findMine(identityId, {
      scope: 'public',
      status: 'pending',
    });
    const since = now.getTime() - NEW_REQUEST_MS;
    const fresh = open.filter((r) => new Date(r.createdAt).getTime() >= since);
    if (fresh.length === 0) return null;
    return {
      kind: 'publicRequests',
      count: fresh.length,
      refId: sole(fresh.map((r) => r.id)),
      tone: 'gold',
    };
  }

  // Office: ad credits running out (none left: red, one: amber)
  private async adCredits(identityId: string): Promise<PulseItemDto | null> {
    const { _sum } = await this.prisma.userPlanSlot.aggregate({
      where: { identityId, status: 'ACTIVE' },
      _sum: { adsRemaining: true },
    });
    const left = _sum.adsRemaining ?? 0;
    if (left > 1) return null;
    return {
      kind: 'adCredits',
      count: left,
      refId: null,
      tone: left === 0 ? 'red' : 'amber',
    };
  }

  // Company and office: my live stories, their views and time left
  private async myStory(
    identityId: string,
    now: Date,
  ): Promise<PulseItemDto | null> {
    const live = {
      identityId,
      status: 'ACTIVE' as const,
      expiresAt: { gt: now },
    };
    const [latest, views] = await Promise.all([
      this.prisma.story.findFirst({
        where: live,
        orderBy: { expiresAt: 'desc' },
        select: { expiresAt: true },
      }),
      this.prisma.storyView.count({ where: { story: live } }),
    ]);
    if (!latest) return null;
    return {
      kind: 'myStory',
      count: views,
      refId: identityId,
      hoursLeft: Math.floor(
        (latest.expiresAt.getTime() - now.getTime()) / HOUR_MS,
      ),
      tone: 'gold',
    };
  }
}
