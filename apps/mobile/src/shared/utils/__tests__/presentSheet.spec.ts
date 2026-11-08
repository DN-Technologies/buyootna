import { PRESENT_CHECK_MS, presentSheet } from '../presentSheet';

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
