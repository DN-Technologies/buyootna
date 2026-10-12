import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RequestOfferStatus, RequestStatus } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
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
          reply: { message: o.message, notes: o.notes },
        },
      ];
    });
}

type RequestWithClient = Prisma.CompanyRequestGetPayload<{
  include: { clientIdentity: { include: typeof CLIENT_INCLUDE } };
}>;

export type RequestScopeFilter = 'company' | 'public' | 'mine';
export type RequestStatusFilter =
  'all' | 'pending' | 'accepted' | 'responded' | 'rejected';

@Injectable()
export class CompanyRequestsService {
  constructor(private readonly prisma: PrismaService) {}

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
    },
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

    if (params.status && params.status !== 'all') {
      where.status = params.status.toUpperCase() as RequestStatus;
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
    // The requester's rejected requests drop off their list after 30 days
    if (params.scope === 'mine') {
      and.push({
        NOT: {
          status: RequestStatus.REJECTED,
          updatedAt: { lt: new Date(Date.now() - REJECTED_VISIBLE_MS) },
        },
      });
    }
    if (and.length) where.AND = and;

    const requests = await this.prisma.companyRequest.findMany({
      where,
      include: {
        clientIdentity: { include: CLIENT_INCLUDE },
        targetIdentity: { include: PROVIDER_INCLUDE },
        acceptedByIdentity: { include: PROVIDER_INCLUDE },
        offers: OFFERS_INCLUDE,
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
        provider: toProviderInfo(r.acceptedByIdentity ?? r.targetIdentity),
        offers,
        offersCount: offers.length,
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
      },
    });
    const offers = visibleOffers(
      extras?.offers,
      identityId,
      request.clientIdentityId,
    );
    return {
      ...this.toResponseDto(request, identityId, previousOffers),
      provider: toProviderInfo(
        extras?.acceptedByIdentity ?? extras?.targetIdentity,
      ),
      offers,
      offersCount: offers.length,
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

    // A company can only reject a request that was sent directly to it --
    // rejecting a public/marketplace lead would incorrectly remove it from
    // every other company's list too, since status is a single shared field.
    if (request.targetIdentityId !== identityId) {
      throw new ForbiddenException('لا يمكن رفض طلب عام غير موجه لشركتك');
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

    const data = {
      message: dto.message,
      notes: dto.notes ?? null,
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

    return this.findOne(id, identityId);
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
    await this.getVisibleRequestOrThrow(id, identityId);

    await this.prisma.companyRequest.updateMany({
      where: { id, status: RequestStatus.PENDING },
      data: { status: RequestStatus.RESPONDED },
    });

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
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      client: {
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
