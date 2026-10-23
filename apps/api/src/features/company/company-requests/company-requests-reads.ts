import { Prisma, RequestStatus } from '@prisma/client';

import type { PrismaService } from '../../../core/prisma/prisma.service';
import { notBlockedWithIdentityWhere } from '../../blocks/block.rules';
import { isApprovedProvider } from '../../identities/persona-rules';
import { CompanyRequestResponseDto } from './dto/company-request-response.dto';
import { toResponseDto } from './company-requests.mapper';
import {
  CLIENT_INCLUDE,
  countPreviousOffers,
  DISMISSAL_REJECTED,
  getVisibleRequestOrThrow,
  OFFERS_INCLUDE,
  PROVIDER_INCLUDE,
  REJECTED_VISIBLE_MS,
  type RequestListFilters,
  type RequestScopeFilter,
  type RequestStatusFilter,
  statusForProvider,
  toProviderInfo,
  visibleOffers,
} from './company-requests.rules';

/** The lists (a company's, the marketplace, the requester's own), one request, and the admin's view. */
export class CompanyRequestsReads {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(
    identityId: string,
    params: {
      scope: RequestScopeFilter;
      status?: RequestStatusFilter;
      search?: string;
    } & RequestListFilters,
  ): Promise<CompanyRequestResponseDto[]> {
    // Leads (directed or marketplace) reach approved companies/offices only;
    // a provider's own submissions ("mine") stay visible either way
    if (
      params.scope !== 'mine' &&
      !(await isApprovedProvider(this.prisma, identityId))
    ) {
      return [];
    }

    const where: Prisma.CompanyRequestWhereInput =
      params.scope === 'company'
        ? { targetIdentityId: identityId }
        : params.scope === 'mine'
          ? // The requester's own submissions, directed and public alike --
            // this is the "طلباتي" surface in My Activity.
            { clientIdentityId: identityId }
          : {
              targetIdentityId: null,
              OR: [
                { acceptedByIdentityId: null },
                { acceptedByIdentityId: identityId },
              ],
            };

    // What this company took off its lists: a public request it rejected
    // shows under مرفوضة only (whatever its shared status), for 30 days; one
    // it removed (the trash on an accepted request) shows nowhere
    const rejectedCutoff = new Date(Date.now() - REJECTED_VISIBLE_MS);
    const publicRejected =
      params.scope === 'public' && params.status === 'rejected';
    if (params.scope !== 'mine') {
      where.dismissals = publicRejected
        ? {
            some: {
              identityId,
              kind: DISMISSAL_REJECTED,
              createdAt: { gte: rejectedCutoff },
            },
          }
        : { none: { identityId } };
    }

    const providerAnswered =
      params.scope !== 'mine' &&
      (params.status === 'pending' || params.status === 'responded');
    if (providerAnswered) {
      // قيد الانتظار / تم الرد are this company's own (statusForProvider):
      // open requests it has or hasn't sent its reply to
      where.status = { in: [RequestStatus.PENDING, RequestStatus.RESPONDED] };
      where.offers =
        params.status === 'responded'
          ? { some: { providerIdentityId: identityId } }
          : { none: { providerIdentityId: identityId } };
    } else if (params.status && params.status !== 'all' && !publicRejected) {
      where.status = params.status.toUpperCase() as RequestStatus;
    }
    // A finished request (انهاء الطلب) leaves the company's مقبولة; it stays
    // under الكل
    if (params.scope !== 'mine' && params.status === 'accepted') {
      where.completedAt = null;
    }

    const and: Prisma.CompanyRequestWhereInput[] = [];
    // Nothing from a client blocked either way with this company
    // (Guideline 1.2)
    if (params.scope !== 'mine') {
      and.push({
        clientIdentity: { user: notBlockedWithIdentityWhere(identityId) },
      });
    }
    if (params.search?.trim()) {
      const q = params.search.trim();
      and.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
        ],
      });
    }
    // Public requests reach the companies of their specialty (the services
    // catalogue's مجال التخصص); one with no specialty reaches everyone, and
    // a company with no specialty yet still sees them all. A request this
    // company already took stays on its list either way.
    if (params.scope !== 'company' && params.scope !== 'mine') {
      const specialty = (
        await this.prisma.companyIdentityData.findUnique({
          where: { identityId },
          select: { specialty: true },
        })
      )?.specialty;
      if (specialty) {
        and.push({
          OR: [
            { category: specialty },
            { category: null },
            { acceptedByIdentityId: identityId },
          ],
        });
      }
    }
    // تصفية البحث and المفضلة
    if (params.specialty) and.push({ category: params.specialty });
    if (params.type) and.push({ title: params.type });
    if (params.priceFrom !== undefined) {
      and.push({ priceMax: { gte: params.priceFrom } });
    }
    if (params.priceTo !== undefined) {
      and.push({ priceMin: { lte: params.priceTo } });
    }
    if (params.location?.trim()) {
      and.push({
        location: { contains: params.location.trim(), mode: 'insensitive' },
      });
    }
    if (params.saved) and.push({ bookmarks: { some: { identityId } } });
    // Rejected requests drop off every list after 30 days (الطلبات
    // المرفوضة تختفي بعد 30يوم)
    and.push({
      NOT: {
        status: RequestStatus.REJECTED,
        updatedAt: { lt: rejectedCutoff },
      },
    });
    if (and.length) where.AND = and;

    const requests = await this.prisma.companyRequest.findMany({
      where,
      include: {
        clientIdentity: { include: CLIENT_INCLUDE },
        targetIdentity: { include: PROVIDER_INCLUDE },
        acceptedByIdentity: { include: PROVIDER_INCLUDE },
        offers: OFFERS_INCLUDE,
        bookmarks: { where: { identityId }, select: { id: true } },
        dismissals: { where: { identityId }, select: { kind: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const previousOffersByClient = await countPreviousOffers(
      this.prisma,
      requests.map((r) => r.clientIdentityId),
    );

    return requests.map((r) => {
      const offers = visibleOffers(r.offers, identityId, r.clientIdentityId);
      return {
        ...toResponseDto(
          r,
          identityId,
          previousOffersByClient.get(r.clientIdentityId) ?? 0,
        ),
        ...(params.scope !== 'mine'
          ? { status: statusForProvider(r.status, r.offers, identityId) }
          : {}),
        // Rejected by this company: مرفوضة for it, whatever others see
        ...(r.dismissals?.some((d) => d.kind === DISMISSAL_REJECTED)
          ? { status: 'rejected' as const }
          : {}),
        provider: toProviderInfo(r.acceptedByIdentity ?? r.targetIdentity),
        offers,
        offersCount: offers.length,
        isSaved: (r.bookmarks?.length ?? 0) > 0,
      };
    });
  }

  // Admin-facing: every request tied to this identity, either as the
  // individual who submitted it or as the company/office it was sent to /
  // accepted by. No visibility restriction -- callers are admin routes.
  async findForIdentityAsAdmin(
    identityId: string,
    role: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE',
  ): Promise<CompanyRequestResponseDto[]> {
    const where: Prisma.CompanyRequestWhereInput =
      role === 'INDIVIDUAL'
        ? { clientIdentityId: identityId }
        : {
            OR: [
              { targetIdentityId: identityId },
              { acceptedByIdentityId: identityId },
            ],
          };

    const requests = await this.prisma.companyRequest.findMany({
      where,
      include: { clientIdentity: { include: CLIENT_INCLUDE } },
      orderBy: { createdAt: 'desc' },
    });

    const previousOffersByClient = await countPreviousOffers(
      this.prisma,
      requests.map((r) => r.clientIdentityId),
    );

    return requests.map((r) =>
      toResponseDto(
        r,
        identityId,
        previousOffersByClient.get(r.clientIdentityId) ?? 0,
      ),
    );
  }

  async findOne(
    id: string,
    identityId: string,
  ): Promise<CompanyRequestResponseDto> {
    // The requester may open their own request; accept / reject / respond
    // keep the provider-only visibility rules
    const request = await getVisibleRequestOrThrow(
      this.prisma,
      id,
      identityId,
      true,
    );
    const previousOffers = await this.prisma.companyRequest.count({
      where: { clientIdentityId: request.clientIdentityId, NOT: { id } },
    });
    const extras = await this.prisma.companyRequest.findUnique({
      where: { id },
      select: {
        targetIdentity: { include: PROVIDER_INCLUDE },
        acceptedByIdentity: { include: PROVIDER_INCLUDE },
        offers: OFFERS_INCLUDE,
        bookmarks: { where: { identityId }, select: { id: true } },
        dismissals: { where: { identityId }, select: { kind: true } },
      },
    });
    const offers = visibleOffers(
      extras?.offers,
      identityId,
      request.clientIdentityId,
    );
    return {
      ...toResponseDto(request, identityId, previousOffers),
      // A company sees its own تم الرد; the requester the request's status
      ...(identityId !== request.clientIdentityId
        ? {
            status: statusForProvider(
              request.status,
              extras?.offers,
              identityId,
            ),
          }
        : {}),
      ...(extras?.dismissals?.some((d) => d.kind === DISMISSAL_REJECTED)
        ? { status: 'rejected' as const }
        : {}),
      provider: toProviderInfo(
        extras?.acceptedByIdentity ?? extras?.targetIdentity,
      ),
      offers,
      offersCount: offers.length,
      isSaved: (extras?.bookmarks?.length ?? 0) > 0,
    };
  }
}
