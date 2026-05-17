import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';

interface RequestWithUser extends Request {
  user: Omit<User, 'password'>;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    // This 'user' object is populated by our JwtStrategy!
    return request.user;
  },
);
