import { Injectable } from '@nestjs/common';
import { ApprovalStatus, InvoiceStatus, Role } from '@prisma/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { hasAccountType } from '../users/account-type.util';

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
      this.prisma.user.count({
        where: { ...hasAccountType(Role.INDIVIDUAL), isAdmin: false },
      }),
      this.prisma.user.count({
        where: { ...hasAccountType(Role.COMPANY), isAdmin: false },
      }),
      this.prisma.user.count({
        where: { ...hasAccountType(Role.OFFICE), isAdmin: false },
      }),
      // The newest profiles, not the newest accounts: a company or office
      // added to an existing account is a registration too, and by account
      // it never showed here (QA: "missing from the admin dashboard")
      this.prisma.identity.findMany({
        where: { user: { isAdmin: false } },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          individualData: { select: { name: true } },
          companyData: { select: { name: true } },
          officeData: { select: { name: true } },
          user: { include: { activePlan: true } },
        },
      }),
      this.prisma.companyIdentityData.findMany({
        where: { status: ApprovalStatus.PENDING },
        take: 7,
        orderBy: { createdAt: 'desc' },
        select: {
          identityId: true,
          name: true,
          licenseNumber: true,
          licenseActivity: true,
          licenseExpiry: true,
          logoUrl: true,
          createdAt: true,
        },
      }),
      this.prisma.officeIdentityData.findMany({
        where: { status: ApprovalStatus.PENDING },
        take: 7,
        orderBy: { createdAt: 'desc' },
        select: {
          identityId: true,
          name: true,
          licenseNumber: true,
          licenseActivity: true,
          licenseExpiry: true,
          logoUrl: true,
          createdAt: true,
        },
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

    const recentRegistrations = recentUsers.map((profile) => {
      const { user } = profile;
      let accountType: 'فرد' | 'شركة' | 'مكتب عقاري' = 'فرد';
      if (profile.type === 'COMPANY') accountType = 'شركة';
      if (profile.type === 'OFFICE') accountType = 'مكتب عقاري';

      return {
        // One row per profile; `userId` is the account it belongs to
        id: profile.id,
        userId: user.id,
        name:
          profile.companyData?.name ||
          profile.officeData?.name ||
          profile.individualData?.name ||
          user.name ||
          user.email ||
          user.phone ||
          'بدون اسم',
        email: user.email || user.phone || '—',
        accountType,
        planName: user.activePlan?.name ?? null,
        createdAt: profile.createdAt,
      };
    });

    const pendingVerifications = [
      ...pendingCompanies.map((c) => ({
        identityId: c.identityId,
        name: c.name,
        type: 'شركة' as const,
        licenseNumber: c.licenseNumber,
        licenseActivity: c.licenseActivity,
        licenseExpiry: c.licenseExpiry,
        logoUrl: c.logoUrl,
        createdAt: c.createdAt,
      })),
      ...pendingOffices.map((o) => ({
        identityId: o.identityId,
        name: o.name,
        type: 'مكتب عقاري' as const,
        licenseNumber: o.licenseNumber,
        licenseActivity: o.licenseActivity,
        licenseExpiry: o.licenseExpiry,
        logoUrl: o.logoUrl,
        createdAt: o.createdAt,
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
