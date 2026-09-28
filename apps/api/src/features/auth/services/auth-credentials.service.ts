import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * The only message a failed password login ever returns: identical for an
 * unknown email/phone and a wrong password, so the login form can't be used
 * to discover which accounts exist (account enumeration).
 */
export const INVALID_CREDENTIALS_MESSAGE =
  'رقم الهاتف/البريد الإلكتروني أو كلمة المرور غير صحيحة';

// Same cost as real password hashes (bcrypt.hash(..., 10) elsewhere), so a
// login for an unknown account takes as long as one with a wrong password
let dummyHash: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  dummyHash ??= bcrypt.hash('buyootna-timing-equalizer', 10);
  return dummyHash;
}

/**
 * Credential verification for the login flow (used by LocalStrategy):
 * looks a user up by email OR phone, checks the password, then account
 * state. Account state (disabled/blocked) is only revealed to someone who
 * already knows the password.
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

    // Always run one bcrypt comparison, even with no account, so response
    // time doesn't reveal whether the identifier is registered
    const hash = user?.password || (await getDummyHash());
    const isMatch = await bcrypt.compare(pass, hash);
    if (!user || !user.password || !isMatch) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    // A self-suspended account (suspendedAt set) signs in and is reactivated
    // by AuthSessionService.login(); an admin disable stays refused
    if (user.isDisabled && !user.isAdmin && !user.suspendedAt) {
      throw new UnauthorizedException('الحساب معطل مؤقتاً');
    }

    if (user.isBlocked && !user.isAdmin) {
      throw new UnauthorizedException('الحساب محظور');
    }

    // Never return the password!
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;
    return userWithoutPassword;
  }
}
