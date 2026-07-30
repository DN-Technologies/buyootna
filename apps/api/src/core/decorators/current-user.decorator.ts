import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RequestUser } from '../../features/auth/strategies/jwt.strategy';

interface RequestWithUser extends Request {
  user: RequestUser;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof RequestUser | undefined,
    ctx: ExecutionContext,
  ): RequestUser | string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Support field extraction: @CurrentUser('identityId'), @CurrentUser('userId'), etc.
    if (data) {
      return user[data] as string;
    }

    return user;
  },
);
