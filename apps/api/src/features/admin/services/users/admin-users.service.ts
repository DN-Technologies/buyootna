import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminUsersFilterDto } from '../../dto/admin-users-filter.dto';
import {
  AdminUpdateStatusDto,
  UserAccountStatusAction,
} from '../../dto/admin-update-status.dto';
import { AdminCreateIndividualDto } from '../../dto/admin-create-individual.dto';
import {
  AdminNotifyUsersDto,
  AdminNotifyUsersResponseDto,
} from '../../dto/admin-notify-users.dto';
import { IdentityType, Prisma, Role } from '@prisma/client';
import {
  checkUserExists,
  defaultLoginMethod,
} from '../../../../core/utils/user.utils';
import { NotificationsService } from '../../../notifications/notifications.service';
import { MailService } from '../../../../core/mail/mail.service';
import { adminCustomMessageTemplate } from '../../../../core/mail/templates/admin-custom-message.template';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';
import { accountTypeOf, hasAccountType } from './account-type.util';
import { accountStatus as accountState } from '../../../auth/account-status.util';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  async getUsers(filters: AdminUsersFilterDto) {
    const {
      search,
      role,
      status,
      plan,
      subscriptionPlan,
      sortOrder = 'desc',
      sortBy = 'createdAt',
      page = 1,
      limit = 10,
    } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      isAdmin: false,
    };
    const andConditions: Prisma.UserWhereInput[] = [];

    // Role filter
    if (role) {
      andConditions.push(hasAccountType(role));
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

    // Subscription plan filter
    const activePlanFilter = subscriptionPlan || plan;
    if (activePlanFilter && activePlanFilter !== 'all') {
      if (activePlanFilter === 'regular' || activePlanFilter === 'العادية') {
        andConditions.push({
          OR: [
            { activePlanId: null },
            { activePlan: { slug: 'regular' } },
            { activePlan: { name: 'العادية' } },
          ],
        });
      } else {
        andConditions.push({
          activePlan: {
            OR: [
              { name: { contains: activePlanFilter, mode: 'insensitive' } },
              { slug: { contains: activePlanFilter, mode: 'insensitive' } },
            ],
          },
        });
      }
    }

    // Search query filter (name, email, phone, company name, office name, individual name)
    if (search && search.trim() !== '') {
      const query = search.trim();
      andConditions.push({
        OR: [
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
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const sortDirection: Prisma.SortOrder =
      sortOrder === 'asc' ? 'asc' : 'desc';
    const sortField = sortBy === 'name' ? 'name' : 'createdAt';
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    // Role-scoped filter for statistics (excluding admin accounts)
    const roleStatsWhere: Prisma.UserWhereInput = {
      isAdmin: false,
      ...(role ? hasAccountType(role) : {}),
    };

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
        orderBy,
        include: {
          identities: {
            include: {
              individualData: true,
              companyData: true,
              officeData: true,
              _count: {
                select: { properties: true },
              },
            },
          },
          activePlan: true,
        },
      }),
      this.prisma.user.count({ where }),
      this.prisma.user.count({ where: roleStatsWhere }),
      this.prisma.user.count({
        where: { ...roleStatsWhere, isDisabled: false, isBlocked: false },
      }),
      this.prisma.user.count({ where: { ...roleStatsWhere, isBlocked: true } }),
      this.prisma.user.count({
        where: { ...roleStatsWhere, isDisabled: true },
      }),
      this.prisma.user.count({
        where: { ...hasAccountType(Role.INDIVIDUAL), isAdmin: false },
      }),
      this.prisma.user.count({
        where: { ...hasAccountType(Role.OFFICE), isAdmin: false },
      }),
      this.prisma.user.count({
        where: { ...hasAccountType(Role.COMPANY), isAdmin: false },
      }),
    ]);

    const formattedUsers = users.map((user) => {
      const accountType = accountTypeOf(user.role, user.identities);

      const companyIdent = user.identities.find((i) => i.type === 'COMPANY');
      const officeIdent = user.identities.find((i) => i.type === 'OFFICE');
      const indIdent = user.identities.find((i) => i.type === 'INDIVIDUAL');

      let displayName = user.name || 'بدون اسم';
      if (accountType === 'شركة' && companyIdent?.companyData?.name) {
        displayName = companyIdent.companyData.name;
      } else if (
        accountType === 'مكتب عقاري' &&
        officeIdent?.officeData?.name
      ) {
        displayName = officeIdent.officeData.name;
      } else if (indIdent?.individualData?.name) {
        displayName = indIdent.individualData.name;
      }

      let verificationStatus: 'موثق' | 'غير موثق' | 'قيد الانتظار' | '—' = '—';
      if (accountType === 'شركة' && companyIdent?.companyData) {
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
      } else if (accountType === 'مكتب عقاري' && officeIdent?.officeData) {
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

      const adsCount = user.identities.reduce(
        (sum, i) => sum + (i._count?.properties ?? 0),
        0,
      );

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
        adsCount,
        accountStatus,
        accountState: accountState(user),
        suspendedUntil: user.suspendedUntil,
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
            properties: { orderBy: { createdAt: 'desc' } },
          },
        },
        activePlan: true,
      },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const userWithoutPassword = { ...user, accountState: accountState(user) };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;
    return userWithoutPassword;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    if (user.isAdmin) {
      throw new BadRequestException('لا يمكن حذف حساب المشرف');
    }
    await this.prisma.user.delete({ where: { id } });
    return { message: 'تم حذف المستخدم بنجاح' };
  }

  async updateUserStatus(
    id: string,
    dto: AdminUpdateStatusDto,
    adminUserId?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (user.isAdmin) {
      throw new BadRequestException('لا يمكن تعديل أو تعطيل حساب المشرف');
    }

    const dataToUpdate: Prisma.UserUpdateInput = {};

    // Suspend and block are the admin's decision: suspendedAt/Until are
    // cleared so signing in (or the timed-reactivation job) can't undo them
    const signOut = dto.status !== UserAccountStatusAction.ACTIVE;
    switch (dto.status) {
      case UserAccountStatusAction.BLOCKED:
        dataToUpdate.isBlocked = true;
        dataToUpdate.suspendedAt = null;
        dataToUpdate.suspendedUntil = null;
        break;
      case UserAccountStatusAction.SUSPENDED:
        dataToUpdate.isDisabled = true;
        dataToUpdate.suspendedAt = null;
        dataToUpdate.suspendedUntil = null;
        break;
      case UserAccountStatusAction.ACTIVE:
        dataToUpdate.isDisabled = false;
        dataToUpdate.isBlocked = false;
        dataToUpdate.suspendedAt = null;
        dataToUpdate.suspendedUntil = null;
        break;
    }

    // Ending every session signs the user out on all devices at once
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: dataToUpdate,
      });
      if (signOut) {
        await tx.session.deleteMany({ where: { userId: id } });
      }
      return updated;
    });

    const userWithoutPassword = { ...updatedUser };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;

    await this.auditLog.log({
      actorAdminId: adminUserId,
      action: 'USER_STATUS_CHANGED',
      targetType: 'USER',
      targetId: id,
      targetUserId: id,
      metadata: { status: dto.status },
    });

    return {
      message: 'تم تحديث حالة المستخدم بنجاح',
      user: userWithoutPassword,
    };
  }

  async createIndividual(dto: AdminCreateIndividualDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        'يجب توفير البريد الإلكتروني أو رقم الهاتف على الأقل',
      );
    }

    const email = dto.email ? dto.email.trim().toLowerCase() : undefined;
    const phone = dto.phone ? dto.phone.trim() : undefined;

    await checkUserExists(this.prisma, email, phone);

    // Password generation or hashing
    const plainPassword =
      dto.password || Math.random().toString(36).slice(-8) + 'Aa1!';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Resolve plan if provided
    let activePlanId: string | undefined;
    if (dto.planId) {
      const plan = await this.prisma.plan.findFirst({
        where: {
          OR: [{ id: dto.planId }, { slug: dto.planId }, { name: dto.planId }],
        },
      });
      if (plan) {
        activePlanId = plan.id;
      }
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        const derivedName =
          dto.name?.trim() ||
          (email ? email.split('@')[0] : phone) ||
          'مستخدم جديد';

        const user = await tx.user.create({
          data: {
            email,
            phone,
            // An admin-entered number counts as verified
            phoneVerifiedAt: phone ? new Date() : undefined,
            loginMethod: defaultLoginMethod(email, phone),
            password: hashedPassword,
            role: Role.INDIVIDUAL,
            name: derivedName,
            activePlanId,
          },
        });

        const profile = await tx.individualProfile.create({
          data: { userId: user.id },
        });

        const identity = await tx.identity.create({
          data: {
            userId: user.id,
            type: IdentityType.INDIVIDUAL,
            isActive: true,
            individualData: {
              create: {
                name: derivedName,
              },
            },
          },
        });

        return { user, profile, identity };
      },
      { timeout: 15000 },
    );

    const userWithoutPassword = { ...result.user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;

    return {
      message: 'تم إضافة الفرد بنجاح',
      user: userWithoutPassword,
      profile: result.profile,
      identity: result.identity,
    };
  }

  async notifyUsers(
    dto: AdminNotifyUsersDto,
    adminUserId?: string,
  ): Promise<AdminNotifyUsersResponseDto> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: dto.userIds } },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const notifiedUserIds: string[] = [];
    const failedUserIds: string[] = [];

    for (const userId of dto.userIds) {
      const user = userMap.get(userId);
      if (!user) {
        failedUserIds.push(userId);
        continue;
      }

      try {
        if (dto.notifyInApp !== false) {
          await this.notificationsService.create({
            userId: user.id,
            type: 'ADMIN_CUSTOM_MESSAGE',
            title: dto.title,
            body: dto.message,
          });
        }

        if (dto.notifyEmail !== false && user.email) {
          // Best-effort: a delivery failure for one recipient shouldn't
          // fail the whole batch -- matches AdminIdentityService's
          // sendMailBestEffort pattern for the same reason.
          try {
            await this.mailService.sendMail({
              to: user.email,
              subject: dto.title,
              html: adminCustomMessageTemplate({
                userName: user.name || 'مستخدم بيوتنا',
                title: dto.title,
                message: dto.message,
              }),
            });
          } catch {
            // Notification still counts as sent (in-app succeeded, or
            // in-app was skipped intentionally); only email delivery failed.
          }
        }

        notifiedUserIds.push(userId);
        await this.auditLog.log({
          actorAdminId: adminUserId,
          action: 'USER_NOTIFIED',
          targetType: 'USER',
          targetId: userId,
          targetUserId: userId,
          metadata: { title: dto.title },
        });
      } catch {
        failedUserIds.push(userId);
      }
    }

    return {
      message: `تم إرسال الإشعار إلى ${notifiedUserIds.length} مستخدم.`,
      notifiedCount: notifiedUserIds.length,
      notifiedUserIds,
      failedUserIds,
    };
  }

  formatArabicDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
