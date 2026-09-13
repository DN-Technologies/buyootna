import { Injectable } from '@nestjs/common';
import { Identity, IdentityType } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';

export type IdentityWithData = Identity & {
  individualData?: {
    name: string | null;
    whatsapp: string | null;
    avatarUrl: string | null;
  } | null;
  companyData?: { name: string; logoUrl: string | null } | null;
  officeData?: { name: string; logoUrl: string | null } | null;
};

const IDENTITY_INCLUDE = {
  individualData: {
    select: { name: true, whatsapp: true, avatarUrl: true },
  },
  companyData: {
    select: { name: true, logoUrl: true },
  },
  officeData: {
    select: { name: true, logoUrl: true },
  },
} as const;

/**
 * Owns identity lookups/mutations that AuthService's login and identity-
 * switch flows share -- previously five near-identical copies of the same
 * `include` block scattered across auth.service.ts.
 */
@Injectable()
export class AuthIdentitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findById(
    identityId: string,
    userId: string,
  ): Promise<IdentityWithData | null> {
    return this.prisma.identity.findFirst({
      where: { id: identityId, userId },
      include: IDENTITY_INCLUDE,
    });
  }

  findActive(userId: string): Promise<IdentityWithData | null> {
    return this.prisma.identity.findFirst({
      where: { userId, isActive: true },
      include: IDENTITY_INCLUDE,
    });
  }

  findEarliest(userId: string): Promise<IdentityWithData | null> {
    return this.prisma.identity.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: IDENTITY_INCLUDE,
    });
  }

  async activate(identityId: string): Promise<void> {
    await this.prisma.identity.update({
      where: { id: identityId },
      data: { isActive: true },
    });
  }

  listAll(userId: string): Promise<IdentityWithData[]> {
    return this.prisma.identity.findMany({
      where: { userId },
      include: IDENTITY_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Recovers a User row that somehow has zero Identity rows by provisioning
   * a default individual identity. Registration always creates the User row
   * and its first Identity together in one transaction, so this should
   * never happen -- but if it somehow does (legacy data, a manual DB edit,
   * a bug we haven't found), don't lock the account out forever with no way
   * back in. Always INDIVIDUAL regardless of the user's legacy `role`
   * field: it's the only identity type with no required fields
   * (company/office data requires a licenseNumber and name we don't have
   * for an account in this state), so it's the only type safe to
   * auto-create.
   */
  createDefaultForOrphanedUser(userId: string): Promise<IdentityWithData> {
    return this.prisma.identity.create({
      data: {
        userId,
        type: IdentityType.INDIVIDUAL,
        isActive: true,
        individualData: { create: {} },
      },
      include: IDENTITY_INCLUDE,
    });
  }
}
