import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { IdentityType, Prisma, PrismaClient } from '@prisma/client';

type Db = Prisma.TransactionClient | PrismaClient;

const EASTERN_DIGITS = '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹';
const WESTERN_DIGITS = '01234567890123456789';

/**
 * Licence numbers are compared and stored in one canonical form: no
 * whitespace, Arabic-Indic / Eastern Arabic digits turned Western. Mirrors
 * the normalisation in the persona_rules migration.
 */
export function normalizeLicenseNumber(raw: string): string {
  return raw
    .replace(/\s+/g, '')
    .replace(/[٠-٩۰-۹]/g, (d) => WESTERN_DIGITS[EASTERN_DIGITS.indexOf(d)]);
}

const TYPE_LABEL: Record<IdentityType, string> = {
  INDIVIDUAL: 'فرد',
  COMPANY: 'شركة',
  OFFICE: 'مكتب',
};

/** One individual, one company and one office per account. */
export async function assertNoPersonaOfType(
  db: Db,
  userId: string,
  type: IdentityType,
): Promise<void> {
  const existing = await db.identity.findFirst({
    where: { userId, type },
    select: { id: true },
  });
  if (existing) {
    throw new ConflictException(`لديك حساب ${TYPE_LABEL[type]} بالفعل`);
  }
}

/**
 * A licence number may belong to only one company or office on the whole
 * platform. `exceptIdentityId` lets a persona keep its own number on edit.
 */
export async function assertLicenseAvailable(
  db: Db,
  licenseNumber: string,
  exceptIdentityId?: string,
): Promise<void> {
  const notSelf = exceptIdentityId
    ? { identityId: { not: exceptIdentityId } }
    : {};
  const [company, office] = await Promise.all([
    db.companyIdentityData.findFirst({
      where: { licenseNumber, ...notSelf },
      select: { id: true },
    }),
    db.officeIdentityData.findFirst({
      where: { licenseNumber, ...notSelf },
      select: { id: true },
    }),
  ]);
  if (company || office) {
    throw new ConflictException('رقم الترخيص مسجل مسبقاً');
  }
}

/**
 * Serialises concurrent creations that would collide (a double tap on
 * "create company", or two accounts racing for one licence) until the
 * surrounding transaction ends. Each key gets its own lock.
 */
export async function lockKeys(
  tx: Prisma.TransactionClient,
  ...keys: string[]
): Promise<void> {
  for (const key of [...keys].sort()) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
  }
}

/** Maps a unique-constraint race the checks above didn't catch to a 409. */
export function rethrowAsConflict(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    const target = JSON.stringify(error.meta?.target ?? '');
    throw new ConflictException(
      target.includes('licenseNumber')
        ? 'رقم الترخيص مسجل مسبقاً'
        : 'لديك هذا النوع من الحسابات بالفعل',
    );
  }
  throw error;
}

/**
 * A company/office can publish ads and receive leads only once approved.
 * Individuals are never gated.
 */
export async function assertApprovedProvider(
  db: Db,
  identityId: string,
): Promise<void> {
  const identity = await db.identity.findUnique({
    where: { id: identityId },
    select: {
      type: true,
      companyData: { select: { status: true } },
      officeData: { select: { status: true } },
    },
  });
  if (!identity) throw new NotFoundException('الهوية غير موجودة');
  const status =
    identity.type === 'COMPANY'
      ? identity.companyData?.status
      : identity.type === 'OFFICE'
        ? identity.officeData?.status
        : 'APPROVED';
  if (status !== 'APPROVED') {
    throw new ForbiddenException(
      status === 'REJECTED'
        ? 'تم رفض طلب اعتماد حسابك، يرجى مراجعة بياناتك والتواصل مع الدعم'
        : 'حسابك قيد المراجعة، ستتمكن من نشر الإعلانات واستقبال الطلبات بعد اعتماده',
    );
  }
}

/** Same rule as a yes/no, for listings that should just come back empty. */
export async function isApprovedProvider(
  db: Db,
  identityId: string,
): Promise<boolean> {
  try {
    await assertApprovedProvider(db, identityId);
    return true;
  } catch {
    return false;
  }
}
