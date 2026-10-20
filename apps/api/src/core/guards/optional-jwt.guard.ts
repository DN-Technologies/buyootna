import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * For public routes that answer better for a signed-in caller (e.g. hiding
 * what that account blocked): a valid token sets the user as usual; no
 * token, or one that fails, lets the request through anonymously instead
 * of answering 401.
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(_error: unknown, user: TUser | false): TUser {
    return (user || undefined) as TUser;
  }
}
