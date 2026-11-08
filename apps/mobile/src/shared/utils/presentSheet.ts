import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { RefObject } from 'react';

// @gorhom/bottom-sheet's modal status (bottomSheetModal/constants.ts)
const STATUS = {
  INITIAL: 0,
  PRESENTED: 1,
  CLOSED: 2,
  MINIMIZED: 3,
  ANIMATING: 5,
  DISMISSING: 6,
  DISMISSED: 7,
} as const;

// A sheet closed by swipe or backdrop that was never unmounted: still
// mounted but hidden, so present() tries to reopen it and the tap is lost
const LEFTOVER: number[] = [
  STATUS.CLOSED,
  STATUS.MINIMIZED,
  STATUS.DISMISSING,
  STATUS.DISMISSED,
];
const OPENING: number[] = [STATUS.PRESENTED, STATUS.ANIMATING];

// How long a tap may take to start opening the sheet before it's retried
export const PRESENT_CHECK_MS = 500;

type Ref = RefObject<BottomSheetModal | null>;

const statusOf = (ref: Ref) =>
  (ref.current as unknown as { status?: { current?: number } } | null)?.status
    ?.current;

const afterTwoFrames = (fn: () => void) =>
  requestAnimationFrame(() => requestAnimationFrame(fn));

/** Clears a leftover sheet, then presents it fresh. */
function presentFresh(ref: Ref) {
  ref.current?.dismiss();
  afterTwoFrames(() => ref.current?.present());
}

/**
 * Opens a bottom sheet on every tap (QA: the home filter and «+» opened on
 * every other tap).
 *
 * The sheet unmounts itself from its close animation's callback. When that
 * callback was missed, the sheet stayed mounted but hidden: the next
 * present() tried to reopen it and did nothing, and only the tap after it
 * mounted a fresh sheet. A leftover sheet is now cleared first, and a tap
 * that still hasn't started opening the sheet is retried once.
 */
export function presentSheet(ref: Ref) {
  if (!ref.current) return;
  const status = statusOf(ref);
  if (status !== undefined && LEFTOVER.includes(status)) {
    presentFresh(ref);
  } else {
    ref.current.present();
  }
  if (status === undefined) return;

  setTimeout(() => {
    const now = statusOf(ref);
    if (now === undefined || OPENING.includes(now)) return;
    // Never mounted: just ask again; anything else: clear it first
    if (now === STATUS.INITIAL) ref.current?.present();
    else presentFresh(ref);
  }, PRESENT_CHECK_MS);
}
