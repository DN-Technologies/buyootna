import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RequestOfferStatus, RequestStatus } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PushService } from '../../../core/push/push.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CreateCompanyRequestDto } from './dto/create-company-request.dto';
import { CreateRequestOfferDto } from './dto/create-request-offer.dto';
import { CompanyRequestResponseDto } from './dto/company-request-response.dto';
import {
  assertApprovedProvider,
  isApprovedProvider,
} from '../../identities/persona-rules';
import { addressDetailsWrite } from '../../../core/dto/address-details.dto';
import {
  assertActiveCompanySubscription,
  hasActiveCompanySubscription,
} from '../../company-subscriptions/company-subscription.rules';

const CLIENT_INCLUDE = {
  user: true,
  individualData: true,
  officeData: true,
  companyData: true,
  receivedReviews: { select: { rating: true } },
} satisfies Prisma.IdentityInclude;

const PROVIDER_INCLUDE = {
  companyData: true,
  officeData: true,
} satisfies Prisma.IdentityInclude;

// A rejected request stays on the requester's list this long
const REJECTED_VISIBLE_MS = 30 * 24 * 60 * 60 * 1000;

// RequestDismissal.kind: رفض on a public request (listed under مرفوضة), or
// the trash on an accepted one (listed nowhere)
const DISMISSAL_REJECTED = 'rejected';
const DISMISSAL_REMOVED = 'removed';

export type CompletedVia = 'in_app' | 'outside';

type ProviderIdentity = Prisma.IdentityGetPayload<{
  include: typeof PROVIDER_INCLUDE;
}>;

