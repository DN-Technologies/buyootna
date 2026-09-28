import { useRef, useState } from 'react';

type Restore = () => void | Promise<void>;

/**
 * One undo slot for the favorites screen: each removal registers how to put
 * things back, and "تراجع" runs it. A newer removal replaces the older one.
 */
export function useFavoritesUndo() {
  const [visible, setVisible] = useState(false);
  const restoreRef = useRef<Restore | null>(null);

  const offerUndo = (restore: Restore) => {
    restoreRef.current = restore;
    setVisible(true);
  };

  const undo = async () => {
    const restore = restoreRef.current;
    restoreRef.current = null;
    setVisible(false);
    await restore?.();
  };

  const dismiss = () => {
    restoreRef.current = null;
    setVisible(false);
  };

  return { visible, offerUndo, undo, dismiss };
}
