import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
      throw new UnauthorizedException('البيانات غير صحيحة');
    }

    if (user.isDisabled) {
      throw new UnauthorizedException('الحساب معطل مؤقتاً');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('البيانات غير صحيحة');
    }

    // Never return the password!
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;
    return userWithoutPassword;
  }

  // 2. Generate JWT token
  login(user: Omit<User, 'password'>) {
    // The payload we encode inside the JWT
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: user, // Send user details back to the frontend to update global state
    };
  }

  // 3. Verify OTP during individual registration
  async verifyRegistrationOtp(phone: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new BadRequestException('رقم الهاتف غير مسجل');
    }

    const otpRecord = await this.prisma.otpCode.findUnique({
      where: { userId: user.id },
    });

    if (!otpRecord || otpRecord.code !== otp) {
      throw new BadRequestException('رمز التحقق غير صحيح');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('رمز التحقق منتهي الصلاحية');
    }

    // OTP is valid! Delete it so it can't be reused
    await this.prisma.otpCode.delete({ where: { userId: user.id } });

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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpCode.upsert({
      where: { userId: user.id },
      update: { code: otp, expiresAt },
      create: { userId: user.id, code: otp, expiresAt },
    });

    console.log(
      `\n🔑 [MOCK SMS/EMAIL] Password change OTP for user ${user.id} (${user.phone}) is: ${otp}\n`,
    );

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

    const otpRecord = await this.prisma.otpCode.findUnique({
      where: { userId },
    });

    if (!otpRecord || otpRecord.code !== otp) {
      throw new BadRequestException('رمز التحقق غير صحيح');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('رمز التحقق منتهي الصلاحية');
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
