import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CompanyRequestsService } from '../../../company/company-requests/company-requests.service';

@Injectable()
export class AdminRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyRequestsService: CompanyRequestsService,
  ) {}

  async getRequestsForUser(userId: string) {
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
