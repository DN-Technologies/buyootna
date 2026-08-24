import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IdentityType } from '@prisma/client';
import { RequestUser } from '../../features/auth/strategies/jwt.strategy';

export const IDENTITY_TYPES_KEY = 'identityTypes';

export const RequireIdentityType = (...types: IdentityType[]) =>
  SetMetadata(IDENTITY_TYPES_KEY, types);

@Injectable()
export class IdentityTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTypes = this.reflector.getAllAndOverride<IdentityType[]>(
      IDENTITY_TYPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTypes || requiredTypes.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    if (!user || !user.identityType) {
      throw new ForbiddenException('يرجى تسجيل الدخول أولاً');
    }

    const hasRequiredType = requiredTypes.includes(user.identityType);

    if (!hasRequiredType) {
      const typeNames = requiredTypes
        .map((t) => {
          switch (t) {
            case IdentityType.INDIVIDUAL:
              return 'فرد';
            case IdentityType.COMPANY:
              return 'شركة';
            case IdentityType.OFFICE:
              return 'مكتب';
            default:
              return t;
          }
        })
        .join(' أو ');

      throw new ForbiddenException(`هذه الميزة متاحة فقط لـ: ${typeNames}`);
    }

    return true;
  }
}
