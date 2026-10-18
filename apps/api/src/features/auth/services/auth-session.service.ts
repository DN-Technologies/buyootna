import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { IdentityType, User } from '@prisma/client';
import { JwtPayload } from '../strategies/jwt.strategy';
import {
  AuthIdentitiesService,
  IdentityWithData,
} from './auth-identities.service';
import { LoginAlertService } from '../../devices/login-alert.service';
import { DeviceCtx, SessionsService } from '../../devices/sessions.service';
import { AccountStateService } from '../../users/services/account-state.service';
import {
  accountStatus,
  arabicDays,
  daysUntil,
  identityTypeNotFoundError,
  suspendedByAdminError,
} from '../account-status.util';

// A short-lived token that lets the user finish a sign-in they paused at the
// "reactivate your account now?" question (POST /auth/reactivate). It
// carries `kind`, which JwtStrategy refuses, so it never works as a login.
interface ReactivationTicket {
  sub: string;
  kind: 'reactivate';
  ident?: string;
}
const REACTIVATION_TICKET_TTL = '10m';

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
    private readonly loginAlerts: LoginAlertService,
    private readonly accountState: AccountStateService,
  ) {}

  // Generate JWT token with identity information
  async login(
    user: Omit<User, 'password'>,
    identityId?: string,
    deviceCtx: DeviceCtx = {},
    opts: { confirmReactivation?: boolean; identityType?: IdentityType } = {},
  ) {
    // Every sign-in path (password, OTP, registration, Google, Apple) comes
    // through here, so account status is enforced once for all of them
    let reactivated = false;
    if (!user.isAdmin) {
      const status = accountStatus(user);
      if (status === 'blocked' || status === 'suspended_by_admin') {
        throw suspendedByAdminError();
      }
    }

    // The login screen's فرد / مكتب / شركة choice: open that persona of the
    // account directly. Resolved here, before the reactivation ticket below,
    // so a sign-in paused there resumes on the same persona. Only reached
    // with the password (or OTP / social token) already proven, so saying
    // which personas exist reveals nothing to a stranger.
    if (!identityId && opts.identityType) {
      const chosen = await this.identities.findByType(
        user.id,
        opts.identityType,
        deviceCtx.deviceId,
      );
      if (!chosen) {
        const available = await this.identities.listAll(user.id);
        throw identityTypeNotFoundError(opts.identityType, [
          ...new Set(available.map((i) => i.type)),
        ]);
      }
      identityId = chosen.id;
    }

    if (!user.isAdmin) {
      const status = accountStatus(user);
      if (status === 'deactivated_by_user') {
        // A timed deactivation still running: ask before ending it early.
        // The app answers "yes" through POST /auth/reactivate with the ticket.
        const until = user.suspendedUntil;
        if (until && until > new Date() && !opts.confirmReactivation) {
          const daysLeft = daysUntil(until);
          const ticket: ReactivationTicket = {
            sub: user.id,
            kind: 'reactivate',
            ...(identityId ? { ident: identityId } : {}),
          };
          throw new ConflictException({
            statusCode: 409,
            code: 'ACCOUNT_SCHEDULED_DEACTIVATION',
            message: `حسابك معطل حالياً وسيُعاد تفعيله تلقائياً خلال ${arabicDays(daysLeft)}. هل تريد إلغاء التعطيل وتسجيل الدخول الآن؟`,
            daysLeft,
            suspendedUntil: until,
            reactivationTicket: this.jwtService.sign(ticket, {
              expiresIn: REACTIVATION_TICKET_TTL,
            }),
          });
        }
        // Signing in brings a self-deactivated account back
        await this.accountState.reactivate(user.id);
        user = {
          ...user,
          isDisabled: false,
          suspendedAt: null,
          suspendedUntil: null,
        };
        reactivated = true;
      }
    }

    // Which persona this login opens with: the one asked for, else the one
    // this device was using, else the account's last used, else the first
    let identity: IdentityWithData | null;

    if (identityId) {
      identity = await this.identities.findById(identityId, user.id);
    } else {
      identity =
        (await this.identities.findForDevice(user.id, deviceCtx.deviceId)) ??
        (await this.identities.findActive(user.id)) ??
        (await this.identities.findEarliest(user.id));

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

    const { isNewDevice, ...session } = await this.sessions.upsertSession(
      user.id,
      deviceCtx,
      identity.id,
    );
    if (!identity.isActive) {
      await this.identities.markLastUsed(user.id, identity.id);
    }
    if (isNewDevice) {
      // Not awaited, and it never throws: alerting must not slow the login
      void this.loginAlerts.notifyNewDeviceLogin(user.id, session);
    }

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
      user: { ...user, accountStatus: accountStatus(user) },
      activeIdentity: { ...identity, isActive: true },
      // isActive here means "active on this device"
      identities: identities.map((i) => ({
        ...i,
        isActive: i.id === identity.id,
      })),
      ...(reactivated ? { reactivated: true } : {}),
    };
  }

  /**
   * The "yes, reactivate now" answer to ACCOUNT_SCHEDULED_DEACTIVATION:
   * checks the ticket from that 409 and finishes the sign-in it paused.
   */
  async loginWithReactivationTicket(ticket: string, deviceCtx: DeviceCtx = {}) {
    let claims: ReactivationTicket;
    try {
      claims = this.jwtService.verify<ReactivationTicket>(ticket);
    } catch {
      claims = null as unknown as ReactivationTicket;
    }
    if (claims?.kind !== 'reactivate' || !claims.sub) {
      throw new UnauthorizedException(
        'انتهت صلاحية الطلب، يرجى تسجيل الدخول مرة أخرى',
      );
    }

    const found = await this.prisma.user.findUnique({
      where: { id: claims.sub },
    });
    if (!found) {
      throw new UnauthorizedException(
        'انتهت صلاحية الطلب، يرجى تسجيل الدخول مرة أخرى',
      );
    }
    const { password: _password, ...user } = found;
    // Anything but a self-deactivation (an admin acted meanwhile, or it
    // already ended) goes through the normal checks in login()
    return this.login(user, claims.ident, deviceCtx, {
      confirmReactivation: true,
    });
  }

  // Switch active identity
  async switchIdentity(userId: string, identityId: string, sessionId?: string) {
    // Verify identity belongs to user
    const identity = await this.identities.findById(identityId, userId);

    if (!identity) {
      throw new ForbiddenException('الهوية غير موجودة أو لا تنتمي لهذا الحساب');
    }

    // This device now uses it, and it becomes the account's last used one;
    // other devices keep their own persona
    await this.identities.markLastUsed(userId, identityId);
    if (sessionId) {
      await this.sessions.setActiveIdentity(sessionId, identityId);
    }

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
