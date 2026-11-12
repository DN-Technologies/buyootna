import { act, renderHook } from '@testing-library/react-native';
import { useEffect, useState } from 'react';

import { useActivityToast } from '@/features/individual/hooks/useActivityToast';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const wait = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

// نشاطي's way: a URL param shows the toast, then is cleared, which re-runs
// the effect. Its cleanup used to cancel the hide timer, so «تم حفظ الاعلان
// كمسودة بنجاح» stayed on screen for good (QA)
function useParamToast() {
  const toast = useActivityToast();
  const [draftSaved, setDraftSaved] = useState<string | undefined>('true');
  const { triggerToast } = toast;
  useEffect(() => {
    if (draftSaved === 'true') {
      triggerToast('تم حفظ الاعلان كمسودة بنجاح.');
      setDraftSaved(undefined);
    }
  }, [draftSaved, triggerToast]);
  return toast;
}

describe('useActivityToast', () => {
  it('a toast shown from a cleared URL param still hides by itself', async () => {
    const { result } = await renderHook(() => useParamToast());
    expect(result.current.showToast).toBe(true);
    expect(result.current.toastMessage).toBe('تم حفظ الاعلان كمسودة بنجاح.');

    await wait(3000);
    expect(result.current.showToast).toBe(true);
    await wait(1500);
    expect(result.current.showToast).toBe(false);
  });

  it('a new toast restarts the timer instead of being cut short', async () => {
    const { result } = await renderHook(() => useActivityToast());
    await act(async () => {
      result.current.triggerToast('أول');
    });
    await wait(3000);
    await act(async () => {
      result.current.triggerToast('ثاني');
    });
    await wait(1000);
    expect(result.current.showToast).toBe(true);
    expect(result.current.toastMessage).toBe('ثاني');
    await wait(3500);
    expect(result.current.showToast).toBe(false);
  });

  it('leaving the screen clears the pending timer', async () => {
    const { result, unmount } = await renderHook(() => useActivityToast());
    let timer: ReturnType<typeof setTimeout> | undefined;
    await act(async () => {
      timer = result.current.triggerToast('أول');
    });
    const cleared = jest.spyOn(global, 'clearTimeout');
    await act(async () => unmount());
    expect(cleared).toHaveBeenCalledWith(timer);
  });
});
