import { create } from 'zustand';

/**
 * «تم اخفاء الخدمة بنجاح.» / «أصبحت الخدمة ظاهرة للعملاء.» with its
 * «تراجع», set by the list's switches, the ⋮ or the edit screen's save, and
 * shown on the الخدمات list.
 */
interface ServicesToastState {
  toast: { message: string; undo: () => Promise<unknown> } | null;
  show: (message: string, undo: () => Promise<unknown>) => void;
  clear: () => void;
}

export const useServicesToast = create<ServicesToastState>((set) => ({
  toast: null,
  show: (message, undo) => set({ toast: { message, undo } }),
  clear: () => set({ toast: null }),
}));

export const serviceVisibilityMessage = (hidden: boolean) =>
  hidden ? 'تم اخفاء الخدمة بنجاح.' : 'أصبحت الخدمة ظاهرة للعملاء.';
