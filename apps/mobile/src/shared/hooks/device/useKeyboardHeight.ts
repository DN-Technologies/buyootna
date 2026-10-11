import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * The on-screen keyboard's height (0 when hidden), from React Native's own
 * keyboard events. For bottom sheets with text inputs: gorhom's
 * keyboardBehavior proved unreliable under the new architecture, so sheets
 * make room for the keyboard themselves (see ChatInputBar for the same idea).
 * iOS uses the "will" events to move with the keyboard; Android only emits
 * the "did" events.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) =>
      setHeight(e.endCoordinates.height),
    );
    // keyboardDidShow carries the settled height, incl. the QuickType bar
    const settledSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardDidShow', (e) =>
            setHeight(e.endCoordinates.height),
          )
        : null;
    const hideSub = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      showSub.remove();
      settledSub?.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}
