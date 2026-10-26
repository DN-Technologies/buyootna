import { Injectable } from '@nestjs/common';
import {
  IdentityType,
  InvoiceStatus,
  Prisma,
  SlotStatus,
} from '@prisma/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import {
  AdminInvoicesFilterDto,
  AdminSubscriptionsFilterDto,
} from '../../dto/admin-billing-filter.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
// «ستنتهي قريباً»: a company period ending within this many days
const EXPIRING_SOON_DAYS = 7;
const TRIAL_PLAN_NAME = 'الفترة التجريبية';

const IDENTITY_SELECT = {
  id: true,
  type: true,
  userId: true,
  user: { select: { email: true, phone: true } },
  individualData: { select: { name: true } },
  companyData: { select: { name: true } },
  officeData: { select: { name: true } },
} satisfies Prisma.IdentitySelect;

type OwnerIdentity = Prisma.IdentityGetPayload<{
  select: typeof IDENTITY_SELECT;
}>;

function owner(identity: OwnerIdentity) {
  return {
    userId: identity.userId,
    identityId: identity.id,
    identityType: identity.type,
    name:
      identity.companyData?.name ??
      identity.officeData?.name ??
      identity.individualData?.name ??
      null,
    email: identity.user.email ?? identity.user.phone ?? null,
  };
}

/** The persona a billing row belongs to: its type and a name/email search. */
function identityWhere(
  role?: IdentityType,
  search?: string,
): Prisma.IdentityWhereInput {
  const q = search?.trim();
  const contains = { contains: q, mode: 'insensitive' as const };
  return {
    ...(role ? { type: role } : {}),
    ...(q
      ? {
          OR: [
            { individualData: { name: contains } },
            { companyData: { name: contains } },
            { officeData: { name: contains } },
            { user: { email: contains } },
            { user: { phone: contains } },
          ],
        }
      : {}),
  };
}

/**
 * The admin's الاشتراكات والفواتير page. Two kinds of subscription exist: a
 * company buys a period (CompanySubscription, starts/ends), an individual or
 * office buys ad credits (UserPlanSlot, active until its ads run out); both
 * are listed together, newest first. Invoices are every Invoice row.
 */
