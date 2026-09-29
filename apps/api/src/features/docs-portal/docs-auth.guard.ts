import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocsRole } from '@prisma/client';
import { Request } from 'express';
import { DOCS_ROLES_KEY, DocsUser } from './docs-portal.constants';
import { DocsTokenService } from './docs-token.service';
import { PrismaService } from '../../core/prisma/prisma.service';

type DocsRequest = Request & { docsUser?: DocsUser };

/** Limits a docs-portal route to these roles (any signed-in role if omitted). */
export const DocsRoles = (...roles: DocsRole[]) =>
  SetMetadata(DOCS_ROLES_KEY, roles);

/** The signed-in docs user, set by DocsAuthGuard. */
export const CurrentDocsUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): DocsUser =>
    ctx.switchToHttp().getRequest<DocsRequest>().docsUser!,
);

@Injectable()
export class DocsAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: DocsTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<DocsRequest>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    const claims =
      scheme === 'Bearer' && token ? this.tokens.verify(token) : null;

    // A token from before the role's password was changed is no longer valid
    const credential = claims
      ? await this.prisma.docsRoleCredential.findUnique({
          where: { role: claims.role },
          select: { updatedAt: true },
        })
      : null;
    if (!claims || credential?.updatedAt.getTime() !== claims.ver) {
      throw new UnauthorizedException('يرجى تسجيل الدخول إلى بوابة التوثيق');
    }
    const user: DocsUser = { role: claims.role, name: claims.name };
    request.docsUser = user;

    const allowed = this.reflector.getAllAndOverride<DocsRole[] | undefined>(
      DOCS_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowed?.length && !allowed.includes(user.role)) {
      throw new ForbiddenException('ليس لدورك صلاحية لهذا الإجراء');
    }
    return true;
  }
}
