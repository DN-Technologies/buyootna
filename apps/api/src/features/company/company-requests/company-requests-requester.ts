import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RequestOfferStatus, RequestStatus } from '@prisma/client';

import { addressDetailsWrite } from '../../../core/dto/address-details.dto';
import { assertCleanContent } from '../../../core/content-filter/content-filter';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import { hasActiveCompanySubscription } from '../../company-subscriptions/company-subscription.rules';
import { CompanyRequestResponseDto } from './dto/company-request-response.dto';
import { CreateCompanyRequestDto } from './dto/create-company-request.dto';
import type { CompanyRequestsReads } from './company-requests-reads';
import { toResponseDto } from './company-requests.mapper';
import { CLIENT_INCLUDE, parsePriceRange } from './company-requests.rules';

/**
 * What the requester does: submit a request (public, or to one company),
 * delete their own, and accept or reject the offers it got.
 */
export class CompanyRequestsRequesterActions {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reads: CompanyRequestsReads,
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
    assertCleanContent(dto.title, dto.description, dto.location);
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

    return toResponseDto(request, clientIdentityId, 0);
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
    return this.reads.findOne(id, identityId);
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
    return this.reads.findOne(id, identityId);
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
}
