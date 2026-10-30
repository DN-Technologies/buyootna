import {
  formatReelCount,
  mergeReels,
  reachedView,
  reelSlot,
  reelWindow,
} from '../reelRules';
import type { ViewerReel } from '../types';

const reel = (id: string) => ({ id }) as ViewerReel;

describe('the player window', () => {
  it('is the reel on screen, the next and the last', () => {
    expect(reelWindow(5, 10)).toEqual([5, 6, 4]);
  });

  it('stops at the ends of the list', () => {
    expect(reelWindow(0, 10)).toEqual([0, 1]);
    expect(reelWindow(9, 10)).toEqual([9, 8]);
    expect(reelWindow(0, 1)).toEqual([0]);
    expect(reelWindow(0, 0)).toEqual([]);
  });

  it('never gives two reels in the window the same player', () => {
    for (let active = 0; active < 12; active += 1) {
      const slots = reelWindow(active, 12).map(reelSlot);
      expect(new Set(slots).size).toBe(slots.length);
    }
  });

  it('keeps a place on its player as the window moves', () => {
    expect(reelSlot(4)).toBe(reelSlot(7));
    expect(reelSlot(4)).not.toBe(reelSlot(5));
  });
});

describe('mergeReels', () => {
  it('adds a page at the end', () => {
    expect(mergeReels([reel('a')], [reel('b')]).map((r) => r.id)).toEqual([
      'a',
      'b',
    ]);
  });

  it('drops what is already shown, so nothing moves on screen', () => {
    const merged = mergeReels([reel('a'), reel('b')], [reel('b'), reel('c')]);
    expect(merged.map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('reachedView', () => {
  it('counts after 3 seconds', () => {
    expect(reachedView(2.9, 60)).toBe(false);
    expect(reachedView(3, 60)).toBe(true);
  });

  it('counts near the end of a shorter reel', () => {
    expect(reachedView(1.7, 2)).toBe(false);
    expect(reachedView(1.8, 2)).toBe(true);
  });

  it('waits the full 3 seconds when the length is unknown', () => {
    expect(reachedView(2, 0)).toBe(false);
    expect(reachedView(3, null)).toBe(true);
  });
});

describe('formatReelCount', () => {
  it('stays short', () => {
    expect(formatReelCount(0)).toBe('0');
    expect(formatReelCount(999)).toBe('999');
    expect(formatReelCount(1000)).toBe('1 ألف');
    expect(formatReelCount(1250)).toBe('1.3 ألف');
    expect(formatReelCount(2_500_000)).toBe('2.5 مليون');
  });
});
