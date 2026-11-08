import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * A key that changes each time the screen is left. Render the screen's
 * content with it and every visit starts fresh: scrolled to the top, no
 * field focused, forms rebuilt from the saved data.
 *
 * Screens registered straight in a tabs navigator (the individual «المزيد»
 * group has no stack of its own) stay mounted after their first visit, so
 * they reopened exactly as they were left (QA: تعديل الحساب).
 */
export function useVisitKey(): number {
  const [visit, setVisit] = useState(0);
  useFocusEffect(
    useCallback(
      () => () => {
        setVisit((value) => value + 1);
      },
      [],
    ),
  );
  return visit;
}
