import { create } from 'zustand';

/**
 * Asks for «تسجيل الدخول أو إنشاء حساب» from anywhere, including hooks and
 * sheets with no sign-in sheet of their own: the root layout's
 * GlobalSignInPrompt answers each request. A guest's heart on an ad sheet
 * or card did nothing at all (QA).
 */
interface SignInPromptState {
  // Bumped on every request, so the same request twice opens it twice
  requestId: number;
  request: () => void;
}

export const useSignInPrompt = create<SignInPromptState>((set) => ({
  requestId: 0,
  request: () => set((s) => ({ requestId: s.requestId + 1 })),
}));

export const requestSignIn = () => useSignInPrompt.getState().request();
