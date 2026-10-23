import { LayoutAnimation } from 'react-native';

/**
 * Animates the next layout change (a chip growing, a pill opening) natively
 * on an iOS-like spring, so it resizes smoothly instead of jumping; what
 * appears fades in. Native, so it lays out right under the app's forced RTL
 * (Reanimated's layout transitions slid the children while the frame grew).
 */
export function animateNextLayout(duration = 380) {
  LayoutAnimation.configureNext({
    duration,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
      duration: duration * 0.6,
    },
    update: { type: LayoutAnimation.Types.spring, springDamping: 0.86 },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
      duration: duration * 0.5,
    },
  });
}
