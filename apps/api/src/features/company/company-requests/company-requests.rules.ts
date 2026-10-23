import { NotFoundException } from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';

import type { PrismaService } from '../../../core/prisma/prisma.service';
import { CompanyRequestResponseDto } from './dto/company-request-response.dto';

/**
 * What every part of the company requests feature shares: the includes, the
 * list rules (dismissals, the 30-day rejected window), who sees which status
 * and offers, and the visibility check.
 */

export const CLIENT_INCLUDE = {
  user: true,
  individualData: true,
  officeData: true,
  companyData: true,
  receivedReviews: { select: { rating: true } },
} satisfies Prisma.IdentityInclude;

export const PROVIDER_INCLUDE = {
  companyData: true,
  officeData: true,
} satisfies Prisma.IdentityInclude;

// A rejected request stays on the requester's list this long
export const REJECTED_VISIBLE_MS = 30 * 24 * 60 * 60 * 1000;

// RequestDismissal.kind: رفض on a public request (listed under مرفوضة), or
// the trash on an accepted one (listed nowhere)
export const DISMISSAL_REJECTED = 'rejected';
export const DISMISSAL_REMOVED = 'removed';

export type CompletedVia = 'in_app' | 'outside';

type ProviderIdentity = Prisma.IdentityGetPayload<{
  include: typeof PROVIDER_INCLUDE;
}>;

/** The company/office a request was sent to, or the one that accepted it. */
export function toProviderInfo(identity: ProviderIdentity | null | undefined) {
  const data = identity?.companyData ?? identity?.officeData;
  if (!identity || !data) return null;
  return {
    id: identity.id,
    name: data.name,
    logoUrl: data.logoUrl ?? null,
    specialty: identity.companyData?.specialty ?? data.services ?? null,
    isVerified: data.isVerified,
  };
}

export const OFFERS_INCLUDE = {
  include: { provider: { include: PROVIDER_INCLUDE } },
  orderBy: { createdAt: 'asc' },
} satisfies Prisma.CompanyRequest$offersArgs;

type OfferWithProvider = Prisma.RequestOfferGetPayload<{
  include: { provider: { include: typeof PROVIDER_INCLUDE } };
}>;

/**
 * The status a company sees. «تم الرد» is its own: a request counts as
 * answered for a company once that company sent its reply or offer (its
 * RequestOffer), never because another company answered a public request
 * or because a chat about it was opened. Accepted and rejected stay as the
 * request has them.
 */
export function statusForProvider(
  status: RequestStatus,
  offers: { providerIdentityId: string }[] | undefined,
  viewerIdentityId: string,
): CompanyRequestResponseDto['status'] {
  if (status === RequestStatus.PENDING || status === RequestStatus.RESPONDED) {
    return offers?.some((o) => o.providerIdentityId === viewerIdentityId)
      ? 'responded'
      : 'pending';
  }
  return status.toLowerCase() as CompanyRequestResponseDto['status'];
}

/**
 * The offers a viewer may see: the requester sees every company's answer, a
 * company only its own.
 */
export function visibleOffers(
  offers: OfferWithProvider[] | undefined,
  viewerIdentityId: string,
  clientIdentityId: string,
) {
  return (offers ?? [])
    .filter(
      (o) =>
        viewerIdentityId === clientIdentityId ||
        o.providerIdentityId === viewerIdentityId,
    )
    .flatMap((o) => {
      const provider = toProviderInfo(o.provider);
      if (!provider) return [];
      return [
        {
          id: o.id,
          provider,
          price: o.price,
          status: o.status.toLowerCase() as 'sent' | 'accepted' | 'rejected',
          reply: { message: o.message, excludes: o.excludes, notes: o.notes },
        },
      ];
    });
}

export type RequestWithClient = Prisma.CompanyRequestGetPayload<{
  include: { clientIdentity: { include: typeof CLIENT_INCLUDE } };
}>;

/**
 * A request's price range text («200 - 800 د.ك», Arabic or Latin digits,
 * thousands commas) as two numbers, for the price filter.
 */
export function parsePriceRange(text?: string | null): {
  priceMin: number | null;
  priceMax: number | null;
} {
  const toNumber = (part?: string) => {
    if (!part) return null;
    const latin = part
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      .replace(/[^0-9.]/g, '');
    if (!latin) return null;
    const n = Number(latin);
    return Number.isFinite(n) ? n : null;
  };
  if (!text || !text.includes('-')) return { priceMin: null, priceMax: null };
  const [from, to] = text.split('-');
  return { priceMin: toNumber(from), priceMax: toNumber(to) };
}

/** The filters of the company's requests list (تصفية البحث). */
export interface RequestListFilters {
  // التخصص: the request's category; نوع الخدمة: its title (request type)
  specialty?: string;
  type?: string;
  // نطاق السعر: requests whose range overlaps it
  priceFrom?: number;
  priceTo?: number;
  // العنوان: a governorate or area name in the request's location
  location?: string;
  // المفضلة: only the requests this company saved
  saved?: boolean;
}

export type RequestScopeFilter = 'company' | 'public' | 'mine';
export type RequestStatusFilter =
  'all' | 'pending' | 'accepted' | 'responded' | 'rejected';

/**
 * A request this profile may see: sent to it, public, accepted by it, or
 * (allowOwner) its own. Anything else is the same 404 as a missing one.
 */
export async function getVisibleRequestOrThrow(
  prisma: PrismaService,
  id: string,
  identityId: string,
  allowOwner = false,
): Promise<RequestWithClient> {
  const request = await prisma.companyRequest.findUnique({
    where: { id },
    include: { clientIdentity: { include: CLIENT_INCLUDE } },
  });

  const isVisible =
    !!request &&
    (request.targetIdentityId === identityId ||
      request.targetIdentityId === null ||
      request.acceptedByIdentityId === identityId ||
      (allowOwner && request.clientIdentityId === identityId));

  if (!request || !isVisible) {
    throw new NotFoundException('الطلب غير موجود');
  }

  return request;
}

/** How many requests each of these clients has made (their «طلبات سابقة»). */
export async function countPreviousOffers(
  prisma: PrismaService,
  clientIdentityIds: string[],
): Promise<Map<string, number>> {
  if (clientIdentityIds.length === 0) return new Map();

  const grouped = await prisma.companyRequest.groupBy({
    by: ['clientIdentityId'],
    where: { clientIdentityId: { in: clientIdentityIds } },
    _count: { _all: true },
  });

  return new Map(grouped.map((g) => [g.clientIdentityId, g._count._all]));
}