@Injectable()
export class AdminBillingListService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscriptions(filters: AdminSubscriptionsFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const now = new Date();
    const who = identityWhere(filters.role, filters.search);
    const plan = filters.plan?.trim();

    const periodsWhere: Prisma.CompanySubscriptionWhereInput = {
      identity: who,
      ...(filters.status === 'active' ? { endsAt: { gt: now } } : {}),
      ...(filters.status === 'expired' ? { endsAt: { lte: now } } : {}),
      ...(plan
        ? plan === TRIAL_PLAN_NAME
          ? { kind: 'TRIAL' }
          : { companyPlan: { name: plan } }
        : {}),
    };
    const creditsActive: Prisma.UserPlanSlotWhereInput = {
      status: SlotStatus.ACTIVE,
      adsRemaining: { gt: 0 },
    };
    const creditsWhere: Prisma.UserPlanSlotWhereInput = {
      identity: who,
      ...(filters.status === 'active' ? creditsActive : {}),
      ...(filters.status === 'expired' ? { NOT: creditsActive } : {}),
      ...(plan ? { plan: { name: plan } } : {}),
    };
    // A company period is only a company's; credits are anyone's
    const withPeriods = !filters.role || filters.role === IdentityType.COMPANY;

    // The page's rows are among the newest page*limit of each source
    const take = page * limit;
    const [periods, credits, periodsCount, creditsCount, metrics, planNames] =
      await Promise.all([
        withPeriods
          ? this.prisma.companySubscription.findMany({
              where: periodsWhere,
              include: {
                identity: { select: IDENTITY_SELECT },
                companyPlan: { select: { name: true, price: true } },
                invoice: {
                  select: { id: true, invoiceNo: true, amount: true },
                },
              },
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              take,
            })
          : [],
        this.prisma.userPlanSlot.findMany({
          where: creditsWhere,
          include: {
            identity: { select: IDENTITY_SELECT },
            plan: { select: { name: true } },
            invoice: { select: { id: true, invoiceNo: true, amount: true } },
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take,
        }),
        withPeriods
          ? this.prisma.companySubscription.count({ where: periodsWhere })
          : 0,
        this.prisma.userPlanSlot.count({ where: creditsWhere }),
        this.subscriptionMetrics(now, creditsActive),
        this.planNames(),
      ]);

    const rows = [
      ...periods.map((s) => ({
        id: s.id,
        kind: 'COMPANY_PERIOD' as const,
        ...owner(s.identity),
        planName:
          s.kind === 'TRIAL' ? TRIAL_PLAN_NAME : (s.companyPlan?.name ?? null),
        amount: s.kind === 'TRIAL' ? 0 : (s.invoice?.amount ?? null),
        status: s.endsAt > now ? ('active' as const) : ('expired' as const),
        adsRemaining: null,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        invoice: s.invoice
          ? { id: s.invoice.id, invoiceNo: s.invoice.invoiceNo }
          : null,
        createdAt: s.createdAt,
      })),
      ...credits.map((s) => ({
        id: s.id,
        kind: 'AD_CREDITS' as const,
        ...owner(s.identity),
        planName: s.plan.name,
        // No invoice: granted by an admin
        amount: s.invoice?.amount ?? null,
        status:
          s.status === SlotStatus.ACTIVE && s.adsRemaining > 0
            ? ('active' as const)
            : ('expired' as const),
        adsRemaining: s.adsRemaining,
        startsAt: s.createdAt.toISOString(),
        endsAt: null,
        invoice: s.invoice
          ? { id: s.invoice.id, invoiceNo: s.invoice.invoiceNo }
          : null,
        createdAt: s.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * limit, page * limit)
      .map(({ createdAt: _createdAt, ...row }) => row);

    const total = periodsCount + creditsCount;
    return {
      data: rows,
      meta: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      metrics,
      planNames,
    };
  }

  async getInvoices(filters: AdminInvoicesFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const q = filters.search?.trim();
    const who = identityWhere(filters.role, undefined);
    const where: Prisma.InvoiceWhereInput = {
      identity: who,
      ...(filters.status ? { status: filters.status } : {}),
      ...(q
        ? {
            OR: [
              { invoiceNo: { contains: q, mode: 'insensitive' } },
              { planName: { contains: q, mode: 'insensitive' } },
              { identity: identityWhere(undefined, q) },
            ],
          }
        : {}),
    };

    const [rows, total, byStatus, paid] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: { identity: { select: IDENTITY_SELECT } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.invoice.aggregate({
        where: { status: InvoiceStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    const count = (status: InvoiceStatus) =>
      byStatus.find((g) => g.status === status)?._count._all ?? 0;

    return {
      data: rows.map((inv) => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        ...owner(inv.identity),
        planName: inv.planName,
        kind: inv.companyPlanId
          ? ('COMPANY_PLAN' as const)
          : inv.featurePackageId
            ? ('FEATURE_AD' as const)
            : ('AD_PLAN' as const),
        amount: inv.amount,
        status: inv.status,
        createdAt: inv.createdAt.toISOString(),
        paidAt: inv.paidAt?.toISOString() ?? null,
      })),
      meta: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      metrics: {
        total: byStatus.reduce((sum, g) => sum + g._count._all, 0),
        paid: count(InvoiceStatus.PAID),
        pending: count(InvoiceStatus.PENDING) + count(InvoiceStatus.OVERDUE),
        cancelled: count(InvoiceStatus.CANCELLED),
        revenuePaid: paid._sum.amount ?? 0,
      },
    };
  }

  private async subscriptionMetrics(
    now: Date,
    creditsActive: Prisma.UserPlanSlotWhereInput,
  ) {
    const soon = new Date(now.getTime() + EXPIRING_SOON_DAYS * DAY_MS);
    const [periods, periodsActive, periodsSoon, credits, creditsActiveCount] =
      await Promise.all([
        this.prisma.companySubscription.count(),
        this.prisma.companySubscription.count({
          where: { endsAt: { gt: now } },
        }),
        this.prisma.companySubscription.count({
          where: { endsAt: { gt: now, lte: soon } },
        }),
        this.prisma.userPlanSlot.count(),
        this.prisma.userPlanSlot.count({ where: creditsActive }),
      ]);
    const total = periods + credits;
    const active = periodsActive + creditsActiveCount;
    return {
      total,
      active,
      expiringSoon: periodsSoon,
      expired: total - active,
    };
  }

  // The package filter's choices: every plan that can appear in the list
  private async planNames() {
    const [plans, companyPlans] = await Promise.all([
      this.prisma.plan.findMany({
        select: { name: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.companyPlan.findMany({
        select: { name: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);
    return [
      ...new Set([
        ...plans.map((p) => p.name),
        ...companyPlans.map((p) => p.name),
        TRIAL_PLAN_NAME,
      ]),
    ];
  }
}
