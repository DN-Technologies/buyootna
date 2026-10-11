import { useEffect, useRef, useState } from 'react';
import { Keyboard, LayoutAnimation, Platform } from 'react-native';

/**
 * iOS-only: the keyboard's real, final rendered height, so the input bar can
 * sit exactly above it. Returns 0 on Android and while the keyboard is hidden.
 *
 * The parent screen's KeyboardAvoidingView ('padding') under-counts the
 * keyboard's predictive-text / QuickType bar -- an accessory view that can
 * settle its own size slightly after the main keyboard frame animates in --
 * leaving the bar's bottom edge behind it. keyboardDidShow fires only once
 * the keyboard (accessory bar included) has fully settled, so its
 * endCoordinates.height is the true final figure. keyboardWillShow is used
 * only to kick off a synced LayoutAnimation, so the resize still tracks the
 * keyboard's own slide instead of jump-cutting at the end.
 *
 * Android is untouched: AndroidManifest's windowSoftInputMode "adjustResize"
 * already resizes the window natively.
 */
export function useIosKeyboardInset(): number {
  const [iosKeyboardHeight, setIosKeyboardHeight] = useState(0);
  const animationConfiguredRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const configureAnimation = (durationMs?: number) => {
      LayoutAnimation.configureNext(
        durationMs
          ? {
              duration: durationMs,
              update: { type: LayoutAnimation.Types.keyboard },
            }
          : LayoutAnimation.Presets.easeInEaseOut,
      );
      animationConfiguredRef.current = true;
    };

    const willShowSub = Keyboard.addListener('keyboardWillShow', (e) => {
      configureAnimation(e.duration);
      setIosKeyboardHeight(e.endCoordinates.height);
    });
    const didShowSub = Keyboard.addListener('keyboardDidShow', (e) => {
      // Corrective snap in case the settled height differs from the
      // "will" estimate (the predictive bar case) -- only animate this
      // one if keyboardWillShow didn't already fire first.
      if (!animationConfiguredRef.current) configureAnimation();
      setIosKeyboardHeight(e.endCoordinates.height);
      animationConfiguredRef.current = false;
    });
    const willHideSub = Keyboard.addListener('keyboardWillHide', (e) => {
      configureAnimation(e.duration);
      setIosKeyboardHeight(0);
    });

    return () => {
      willShowSub.remove();
      didShowSub.remove();
      willHideSub.remove();
    };
  }, []);

  return iosKeyboardHeight;
}
