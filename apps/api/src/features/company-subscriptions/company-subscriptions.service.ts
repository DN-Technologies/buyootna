import { ForbiddenException, Injectable } from '@nestjs/common';
import { IdentityType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { getCompanySubscriptionState } from './company-subscription.rules';

@Injectable()
export class CompanySubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** The plans a company can buy, in the admin's order. */
  listPlans() {
    return this.prisma.companyPlan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { durationMonths: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        durationMonths: true,
        price: true,
        features: true,
        badge: true,
      },
    });
  }

  getMine(identityId: string, identityType: IdentityType) {
    if (identityType !== 'COMPANY') {
      throw new ForbiddenException('الاشتراكات متاحة لحسابات الشركات فقط');
    }
    return getCompanySubscriptionState(this.prisma, identityId);
  }
}
