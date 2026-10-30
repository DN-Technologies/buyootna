import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';

import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { reelsEnabledFor } from './reels.switch';

/**
 * Hides every reels route behind the switch: to anyone it's off for, they
 * don't exist. Runs after OptionalJwtGuard, which sets the user if signed in.
 */
@Injectable()
export class ReelsEnabledGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    if (!reelsEnabledFor(request.user?.userId)) throw new NotFoundException();
    return true;
  }
}
