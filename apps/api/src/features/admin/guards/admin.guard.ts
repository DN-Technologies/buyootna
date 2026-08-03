import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { RequestUser } from '../../auth/strategies/jwt.strategy';

interface RequestWithUser extends Request {
  user: RequestUser;
}

// Runs after AuthGuard('jwt') — rejects authenticated users who aren't admins.
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user?.user?.isAdmin) {
      throw new ForbiddenException(
        'هذا الحساب لا يملك صلاحية الوصول إلى لوحة التحكم',
      );
    }

    return true;
  }
}
