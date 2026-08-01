import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IdentityType, User, Identity } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface JwtPayload {
  sub: string; // userId (auth principal)
  ident: string; // identityId (active identity)
  type: IdentityType; // INDIVIDUAL | COMPANY | OFFICE
}

export interface RequestUser {
  userId: string;
  identityId: string;
  identityType: IdentityType;
  user: Omit<User, 'password'>;
  identity: Identity & {
    individualData?: {
      name: string | null;
      whatsapp: string | null;
      avatarUrl: string | null;
    } | null;
    companyData?: { name: string; logoUrl: string | null } | null;
    officeData?: { name: string; logoUrl: string | null } | null;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-fallback-key',
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    // Validate both user existence AND identity ownership
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException(
        'المستخدم غير موجود أو انتهت صلاحية الجلسة',
      );
    }

    if (user.isDisabled) {
      throw new UnauthorizedException('الحساب معطل مؤقتاً');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('الحساب محظور');
    }

    // Validate identity belongs to this user
    const identity = await this.prisma.identity.findFirst({
      where: {
        id: payload.ident,
        userId: payload.sub,
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
      throw new UnauthorizedException(
        'الهوية غير صالحة أو لا تنتمي لهذا المستخدم',
      );
    }

    // Remove password from user object
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;

    return {
      userId: user.id,
      identityId: identity.id,
      identityType: identity.type,
      user: userWithoutPassword,
      identity,
    };
  }
}
