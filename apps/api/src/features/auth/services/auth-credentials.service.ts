import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Credential verification for the login flow (used by LocalStrategy):
 * looks a user up by email OR phone and checks account state + password.
 */
@Injectable()
export class AuthCredentialsService {
  constructor(private readonly prisma: PrismaService) {}

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

    if (user.isDisabled && !user.isAdmin) {
      throw new UnauthorizedException('الحساب معطل مؤقتاً');
    }

    if (user.isBlocked && !user.isAdmin) {
      throw new UnauthorizedException('الحساب محظور');
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
}
