import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TestingCredentialKind } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TestingUser } from './testing-portal.constants';
import { TestingTokenService } from './testing-token.service';

type TestingRequest = Request & { testingUser?: TestingUser };

/** The signed-in tester, set by TestingAuthGuard. */
export const CurrentTester = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TestingUser =>
    ctx.switchToHttp().getRequest<TestingRequest>().testingUser!,
);

@Injectable()
export class TestingAuthGuard implements CanActivate {
  constructor(
    private readonly tokens: TestingTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<TestingRequest>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    const claims =
      scheme === 'Bearer' && token ? this.tokens.verify(token) : null;

    // A token from before the password was changed is no longer valid
    const credential = claims
      ? await this.prisma.testingCredential.findUnique({
          where: { kind: TestingCredentialKind.LOGIN },
          select: { updatedAt: true },
        })
      : null;
    if (!claims || credential?.updatedAt.getTime() !== claims.ver) {
      throw new UnauthorizedException('يرجى تسجيل الدخول إلى بوابة الاختبار');
    }
    request.testingUser = { name: claims.name };
    return true;
  }
}
