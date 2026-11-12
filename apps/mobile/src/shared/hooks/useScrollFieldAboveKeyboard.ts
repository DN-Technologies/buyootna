import { useCallback, useEffect, useRef } from 'react';
import { Keyboard, type LayoutChangeEvent, type ScrollView } from 'react-native';

// Space kept above the field (its label) when it is scrolled into view
const TOP_GAP = 32;

/**
 * Keeps a field in a ScrollView visible while it is typed in: once the
 * keyboard is up (the KeyboardAvoidingView has shrunk the form), the form
 * scrolls the field to the top of what is left. A ScrollView doesn't follow
 * a focused input by itself, so a «وصف» box low in the form stayed under the
 * keyboard (QA).
 *
 * `onLayout` goes on the field's container, a direct child of the scroll
 * content, so its y is the offset to scroll to.
 */
export function useScrollFieldAboveKeyboard(
  scrollRef: React.RefObject<ScrollView | null>,
) {
  const fieldY = useRef(0);
  const pending = useRef<{ remove: () => void } | null>(null);

  const scrollToField = useCallback(() => {
    scrollRef.current?.scrollTo({
      y: Math.max(0, fieldY.current - TOP_GAP),
      animated: true,
    });
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

  useEffect(() => () => pending.current?.remove(), []);

  return { onLayout, onFocus };
}
