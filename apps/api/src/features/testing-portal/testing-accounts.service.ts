import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IdentityType, Prisma, SlotStatus } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { OtpRateLimiterService } from '../../core/otp-rate-limiter/otp-rate-limiter.service';
import { DemoCommand, runPulseDemo } from '../../core/demo-data/pulse-demo';
import { AdminUsersService } from '../admin/services/users/admin-users.service';
import { IdentitiesService } from '../identities/identities.service';
import { PlansService } from '../plans/plans.service';
import { TestingAuditService } from './testing-audit.service';
import type { TestingUser } from './testing-portal.constants';

export interface Actor {
  tester: TestingUser;
  ip?: string;
}

const IDENTITY_SELECT = {
  id: true,
  type: true,
  isActive: true,
  freeAdsRemaining: true,
  createdAt: true,
  individualData: { select: { name: true } },
  companyData: { select: { name: true, status: true, licenseNumber: true } },
  officeData: { select: { name: true, status: true, licenseNumber: true } },
} satisfies Prisma.IdentitySelect;

type IdentityRow = Prisma.IdentityGetPayload<{
  select: typeof IDENTITY_SELECT;
}>;

function identityView(identity: IdentityRow) {
  const data = identity.companyData ?? identity.officeData;
  return {
    id: identity.id,
    type: identity.type,
    name: data?.name ?? identity.individualData?.name ?? null,
    status: data?.status ?? null,
    licenseNumber: data?.licenseNumber ?? null,
    freeAdsRemaining: identity.freeAdsRemaining,
    isActive: identity.isActive,
  };
}

/**
 * الأدوات › الحسابات: find an account, see its identities, credits and OTP
 * cooldowns, add a test account, give or edit plans, and fill it with demo
 * data. Every change is written to the portal's audit log.
 */
