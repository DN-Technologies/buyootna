import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TwilioService } from '../../core/twilio/twilio.service';
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
    private readonly twilioService: TwilioService,
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

    if (user.phone) {
      await this.twilioService.sendVerification(user.phone);
    }

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

    if (!user || !user.phone)
      throw new BadRequestException('البيانات غير صحيحة');

    const isValid = await this.twilioService.checkVerification(
      user.phone,
      dto.otp,
    );
    if (!isValid) {
      throw new BadRequestException('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

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
