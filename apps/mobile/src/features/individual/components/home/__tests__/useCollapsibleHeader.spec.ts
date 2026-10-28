import { nextOffset, snapOffset } from '../useCollapsibleHeader';

// A 120 px block over a list that scrolls to 2000
const BLOCK = 120;
const MAX_Y = 2000;
// Scrolls through `ys` in turn, from `start`, with the block at `offset`
const scroll = (offset: number, start: number, ...ys: number[]) => {
  let prev = start;
  return ys.reduce((o, y) => {
    const next = nextOffset(o, prev, y, MAX_Y, BLOCK);
    prev = y;
    return next;
  }, offset);
};

describe('nextOffset', () => {
  it('slides away with the finger, as far as the list scrolled', () => {
    expect(scroll(0, 500, 530)).toBe(30);
    expect(scroll(0, 500, 530, 580)).toBe(80);
  });

  it('goes no further than all the way', () => {
    expect(scroll(0, 500, 900)).toBe(BLOCK);
  });

  it('comes back with the finger on a scroll up, from anywhere in the list', () => {
    expect(scroll(BLOCK, 1500, 1460)).toBe(80);
    expect(scroll(BLOCK, 1500, 1460, 1300)).toBe(0);
  });

  it('never hides more than the list has scrolled, so at the top it is all there', () => {
    expect(scroll(0, 0, 50)).toBe(50);
    expect(scroll(BLOCK, 400, 60)).toBe(0);
    expect(scroll(BLOCK, 400, 200, 40)).toBe(0);
  });

  it('the bounce at either end changes nothing', () => {
    // Pulling to refresh at the top
    expect(scroll(0, 0, -80, -20, 0)).toBe(0);
    // Past the end and back
    expect(scroll(BLOCK, 2000, 2060, 2000)).toBe(BLOCK);
  });
});

describe('snapOffset', () => {
  it('settles hidden when more than half gone', () => {
    expect(snapOffset(80, 900, BLOCK)).toBe(BLOCK);
  });

  it('settles shown when less than half gone', () => {
    expect(snapOffset(40, 900, BLOCK)).toBe(0);
  });

  it('settles shown while the list is still near the top', () => {
    expect(snapOffset(80, 80, BLOCK)).toBe(0);
  });
});
