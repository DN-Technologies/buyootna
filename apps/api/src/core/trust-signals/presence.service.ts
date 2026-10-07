import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// A REST request refreshes lastSeenAt at most this often per persona
export const PRESENCE_TOUCH_INTERVAL_MS = 60_000;
// Without a live socket, a persona seen this recently still counts as online
export const PRESENCE_ONLINE_WINDOW_MS = 2 * 60_000;

export interface IdentityPresence {
  isOnline: boolean;
  lastSeenAt: string | null;
}

/**
 * Who is using the app right now, per persona. The chat socket is opened
 * app-wide while signed in and dropped soon after the app is backgrounded,
 * so a live socket means "app open". Socket counts live in memory (the API
 * runs as a single container); lastSeenAt is persisted so "نشط منذ" survives
 * restarts. Writes are best-effort and never fail the caller.
 */
@Injectable()
export class PresenceService {
  private readonly liveSockets = new Map<string, number>();
  private readonly lastWriteAt = new Map<string, number>();

  constructor(private readonly prisma: PrismaService) {}

  socketConnected(identityId: string) {
    this.liveSockets.set(
      identityId,
      (this.liveSockets.get(identityId) ?? 0) + 1,
    );
    this.stamp(identityId, true);
  }

  socketDisconnected(identityId: string) {
    const remaining = (this.liveSockets.get(identityId) ?? 1) - 1;
    if (remaining > 0) this.liveSockets.set(identityId, remaining);
    else this.liveSockets.delete(identityId);
    this.stamp(identityId, true);
  }

  /** An authenticated request from this persona (throttled write). */
  touch(identityId: string) {
    this.stamp(identityId, false);
  }

  presenceOf(identityId: string, lastSeenAt: Date | null): IdentityPresence {
    const connected = (this.liveSockets.get(identityId) ?? 0) > 0;
    const seenRecently =
      !!lastSeenAt &&
      Date.now() - lastSeenAt.getTime() < PRESENCE_ONLINE_WINDOW_MS;
    return {
      isOnline: connected || seenRecently,
      lastSeenAt: lastSeenAt ? lastSeenAt.toISOString() : null,
    };
  }

  private stamp(identityId: string, force: boolean) {
    const now = Date.now();
    const last = this.lastWriteAt.get(identityId) ?? 0;
    if (!force && now - last < PRESENCE_TOUCH_INTERVAL_MS) return;
    this.lastWriteAt.set(identityId, now);
    void this.prisma.identity
      .update({
        where: { id: identityId },
        data: { lastSeenAt: new Date(now) },
      })
      .catch(() => undefined);
  }
}