/** The company/office a request was sent to, or the one that accepted it. */
function toProviderInfo(identity: ProviderIdentity | null | undefined) {
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

const OFFERS_INCLUDE = {
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
function visibleOffers(
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

type RequestWithClient = Prisma.CompanyRequestGetPayload<{
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

@Injectable()
export class CompanyRequestsService {
  private readonly logger = new Logger(CompanyRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly push: PushService,
  ) {}

  /**
   * Submits a price-quote request as the current identity. Omitting
   * targetIdentityId publishes a public/marketplace request any company can
   * claim; setting it sends the request directly to that COMPANY/OFFICE.
   */
  async create(
    clientIdentityId: string,
    dto: CreateCompanyRequestDto,
  ): Promise<CompanyRequestResponseDto> {
    let targetIdentityId: string | null = null;

    if (dto.targetIdentityId) {
      const target = await this.prisma.identity.findUnique({
        where: { id: dto.targetIdentityId },
        select: {
          id: true,
          type: true,
          companyData: { select: { status: true } },
          officeData: { select: { status: true } },
        },
      });
      if (!target || (target.type !== 'COMPANY' && target.type !== 'OFFICE')) {
        throw new BadRequestException('الجهة المطلوبة غير موجودة');
      }
      // A company/office still under review can't receive requests yet
      const targetStatus = (target.companyData ?? target.officeData)?.status;
      if (targetStatus !== 'APPROVED') {
        throw new BadRequestException(
          'هذه الجهة غير متاحة لاستقبال الطلبات حالياً',
        );
      }
      if (target.id === clientIdentityId) {
        throw new BadRequestException('لا يمكن إرسال طلب إلى نفسك');
      }
      // Receiving private requests is part of a company's subscription
      if (!(await hasActiveCompanySubscription(this.prisma, target.id))) {
        throw new BadRequestException(
          'هذه الجهة غير متاحة لاستقبال الطلبات حالياً',
        );
      }
      targetIdentityId = target.id;
    }

    const request = await this.prisma.companyRequest.create({
      data: {
        clientIdentityId,
        targetIdentityId,
        title: dto.title,
        category: dto.category,
        priceRange: dto.priceRange,
        ...parsePriceRange(dto.priceRange),
        offerType: dto.offerType,
        location: dto.location,
        ...addressDetailsWrite(dto.addressDetails),
        latitude: dto.latitude,
        longitude: dto.longitude,
        images: dto.images ?? [],
        description: dto.description,
        status: RequestStatus.PENDING,
      },
      include: { clientIdentity: { include: CLIENT_INCLUDE } },
    });

    return this.toResponseDto(request, clientIdentityId, 0);
  }

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

    const previousOffersByClient = await this.countPreviousOffers(
      requests.map((r) => r.clientIdentityId),
    );

    return requests.map((r) => {
      const offers = visibleOffers(r.offers, identityId, r.clientIdentityId);
      return {
        ...this.toResponseDto(
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

    const previousOffersByClient = await this.countPreviousOffers(
      requests.map((r) => r.clientIdentityId),
    );

    return requests.map((r) =>
      this.toResponseDto(
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
    const request = await this.getVisibleRequestOrThrow(id, identityId, true);
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
      ...this.toResponseDto(request, identityId, previousOffers),
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

  async accept(
    id: string,
    identityId: string,
  ): Promise<CompanyRequestResponseDto> {
    await assertApprovedProvider(this.prisma, identityId);
    await assertActiveCompanySubscription(this.prisma, identityId);
    const request = await this.getVisibleRequestOrThrow(id, identityId);

    if (request.targetIdentityId && request.targetIdentityId !== identityId) {
      throw new NotFoundException('الطلب غير موجود');
    }

    // Atomic, race-safe claim: only succeeds if the request is still PENDING
    // at the moment of the update -- this is what makes "first company to
    // accept a public request wins" actually safe under concurrent accepts.
    const { count } = await this.prisma.companyRequest.updateMany({
      where: { id, status: RequestStatus.PENDING },
      data: {
        status: RequestStatus.ACCEPTED,
        acceptedByIdentityId: identityId,
      },
    });

    if (count === 0) {
      throw new ConflictException(
        'تم التعامل مع هذا الطلب بالفعل من قبل شركة أخرى',
      );
    }

    return this.findOne(id, identityId);
  }

  async reject(
    id: string,
    identityId: string,
  ): Promise<CompanyRequestResponseDto> {
    const request = await this.getVisibleRequestOrThrow(id, identityId);

    // A public request: rejecting it hides it from this company only (it
    // shows under its مرفوضة); its shared status stays, so other companies
    // and the client aren't affected
    if (request.targetIdentityId === null) {
      await this.prisma.requestDismissal.upsert({
        where: { requestId_identityId: { requestId: id, identityId } },
        create: { requestId: id, identityId, kind: DISMISSAL_REJECTED },
        update: {},
      });
      return this.findOne(id, identityId);
    }

    // A request sent directly to this company
    if (request.targetIdentityId !== identityId) {
      throw new NotFoundException('الطلب غير موجود');
    }
    await this.prisma.companyRequest.update({
      where: { id },
      data: { status: RequestStatus.REJECTED },
    });

    return this.findOne(id, identityId);
  }

  /** The requester deletes one of their own requests. */
  async removeMine(id: string, identityId: string): Promise<{ deleted: true }> {
    const { count } = await this.prisma.companyRequest.deleteMany({
      where: { id, clientIdentityId: identityId },
    });
    if (count === 0) throw new NotFoundException('الطلب غير موجود');
    return { deleted: true };
  }

  /** The requester deletes every request they submitted. */
  async removeAllMine(identityId: string): Promise<{ deleted: number }> {
    const { count } = await this.prisma.companyRequest.deleteMany({
      where: { clientIdentityId: identityId },
    });
    return { deleted: count };
  }

  /** A company saves a request it can see (اضافة الى المفضلة). */
  async bookmark(id: string, identityId: string): Promise<{ saved: true }> {
    await this.getVisibleRequestOrThrow(id, identityId);
    await this.prisma.requestBookmark.upsert({
      where: { requestId_identityId: { requestId: id, identityId } },
      create: { requestId: id, identityId },
      update: {},
    });
    return { saved: true };
  }

  /** A company removes a request from its saved ones. */
  async unbookmark(id: string, identityId: string): Promise<{ saved: false }> {
    await this.prisma.requestBookmark.deleteMany({
      where: { requestId: id, identityId },
    });
    return { saved: false };
  }
  /**
   * The trash on an accepted request: it leaves this company's lists for
   * good. Other companies and the client are not affected.
   */
  async removeFromMine(
    id: string,
    identityId: string,
  ): Promise<{ removed: true }> {
    await this.getVisibleRequestOrThrow(id, identityId);
    await this.prisma.requestDismissal.upsert({
      where: { requestId_identityId: { requestId: id, identityId } },
      create: { requestId: id, identityId, kind: DISMISSAL_REMOVED },
      update: { kind: DISMISSAL_REMOVED },
    });
    return { removed: true };
  }

  /**
   * انهاء الطلب: the company that took the request says the work is done
   * and where the final agreement was made. It leaves the company's
   * مقبولة; the client still sees it accepted.
   */
  async complete(
    id: string,
    identityId: string,
    via: CompletedVia,
  ): Promise<CompanyRequestResponseDto> {
    const request = await this.getVisibleRequestOrThrow(id, identityId);
    if (request.acceptedByIdentityId !== identityId) {
      throw new NotFoundException('الطلب غير موجود');
    }
    const { count } = await this.prisma.companyRequest.updateMany({
      where: { id, status: RequestStatus.ACCEPTED, completedAt: null },
      data: { completedAt: new Date(), completedVia: via },
    });
    if (count === 0) {
      throw new ConflictException('لا يمكن إنهاء هذا الطلب');
    }
    return this.findOne(id, identityId);
  }

  /**
   * A company answers a request: it gets an offer (message, notes, price) the
   * requester can accept or reject. One offer per company; answering again
   * updates it. A pending request becomes responded.
   */
  async respond(
    id: string,
    identityId: string,
    dto: CreateRequestOfferDto,
  ): Promise<CompanyRequestResponseDto> {
    await assertApprovedProvider(this.prisma, identityId);
    await assertActiveCompanySubscription(this.prisma, identityId);
    const request = await this.getVisibleRequestOrThrow(id, identityId);

    if (request.targetIdentityId && request.targetIdentityId !== identityId) {
      throw new NotFoundException('الطلب غير موجود');
    }
    if (
      request.status === RequestStatus.ACCEPTED ||
      request.status === RequestStatus.REJECTED
    ) {
      throw new ConflictException('تم إغلاق هذا الطلب');
    }

    // Every field is optional in the design, but a reply says something
    const message = dto.message?.trim() || null;
    const excludes = dto.excludes?.trim() || null;
    const notes = dto.notes?.trim() || null;
    if (!message && !excludes && !notes && dto.price === undefined) {
      throw new BadRequestException('اكتب تفاصيل العرض أو ملاحظات للعميل');
    }

    const data = {
      message,
      excludes,
      notes,
      price: dto.price ?? null,
      status: RequestOfferStatus.SENT,
    };
    await this.prisma.requestOffer.upsert({
      where: {
        requestId_providerIdentityId: {
          requestId: id,
          providerIdentityId: identityId,
        },
      },
      create: { requestId: id, providerIdentityId: identityId, ...data },
      update: data,
    });
    await this.prisma.companyRequest.updateMany({
      where: { id, status: RequestStatus.PENDING },
      data: { status: RequestStatus.RESPONDED },
    });
    await this.notifyClientOfReply(request, identityId);

    return this.findOne(id, identityId);
  }

  /**
   * Tells the client a company answered their request: an in-app notice on
   * the client persona and a push. Never throws: a failed notice must not
   * fail the reply.
   */
  private async notifyClientOfReply(
    request: RequestWithClient,
    providerIdentityId: string,
  ) {
    try {
      const provider = await this.prisma.identity.findUnique({
        where: { id: providerIdentityId },
        include: PROVIDER_INCLUDE,
      });
      const name =
        provider?.companyData?.name ?? provider?.officeData?.name ?? 'شركة';
      const title = 'رد جديد على طلبك';
      const body = `ردّت ${name} على طلبك «${request.title}»`;
      const userId = request.clientIdentity.userId;

      await this.notifications.create({
        userId,
        type: 'REQUEST_REPLY',
        title,
        body,
        identityId: request.clientIdentityId,
        data: { requestId: request.id },
      });
      const sessions = await this.prisma.session.findMany({
        where: { userId, pushToken: { not: null } },
        select: { pushToken: true },
      });
      await this.push.sendToTokens(
        sessions.map((s) => s.pushToken).filter((t): t is string => !!t),
        {
          title,
          body,
          data: {
            type: 'REQUEST_REPLY',
            route: `/request-details/${request.id}`,
            requestId: request.id,
          },
        },
      );
    } catch (err) {
      this.logger.error(`Reply notice for ${request.id} failed`, err as Error);
    }
  }

  /**
   * The requester accepts an offer: responded -> accepted, carried out by
   * that company; the other offers are rejected. Without `offerId` the only
   * offer (or, for a request answered before offers existed, the company it
   * was sent to) is meant.
   */
  async acceptOffer(
    id: string,
    identityId: string,
    offerId?: string,
  ): Promise<CompanyRequestResponseDto> {
    const { request, offer } = await this.getOwnOfferOrThrow(
      id,
      identityId,
      offerId,
    );
    const providerId =
      offer?.providerIdentityId ??
      request.acceptedByIdentityId ??
      request.targetIdentityId;
    if (!providerId) {
      throw new ConflictException('لا يوجد عرض من شركة لقبوله');
    }

    await this.prisma.$transaction([
      ...(offer
        ? [
            this.prisma.requestOffer.update({
              where: { id: offer.id },
              data: { status: RequestOfferStatus.ACCEPTED },
            }),
            this.prisma.requestOffer.updateMany({
              where: { requestId: id, NOT: { id: offer.id } },
              data: { status: RequestOfferStatus.REJECTED },
            }),
          ]
        : []),
      this.prisma.companyRequest.update({
        where: { id },
        data: {
          status: RequestStatus.ACCEPTED,
          acceptedByIdentityId: providerId,
        },
      }),
    ]);
    return this.findOne(id, identityId);
  }

  /**
   * The requester rejects an offer. The request is rejected once no offer is
   * left waiting (immediately for one answered before offers existed).
   */
  async rejectOffer(
    id: string,
    identityId: string,
    offerId?: string,
  ): Promise<CompanyRequestResponseDto> {
    const { offer } = await this.getOwnOfferOrThrow(id, identityId, offerId);

    if (offer) {
      await this.prisma.requestOffer.update({
        where: { id: offer.id },
        data: { status: RequestOfferStatus.REJECTED },
      });
    }
    const waiting = offer
      ? await this.prisma.requestOffer.count({
          where: { requestId: id, status: RequestOfferStatus.SENT },
        })
      : 0;
    if (waiting === 0) {
      await this.prisma.companyRequest.update({
        where: { id },
        data: { status: RequestStatus.REJECTED },
      });
    }
    return this.findOne(id, identityId);
  }

  /** The requester's own responded request and the offer being decided on. */
  private async getOwnOfferOrThrow(
    id: string,
    identityId: string,
    offerId?: string,
  ) {
    const request = await this.prisma.companyRequest.findUnique({
      where: { id },
      include: { offers: { orderBy: { createdAt: 'asc' } } },
    });
    if (!request || request.clientIdentityId !== identityId) {
      throw new NotFoundException('الطلب غير موجود');
    }
    if (request.status !== RequestStatus.RESPONDED) {
      throw new ConflictException('لا يمكن تنفيذ هذا الإجراء على الطلب');
    }

    const offers = request.offers ?? [];
    if (offerId) {
      const offer = offers.find((o) => o.id === offerId);
      if (!offer) throw new NotFoundException('العرض غير موجود');
      return { request, offer };
    }
    if (offers.length > 1) {
      throw new BadRequestException('حدد العرض المطلوب');
    }
    return { request, offer: offers[0] };
  }

  async markResponded(
    id: string,
    identityId: string,
  ): Promise<CompanyRequestResponseDto> {
    // Kept for app builds that still call it when they open a chat. Opening
    // a chat is not a reply: only respond() (a reply or offer) marks a
    // request answered, so this changes nothing
    await this.getVisibleRequestOrThrow(id, identityId);
    return this.findOne(id, identityId);
  }

  private async getVisibleRequestOrThrow(
    id: string,
    identityId: string,
    allowOwner = false,
  ): Promise<RequestWithClient> {
    const request = await this.prisma.companyRequest.findUnique({
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

  private async countPreviousOffers(
    clientIdentityIds: string[],
  ): Promise<Map<string, number>> {
    if (clientIdentityIds.length === 0) return new Map();

    const grouped = await this.prisma.companyRequest.groupBy({
      by: ['clientIdentityId'],
      where: { clientIdentityId: { in: clientIdentityIds } },
      _count: { _all: true },
    });

    return new Map(grouped.map((g) => [g.clientIdentityId, g._count._all]));
  }

  private toResponseDto(
    request: RequestWithClient,
    viewerIdentityId: string,
    previousOffers: number,
  ): CompanyRequestResponseDto {
    const client = request.clientIdentity;
    const profile =
      client.individualData || client.officeData || client.companyData;
    const name = profile?.name || 'مستخدم';
    const avatarUrl =
      client.individualData?.avatarUrl ??
      client.officeData?.logoUrl ??
      client.companyData?.logoUrl ??
      null;
    const ratings = client.receivedReviews.map((r) => r.rating);
    const rating =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10,
          ) / 10
        : null;

    return {
      id: request.id,
      clientIdentityId: request.clientIdentityId,
      title: request.title,
      clientName: name,
      requestNumber: `#${request.id.slice(-6).toUpperCase()}`,
      category: request.category,
      priceRange: request.priceRange,
      location: request.location,
      addressDetails: (request.addressDetails ?? null) as Record<
        string,
        string
      > | null,
      attachmentsCount: request.images.length,
      offerType: request.offerType,
      images: request.images,
      latitude: request.latitude,
      longitude: request.longitude,
      description: request.description,
      status:
        request.status.toLowerCase() as CompanyRequestResponseDto['status'],
      scope: request.targetIdentityId ? 'company' : 'public',
      completed: !!request.completedAt,
      completedVia: (request.completedVia ?? null) as CompletedVia | null,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      client: {
        userId: client.userId,
        name,
        joinedDate: client.createdAt.toISOString(),
        previousOffers,
        rating,
        avatarUrl,
        phone: client.user.phone,
        whatsapp: client.user.whatsapp,
        isVerified:
          client.companyData?.isVerified ??
          client.officeData?.isVerified ??
          false,
      },
    };
  }
}