@Injectable()
export class TestingAccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimiter: OtpRateLimiterService,
    private readonly adminUsers: AdminUsersService,
    private readonly identities: IdentitiesService,
    private readonly plans: PlansService,
    private readonly audit: TestingAuditService,
  ) {}

  async search(query: string) {
    const q = query.trim();
    if (q.length < 2) return { data: [] };
    const contains = { contains: q, mode: 'insensitive' as const };
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { email: contains },
          { phone: contains },
          { name: contains },
          {
            identities: {
              some: {
                OR: [
                  { individualData: { name: contains } },
                  { companyData: { name: contains } },
                  { officeData: { name: contains } },
                ],
              },
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        isBlocked: true,
        isDisabled: true,
        createdAt: true,
        identities: { select: IDENTITY_SELECT, orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return {
      data: users.map(({ identities, ...user }) => ({
        ...user,
        identities: identities.map(identityView),
      })),
    };
  }

  async account(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        isBlocked: true,
        isDisabled: true,
        createdAt: true,
        identities: { select: IDENTITY_SELECT, orderBy: { createdAt: 'asc' } },
        _count: { select: { sessions: { where: { isActive: true } } } },
      },
    });
    if (!user) throw new NotFoundException('الحساب غير موجود');

    const wallets = await Promise.all(
      user.identities.map((identity) => this.plans.getWallet(identity.id)),
    );
    // Cooldowns are keyed by what each screen typed: email, phone or user id
    const cooldowns = [user.email, user.phone, user.id]
      .filter((key): key is string => !!key)
      .flatMap((key) => this.rateLimiter.entries(key));

    const { identities, _count, ...rest } = user;
    return {
      ...rest,
      activeSessions: _count.sessions,
      identities: identities.map((identity, i) => ({
        ...identityView(identity),
        wallet: wallets[i],
      })),
      cooldowns: [...new Map(cooldowns.map((c) => [c.key, c])).values()],
    };
  }

  cooldowns(query: string) {
    return { data: this.rateLimiter.entries(query) };
  }

  async unlock(key: string, actor: Actor) {
    this.rateLimiter.reset(key);
    await this.audit.record({
      actorName: actor.tester.name,
      action: 'OTP_COOLDOWN_UNLOCKED',
      target: key,
      ip: actor.ip,
    });
    return { key, unlocked: true };
  }

  /**
   * A test account: an individual (email and/or phone + password), with a
   * company or office if asked. A company is approved from the start (as
   * in the app); an office is approved too when `approveOffice` is set.
   */
  async createAccount(
    input: {
      name: string;
      email?: string;
      phone?: string;
      password: string;
      persona?: {
        type: 'COMPANY' | 'OFFICE';
        name: string;
        licenseNumber: string;
        approveOffice?: boolean;
      };
    },
    actor: Actor,
  ) {
    const created = await this.adminUsers.createIndividual({
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
    });
    const userId = created.user.id;

    if (input.persona) {
      const persona = input.persona;
      // The persona can't be made (e.g. its licence is taken): no half
      // account left behind
      await this.prisma
        .$transaction(async (tx) => {
          const identity = await this.identities.createProviderPersonaInTx(
            tx,
            persona.type,
            userId,
            { name: persona.name, licenseNumber: persona.licenseNumber },
            { isActive: false },
          );
          if (persona.type === IdentityType.OFFICE && persona.approveOffice) {
            await tx.officeIdentityData.update({
              where: { identityId: identity.id },
              data: { status: 'APPROVED' },
            });
            await tx.reviewRequest.updateMany({
              where: { officeIdentityDataId: identity.officeData!.id },
              data: { status: 'APPROVED' },
            });
          }
        })
        .catch(async (error: unknown) => {
          await this.prisma.user.delete({ where: { id: userId } });
          throw error;
        });
    }

    await this.audit.record({
      actorName: actor.tester.name,
      action: 'ACCOUNT_CREATED',
      target: input.email ?? input.phone ?? userId,
      metadata: {
        userId,
        persona: input.persona?.type ?? null,
        officeApproved: input.persona?.approveOffice ?? null,
      },
      ip: actor.ip,
    });
    return this.account(userId);
  }

  listPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        maxActiveAds: true,
        durationDays: true,
      },
    });
  }

  private async identityOf(identityId: string) {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      select: { id: true, userId: true },
    });
    if (!identity) throw new NotFoundException('الهوية غير موجودة');
    return identity;
  }

  /** Gives a persona a plan: a new active slot with its ads. */
  async grantPlan(
    identityId: string,
    planId: string,
    adsRemaining: number | undefined,
    actor: Actor,
  ) {
    const identity = await this.identityOf(identityId);
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('الباقة غير موجودة');
    const slot = await this.prisma.userPlanSlot.create({
      data: {
        planId,
        identityId,
        userId: identity.userId,
        adsRemaining: adsRemaining ?? plan.maxActiveAds,
        status: SlotStatus.ACTIVE,
      },
    });
    await this.audit.record({
      actorName: actor.tester.name,
      action: 'PLAN_GRANTED',
      target: identityId,
      metadata: {
        planId,
        planName: plan.name,
        adsRemaining: slot.adsRemaining,
      },
      ip: actor.ip,
    });
    return this.plans.getWallet(identityId);
  }

  /** Changes a slot's ads left (0 ends it) or its status. */
  async editSlot(
    slotId: string,
    changes: { adsRemaining?: number; status?: SlotStatus },
    actor: Actor,
  ) {
    const slot = await this.prisma.userPlanSlot.findUnique({
      where: { id: slotId },
    });
    if (!slot) throw new NotFoundException('الباقة غير موجودة');
    if (changes.adsRemaining === undefined && !changes.status) {
      throw new BadRequestException('لا يوجد تعديل');
    }
    const updated = await this.prisma.userPlanSlot.update({
      where: { id: slotId },
      data: {
        ...(changes.adsRemaining !== undefined
          ? { adsRemaining: changes.adsRemaining }
          : {}),
        ...(changes.status ? { status: changes.status } : {}),
      },
    });
    await this.audit.record({
      actorName: actor.tester.name,
      action: 'PLAN_EDITED',
      target: slot.identityId,
      metadata: {
        slotId,
        from: { adsRemaining: slot.adsRemaining, status: slot.status },
        to: { adsRemaining: updated.adsRemaining, status: updated.status },
      },
      ip: actor.ip,
    });
    return this.plans.getWallet(slot.identityId);
  }

  /** Sets a persona's free ads left (the one free ad, or more for a test). */
  async setFreeAds(identityId: string, freeAdsRemaining: number, actor: Actor) {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      select: { freeAdsRemaining: true },
    });
    if (!identity) throw new NotFoundException('الهوية غير موجودة');
    await this.prisma.identity.update({
      where: { id: identityId },
      data: { freeAdsRemaining },
    });
    await this.audit.record({
      actorName: actor.tester.name,
      action: 'FREE_ADS_SET',
      target: identityId,
      metadata: { from: identity.freeAdsRemaining, to: freeAdsRemaining },
      ip: actor.ip,
    });
    return this.plans.getWallet(identityId);
  }

  /**
   * Runs a «النبض» demo command for the account (`clear` removes every
   * demo row, whoever it was added for).
   */
  async runDemo(
    userId: string,
    command: DemoCommand,
    days: number | undefined,
    actor: Actor,
  ) {
    let lines: string[];
    try {
      lines = await runPulseDemo(this.prisma, command, { userId, days });
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
    await this.audit.record({
      actorName: actor.tester.name,
      action: command === 'clear' ? 'DEMO_CLEARED' : 'DEMO_ADDED',
      target: userId,
      metadata: { command, days: days ?? null },
      ip: actor.ip,
    });
    return { lines };
  }
}
