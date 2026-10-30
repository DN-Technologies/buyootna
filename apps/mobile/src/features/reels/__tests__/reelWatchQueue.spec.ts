import { ReelWatchQueue } from '../reelWatchQueue';

describe('ReelWatchQueue', () => {
  const send = jest.fn();
  beforeEach(() => {
    jest.useFakeTimers();
    send.mockReset();
    send.mockResolvedValue(undefined);
  });
  afterEach(() => jest.useRealTimers());

  it('sends after a pause, one report per reel, keeping the most', async () => {
    const queue = new ReelWatchQueue(send);
    queue.add({ reelId: 'a', watchedMs: 5000, completed: false });
    queue.add({ reelId: 'a', watchedMs: 2000, completed: true });
    queue.add({ reelId: 'b', watchedMs: 1000, completed: false });
    expect(send).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(2000);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith([
      { reelId: 'a', watchedMs: 5000, completed: true },
      { reelId: 'b', watchedMs: 1000, completed: false },
    ]);
  });

  it('sends at once when a batch is full', () => {
    const queue = new ReelWatchQueue(send);
    for (let i = 0; i < 50; i += 1) {
      queue.add({ reelId: `r${i}`, watchedMs: 1, completed: false });
    }
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toHaveLength(50);
  });

  it('keeps a failed batch for the next try', async () => {
    send.mockRejectedValueOnce(new Error('offline'));
    const queue = new ReelWatchQueue(send);
    queue.add({ reelId: 'a', watchedMs: 5000, completed: false });
    await queue.flush();
    await queue.flush();
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[1][0]).toEqual([
      { reelId: 'a', watchedMs: 5000, completed: false },
    ]);
  });

  it('sends nothing when empty, or after being dropped', async () => {
    const queue = new ReelWatchQueue(send);
    await queue.flush();
    queue.add({ reelId: 'a', watchedMs: 1, completed: false });
    queue.dispose();
    await jest.advanceTimersByTimeAsync(5000);
    expect(send).not.toHaveBeenCalled();
  });
});
