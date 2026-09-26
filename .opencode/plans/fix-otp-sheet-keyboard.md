# Fix: Change-password OTP sheet hidden behind the keyboard (iOS)

## Context
- `ChangePasswordOtpSheet` (`apps/mobile/src/features/individual/components/more/change-password/ChangePasswordOtpSheet.tsx`) is the ONLY input sheet in the app without explicit keyboard props.
- Every other input sheet (`GlobalFilterSheet`, `AddReviewSheet`, `QuoteRequestModal`, `DeleteConfirmationSheet`) sets `keyboardBehavior="interactive"` + `keyboardBlurBehavior="restore"` + `android_keyboardInputMode="adjustResize"` — the OTP sheet relies on defaults, and its 55% snap point leaves the OTP boxes + submit button under the iOS keyboard with no avoidance.
- `autoFocus` on the hidden TextInput (line 143) opens the keyboard during the sheet's entrance animation — a known @gorhom/bottom-sheet v5 race that leaves position handling stale.
- The screen's `KeyboardAvoidingView` wraps only the form ScrollView (sheets render via the root `BottomSheetModalProvider` portal), so there is no double-avoidance; the fix belongs in the sheet.

## Changes

### 1. `ChangePasswordOtpSheet.tsx` — keyboard props on `BottomSheetModal`
```tsx
keyboardBehavior="extend"        // sheet grows to sit fully above the keyboard
keyboardBlurBehavior="restore"   // consistency with other app sheets
android_keyboardInputMode="adjustResize"
enableDynamicSizing={false}      // explicit snapPoints; avoids v5 dynamic-sizing interplay
```

### 2. Remove the mount-time keyboard race
- Delete `autoFocus` from the hidden TextInput.
- In `useChangePassword.ts`, after `bottomSheetRef.current?.present()`, defer focus until the entrance settles:
  ```ts
  bottomSheetRef.current?.present();
  setTimeout(() => otpInputRef.current?.focus(), 600);
  ```
  (sheet entrance ≈ 400–500ms; keyboard then opens against a settled sheet and `extend` keeps everything visible). Alternative if this feels hacky: keep `autoFocus` and rely on `extend` alone — but we can't iterate cheaply on OTA, so do both now.

## Test
- New `ChangePasswordOtpSheet.spec.tsx`: mock `@gorhom/bottom-sheet`'s `BottomSheetModal` with a passthrough capturing props; assert `keyboardBehavior="extend"`, `keyboardBlurBehavior="restore"`, `android_keyboardInputMode="adjustResize"`, `enableDynamicSizing={false}` (pins the regression).
- `npx --prefix apps/mobile tsc --noEmit -p apps/mobile` + `pnpm --filter buyootna test`.
- Manual QA: change password with phone → sheet presents → tap OTP field → sheet stays fully above keyboard; verify + resend still work.

## Ship
- Mobile-only → commit, push, OTA via `pnpm --filter buyootna release:ota -- --channel production --message "Fix: OTP sheet hidden behind keyboard on change password"` (clean-tree dance for `.opencode/` as before).
