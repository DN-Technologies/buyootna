import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  RequestOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/recovery.dto';
import { isEmail, isPhone } from '../../core/utils/user.utils';
import * as bcrypt from 'bcrypt';

interface ResetTokenPayload {
  sub: string;
  purpose: string;
}

@Injectable()
export class RecoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // STEP 1: Generate and send OTP
  async requestOtp(dto: RequestOtpDto) {
    const validEmail = isEmail(dto.identifier);
    const validPhone = isPhone(dto.identifier);

    if (!validEmail && !validPhone) {
      throw new BadRequestException('يجب إدخال بريد إلكتروني أو رقم هاتف صالح');
    }

    const email = validEmail ? dto.identifier : undefined;
    const phone = validPhone ? dto.identifier : undefined;

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: email }, { phone: phone }] },
    });

    if (!user) {
      // Security best practice: Don't reveal if the user exists or not
      return { message: 'إذا كان الحساب موجوداً، فسيتم إرسال رمز التحقق' };
    }

    // Generate a 6-digit random string
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Upsert ensures we overwrite any existing unused OTP for this user
    await this.prisma.otpCode.upsert({
      where: {
        userId: user.id,
      },
      update: {
        code: otp,
        expiresAt,
      },
      create: {
        userId: user.id,
        code: otp,
        expiresAt,
      },
    });

    // TODO: Integrate real SMS (Twilio/MessageBird) or Email service here
    console.log(
      `\n🔑 [MOCK SMS/EMAIL] Your OTP for ${dto.identifier} is: ${otp}\n`,
    );

    return { message: 'تم إرسال رمز التحقق بنجاح' };
  }

  // STEP 2: Verify the OTP and issue a temporary Reset Token
  async verifyOtp(dto: VerifyOtpDto) {
    const validEmail = isEmail(dto.identifier);
    const validPhone = isPhone(dto.identifier);

    const email = validEmail ? dto.identifier : undefined;
    const phone = validPhone ? dto.identifier : undefined;

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: email }, { phone: phone }] },
    });

    if (!user) throw new BadRequestException('البيانات غير صحيحة');

    const otpRecord = await this.prisma.otpCode.findUnique({
      where: { userId: user.id },
    });

    if (!otpRecord || otpRecord.code !== dto.otp) {
      throw new BadRequestException('رمز التحقق غير صحيح');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('رمز التحقق منتهي الصلاحية');
    }

    // OTP is valid! Delete it so it can't be reused
    await this.prisma.otpCode.delete({ where: { userId: user.id } });

    // Generate a temporary JWT just for resetting the password
    const resetToken = this.jwtService.sign({
      sub: user.id,
      purpose: 'password_reset',
    });

    return {
      message: 'تم التحقق بنجاح',
      resetToken,
    };
  }

  // STEP 3: Use the Reset Token to change the password
  async resetPassword(dto: ResetPasswordDto) {
    try {
      // Verify the temporary token
      const payload = this.jwtService.verify<ResetTokenPayload>(dto.resetToken);

      if (payload.purpose !== 'password_reset') {
        throw new UnauthorizedException('توكن غير صالح');
      }

      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

      // Update the user's password
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashedPassword },
      });

      return { message: 'تم تحديث كلمة المرور بنجاح' };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(
        'انتهت صلاحية الجلسة، يرجى المحاولة مرة أخرى',
      );
    }
  }
}
