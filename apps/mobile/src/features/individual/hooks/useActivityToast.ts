import { useCallback, useRef, useState } from 'react';
import { Animated } from 'react-native';

/**
 * Manages the activity screen's transient success toast: its visibility,
 * message/subtitle text, and the fade/slide-in-then-out animation. Kept
 * separate from ActivityScreen so the animation timing isn't tangled up
 * with the screen's data-fetching and navigation concerns.
 */
export function useActivityToast() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    'تم تحديث بيانات الإعلان بنجاح.',
  );
  const [toastSubtitle, setToastSubtitle] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const triggerToast = useCallback(
    (message: string, subtitle?: string | null) => {
      setToastMessage(message);
      setToastSubtitle(subtitle || null);
      setShowToast(true);

      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(40);

      // Animate In
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();

      // Hide after 3.5 seconds
      const timer = setTimeout(() => {
        // Animate Out
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 20,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowToast(false);
        });
      }, 3500);

      return timer;
    },
    [fadeAnim, slideAnim],
  );

  return {
    showToast,
    toastMessage,
    toastSubtitle,
    fadeAnim,
    slideAnim,
    triggerToast,
  };
}
