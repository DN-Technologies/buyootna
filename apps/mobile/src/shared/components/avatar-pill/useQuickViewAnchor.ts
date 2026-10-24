import { useRef, useState } from 'react';
import { useWindowDimensions, type View } from 'react-native';

/**
 * Where the quick view opens: under the pill, on its side of the screen.
 * Measured as the pill is laid out, and again on opening.
 */
export function useQuickViewAnchor() {
  const pillRef = useRef<View>(null);
  const { width: screenWidth } = useWindowDimensions();
  const [anchor, setAnchor] = useState({ top: 0, inset: 0 });

  const measure = () =>
    pillRef.current?.measureInWindow?.((x, y, width, height) =>
      setAnchor({
        top: y + height + 8,
        inset: Math.max(0, screenWidth - x - width),
      }),
    );

  return { pillRef, anchor, measure };
}
