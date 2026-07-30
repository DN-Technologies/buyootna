import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { TwilioService } from 'src/core/twilio/twilio.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, Identity } from '@prisma/client';
import { JwtPayload } from './strategies/jwt.strategy';

type IdentityWithData = Identity & {
  individualData?: {
    name: string | null;
    whatsapp: string | null;
    avatarUrl: string | null;
  } | null;
  companyData?: { name: string; logoUrl: string | null } | null;
  officeData?: { name: string; logoUrl: string | null } | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly twilioService: TwilioService,
  ) {}

  // 1. Verify credentials (used by LocalStrategy)
  async validateUser(
    identifier: string,
    pass: string,
  ): Promise<Omit<User, 'password'>> {
    // Look up user by email OR phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'البريد الإلكتروني أو رقم الهاتف غير صحيح',
      );
    }

    if (user.isDisabled) {
      throw new UnauthorizedException('الحساب معطل مؤقتاً');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    // Never return the password!
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;
    return userWithoutPassword;
  }

  // 2. Generate JWT token with identity information
  async login(user: Omit<User, 'password'>, identityId?: string) {
    // Get the active identity or the specified one
    let identity: IdentityWithData | null;

    if (identityId) {
      // Use specified identity
      identity = await this.prisma.identity.findFirst({
        where: {
          id: identityId,
          userId: user.id,
        },
        include: {
          individualData: {
            select: { name: true, whatsapp: true, avatarUrl: true },
          },
          companyData: {
            select: { name: true, logoUrl: true },
          },
          officeData: {
            select: { name: true, logoUrl: true },
          },
        },
      });
    } else {
      // Get the currently active identity
      identity = await this.prisma.identity.findFirst({
        where: {
          userId: user.id,
          isActive: true,
        },
        include: {
          individualData: {
            select: { name: true, whatsapp: true, avatarUrl: true },
          },
          companyData: {
            select: { name: true, logoUrl: true },
          },
          officeData: {
            select: { name: true, logoUrl: true },
          },
        },
      });

      // If no active identity, get the first one (and set it as active)
      if (!identity) {
        identity = await this.prisma.identity.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'asc' },
          include: {
            individualData: {
              select: { name: true, whatsapp: true, avatarUrl: true },
            },
            companyData: {
              select: { name: true, logoUrl: true },
            },
            officeData: {
              select: { name: true, logoUrl: true },
            },
          },
        });

        if (identity) {
          await this.prisma.identity.update({
            where: { id: identity.id },
            data: { isActive: true },
          });
          identity.isActive = true;
        }
      }
    }

    if (!identity) {
      throw new BadRequestException('لا توجد هوية مرتبطة بهذا الحساب');
    }

    // Build JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      ident: identity.id,
      type: identity.type,
    };

    // Get all identities for the user
    const identities = await this.prisma.identity.findMany({
      where: { userId: user.id },
      include: {
        individualData: {
          select: { name: true, whatsapp: true, avatarUrl: true },
        },
        companyData: {
          select: { name: true, logoUrl: true },
        },
        officeData: {
          select: { name: true, logoUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      access_token: this.jwtService.sign(payload),
      user,
      activeIdentity: identity,
      identities,
    };
  }

  // 3. Switch active identity
  async switchIdentity(userId: string, identityId: string) {
    // Verify identity belongs to user
    const identity = await this.prisma.identity.findFirst({
      where: {
        id: identityId,
        userId,
      },
      include: {
        individualData: {
          select: { name: true, whatsapp: true, avatarUrl: true },
        },
        companyData: {
          select: { name: true, logoUrl: true },
        },
        officeData: {
          select: { name: true, logoUrl: true },
        },
      },
    });

    if (!identity) {
      throw new ForbiddenException('الهوية غير موجودة أو لا تنتمي لهذا الحساب');
    }

    // Update isActive flags in a transaction
    await this.prisma.$transaction([
      // Deactivate all user's identities
      this.prisma.identity.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
      // Activate the selected identity
      this.prisma.identity.update({
        where: { id: identityId },
        data: { isActive: true },
      }),
    ]);

    // Get updated user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;

    // Generate new JWT token with updated identity
    const payload: JwtPayload = {
      sub: userId,
      ident: identity.id,
      type: identity.type,
    };

    // Get all identities
    const identities = await this.prisma.identity.findMany({
      where: { userId },
      include: {
        individualData: {
          select: { name: true, whatsapp: true, avatarUrl: true },
        },
        companyData: {
          select: { name: true, logoUrl: true },
        },
        officeData: {
          select: { name: true, logoUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
      activeIdentity: { ...identity, isActive: true },
      identities: identities.map((i) => ({
        ...i,
        isActive: i.id === identityId,
      })),
    };
  }

  // 4. Verify OTP during individual registration
  async verifyRegistrationOtp(phone: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new BadRequestException('رقم الهاتف غير مسجل');
    }

    const isValid = await this.twilioService.checkVerification(phone, otp);
    if (!isValid) {
      throw new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

    // Return access token and user info
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;

    return this.login(userWithoutPassword);
  }

  async requestChangePasswordOtp(user: User) {
    if (!user.phone) {
      throw new BadRequestException('المستخدم ليس لديه رقم هاتف مسجل');
    }

    await this.twilioService.sendVerification(user.phone);

    return { message: 'تم إرسال رمز التحقق بنجاح' };
  }

  async changePassword(
    userId: string,
    oldPass: string,
    newPass: string,
    otp: string,
    logoutAllDevices?: boolean,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('المستخدم غير موجود');
    }

    if (!user.phone) {
      throw new BadRequestException('المستخدم ليس لديه رقم هاتف مسجل');
    }

    const isValid = await this.twilioService.checkVerification(user.phone, otp);
    if (!isValid) {
      throw new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
      throw new BadRequestException('كلمة المرور القديمة غير صحيحة');
    }

    await this.prisma.otpCode.delete({ where: { userId } });

    const hashedNewPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    if (logoutAllDevices) {
      const latest = await this.prisma.session.findFirst({
        where: { userId, isActive: true },
        orderBy: { lastActive: 'desc' },
      });
      if (latest) {
        await this.prisma.session.deleteMany({
          where: {
            userId,
            id: { not: latest.id },
          },
        });
      }
    }

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }
}
