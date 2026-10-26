import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CompanyRequestsService } from '../../../company/company-requests/company-requests.service';
import { findOwnedIdentity } from '../users/admin-persona.util';

@Injectable()
export class AdminRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyRequestsService: CompanyRequestsService,
  ) {}

  // The named persona's requests, else the account's first persona's
  async getRequestsForUser(userId: string, identityId?: string) {
    if (identityId) {
      const owned = await findOwnedIdentity(this.prisma, userId, identityId);
      return this.companyRequestsService.findForIdentityAsAdmin(
        owned.id,
        owned.type,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { identities: { take: 1 } },
    });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const identity = user.identities[0];
    if (!identity) return [];

    return this.companyRequestsService.findForIdentityAsAdmin(
      identity.id,
      identity.type,
    );
  }
}
