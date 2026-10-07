import {
  clampScale,
  clampTranslate,
  DOUBLE_TAP_SCALE,
  doubleTapTarget,
  MAX_SCALE,
  maxTranslate,
  translateForFocal,
} from '../zoom';

describe('zoom maths', () => {
  it('keeps the scale between 1x and 4x', () => {
    expect(clampScale(0.5)).toBe(1);
    expect(clampScale(2)).toBe(2);
    expect(clampScale(9)).toBe(MAX_SCALE);
  });

  it('lets a zoomed photo move only as far as its edges', () => {
    // 400pt wide at 2x is 800pt: 200pt each side can scroll into view
    expect(maxTranslate(2, 400)).toBe(200);
    expect(maxTranslate(1, 400)).toBe(0);
    expect(clampTranslate(350, 2, 400)).toBe(200);
    expect(clampTranslate(-350, 2, 400)).toBe(-200);
    expect(clampTranslate(120, 2, 400)).toBe(120);
    expect(clampTranslate(50, 1, 400)).toBe(0);
  });

  it('keeps the pinch point under the fingers', () => {
    // Zooming 1x -> 2x around the centre doesn't move the photo
    expect(translateForFocal(200, 400, 1, 0, 2)).toBe(0);
    // Around a point 100pt right of centre, the photo shifts left by 100pt
    expect(translateForFocal(300, 400, 1, 0, 2)).toBe(-100);
  });

  it('double-tap zooms in at the tapped point, and out again', () => {
    const zoomIn = doubleTapTarget(1, 300, 400, 400, 800);
    expect(zoomIn.scale).toBe(DOUBLE_TAP_SCALE);
    expect(zoomIn.x).toBeLessThan(0); // tapped right of centre
    expect(Math.abs(zoomIn.x)).toBeLessThanOrEqual(
      maxTranslate(DOUBLE_TAP_SCALE, 400),
    );

    expect(doubleTapTarget(2.5, 300, 400, 400, 800)).toEqual({
      scale: 1,
      x: 0,
      y: 0,
    });
  });
});
