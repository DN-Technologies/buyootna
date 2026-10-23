import { create } from 'zustand';

/**
 * The «تم اخفاء المشروع بنجاح» / «أصبح المشروع ظاهر للعملاء» message with its
 * «تراجع». Set by the edit screen (or the ⋮ hide-all) and shown on the
 * معرض الأعمال list it goes back to.
 */
interface PortfolioToastState {
  toast: { message: string; undo: () => Promise<void> } | null;
  show: (message: string, undo: () => Promise<void>) => void;
  clear: () => void;
}

export const usePortfolioToast = create<PortfolioToastState>((set) => ({
  toast: null,
  show: (message, undo) => set({ toast: { message, undo } }),
  clear: () => set({ toast: null }),
}));

export const visibilityToastMessage = (hidden: boolean, all = false) =>
  hidden
    ? all
      ? 'تم اخفاء جميع المشاريع بنجاح.'
      : 'تم اخفاء المشروع بنجاح.'
    : all
      ? 'أصبحت جميع المشاريع ظاهرة للعملاء.'
      : 'أصبح المشروع ظاهر للعملاء.';
