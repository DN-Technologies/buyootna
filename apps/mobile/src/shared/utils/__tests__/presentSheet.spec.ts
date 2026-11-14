import {
  dismissSheet,
  PRESENT_CHECK_MS,
  PRESENT_POLL_MS,
  presentSheet,
} from '../presentSheet';

type FakeSheet = {
  status: { current: number };
  present: jest.Mock;
  dismiss: jest.Mock;
};

const sheet = (status: number): FakeSheet => ({
  status: { current: status },
  present: jest.fn(),
  dismiss: jest.fn(),
});
const refOf = (s: FakeSheet | null) => ({ current: s }) as never;

const PRESENTED = 1;
const MINIMIZED = 3;
const ANIMATING = 5;
const INITIAL = 0;

describe('presentSheet', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(global, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // QA: the second tap on «+» opened the sheet only after a pause: it
  // landed while the first sheet's close was finishing, and was lost
  it('a tap lost to the closing sheet is retried as soon as the close ends', () => {
    const s = sheet(ANIMATING);
    presentSheet(refOf(s));
    expect(s.present).toHaveBeenCalledTimes(1);

    // The close finishes and the sheet unmounts, with no open started
    s.status.current = INITIAL;
    jest.advanceTimersByTime(2 * PRESENT_POLL_MS);
    expect(s.present).toHaveBeenCalledTimes(2);

    // Not again at the deadline
    jest.advanceTimersByTime(PRESENT_CHECK_MS);
    expect(s.present).toHaveBeenCalledTimes(2);
  });

  it('one left closed after the close is cleared and presented at once', () => {
    const s = sheet(ANIMATING);
    presentSheet(refOf(s));
    s.status.current = MINIMIZED;
    jest.advanceTimersByTime(PRESENT_POLL_MS);
    expect(s.dismiss).toHaveBeenCalledTimes(1);
    expect(s.present).toHaveBeenCalledTimes(2);
  });

  it('a sheet that opens normally is never presented twice', () => {
    const s = sheet(INITIAL);
    presentSheet(refOf(s));
    // Mounting takes a moment, then it animates open
    jest.advanceTimersByTime(3 * PRESENT_POLL_MS);
    s.status.current = ANIMATING;
    jest.advanceTimersByTime(3 * PRESENT_POLL_MS);
    s.status.current = PRESENTED;
    jest.advanceTimersByTime(PRESENT_CHECK_MS);
    expect(s.present).toHaveBeenCalledTimes(1);
  });

  it('presents a closed sheet once, and leaves it when it opens', () => {
    const s = sheet(INITIAL);
    s.present.mockImplementation(() => {
      s.status.current = ANIMATING;
    });
    presentSheet(refOf(s));
    jest.advanceTimersByTime(PRESENT_CHECK_MS);

    expect(s.present).toHaveBeenCalledTimes(1);
    expect(s.dismiss).not.toHaveBeenCalled();
  });

  // QA: the tap after a swipe-down did nothing
  it('clears a sheet left mounted after closing, then presents it fresh', () => {
    const s = sheet(MINIMIZED);
    presentSheet(refOf(s));

    expect(s.dismiss).toHaveBeenCalledTimes(1);
    expect(s.present).toHaveBeenCalledTimes(1);
    expect(s.dismiss.mock.invocationCallOrder[0]).toBeLessThan(
      s.present.mock.invocationCallOrder[0],
    );
  });

  it('retries once a tap that never started opening the sheet', () => {
    const s = sheet(INITIAL);
    presentSheet(refOf(s));
    expect(s.present).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(PRESENT_CHECK_MS);
    expect(s.present).toHaveBeenCalledTimes(2);
  });

  it('leaves an open sheet alone', () => {
    const s = sheet(PRESENTED);
    presentSheet(refOf(s));
    jest.advanceTimersByTime(PRESENT_CHECK_MS);

    expect(s.present).toHaveBeenCalledTimes(1);
    expect(s.dismiss).not.toHaveBeenCalled();
  });

  it('does nothing without a sheet', () => {
    expect(() => presentSheet(refOf(null))).not.toThrow();
  });
});

// QA: «اضافة خدمة فرعية» did nothing after adding one: the add closed the
// type picker too, which wasn't open, and the closed picker / sheet then
// ignored their next present()
describe('dismissSheet', () => {
  it('closes an open sheet', () => {
    const s = sheet(PRESENTED);
    dismissSheet(refOf(s));
    expect(s.dismiss).toHaveBeenCalled();
  });

  it('leaves a sheet that isn\'t open alone', () => {
    for (const status of [INITIAL, MINIMIZED]) {
      const s = sheet(status);
      dismissSheet(refOf(s));
      expect(s.dismiss).not.toHaveBeenCalled();
    }
  });
});
