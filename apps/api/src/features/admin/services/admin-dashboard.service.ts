import { Injectable } from '@nestjs/common';
import { ApprovalStatus, InvoiceStatus, Role } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';

// Free/default tier -- matches AdminUsersService.getUsers's exact
// "regular" plan filter (no paid activePlan means a user is effectively on
// the free tier too).
const REGULAR_PLAN_WHERE = {
  OR: [
    { activePlanId: null },
    { activePlan: { slug: 'regular' } },
    { activePlan: { name: 'العادية' } },
  ],
};

function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function monthBounds(monthsAgo: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1);
  return { start, end };
}

const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'ابريل',
  'مايو',
  'يونيو',
  'يوليو',
  'اغسطس',
  'سبتمبر',
  'اكتوبر',
  'نوفمبر',
  'ديسمبر',
];

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const thisMonth = monthBounds(0);
    const lastMonth = monthBounds(1);

    const [
      totalUsersNow,
      totalUsersLastMonth,
      trialAccountsNow,
      trialAccountsLastMonth,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
      countIndividual,
      countCompany,
      countOffice,
      recentUsers,
      pendingCompanies,
      pendingOffices,
      revenueByMonthRaw,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isAdmin: false } }),
      this.prisma.user.count({
        where: { isAdmin: false, createdAt: { lt: thisMonth.start } },
      }),
      this.prisma.user.count({
        where: { isAdmin: false, ...REGULAR_PLAN_WHERE },
      }),
      this.prisma.user.count({
        where: {
          isAdmin: false,
          createdAt: { lt: thisMonth.start },
          ...REGULAR_PLAN_WHERE,
        },
      }),
      this.prisma.invoice.aggregate({
        where: {
          status: InvoiceStatus.PAID,
          paidAt: { gte: thisMonth.start, lt: thisMonth.end },
        },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          status: InvoiceStatus.PAID,
          paidAt: { gte: lastMonth.start, lt: lastMonth.end },
        },
        _sum: { amount: true },
      }),
      this.prisma.user.count({ where: { role: Role.INDIVIDUAL, isAdmin: false } }),
      this.prisma.user.count({ where: { role: Role.COMPANY, isAdmin: false } }),
      this.prisma.user.count({ where: { role: Role.OFFICE, isAdmin: false } }),
      this.prisma.user.findMany({
        where: { isAdmin: false },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { activePlan: true },
      }),
      this.prisma.companyIdentityData.findMany({
        where: { status: ApprovalStatus.PENDING },
        take: 7,
        orderBy: { createdAt: 'desc' },
        select: { identityId: true, name: true },
      }),
      this.prisma.officeIdentityData.findMany({
        where: { status: ApprovalStatus.PENDING },
        take: 7,
        orderBy: { createdAt: 'desc' },
        select: { identityId: true, name: true },
      }),
      this.prisma.invoice.findMany({
        where: {
          status: InvoiceStatus.PAID,
          paidAt: { gte: monthBounds(11).start },
        },
        select: { amount: true, paidAt: true },
      }),
    ]);

    const revenueTotal = revenueThisMonthAgg._sum.amount ?? 0;
    const revenuePrevious = revenueLastMonthAgg._sum.amount ?? 0;

    // Bucket the trailing-12-months invoices into calendar months -- done in
    // JS rather than a Prisma groupBy-by-month (Postgres date_trunc isn't
    // directly expressible through Prisma's query builder).
    const monthBuckets = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const { start } = monthBounds(i);
      monthBuckets.set(`${start.getFullYear()}-${start.getMonth()}`, 0);
    }
    for (const inv of revenueByMonthRaw) {
      if (!inv.paidAt) continue;
      const key = `${inv.paidAt.getFullYear()}-${inv.paidAt.getMonth()}`;
      if (monthBuckets.has(key)) {
        monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + inv.amount);
      }
    }
    const revenueByMonth = Array.from(monthBuckets.entries()).map(
      ([key, amount]) => {
        const [year, month] = key.split('-').map(Number);
        return { month: ARABIC_MONTHS[month], year, amount };
      },
    );

    const recentRegistrations = recentUsers.map((user) => {
      let accountType: 'فرد' | 'شركة' | 'مكتب عقاري' = 'فرد';
      if (user.role === Role.COMPANY) accountType = 'شركة';
      if (user.role === Role.OFFICE) accountType = 'مكتب عقاري';

      return {
        id: user.id,
        name: user.name || user.email || user.phone || 'بدون اسم',
        email: user.email || user.phone || '—',
        accountType,
        planName: user.activePlan?.name ?? null,
        createdAt: user.createdAt,
      };
    });

    const pendingVerifications = [
      ...pendingCompanies.map((c) => ({
        identityId: c.identityId,
        name: c.name,
        type: 'شركة' as const,
      })),
      ...pendingOffices.map((o) => ({
        identityId: o.identityId,
        name: o.name,
        type: 'مكتب عقاري' as const,
      })),
    ].slice(0, 7);

    return {
      metrics: {
        totalUsers: totalUsersNow,
        totalUsersChangePct: percentChange(totalUsersNow, totalUsersLastMonth),
        trialAccounts: trialAccountsNow,
        trialAccountsChangePct: percentChange(
          trialAccountsNow,
          trialAccountsLastMonth,
        ),
        revenueTotal,
        revenueChangePct: percentChange(revenueTotal, revenuePrevious),
      },
      usersByType: {
        individual: countIndividual,
        company: countCompany,
        office: countOffice,
      },
      revenueByMonth,
      recentRegistrations,
      pendingVerifications,
    };
  }
}
