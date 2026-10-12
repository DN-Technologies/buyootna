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

  /** The periods the company paid for, newest first (سجل الباقات). */
  async getHistory(identityId: string, identityType: IdentityType) {
    if (identityType !== 'COMPANY') {
      throw new ForbiddenException('الاشتراكات متاحة لحسابات الشركات فقط');
    }
    const periods = await this.prisma.companySubscription.findMany({
      where: { identityId, kind: 'PAID' },
      orderBy: { endsAt: 'desc' },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        companyPlan: { select: { name: true } },
      },
    });

    const now = new Date();
    return periods.map((period) => ({
      id: period.id,
      displayId: `ID:${period.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
      planName: period.companyPlan?.name ?? 'باقة',
      startsAt: period.startsAt,
      endsAt: period.endsAt,
      status: period.endsAt > now ? 'ACTIVE' : 'EXPIRED',
    }));
  }
}
