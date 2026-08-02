import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AdminUsersFilterDto } from './dto/admin-users-filter.dto';
import {
  AdminUpdateStatusDto,
  UserAccountStatusAction,
} from './dto/admin-update-status.dto';
import { AdminUpdateIdentityStatusDto } from './dto/admin-update-identity-status.dto';
import { Prisma, Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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
        {
          identities: {
            some: {
              OR: [
                {
                  companyData: {
                    name: { contains: query, mode: 'insensitive' },
                  },
                },
                {
                  officeData: {
                    name: { contains: query, mode: 'insensitive' },
                  },
                },
                {
                  individualData: {
                    name: { contains: query, mode: 'insensitive' },
                  },
                },
              ],
            },
          },
        },
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
          identities: {
            include: {
              individualData: true,
              companyData: true,
              officeData: true,
            },
          },
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
      let accountType: 'فرد' | 'شركة' | 'مكتب عقاري' = 'فرد';
      if (user.role === Role.COMPANY) accountType = 'شركة';
      if (user.role === Role.OFFICE) accountType = 'مكتب عقاري';

      const companyIdent = user.identities.find((i) => i.type === 'COMPANY');
      const officeIdent = user.identities.find((i) => i.type === 'OFFICE');
      const indIdent = user.identities.find((i) => i.type === 'INDIVIDUAL');

      let displayName = user.name || 'بدون اسم';
      if (user.role === Role.COMPANY && companyIdent?.companyData?.name) {
        displayName = companyIdent.companyData.name;
      } else if (user.role === Role.OFFICE && officeIdent?.officeData?.name) {
        displayName = officeIdent.officeData.name;
      } else if (indIdent?.individualData?.name) {
        displayName = indIdent.individualData.name;
      }

      let verificationStatus: 'موثق' | 'غير موثق' | 'قيد الانتظار' | '—' = '—';
      if (user.role === Role.COMPANY && companyIdent?.companyData) {
        if (companyIdent.companyData.status === 'PENDING') {
          verificationStatus = 'قيد الانتظار';
        } else if (
          companyIdent.companyData.isVerified ||
          companyIdent.companyData.status === 'APPROVED'
        ) {
          verificationStatus = 'موثق';
        } else {
          verificationStatus = 'غير موثق';
        }
      } else if (user.role === Role.OFFICE && officeIdent?.officeData) {
        if (officeIdent.officeData.status === 'PENDING') {
          verificationStatus = 'قيد الانتظار';
        } else if (
          officeIdent.officeData.isVerified ||
          officeIdent.officeData.status === 'APPROVED'
        ) {
          verificationStatus = 'موثق';
        } else {
          verificationStatus = 'غير موثق';
        }
      }

      const subscriptionPlan = user.activePlan?.name || 'العادية';

      let accountStatus: 'نشط' | 'محظور' | 'موقوف' = 'نشط';
      if (user.isBlocked) {
        accountStatus = 'محظور';
      } else if (user.isDisabled) {
        accountStatus = 'موقوف';
      }

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
        identities: {
          include: {
            individualData: true,
            companyData: true,
            officeData: true,
            properties: { take: 5, orderBy: { createdAt: 'desc' } },
          },
        },
        activePlan: true,
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

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    await this.prisma.user.delete({ where: { id } });
    return { message: 'تم حذف المستخدم بنجاح' };
  }

  async updateUserStatus(id: string, dto: AdminUpdateStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const dataToUpdate: Prisma.UserUpdateInput = {};

    switch (dto.status) {
      case UserAccountStatusAction.BLOCKED:
        dataToUpdate.isBlocked = true;
        break;
      case UserAccountStatusAction.SUSPENDED:
        dataToUpdate.isDisabled = true;
        break;
      case UserAccountStatusAction.ACTIVE:
        dataToUpdate.isDisabled = false;
        dataToUpdate.isBlocked = false;
        break;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    const userWithoutPassword = { ...updatedUser };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;

    return {
      message: 'تم تحديث حالة المستخدم بنجاح',
      user: userWithoutPassword,
    };
  }

  async updateIdentityStatus(
    identityId: string,
    dto: AdminUpdateIdentityStatusDto,
  ) {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      include: { companyData: true, officeData: true },
    });

    if (!identity) {
      throw new NotFoundException('الهوية غير موجودة');
    }

    const isVerified = dto.status === 'APPROVED';
    let identityLabel: string;

    if (identity.type === 'COMPANY' && identity.companyData) {
      await this.prisma.companyIdentityData.update({
        where: { identityId },
        data: { status: dto.status, isVerified },
      });
      identityLabel = 'الشركة';
    } else if (identity.type === 'OFFICE' && identity.officeData) {
      await this.prisma.officeIdentityData.update({
        where: { identityId },
        data: { status: dto.status, isVerified },
      });
      identityLabel = 'المكتب';
    } else {
      throw new BadRequestException('هذا النوع من الهويات لا يخضع للمراجعة');
    }

    const title =
      dto.status === 'APPROVED' ? 'تمت الموافقة على هويتك' : 'تم رفض هويتك';
    const body =
      dto.status === 'APPROVED'
        ? `تمت الموافقة على طلب هوية ${identityLabel} الخاص بك، ويمكنك الآن استخدامه بالكامل.`
        : `للأسف تم رفض طلب هوية ${identityLabel} الخاص بك. يرجى مراجعة بياناتك والمحاولة مرة أخرى أو التواصل مع الدعم.`;

    await this.notificationsService.create({
      userId: identity.userId,
      type:
        dto.status === 'APPROVED' ? 'IDENTITY_APPROVED' : 'IDENTITY_REJECTED',
      title,
      body,
      identityId,
    });

    return this.prisma.identity.findUnique({
      where: { id: identityId },
      include: { companyData: true, officeData: true, individualData: true },
    });
  }

  private formatArabicDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
