import { ForbiddenException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

type Db = Prisma.TransactionClient | PrismaClient;

/** The free period a company gets once, when it is approved. */
export const TRIAL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export type CompanySubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'NONE';

export interface CompanySubscriptionState {
  status: CompanySubscriptionStatus;
  // The plan of the latest paid period; null on a trial or with none
  currentPlanId: string | null;
  endsAt: Date | null;
  daysLeft: number;
}

/**
 * `months` calendar months after `from`. A day the target month lacks (the
 * 31st, or the 30th in February) lands on that month's last day.
 */
export function addMonths(from: Date, months: number): Date {
  const date = new Date(from);
  const day = date.getUTCDate();
  date.setUTCMonth(date.getUTCMonth() + months);
  if (date.getUTCDate() !== day) date.setUTCDate(0);
  return date;
}

/**
 * Where a company's subscription stands. Periods are stacked end to end, so
 * the company is covered until its latest `endsAt`.
 */
export async function getCompanySubscriptionState(
  db: Db,
  identityId: string,
  now = new Date(),
): Promise<CompanySubscriptionState> {
  const periods = await db.companySubscription.findMany({
    where: { identityId },
    orderBy: { endsAt: 'desc' },
    select: { kind: true, companyPlanId: true, endsAt: true },
  });
  if (periods.length === 0) {
    return { status: 'NONE', currentPlanId: null, endsAt: null, daysLeft: 0 };
  }

  const latest = periods[0];
  if (latest.endsAt <= now) {
    return {
      status: 'EXPIRED',
      currentPlanId: null,
      endsAt: latest.endsAt,
      daysLeft: 0,
    };
  }

  const paid = periods.find((p) => p.kind === 'PAID' && p.endsAt > now);
  return {
    status: paid ? 'ACTIVE' : 'TRIAL',
    currentPlanId: paid?.companyPlanId ?? null,
    endsAt: latest.endsAt,
    daysLeft: Math.ceil((latest.endsAt.getTime() - now.getTime()) / DAY_MS),
  };
}

/**
 * Adding services or projects, answering requests, receiving private
 * requests and issuing invoices need a running subscription (or trial).
 * Only companies subscribe: any other persona passes.
 */
export async function hasActiveCompanySubscription(
  db: Db,
  identityId: string,
): Promise<boolean> {
  const identity = await db.identity.findUnique({
    where: { id: identityId },
    select: { type: true },
  });
  if (identity?.type !== 'COMPANY') return true;

  const active = await db.companySubscription.findFirst({
    where: { identityId, endsAt: { gt: new Date() } },
    select: { id: true },
  });
  return active !== null;
}

/** The code tells the app to offer the plans rather than a dead-end error. */
export async function assertActiveCompanySubscription(
  db: Db,
  identityId: string,
): Promise<void> {
  if (await hasActiveCompanySubscription(db, identityId)) return;
  throw new ForbiddenException({
    statusCode: 403,
    message: 'انتهى اشتراك شركتك، اشترك في إحدى الباقات للمتابعة',
    code: 'SUBSCRIPTION_REQUIRED',
  });
}

/** Starts the free trial for a company that never had a period. */
export async function grantTrialIfNew(
  db: Db,
  identityId: string,
  now = new Date(),
): Promise<void> {
  const existing = await db.companySubscription.findFirst({
    where: { identityId },
    select: { id: true },
  });
  if (existing) return;
  await db.companySubscription.create({
    data: {
      identityId,
      kind: 'TRIAL',
      startsAt: now,
      endsAt: new Date(now.getTime() + TRIAL_DAYS * DAY_MS),
    },
  });
}
