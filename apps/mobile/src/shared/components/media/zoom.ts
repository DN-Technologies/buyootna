// Pure zoom maths for the image viewer. Marked as worklets so gesture
// callbacks can run them on the UI thread; plain functions under Jest.

export const MIN_SCALE = 1;
export const MAX_SCALE = 4;
// Double-tap zooms to this, at the tapped point
export const DOUBLE_TAP_SCALE = 2.5;
// At 1x, dragging the photo down past this closes the viewer
export const DISMISS_DISTANCE = 120;

/** Scale kept within 1x-4x. */
export function clampScale(scale: number): number {
  'worklet';
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/** How far a photo of `size` may move at `scale` before showing its edge. */
export function maxTranslate(scale: number, size: number): number {
  'worklet';
  return Math.max(0, (size * scale - size) / 2);
}

/** A translation kept inside the zoomed photo's edges. */
export function clampTranslate(
  value: number,
  scale: number,
  size: number,
): number {
  'worklet';
  const max = maxTranslate(scale, size);
  return Math.min(max, Math.max(-max, value));
}

/**
 * The translation that keeps `point` (in view coordinates) under the finger
 * while zooming from `fromScale`/`fromTranslate` to `toScale`.
 */
export function translateForFocal(
  point: number,
  size: number,
  fromScale: number,
  fromTranslate: number,
  toScale: number,
): number {
  'worklet';
  const fromCenter = point - size / 2;
  return fromCenter - ((fromCenter - fromTranslate) * toScale) / fromScale;
}

/** Double-tap: zoom in at the point, or back out if already zoomed. */
export function doubleTapTarget(
  currentScale: number,
  tapX: number,
  tapY: number,
  width: number,
  height: number,
): { scale: number; x: number; y: number } {
  'worklet';
  if (currentScale > MIN_SCALE + 0.01) return { scale: MIN_SCALE, x: 0, y: 0 };
  const scale = DOUBLE_TAP_SCALE;
  return {
    scale,
    x: clampTranslate(translateForFocal(tapX, width, 1, 0, scale), scale, width),
    y: clampTranslate(translateForFocal(tapY, height, 1, 0, scale), scale, height),
  };
}
