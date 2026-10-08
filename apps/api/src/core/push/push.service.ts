import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from './badge.service';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
// Expo accepts at most 100 messages per request
const BATCH_SIZE = 100;

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  // A bundled sound file name (iOS plays 'default' if the build lacks it)
  sound?: string;
  // Android notification channel (posted to the fallback one if missing)
  channelId?: string;
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
}

/**
 * Sends push notifications through Expo's push service to the Expo push
 * tokens the app registers per session (Session.pushToken). Never throws:
 * push is best-effort on top of the in-app notification.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly badges: BadgeService,
  ) {}

  async sendToTokens(tokens: string[], message: PushMessage): Promise<void> {
    const unique = [...new Set(tokens.filter(Boolean))];
    const badges = await this.badgesFor(unique);
    for (let i = 0; i < unique.length; i += BATCH_SIZE) {
      await this.sendBatch(unique.slice(i, i + BATCH_SIZE), message, badges);
    }
  }

  /**
   * The app-icon number for each device: what its account / active persona
   * hasn't read (counted after the notification being pushed was saved).
   * Best effort: a device without a count just keeps its current number.
   */
  private async badgesFor(tokens: string[]): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    try {
      const sessions = await this.prisma.session.findMany({
        where: { pushToken: { in: tokens }, isActive: true },
        select: { pushToken: true, userId: true, activeIdentityId: true },
      });
      const counts = new Map<string, number>();
      for (const s of sessions) {
        if (!s.pushToken) continue;
        const key = `${s.userId}:${s.activeIdentityId ?? ''}`;
        if (!counts.has(key)) {
          const { count } = await this.badges.countFor(
            s.userId,
            s.activeIdentityId,
          );
          counts.set(key, count);
        }
        result.set(s.pushToken, counts.get(key)!);
      }
    } catch (error) {
      this.logger.warn(`Badge count failed: ${error}`);
    }
    return result;
  }

  private async sendBatch(
    tokens: string[],
    message: PushMessage,
    badges: Map<string, number> = new Map(),
  ) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(process.env.EXPO_ACCESS_TOKEN
            ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(
          tokens.map((to) => ({
            to,
            title: message.title,
            body: message.body,
            data: message.data ?? {},
            sound: message.sound ?? 'default',
            ...(badges.has(to) ? { badge: badges.get(to) } : {}),
            ...(message.channelId ? { channelId: message.channelId } : {}),
          })),
        ),
      });

      if (!response.ok) {
        this.logger.warn(`Expo push request failed: HTTP ${response.status}`);
        return;
      }

      const { data: tickets = [] } = (await response.json()) as {
        data?: ExpoPushTicket[];
      };

      // Tickets come back in message order. A token Expo says is no longer
      // registered (app uninstalled / permission revoked) is cleared so it
      // isn't retried on every alert.
      const deadTokens = tokens.filter(
        (_, i) => tickets[i]?.details?.error === 'DeviceNotRegistered',
      );
      if (deadTokens.length > 0) {
        await this.prisma.session.updateMany({
          where: { pushToken: { in: deadTokens } },
          data: { pushToken: null },
        });
      }

      const failures = tickets.filter((t) => t.status === 'error');
      if (failures.length > 0) {
        this.logger.warn(
          `Expo push: ${failures.length}/${tokens.length} failed (${failures
            .map((f) => f.details?.error ?? f.message)
            .join(', ')})`,
        );
      }
    } catch (error) {
      this.logger.warn(`Expo push send failed: ${error}`);
    }
  }
}
