import { StoryViewQueue, VIEW_FLUSH_DELAY_MS } from '../storyViewQueue';

describe('StoryViewQueue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('batches views after a short pause, without duplicates', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const queue = new StoryViewQueue(send);
    queue.add('a');
    queue.add('b');
    queue.add('a');
    expect(send).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(VIEW_FLUSH_DELAY_MS);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(['a', 'b']);
  });

  it('a story already sent is not sent again', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const queue = new StoryViewQueue(send);
    queue.add('a');
    await queue.flush();
    queue.add('a');
    await queue.flush();
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('sends at once when 50 are queued, in batches of 50', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const queue = new StoryViewQueue(send);
    for (let i = 0; i < 50; i++) queue.add(`s${i}`);
    await jest.advanceTimersByTimeAsync(0);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toHaveLength(50);
  });

  it('a failed send keeps the views for the next flush', async () => {
    const send = jest
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined);
    const queue = new StoryViewQueue(send);
    queue.add('a');
    await queue.flush();
    await queue.flush();
    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenLastCalledWith(['a']);
  });

  it('dispose drops what is queued (a profile switch)', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const queue = new StoryViewQueue(send);
    queue.add('a');
    queue.dispose();
    await jest.advanceTimersByTimeAsync(VIEW_FLUSH_DELAY_MS);
    await queue.flush();
    expect(send).not.toHaveBeenCalled();
  });
});
