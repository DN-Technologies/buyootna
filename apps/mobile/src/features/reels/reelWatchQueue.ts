// Same limits as the views it follows
const WATCH_BATCH_MAX = 50;
const WATCH_FLUSH_DELAY_MS = 2000;

export interface ReelWatch {
  reelId: string;
  watchedMs: number;
  completed: boolean;
}

/**
 * How much of each reel was watched, waiting to be sent. Several reports of
 * one reel become one, keeping the most. A failed send keeps them for the next
 * try; the server keeps the highest, so resending is safe. Nothing here is
 * worth bothering anyone about: losing some only makes ranking a little less
 * informed.
 */
export class ReelWatchQueue {
  private pending = new Map<string, ReelWatch>();
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly send: (watches: ReelWatch[]) => Promise<void>) {}

  add(watch: ReelWatch): void {
    const known = this.pending.get(watch.reelId);
    this.pending.set(watch.reelId, {
      reelId: watch.reelId,
      watchedMs: Math.max(watch.watchedMs, known?.watchedMs ?? 0),
      completed: watch.completed || !!known?.completed,
    });
    if (this.pending.size >= WATCH_BATCH_MAX) {
      void this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        void this.flush();
      }, WATCH_FLUSH_DELAY_MS);
    }
  }

  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.pending.size === 0) return;
    const batch = [...this.pending.values()].slice(0, WATCH_BATCH_MAX);
    batch.forEach((w) => this.pending.delete(w.reelId));
    try {
      await this.send(batch);
    } catch {
      // Back in the queue, unless something newer is already there
      batch.forEach((w) => {
        if (!this.pending.has(w.reelId)) this.pending.set(w.reelId, w);
      });
    }
  }

  dispose(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.pending.clear();
  }
}
