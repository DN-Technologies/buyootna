import { Injectable } from '@nestjs/common';
import { ApprovalStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminVerificationsFilterDto } from '../../dto/admin-verifications-filter.dto';

function dayBounds(daysAgo: number) {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysAgo,
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysAgo + 1,
  );
  return { start, end };
}

const STATUS_FILTER_MAP: Record<string, ApprovalStatus | undefined> = {
  VERIFIED: ApprovalStatus.APPROVED,
  PENDING: ApprovalStatus.PENDING,
  UNVERIFIED: ApprovalStatus.REJECTED,
  ALL: undefined,
};

// The mock UI data also has a 'مرفوض' (rejected) status value, visually
// distinct from 'غير موثق' (unverified) -- but there's no schema basis for
// that distinction (both are just ApprovalStatus.REJECTED, confirmed via
// AdminUsersService.getUsers's existing verificationStatus derivation,
// which already treats any non-pending/non-approved identity as 'غير موثق').
// Real data only ever produces 'غير موثق' here.
function toDisplayStatus(
  status: ApprovalStatus,
): 'قيد الانتظار' | 'موثق' | 'غير موثق' {
  if (status === ApprovalStatus.PENDING) return 'قيد الانتظار';
  if (status === ApprovalStatus.APPROVED) return 'موثق';
  return 'غير موثق';
}

type CompanyRow = Prisma.CompanyIdentityDataGetPayload<{
  include: { identity: { include: { user: true } } };
}>;
type OfficeRow = Prisma.OfficeIdentityDataGetPayload<{
  include: { identity: { include: { user: true } } };
}>;

@Injectable()
export class AdminVerificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getVerifications(filters: AdminVerificationsFilterDto) {
    const {
      search,
      accountType,
      status = 'ALL',
      sortOrder = 'NEWEST',
      page = 1,
      limit = 10,
    } = filters;

    const approvalStatus = STATUS_FILTER_MAP[status];
    const searchOr = search?.trim()
      ? [
          { name: { contains: search.trim(), mode: 'insensitive' as const } },
          {
            identity: {
              user: {
                email: {
                  contains: search.trim(),
                  mode: 'insensitive' as const,
                },
              },
            },
          },
          {
            identity: {
              user: {
                phone: {
                  contains: search.trim(),
                  mode: 'insensitive' as const,
                },
              },
            },
          },
        ]
      : undefined;

    const companyWhere: Prisma.CompanyIdentityDataWhereInput = {
      ...(approvalStatus ? { status: approvalStatus } : {}),
      ...(searchOr ? { OR: searchOr } : {}),
    };
    const officeWhere: Prisma.OfficeIdentityDataWhereInput = {
      ...(approvalStatus ? { status: approvalStatus } : {}),
      ...(searchOr ? { OR: searchOr } : {}),
    };

    const [
      companies,
      offices,
      countAllCompanies,
      countAllOffices,
      pendingCompanies,
      pendingOffices,
      approvedTodayCompanies,
      approvedTodayOffices,
      rejectedTodayCompanies,
      rejectedTodayOffices,
    ] = await Promise.all([
      accountType === 'مكتب عقاري'
        ? Promise.resolve([] as CompanyRow[])
        : this.prisma.companyIdentityData.findMany({
            where: companyWhere,
            include: { identity: { include: { user: true } } },
          }),
      accountType === 'شركة'
        ? Promise.resolve([] as OfficeRow[])
        : this.prisma.officeIdentityData.findMany({
            where: officeWhere,
            include: { identity: { include: { user: true } } },
          }),
      this.prisma.companyIdentityData.count(),
      this.prisma.officeIdentityData.count(),
      this.prisma.companyIdentityData.count({
        where: { status: ApprovalStatus.PENDING },
      }),
      this.prisma.officeIdentityData.count({
        where: { status: ApprovalStatus.PENDING },
      }),
      this.prisma.companyIdentityData.count({
        where: {
          status: ApprovalStatus.APPROVED,
          updatedAt: { gte: dayBounds(0).start, lt: dayBounds(0).end },
        },
      }),
      this.prisma.officeIdentityData.count({
        where: {
          status: ApprovalStatus.APPROVED,
          updatedAt: { gte: dayBounds(0).start, lt: dayBounds(0).end },
        },
      }),
      this.prisma.companyIdentityData.count({
        where: {
          status: ApprovalStatus.REJECTED,
          updatedAt: { gte: dayBounds(0).start, lt: dayBounds(0).end },
        },
      }),
      this.prisma.officeIdentityData.count({
        where: {
          status: ApprovalStatus.REJECTED,
          updatedAt: { gte: dayBounds(0).start, lt: dayBounds(0).end },
        },
      }),
    ]);

    const merged: Array<
      | (CompanyRow & { accountType: 'شركة' })
      | (OfficeRow & { accountType: 'مكتب عقاري' })
    > = [
      ...companies.map((c) => ({ ...c, accountType: 'شركة' as const })),
      ...offices.map((o) => ({ ...o, accountType: 'مكتب عقاري' as const })),
    ];

    merged.sort((a, b) =>
      sortOrder === 'OLDEST'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const total = merged.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIdx = (page - 1) * limit;
    const pageRows = merged.slice(startIdx, startIdx + limit);

    const data = pageRows.map((row) => {
      const user = row.identity.user;
      return {
        identityId: row.identityId,
        userId: user.id,
        name: row.name,
        email: user.email || user.phone || '—',
        accountType: row.accountType,
        status: toDisplayStatus(row.status),
        accountStatus:
          user.isBlocked || user.isDisabled
            ? ('موقوف' as const)
            : ('نشط' as const),
        attachmentsText: row.licenseFileUrl ? '1' : '0',
        sentAt: row.createdAt.toISOString(),
        actionLabel:
          row.status === ApprovalStatus.APPROVED
            ? ('عرض' as const)
            : ('مراجعة' as const),
        licenseNumber: row.licenseNumber,
        licenseActivity: row.licenseActivity,
        licenseExpiry: row.licenseExpiry,
        licenseFileUrl: row.licenseFileUrl,
        logoUrl: row.logoUrl,
        createdAt: row.createdAt.toISOString(),
      };
    });

    return {
      data,
      meta: {
        total,
        currentPage: page,
        limit,
        totalPages,
      },
      counts: {
        all: countAllCompanies + countAllOffices,
        companies: countAllCompanies,
        offices: countAllOffices,
      },
      stats: {
        pendingCount: pendingCompanies + pendingOffices,
        approvedTodayCount: approvedTodayCompanies + approvedTodayOffices,
        rejectedTodayCount: rejectedTodayCompanies + rejectedTodayOffices,
      },
    };
  }
}
