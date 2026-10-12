import { Injectable } from '@nestjs/common';
import { InvoiceStatus, ListingStatus, SlotStatus } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { getCompanySubscriptionState } from '../../company-subscriptions/company-subscription.rules';
import { CompanyDashboardResponseDto } from './dto/company-dashboard-response.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(identityId: string): Promise<CompanyDashboardResponseDto> {
    const [activeCount, viewsAgg, activeSlots, overdueInvoice, subscription] =
      await Promise.all([
        this.prisma.property.count({
          where: { identityId, status: ListingStatus.ACTIVE },
        }),
        // Lifetime sum across all statuses -- a listing's accumulated views
        // shouldn't disappear once it expires/closes, unlike activeCount
        // which is deliberately scoped to currently-live listings.
        this.prisma.property.aggregate({
          where: { identityId },
          _sum: { views: true },
        }),
        this.prisma.userPlanSlot.findMany({
          where: {
            identityId,
            status: SlotStatus.ACTIVE,
            adsRemaining: { gt: 0 },
          },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.invoice.findFirst({
          where: {
            identityId,
            // An abandoned subscription checkout is not a debt
            companyPlanId: null,
            OR: [
              { status: InvoiceStatus.OVERDUE },
              { status: InvoiceStatus.PENDING, dueDate: { lt: new Date() } },
            ],
          },
        }),
        getCompanySubscriptionState(this.prisma, identityId),
      ]);

    const adsRemaining = activeSlots.reduce(
      (sum, slot) => sum + slot.adsRemaining,
      0,
    );

    return {
      listings: {
        activeCount,
        totalViews: viewsAgg._sum.views ?? 0,
      },
      billing: {
        // A company's plan is its subscription; ad packages still count
        // for the personas that buy them
        hasActivePlan:
          subscription.status === 'ACTIVE' || activeSlots.length > 0,
        activePlanName: activeSlots[0]?.plan.name ?? null,
        adsRemaining,
        hasOverdueInvoice: !!overdueInvoice,
        subscriptionStatus: subscription.status,
        trialDaysLeft:
          subscription.status === 'TRIAL' ? subscription.daysLeft : null,
      },
    };
  }
}
