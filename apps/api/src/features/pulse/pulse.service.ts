import { Injectable } from '@nestjs/common';
import { IdentityType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { VISIBLE_AUTHOR_WHERE } from '../stories/stories.mapper';
import { PulseItemDto } from './dto/pulse-response.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
// An ad shows in the pulse from this many days before it expires
const EXPIRING_WITHIN_DAYS = 3;
// …and in amber from this many
const URGENT_DAYS = 2;
const MAX_ITEMS = 6;

// The one value every row shares, or null
function sole(ids: string[]): string | null {
  const unique = new Set(ids);
  return unique.size === 1 ? ids[0] : null;
}

/**
 * The home pill's «النبض»: what is going on for the current profile right
 * now, most pressing first, as facts (the app writes the words). Each item
 * stays until it is acted on: an offer decided, an ad renewed, matches or
 * stories opened.
 */
@Injectable()
export class PulseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: AlertsService,
  ) {}

  async forIdentity(
    identityId: string,
    type: IdentityType,
    now = new Date(),
  ): Promise<{ items: PulseItemDto[] }> {
    if (type !== 'INDIVIDUAL') return { items: [] };

    const parts = await Promise.all([
      this.requestOffers(identityId),
      this.adsExpiring(identityId, now),
      this.alertMatches(identityId),
      this.providerStories(identityId, now),
    ]);
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
}
