import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, type LayoutChangeEvent } from 'react-native';

// A ScrollView, or a bottom sheet's (BottomSheetScrollView)
interface Scrollable {
  scrollTo: (options: { y: number; animated?: boolean }) => void;
}

// Space kept above the field (its label) when it is scrolled into view
const TOP_GAP = 32;
// Lets `keyboardSpace` render before scrolling into it
const AFTER_LAYOUT_MS = 50;

/**
 * Keeps a field in a ScrollView visible while it is typed in: once the
 * keyboard is up, the form scrolls the field to the top of what is left. A
 * ScrollView doesn't follow a focused input by itself, so a «وصف» box low in
 * the form stayed under the keyboard (QA), on the «+» form and in the
 * company profile's «تقديم طلب سعر» sheet.
 *
 * `onLayout` goes on the field's container, a direct child of the scroll
 * content, so its y is the offset to scroll to. `keyboardSpace` is the
 * keyboard's height while it is up: a form with little content below the
 * field (a bottom sheet, which doesn't shrink) adds it to its bottom padding
 * so there is room to scroll the field up.
 */
export function useScrollFieldAboveKeyboard(
  scrollRef: React.RefObject<Scrollable | null>,
) {
  const fieldY = useRef(0);
  const pending = useRef<{ remove: () => void } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [keyboardSpace, setKeyboardSpace] = useState(0);

  useEffect(() => {
    const shown = Keyboard.addListener('keyboardDidShow', (e) =>
      setKeyboardSpace(e?.endCoordinates?.height ?? 0),
    );
    const hidden = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardSpace(0),
    );
    return () => {
      shown.remove();
      hidden.remove();
      pending.current?.remove();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const scrollToField = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      scrollRef.current?.scrollTo({
        y: Math.max(0, fieldY.current - TOP_GAP),
        animated: true,
      });
    }, AFTER_LAYOUT_MS);
  }, [scrollRef]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    fieldY.current = e.nativeEvent.layout.y;
  }, []);

  const onFocus = useCallback(() => {
    pending.current?.remove();
    // Already up (moving from another field): scroll now; else once shown
    if (Keyboard.isVisible()) {
      scrollToField();
      return;
    }
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      sub.remove();
      pending.current = null;
      scrollToField();
    });
    pending.current = sub;
  }, [scrollToField]);

  return { onLayout, onFocus, keyboardSpace };
}
