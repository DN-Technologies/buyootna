import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateCompanyRequestDto } from './dto/create-company-request.dto';
import { CompanyRequestResponseDto } from './dto/company-request-response.dto';
import {
  assertApprovedProvider,
  isApprovedProvider,
} from '../../identities/persona-rules';

const CLIENT_INCLUDE = {
  user: true,
  individualData: true,
  officeData: true,
  companyData: true,
  receivedReviews: { select: { rating: true } },
} satisfies Prisma.IdentityInclude;

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

    if (params.search?.trim()) {
      const q = params.search.trim();
      where.AND = [
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

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
    const request = await this.getVisibleRequestOrThrow(id, identityId);
    const previousOffers = await this.prisma.companyRequest.count({
      where: { clientIdentityId: request.clientIdentityId, NOT: { id } },
    });
    return this.toResponseDto(request, identityId, previousOffers);
  }

  async accept(
    id: string,
    identityId: string,
  ): Promise<CompanyRequestResponseDto> {
    await assertApprovedProvider(this.prisma, identityId);
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
  ): Promise<RequestWithClient> {
    const request = await this.prisma.companyRequest.findUnique({
      where: { id },
      include: { clientIdentity: { include: CLIENT_INCLUDE } },
    });

    const isVisible =
      !!request &&
      (request.targetIdentityId === identityId ||
        request.targetIdentityId === null ||
        request.acceptedByIdentityId === identityId);

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
