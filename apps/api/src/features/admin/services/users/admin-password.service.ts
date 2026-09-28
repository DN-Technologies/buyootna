import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { MailService } from '../../../../core/mail/mail.service';
import { adminResetPasswordTemplate } from '../../../../core/mail/templates/admin-reset-password.template';

@Injectable()
export class AdminPasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

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
