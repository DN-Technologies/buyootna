import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AdminUsersFilterDto } from './dto/admin-users-filter.dto';
import {
  AdminUpdateStatusDto,
  UserAccountStatusAction,
} from './dto/admin-update-status.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(filters: AdminUsersFilterDto) {
    const { search, role, status, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    // Role filter
    if (role) {
      where.role = role;
    }

    // Status filter
    if (status === 'active') {
      where.isDisabled = false;
      where.isBlocked = false;
    } else if (status === 'blocked') {
      where.isBlocked = true;
    } else if (status === 'suspended') {
      where.isDisabled = true;
    }

    // Search query filter (name, email, phone, company name, office name)
    if (search && search.trim() !== '') {
      const query = search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { companyProfile: { name: { contains: query, mode: 'insensitive' } } },
        { officeProfile: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const [
      users,
      totalCount,
      totalUsers,
      totalActive,
      totalBlocked,
      totalSuspended,
      countIndividual,
      countOffice,
      countCompany,
    ] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          companyProfile: true,
          individualProfile: true,
          officeProfile: true,
          activePlan: true,
        },
      }),
      this.prisma.user.count({ where }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { isDisabled: false, isBlocked: false },
      }),
      this.prisma.user.count({ where: { isBlocked: true } }),
      this.prisma.user.count({ where: { isDisabled: true } }),
      this.prisma.user.count({ where: { role: Role.INDIVIDUAL } }),
      this.prisma.user.count({ where: { role: Role.OFFICE } }),
      this.prisma.user.count({ where: { role: Role.COMPANY } }),
    ]);

    const formattedUsers = users.map((user) => {
      // 1. Account type
      let accountType: 'فرد' | 'شركة' | 'مكتب عقاري' = 'فرد';
      if (user.role === Role.COMPANY) accountType = 'شركة';
      if (user.role === Role.OFFICE) accountType = 'مكتب عقاري';

      // 2. Name
      let displayName = user.name || 'بدون اسم';
      if (user.role === Role.COMPANY && user.companyProfile?.name) {
        displayName = user.companyProfile.name;
      } else if (user.role === Role.OFFICE && user.officeProfile?.name) {
        displayName = user.officeProfile.name;
      }

      // 3. Verification status
      let verificationStatus: 'موثق' | 'غير موثق' | 'قيد الانتظار' | '—' = '—';
      if (user.role === Role.COMPANY && user.companyProfile) {
        if (user.companyProfile.status === 'PENDING') {
          verificationStatus = 'قيد الانتظار';
        } else if (
          user.companyProfile.isVerified ||
          user.companyProfile.status === 'APPROVED'
        ) {
          verificationStatus = 'موثق';
        } else {
          verificationStatus = 'غير موثق';
        }
      } else if (user.role === Role.OFFICE && user.officeProfile) {
        if (user.officeProfile.status === 'PENDING') {
          verificationStatus = 'قيد الانتظار';
        } else if (
          user.officeProfile.isVerified ||
          user.officeProfile.status === 'APPROVED'
        ) {
          verificationStatus = 'موثق';
        } else {
          verificationStatus = 'غير موثق';
        }
      }

      // 4. Subscription Plan
      const subscriptionPlan = user.activePlan?.name || 'العادية';

      // 5. Account Status
      let accountStatus: 'نشط' | 'محظور' | 'موقوف' = 'نشط';
      if (user.isBlocked) {
        accountStatus = 'محظور';
      } else if (user.isDisabled) {
        accountStatus = 'موقوف';
      }

      // 6. Registration Date
      const registrationDate = this.formatArabicDate(user.createdAt);

      return {
        id: user.id,
        name: displayName,
        email: user.email || user.phone || '—',
        phone: user.phone || '—',
        accountType,
        verificationStatus,
        subscriptionPlan,
        accountStatus,
        registrationDate,
      };
    });

    return {
      data: formattedUsers,
      meta: {
        total: totalCount,
        currentPage: page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        total: totalUsers,
        active: totalActive,
        blocked: totalBlocked,
        suspended: totalSuspended,
      },
      counts: {
        all: totalUsers,
        individual: countIndividual,
        office: countOffice,
        company: countCompany,
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        companyProfile: true,
        individualProfile: true,
        officeProfile: true,
        activePlan: true,
        properties: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;
    return userWithoutPassword;
  }

  async updateUserStatus(id: string, dto: AdminUpdateStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    let isBlocked = false;
    let isDisabled = false;

    if (dto.status === UserAccountStatusAction.BLOCKED) {
      isBlocked = true;
    } else if (dto.status === UserAccountStatusAction.SUSPENDED) {
      isDisabled = true;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isBlocked, isDisabled },
    });

    return {
      success: true,
      message: 'تم تحديث حالة الحساب بنجاح',
      user: {
        id: updated.id,
        isBlocked: updated.isBlocked,
        isDisabled: updated.isDisabled,
      },
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'تم حذف المستخدم بنجاح' };
  }

  private formatArabicDate(date: Date): string {
    try {
      return new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      return date.toISOString().split('T')[0];
    }
  }
}
