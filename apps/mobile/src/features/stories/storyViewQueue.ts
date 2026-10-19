/**
 * Views waiting to be sent: deduplicated, sent in batches of at most 50
 * after a short pause (or at once on flush). A failed send keeps the ids
 * for the next try; the server ignores repeats, so resending is safe.
 */
export const VIEW_BATCH_MAX = 50;
export const VIEW_FLUSH_DELAY_MS = 2000;

export class StoryViewQueue {
  private pending = new Set<string>();
  private sent = new Set<string>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private sending: Promise<void> | null = null;

  constructor(private readonly send: (storyIds: string[]) => Promise<void>) {}

  /** Queue a view; ignored if already queued or sent. */
  add(storyId: string): void {
    if (this.pending.has(storyId) || this.sent.has(storyId)) return;
    this.pending.add(storyId);
    if (this.pending.size >= VIEW_BATCH_MAX) {
      void this.flush();
      return;
    }
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        void this.flush();
      }, VIEW_FLUSH_DELAY_MS);
    }
  }

  /** Sends everything queued now. */
  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.sending) await this.sending;
    while (this.pending.size > 0) {
      const batch = [...this.pending].slice(0, VIEW_BATCH_MAX);
      this.sending = this.send(batch)
        .then(() => {
          for (const id of batch) {
            this.pending.delete(id);
            this.sent.add(id);
          }
        })
        .finally(() => {
          this.sending = null;
        });
      try {
        await this.sending;
      } catch {
        // Kept for the next flush
        return;
      }
    }
  }

  /** Stops the timer without sending (e.g. on a profile switch). */
  dispose(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.pending.clear();
  }
}
