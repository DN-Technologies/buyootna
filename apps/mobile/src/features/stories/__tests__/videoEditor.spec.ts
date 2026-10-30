import { clampTrim } from '../components/composer/VideoTrimBar';
import { formatClock, initialTrim, needsTrim } from '../videoEditor';

jest.mock('expo', () => ({ requireOptionalNativeModule: () => null }));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-video-thumbnails', () => ({ getThumbnailAsync: jest.fn() }));

describe('the video trim', () => {
  it('starts with what a story can hold', () => {
    expect(initialTrim(120_000)).toEqual({ startMs: 0, endMs: 30_000 });
    expect(initialTrim(12_000)).toEqual({ startMs: 0, endMs: 12_000 });
    expect(initialTrim(null)).toEqual({ startMs: 0, endMs: 30_000 });
  });

  it('keeps the part 1–30 s long and inside the video', () => {
    // The end can't pass 30 s after the start, nor the video's end
    expect(clampTrim({ startMs: 10_000, endMs: 90_000 }, 120_000, 'end')).toEqual({
      startMs: 10_000,
      endMs: 40_000,
    });
    expect(clampTrim({ startMs: 0, endMs: 200_000 }, 20_000, 'end').endMs).toBe(20_000);
    // The start stays a second before the end, and within 30 s of it
    expect(clampTrim({ startMs: 39_500, endMs: 40_000 }, 120_000, 'start').startMs).toBe(39_000);
    expect(clampTrim({ startMs: 0, endMs: 40_000 }, 120_000, 'start').startMs).toBe(10_000);
    expect(clampTrim({ startMs: -500, endMs: 5_000 }, 120_000, 'start').startMs).toBe(0);
  });

  it('cuts only when a part, no sound, or too big a file is asked for', () => {
    const video = { durationMs: 20_000, sizeBytes: 8 * 1024 * 1024 };
    expect(needsTrim(video, { startMs: 0, endMs: 20_000 }, false)).toBe(false);
    // The encoder's rounding: a few ms short is still the whole video
    expect(needsTrim(video, { startMs: 0, endMs: 19_950 }, false)).toBe(false);
    expect(needsTrim(video, { startMs: 0, endMs: 15_000 }, false)).toBe(true);
    expect(needsTrim(video, { startMs: 2_000, endMs: 20_000 }, false)).toBe(true);
    expect(needsTrim(video, { startMs: 0, endMs: 20_000 }, true)).toBe(true);
    expect(
      needsTrim({ ...video, sizeBytes: 60 * 1024 * 1024 }, { startMs: 0, endMs: 20_000 }, false),
    ).toBe(true);
  });

  it('shows times as m:ss', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(20_000)).toBe('0:20');
    expect(formatClock(95_400)).toBe('1:35');
  });
});

describe('a longer limit (reels)', () => {
  it('starts with the first 60 seconds', () => {
    expect(initialTrim(120_000, 60_000)).toEqual({ startMs: 0, endMs: 60_000 });
    expect(initialTrim(null, 60_000)).toEqual({ startMs: 0, endMs: 60_000 });
    expect(initialTrim(12_000, 60_000)).toEqual({ startMs: 0, endMs: 12_000 });
  });

  it('lets the kept part grow to 60 seconds, and no further', () => {
    expect(
      clampTrim({ startMs: 0, endMs: 45_000 }, 120_000, 'end', 60_000).endMs,
    ).toBe(45_000);
    expect(
      clampTrim({ startMs: 0, endMs: 90_000 }, 120_000, 'end', 60_000).endMs,
    ).toBe(60_000);
    // The story limit is still 30 seconds
    expect(clampTrim({ startMs: 0, endMs: 45_000 }, 120_000, 'end').endMs).toBe(
      30_000,
    );
  });
});
