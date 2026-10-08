import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  LISTING_TYPE_LABELS,
  PROPERTY_CATEGORY_LABELS,
} from '../properties/services/property-formatting.util';
import { alertListingType, propertyMatchesAlert } from './alert-matching.util';

@Injectable()
export class AlertMatchingService {
  private readonly logger = new Logger(AlertMatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Called after a listing becomes ACTIVE. Records a match for every active
   * alert it satisfies and notifies each alert owner once. Never throws: a
   * matching failure must not affect publishing.
   */
  async notifyMatchesForProperty(propertyId: string): Promise<void> {
    try {
      await this.matchAndNotify(propertyId);
    } catch (error) {
      this.logger.warn(
        `Alert matching failed for property ${propertyId}: ${error}`,
      );
    }
  }

  private async matchAndNotify(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { area: { select: { name: true } } },
    });
    if (!property || property.status !== 'ACTIVE' || !property.governorateId) {
      return;
    }

    const alertType = property.type === 'AUCTION' ? 'AUCTIONS' : 'PROPERTIES';
    const candidates = await this.prisma.alert.findMany({
      where: {
        isActive: true,
        type: alertType,
        governorateId: property.governorateId,
        // Never alert someone about their own listing
        ...(property.identityId
          ? { identityId: { not: property.identityId } }
          : {}),
      },
      include: { identity: { select: { userId: true } } },
    });

    const matched = candidates.filter(
      (alert) =>
        alertListingType(alert) === property.type &&
        propertyMatchesAlert(alert, property),
    );
    if (matched.length === 0) return;

    // Only alerts that hadn't already matched this listing (republish)
    const existing = await this.prisma.alertMatch.findMany({
      where: { propertyId, alertId: { in: matched.map((a) => a.id) } },
      select: { alertId: true },
    });
    const alreadyMatched = new Set(existing.map((m) => m.alertId));
    const newMatches = matched.filter((a) => !alreadyMatched.has(a.id));
    if (newMatches.length === 0) return;

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.alertMatch.createMany({
        data: newMatches.map((a) => ({ alertId: a.id, propertyId })),
        skipDuplicates: true,
      }),
      this.prisma.alert.updateMany({
        where: { id: { in: newMatches.map((a) => a.id) } },
        data: { lastMatchedAt: now },
      }),
    ]);

    // One notification per user, even if several of their alerts matched
    const recipients = new Map<string, string>();
    for (const alert of newMatches) {
      if (alert.identity?.userId && !recipients.has(alert.identity.userId)) {
        recipients.set(alert.identity.userId, alert.identityId);
      }
    }
    const mutedUsers = await this.prisma.notificationPreferences.findMany({
      where: { userId: { in: [...recipients.keys()] }, appEnabled: false },
      select: { userId: true },
    });
    for (const { userId } of mutedUsers) recipients.delete(userId);

    const category = PROPERTY_CATEGORY_LABELS[property.category] || 'عقار';
    const typeLabel = LISTING_TYPE_LABELS[property.type] ?? '';
    const place = property.area?.name ?? property.location;
    const body = `${category} ${typeLabel}${place ? ` في ${place}` : ''}`;

    for (const [userId, identityId] of recipients) {
      await this.notificationsService.create({
        userId,
        identityId,
        type: 'ALERT_MATCH',
        title: 'تطابق جديد لتنبيهك',
        body,
        data: { propertyId },
      });
    }
  }
}
