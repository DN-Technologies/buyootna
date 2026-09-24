import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/core/prisma/prisma.service';

export interface OtherParticipantLike {
  userId: string | null;
  identity?: {
    companyData?: { name: string; logoUrl?: string | null } | null;
    officeData?: { name: string; logoUrl?: string | null } | null;
    individualData?: {
      name?: string | null;
      avatarUrl?: string | null;
    } | null;
    user?: { name: string | null; avatarUrl: string | null } | null;
  } | null;
}

/**
 * Resolves how a conversation's other participant should be displayed
 * (name + avatar). Shared by the conversation list and the message thread.
 */
@Injectable()
export class ChatParticipantDisplayService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Some participants were created via a legacy userId with no identityId
   * link (e.g. a caller that resolved the recipient as a plain User rather
   * than their active Identity), so ident?.* alone can come back empty even
   * though the account has a perfectly real name -- fall back to that
   * user's active Identity, then their bare User row, before giving up on
   * the generic placeholder.
   */
  async resolve(otherPart?: OtherParticipantLike): Promise<{
    name: string;
    avatarUrl: string;
  }> {
    const ident = otherPart?.identity;

    let name =
      ident?.companyData?.name ||
      ident?.officeData?.name ||
      ident?.individualData?.name ||
      ident?.user?.name ||
      undefined;
    let avatarUrl =
      ident?.companyData?.logoUrl ||
      ident?.officeData?.logoUrl ||
      ident?.individualData?.avatarUrl ||
      ident?.user?.avatarUrl ||
      undefined;

    if (!name && otherPart?.userId) {
      const activeIdentity = await this.prisma.identity.findFirst({
        where: { userId: otherPart.userId, isActive: true },
        include: { individualData: true, companyData: true, officeData: true },
      });
      name =
        activeIdentity?.companyData?.name ||
        activeIdentity?.officeData?.name ||
        activeIdentity?.individualData?.name ||
        undefined;
      avatarUrl =
        avatarUrl ||
        activeIdentity?.companyData?.logoUrl ||
        activeIdentity?.officeData?.logoUrl ||
        activeIdentity?.individualData?.avatarUrl ||
        undefined;

      if (!name) {
        const user = await this.prisma.user.findUnique({
          where: { id: otherPart.userId },
          select: { name: true, avatarUrl: true },
        });
        name = user?.name || undefined;
        avatarUrl = avatarUrl || user?.avatarUrl || undefined;
      }
    }

    return {
      name: name || 'مستخدم بيوتنا',
      avatarUrl: avatarUrl || '@/assets/images/no-image.png',
    };
  }
}
