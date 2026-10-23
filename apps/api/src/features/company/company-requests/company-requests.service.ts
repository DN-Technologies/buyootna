import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../core/prisma/prisma.service';
import { PushService } from '../../../core/push/push.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CompanyRequestResponseDto } from './dto/company-request-response.dto';
import { CreateCompanyRequestDto } from './dto/create-company-request.dto';
import { CreateRequestOfferDto } from './dto/create-request-offer.dto';
import { CompanyRequestsProviderActions } from './company-requests-provider';
import { CompanyRequestsReads } from './company-requests-reads';
import { CompanyRequestsRequesterActions } from './company-requests-requester';
import type {
  CompletedVia,
  RequestListFilters,
  RequestScopeFilter,
  RequestStatusFilter,
} from './company-requests.rules';

export { parsePriceRange, statusForProvider } from './company-requests.rules';
export type {
  CompletedVia,
  RequestListFilters,
  RequestScopeFilter,
  RequestStatusFilter,
} from './company-requests.rules';

/**
 * Company requests (طلبات عروض الأسعار), as the controller and the admin use
 * them. The work lives in three parts:
 *  - CompanyRequestsReads: the lists and one request
 *    (company-requests-reads.ts);
 *  - CompanyRequestsProviderActions: what a company does with a request
 *    (company-requests-provider.ts);
 *  - CompanyRequestsRequesterActions: what the requester does
 *    (company-requests-requester.ts).
 * Shared rules (includes, visibility, who sees which status and offers) are
 * in company-requests.rules.ts, and the response shape in
 * company-requests.mapper.ts.
 */
@Injectable()
export class CompanyRequestsService {
  private readonly reads: CompanyRequestsReads;
  private readonly provider: CompanyRequestsProviderActions;
  private readonly requester: CompanyRequestsRequesterActions;

  constructor(
    prisma: PrismaService,
    notifications: NotificationsService,
    push: PushService,
  ) {
    this.reads = new CompanyRequestsReads(prisma);
    this.provider = new CompanyRequestsProviderActions(
      prisma,
      notifications,
      push,
      this.reads,
    );
    this.requester = new CompanyRequestsRequesterActions(prisma, this.reads);
  }

  create(
    clientIdentityId: string,
    dto: CreateCompanyRequestDto,
  ): Promise<CompanyRequestResponseDto> {
    return this.requester.create(clientIdentityId, dto);
  }

  findMine(
    identityId: string,
    params: {
      scope: RequestScopeFilter;
      status?: RequestStatusFilter;
      search?: string;
    } & RequestListFilters,
  ): Promise<CompanyRequestResponseDto[]> {
    return this.reads.findMine(identityId, params);
  }

  findForIdentityAsAdmin(
    identityId: string,
    role: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE',
  ): Promise<CompanyRequestResponseDto[]> {
    return this.reads.findForIdentityAsAdmin(identityId, role);
  }

  findOne(id: string, identityId: string): Promise<CompanyRequestResponseDto> {
    return this.reads.findOne(id, identityId);
  }

  accept(id: string, identityId: string): Promise<CompanyRequestResponseDto> {
    return this.provider.accept(id, identityId);
  }

  reject(id: string, identityId: string): Promise<CompanyRequestResponseDto> {
    return this.provider.reject(id, identityId);
  }

  removeMine(id: string, identityId: string): Promise<{ deleted: true }> {
    return this.requester.removeMine(id, identityId);
  }

  removeAllMine(identityId: string): Promise<{ deleted: number }> {
    return this.requester.removeAllMine(identityId);
  }

  bookmark(id: string, identityId: string): Promise<{ saved: true }> {
    return this.provider.bookmark(id, identityId);
  }

  unbookmark(id: string, identityId: string): Promise<{ saved: false }> {
    return this.provider.unbookmark(id, identityId);
  }

  removeFromMine(id: string, identityId: string): Promise<{ removed: true }> {
    return this.provider.removeFromMine(id, identityId);
  }

  complete(
    id: string,
    identityId: string,
    via: CompletedVia,
  ): Promise<CompanyRequestResponseDto> {
    return this.provider.complete(id, identityId, via);
  }

  respond(
    id: string,
    identityId: string,
    dto: CreateRequestOfferDto,
  ): Promise<CompanyRequestResponseDto> {
    return this.provider.respond(id, identityId, dto);
  }

  acceptOffer(
    id: string,
    identityId: string,
    offerId?: string,
  ): Promise<CompanyRequestResponseDto> {
    return this.requester.acceptOffer(id, identityId, offerId);
  }

  rejectOffer(
    id: string,
    identityId: string,
    offerId?: string,
  ): Promise<CompanyRequestResponseDto> {
    return this.requester.rejectOffer(id, identityId, offerId);
  }

  markResponded(
    id: string,
    identityId: string,
  ): Promise<CompanyRequestResponseDto> {
    return this.provider.markResponded(id, identityId);
  }
}
