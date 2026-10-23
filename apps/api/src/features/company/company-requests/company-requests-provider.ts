import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RequestOfferStatus, RequestStatus } from '@prisma/client';

import { assertCleanContent } from '../../../core/content-filter/content-filter';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { PushService } from '../../../core/push/push.service';
import { assertActiveCompanySubscription } from '../../company-subscriptions/company-subscription.rules';
import { assertApprovedProvider } from '../../identities/persona-rules';
import type { NotificationsService } from '../../notifications/notifications.service';
import { CompanyRequestResponseDto } from './dto/company-request-response.dto';
import { CreateRequestOfferDto } from './dto/create-request-offer.dto';
import type { CompanyRequestsReads } from './company-requests-reads';
import {
  type CompletedVia,
  DISMISSAL_REJECTED,
  DISMISSAL_REMOVED,
  getVisibleRequestOrThrow,
  PROVIDER_INCLUDE,
  type RequestWithClient,
} from './company-requests.rules';

/**
 * What a company or office does with a request: accept or reject it, reply
 * with an offer (telling the client), save it, take it off its lists, and
 * finish it (انهاء الطلب).
 */
export class CompanyRequestsProviderActions {
  // Same name as before the split, so the logs read the same
  private readonly logger = new Logger('CompanyRequestsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly push: PushService,
    private readonly reads: CompanyRequestsReads,
  ) {}

  async accept(
    id: string,
    identityId: string,
  ): Promise<CompanyRequestResponseDto> {
    await assertApprovedProvider(this.prisma, identityId);
    await assertActiveCompanySubscription(this.prisma, identityId);
    const request = await getVisibleRequestOrThrow(this.prisma, id, identityId);

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

    return this.reads.findOne(id, identityId);
  }

  async reject(
    id: string,
    identityId: string,
  ): Promise<CompanyRequestResponseDto> {
    const request = await getVisibleRequestOrThrow(this.prisma, id, identityId);

    // A public request: rejecting it hides it from this company only (it
    // shows under its مرفوضة); its shared status stays, so other companies
    // and the client aren't affected
    if (request.targetIdentityId === null) {
      await this.prisma.requestDismissal.upsert({
        where: { requestId_identityId: { requestId: id, identityId } },
        create: { requestId: id, identityId, kind: DISMISSAL_REJECTED },
        update: {},
      });
      return this.reads.findOne(id, identityId);
    }

    // A request sent directly to this company
    if (request.targetIdentityId !== identityId) {
      throw new NotFoundException('الطلب غير موجود');
    }
    await this.prisma.companyRequest.update({
      where: { id },
      data: { status: RequestStatus.REJECTED },
    });

    return this.reads.findOne(id, identityId);
  }

  /** A company saves a request it can see (اضافة الى المفضلة). */
  async bookmark(id: string, identityId: string): Promise<{ saved: true }> {
    await getVisibleRequestOrThrow(this.prisma, id, identityId);
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
    await getVisibleRequestOrThrow(this.prisma, id, identityId);
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
    const request = await getVisibleRequestOrThrow(this.prisma, id, identityId);
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
    return this.reads.findOne(id, identityId);
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
    const request = await getVisibleRequestOrThrow(this.prisma, id, identityId);

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
    assertCleanContent(message, excludes, notes);

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

    return this.reads.findOne(id, identityId);
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

  async markResponded(
    id: string,
    identityId: string,
  ): Promise<CompanyRequestResponseDto> {
    // Kept for app builds that still call it when they open a chat. Opening
    // a chat is not a reply: only respond() (a reply or offer) marks a
    // request answered, so this changes nothing
    await getVisibleRequestOrThrow(this.prisma, id, identityId);
    return this.reads.findOne(id, identityId);
  }
}
