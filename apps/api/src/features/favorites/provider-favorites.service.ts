import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IdentityType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ProviderCardsService } from '../users/services/provider-cards.service';

export type ProviderType = Extract<IdentityType, 'COMPANY' | 'OFFICE'>;

// Providers whose account is live (not suspended or blocked)
const ACTIVE_OWNER = { user: { isDisabled: false, isBlocked: false } };

/** Companies and offices an identity saved to its favorites. */
@Injectable()
export class ProviderFavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerCards: ProviderCardsService,
  ) {}

  async toggle(identityId: string, providerId: string) {
    if (providerId === identityId) {
      throw new BadRequestException('لا يمكنك إضافة حسابك إلى المفضلة');
    }
    const provider = await this.prisma.identity.findUnique({
      where: { id: providerId },
      select: {
        type: true,
        user: { select: { isDisabled: true, isBlocked: true } },
      },
    });
    if (
      !provider ||
      (provider.type !== 'COMPANY' && provider.type !== 'OFFICE') ||
      provider.user.isDisabled ||
      provider.user.isBlocked
    ) {
      throw new NotFoundException('الشركة أو المكتب غير موجود');
    }

    const key = { identityId_providerId: { identityId, providerId } };
    const existing = await this.prisma.providerFavorite.findUnique({
      where: key,
    });
    if (existing) {
      await this.prisma.providerFavorite.delete({ where: key });
      return { favorited: false, message: 'تمت الإزالة من المفضلة' };
    }
    await this.prisma.providerFavorite.create({
      data: { identityId, providerId },
    });
    return { favorited: true, message: 'تمت الإضافة إلى المفضلة' };
  }

  async getIds(identityId: string) {
    const rows = await this.prisma.providerFavorite.findMany({
      where: { identityId },
      select: { providerId: true },
    });
    return { ids: rows.map((r) => r.providerId) };
  }

  /** Saved companies or offices, newest first, as directory cards. */
  async list(identityId: string, type: ProviderType, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {
      identityId,
      provider: { type, ...ACTIVE_OWNER },
    };

    const [rows, total] = await Promise.all([
      this.prisma.providerFavorite.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          provider: {
            include: { companyData: true, officeData: true, user: true },
          },
        },
      }),
      this.prisma.providerFavorite.count({ where }),
    ]);

    const identities = rows.map((r) => r.provider);
    const data =
      type === 'COMPANY'
        ? await this.providerCards.formatCompanyCards(identities)
        : (await this.providerCards.formatOfficeCards(identities)).map(
            (office) => ({ ...office, isFavorite: true }),
          );

    return {
      data,
      meta: { total, page, limit, hasNextPage: skip + limit < total },
    };
  }

  /** Removes every saved company (or office); returns their ids for undo. */
  async clear(identityId: string, type: ProviderType) {
    const rows = await this.prisma.providerFavorite.findMany({
      where: { identityId, provider: { type } },
      select: { providerId: true },
    });
    const ids = rows.map((r) => r.providerId);
    await this.prisma.providerFavorite.deleteMany({
      where: { identityId, providerId: { in: ids } },
    });
    return { ids };
  }

  /** Puts back what clear() removed (skips ones that no longer exist). */
  async restore(identityId: string, type: ProviderType, ids: string[]) {
    const valid = await this.prisma.identity.findMany({
      where: { id: { in: ids, not: identityId }, type },
      select: { id: true },
    });
    await this.prisma.providerFavorite.createMany({
      data: valid.map((p) => ({ identityId, providerId: p.id })),
      skipDuplicates: true,
    });
    return { ids: valid.map((p) => p.id) };
  }
}
