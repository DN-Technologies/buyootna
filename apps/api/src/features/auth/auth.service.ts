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
}
