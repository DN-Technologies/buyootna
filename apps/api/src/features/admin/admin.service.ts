import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AdminUsersFilterDto } from './dto/admin-users-filter.dto';
import {
  AdminUpdateStatusDto,
  UserAccountStatusAction,
} from './dto/admin-update-status.dto';
import { AdminUpdateIdentityStatusDto } from './dto/admin-update-identity-status.dto';
import { AdminCreateIndividualDto } from './dto/admin-create-individual.dto';
import { IdentityType, Prisma, Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../../core/mail/mail.service';
import { adminResetPasswordTemplate } from '../../core/mail/templates/admin-reset-password.template';
import { checkUserExists } from '../../core/utils/user.utils';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
      ...(role ? { role } : {}),
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
        where: { role: Role.INDIVIDUAL, isAdmin: false },
      }),
      this.prisma.user.count({ where: { role: Role.OFFICE, isAdmin: false } }),
      this.prisma.user.count({ where: { role: Role.COMPANY, isAdmin: false } }),
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
    if (user.isAdmin) {
      throw new BadRequestException('لا يمكن حذف حساب المشرف');
    }
    await this.prisma.user.delete({ where: { id } });
    return { message: 'تم حذف المستخدم بنجاح' };
  }

  async updateUserStatus(id: string, dto: AdminUpdateStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (user.isAdmin) {
      throw new BadRequestException('لا يمكن تعديل أو تعطيل حساب المشرف');
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

  async exportUsersCsv(filters: AdminUsersFilterDto): Promise<string> {
    const res = await this.getUsers({
      ...filters,
      page: 1,
      limit: 10000,
    });

    const headers = [
      'معرف الفرد',
      'الاسم',
      'البريد الإلكتروني',
      'رقم الهاتف',
      'نوع الحساب',
      'الاشتراك',
      'عدد الإعلانات',
      'الحالة',
      'تاريخ التسجيل',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = res.data.map((user) => [
      escapeCsv(user.id),
      escapeCsv(user.name),
      escapeCsv(user.email),
      escapeCsv(user.phone),
      escapeCsv(user.accountType),
      escapeCsv(user.subscriptionPlan),
      escapeCsv(user.adsCount ?? 0),
      escapeCsv(user.accountStatus),
      escapeCsv(user.registrationDate),
    ]);

    // UTF-8 BOM (\uFEFF) ensures Arabic text renders properly in Excel
    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join(
        '\r\n',
      );

    return csvContent;
  }

  private formatArabicDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }

  async sendUserPasswordResetLink(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (!user.email) {
      throw new BadRequestException('لا يوجد بريد إلكتروني مسجل لهذا المستخدم');
    }

    // 60 minutes expiry token matching Figma UI
    const resetToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        purpose: 'password_reset',
      },
      { expiresIn: '60m' },
    );

    const frontendBaseUrl =
      process.env.ADMIN_WEB_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:3005';
    const resetUrl = `${frontendBaseUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

    await this.mailService.sendMail({
      to: user.email,
      subject: 'إعادة تعيين كلمة المرور - Buyootna',
      html: adminResetPasswordTemplate({
        userName: user.name || 'مستخدم بيوتنا',
        resetUrl,
        expiresInMinutes: 60,
      }),
    });

    return {
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح',
      email: user.email,
    };
  }
}
