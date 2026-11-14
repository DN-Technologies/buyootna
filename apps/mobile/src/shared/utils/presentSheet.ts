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
// How often it's checked until then: a tap lost to the previous sheet's
// close is retried as soon as that close settles, not at the deadline (QA:
// the second tap on «+» opened the sheet only after a noticeable pause)
export const PRESENT_POLL_MS = 50;

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

  // Mounted at the tap (open, closing or left over): unmounted later means
  // the tap was lost to its close. Not mounted: a fresh sheet may take a
  // while to start, so only the deadline retries it
  const wasMounted = status !== STATUS.INITIAL;
  let waited = 0;
  const check = () => {
    waited += PRESENT_POLL_MS;
    const now = statusOf(ref);
    if (now === undefined || now === STATUS.PRESENTED) return;
    const atDeadline = waited >= PRESENT_CHECK_MS;
    if (now === STATUS.INITIAL) {
      if (wasMounted || atDeadline) ref.current?.present();
      else setTimeout(check, PRESENT_POLL_MS);
      return;
    }
    if (LEFTOVER.includes(now)) {
      presentFresh(ref);
      return;
    }
    // Animating (opening, or the previous close finishing): wait
    if (!atDeadline) setTimeout(check, PRESENT_POLL_MS);
  };
  setTimeout(check, PRESENT_POLL_MS);
}

/**
 * Closes a sheet only if it's open. dismiss() on a sheet that isn't shown
 * leaves it marked as closing, and it then ignores its next present() (QA:
 * «اضافة خدمة فرعية» did nothing after the first one was added).
 */
export function dismissSheet(ref: Ref) {
  if (!ref.current) return;
  const status = statusOf(ref);
  if (status === undefined || OPENING.includes(status)) {
    ref.current.dismiss();
  }
}
