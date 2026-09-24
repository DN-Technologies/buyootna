import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { User } from '@prisma/client';
import { JwtPayload } from '../strategies/jwt.strategy';
import {
  AuthIdentitiesService,
  IdentityWithData,
} from './auth-identities.service';
import { DeviceCtx, SessionsService } from '../../devices/sessions.service';

/**
 * Token + session issuance around the active identity: building the JWT for
 * a (user, identity, session) triple and switching the active identity.
 */
@Injectable()
export class AuthSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly identities: AuthIdentitiesService,
    private readonly sessions: SessionsService,
  ) {}

  // Generate JWT token with identity information
  async login(
    user: Omit<User, 'password'>,
    identityId?: string,
    deviceCtx: DeviceCtx = {},
  ) {
    // Get the active identity or the specified one
    let identity: IdentityWithData | null;

    if (identityId) {
      identity = await this.identities.findById(identityId, user.id);
    } else {
      identity = await this.identities.findActive(user.id);

      // If no active identity, get the first one (and set it as active)
      if (!identity) {
        identity = await this.identities.findEarliest(user.id);

        if (identity) {
          await this.identities.activate(identity.id);
          identity.isActive = true;
        }
      }

      // Self-heal: registration always creates the User row and its first
      // Identity together in one transaction, so a User with zero
      // identities should never exist. If one somehow does (legacy data,
      // a manual DB edit, a bug we haven't found), don't lock the account
      // out forever with no way back in -- provision a default individual
      // identity instead of throwing. Never done for an explicit
      // identityId switch below, since that's a real "not found" error,
      // not an orphaned-account recovery.
      if (!identity) {
        identity = await this.identities.createDefaultForOrphanedUser(user.id);
      }
    }

    if (!identity) {
      throw new BadRequestException('لا توجد هوية مرتبطة بهذا الحساب');
    }

    const session = await this.sessions.upsertSession(user.id, deviceCtx);

    // Build JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      ident: identity.id,
      type: identity.type,
      sid: session.id,
    };

    const identities = await this.identities.listAll(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      sessionId: session.id,
      user,
      activeIdentity: identity,
      identities,
    };
  }

  // Switch active identity
  async switchIdentity(userId: string, identityId: string, sessionId?: string) {
    // Verify identity belongs to user
    const identity = await this.identities.findById(identityId, userId);

    if (!identity) {
      throw new ForbiddenException('الهوية غير موجودة أو لا تنتمي لهذا الحساب');
    }

    // Update isActive flags in a transaction
    await this.prisma.$transaction([
      // Deactivate all user's identities
      this.prisma.identity.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
      // Activate the selected identity
      this.prisma.identity.update({
        where: { id: identityId },
        data: { isActive: true },
      }),
    ]);

    // Get updated user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof userWithoutPassword>)
      .password;

    // Switching identity stays on the same device/session — reuse the
    // existing sid rather than creating a new Session row.
    if (sessionId) {
      await this.sessions.touchLastActive(sessionId);
    }

    // Generate new JWT token with updated identity
    const payload: JwtPayload = {
      sub: userId,
      ident: identity.id,
      type: identity.type,
      sid: sessionId,
    };

    // Get all identities
    const identities = await this.identities.listAll(userId);

    return {
      access_token: this.jwtService.sign(payload),
      sessionId,
      user: userWithoutPassword,
      activeIdentity: { ...identity, isActive: true },
      identities: identities.map((i) => ({
        ...i,
        isActive: i.id === identityId,
      })),
    };
  }
}
