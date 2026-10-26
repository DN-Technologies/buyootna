import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export type OtpChannel = 'EMAIL' | 'SMS';

export type OtpPurpose =
  | 'SIGNUP'
  | 'PASSWORD_RESET'
  | 'PASSWORD_CHANGE'
  | 'RECOVERY'
  | 'ACCOUNT_SUSPEND'
  | 'EMAIL_CHANGE'
  | 'PHONE_CHANGE'
  | 'CONTACT_PHONE'
  | 'OTHER';

export type OtpStatus = 'PENDING' | 'USED' | 'REPLACED' | 'EXPIRED';

interface OtpFeedEntry {
  id: string;
  channel: OtpChannel;
  purpose: OtpPurpose;
  recipient: string;
  // Matches a send to its later use (or to the newer code that replaces it)
  key: string;
  // Null once used, replaced or expired; always null for real Twilio Verify
  code: string | null;
  // Who sent it: real email/SMS, or the mock modes that only log
  provider: 'resend' | 'mock-mail' | 'twilio' | 'mock-sms';
  sentAt: Date;
  expiresAt: Date;
  status: OtpStatus;
}

/** An entry as the testing portal lists it: never the code itself. */
export interface OtpFeedItem extends Omit<OtpFeedEntry, 'code' | 'key'> {
  hasCode: boolean;
}

// Entries (without their code) stay listed this long after they were sent
const KEEP_MS = 30 * 60 * 1000;

const keyOf = (channel: OtpChannel, purpose: OtpPurpose, recipient: string) =>
  `${channel}:${purpose}:${recipient.toLowerCase()}`;

/**
 * Every OTP the platform sends, for the testing portal's الرموز screen (the
 * owner's decision, see docs/ai/security-policy.md). In memory only: a code
 * is dropped as soon as it's used, replaced by a newer one or expired, and
 * the entry itself after 30 minutes. Codes are only ever handed out by
 * `reveal`, which the caller audit-logs; `list` never includes them.
 */
@Injectable()
export class OtpFeedService {
  private entries: OtpFeedEntry[] = [];

  recordSent(input: {
    channel: OtpChannel;
    purpose: OtpPurpose;
    recipient: string;
    code: string | null;
    provider: OtpFeedEntry['provider'];
    expiresAt: Date;
    // Defaults to channel + purpose + recipient
    key?: string;
  }): void {
    const now = new Date();
    this.prune(now);
    const key =
      input.key ?? keyOf(input.channel, input.purpose, input.recipient);
    // A new code for the same thing makes the old one useless
    for (const entry of this.entries) {
      if (entry.key === key && entry.status === 'PENDING') {
        entry.status = 'REPLACED';
        entry.code = null;
      }
    }
    this.entries.push({
      id: randomUUID(),
      channel: input.channel,
      purpose: input.purpose,
      recipient: input.recipient,
      key,
      code: input.code,
      provider: input.provider,
      sentAt: now,
      expiresAt: input.expiresAt,
      status: 'PENDING',
    });
  }

  /** The code for `key` was accepted: forget it. */
  recordUsed(
    channel: OtpChannel,
    purpose: OtpPurpose,
    recipient: string,
    key = keyOf(channel, purpose, recipient),
  ): void {
    const entry = [...this.entries]
      .reverse()
      .find((e) => e.key === key && e.status === 'PENDING');
    if (entry) {
      entry.status = 'USED';
      entry.code = null;
    }
  }

  /** A phone's newest pending SMS code was accepted, whatever it was for. */
  recordPhoneUsed(recipient: string): void {
    const entry = [...this.entries]
      .reverse()
      .find(
        (e) =>
          e.channel === 'SMS' &&
          e.recipient === recipient &&
          e.status === 'PENDING',
      );
    if (entry) {
      entry.status = 'USED';
      entry.code = null;
    }
  }

  list(query: { q?: string; limit?: number } = {}): OtpFeedItem[] {
    this.prune(new Date());
    const q = query.q?.trim().toLowerCase();
    return this.entries
      .filter((e) => !q || e.recipient.toLowerCase().includes(q))
      .slice(-(query.limit ?? 100))
      .reverse()
      .map(({ code, key: _key, ...entry }) => ({ ...entry, hasCode: !!code }));
  }

  /** The code of a pending entry (null when it has none any more). */
  reveal(id: string): { code: string | null; entry: OtpFeedItem | null } {
    this.prune(new Date());
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return { code: null, entry: null };
    const { code, key: _key, ...rest } = entry;
    return { code, entry: { ...rest, hasCode: !!code } };
  }

  private prune(now: Date): void {
    for (const entry of this.entries) {
      if (entry.status === 'PENDING' && entry.expiresAt <= now) {
        entry.status = 'EXPIRED';
        entry.code = null;
      }
    }
    this.entries = this.entries.filter(
      (e) => now.getTime() - e.sentAt.getTime() < KEEP_MS,
    );
  }

  clearForTests(): void {
    this.entries = [];
  }
}
