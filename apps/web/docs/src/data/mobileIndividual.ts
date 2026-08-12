import { DocSection } from "./types";

export const mobileIndividual: DocSection = {
  slug: "mobile-individual",
  title: "Mobile — Individual",
  summary:
    "The (individual) route group and (auth) individual-auth/forgot-password screens — the only account type currently reachable in the mobile app (Company/Office are gated, see Mobile — Shared). Covers login, signup, OTP, password recovery, the identity switcher, and favorites.",
  stories: [
    {
      id: "mobile-favorites",
      title: "Favorites persist correctly across the property lifecycle",
      priority: "P0",
      endUserStory:
        "As an individual user, I want to save properties I'm interested in and find them again easily later, so that I don't lose track of listings while I'm comparing options across multiple browsing sessions.",
      story:
        "As a QA engineer, I want to verify the Favorites system (POST /favorites/:propertyId toggle, GET /favorites, GET /favorites/ids, GET /favorites/check/:propertyId, useFavoritesStore) behaves correctly end to end, so that a saved property reliably shows as saved everywhere in the app and survives logout/login.",
      acceptanceCriteria: [
        "Toggling favorite on Property Detail updates the heart icon instantly (optimistic) and reflects the server state after refresh.",
        "The Favorites tab (more)/favorites shows exactly the set of properties the user has favorited, in a stable order.",
        "Un-favoriting from the Favorites list removes it from that list without requiring a manual refresh.",
        "Favorite state is per-user: switching identities (see mobile-identity-switch in Mobile — Shared) does not leak another identity's favorites.",
      ],
      testScenarios: [
        "Favorite a property from Search results, then verify it appears favorited on Property Detail and in the Favorites tab.",
        "Favorite 15+ properties and confirm the Favorites list paginates/scrolls without duplication or drops.",
        "Favorite a property, then have it deleted/archived by its owner — confirm the Favorites tab handles the now-missing property gracefully (no crash, sensible empty/removed state).",
        "Toggle favorite rapidly (double-tap) and confirm no duplicate POSTs desync the heart icon from server state.",
      ],
    },
    {
      id: "mobile-individual-login",
      title: "Individual login: remember-me checkbox currently has no effect (known gap)",
      priority: "P1",
      endUserStory:
        "As an individual user, I want to log in with either my email or phone, optionally stay signed in with 'remember me,' and quickly get back into an account I've already used on this device, so that returning to the app is fast and I never lose access to identities I've already set up.",
      story:
        "As a QA engineer, I want to verify the Individual Login screen (identifier + password, 'تذكري' remember-me checkbox, 'هل نسيت كلمة المرور؟' link, 'المتابعة بحساب محفوظ' saved-account entry point) behaves correctly end to end, while flagging that the rememberMe value captured in IndividualLoginForm is passed to onLogin but never actually used — session persistence/token lifetime doesn't currently change based on it.",
      acceptanceCriteria: [
        "loginSchema validation (identifier: email-or-phone string, password: 6-char min) blocks submission with inline errors before any network call.",
        "Toggling 'تذكري' visibly checks/unchecks the box, but confirm — and document — that it has no observable effect on session length or biometric re-prompt behavior today.",
        "'هل نسيت كلمة المرور؟' navigates to the forgot-password flow (see mobile-forgot-password-inline-error).",
        "'المتابعة بحساب محفوظ' opens ProfileBottomSheet (the saved-identities list), not a dead button.",
      ],
      testScenarios: [
        "Log in with 'تذكري' checked, force-quit the app, relaunch after a day, and confirm whether the session persists any differently than with it unchecked — if there's no difference, that confirms the no-op and should be flagged to product as either wire it up or remove it.",
        "Submit the login form empty, with only identifier filled, and with only password filled — confirm inline validation catches each case before hitting the network.",
        "Tap 'المتابعة بحساب محفوظ' with zero saved identities on the device and confirm the bottom sheet handles the empty case gracefully rather than showing a blank sheet.",
        "Log in with a correct identifier and wrong password 3 times in a row and confirm the error Alert is clear each time (message comes from the backend, not a generic fallback, unless the network genuinely fails).",
      ],
    },
    {
      id: "mobile-individual-signup",
      title: "Individual signup: phone is optional in code but shown as required (*) in design",
      priority: "P1",
      endUserStory:
        "As an individual user, I want to create an account with just an email and password, without being forced to hand over my phone number right away, so that I can start using the app immediately and decide later whether I trust it enough to add my phone.",
      story:
        "As a QA engineer, I want to verify the Individual Signup screen's actual validation against signupSchema (email required + valid format, phone OPTIONAL matching Kuwaiti regex ^(?:+?965)?[569]\\d{7}$ when provided, password 8-char min, confirmPassword must match), and flag that the Figma design marks 'رقم الهاتف*' with a required-field asterisk while the implementation treats phone as fully optional — so this is either a design/code drift to fix or a design annotation error to correct, not a live bug either way, but worth resolving so the two don't keep disagreeing.",
      acceptanceCriteria: [
        "Signup succeeds with email + password + confirmPassword only, leaving phone blank — confirming phone truly is optional today, in contrast with the design's asterisk.",
        "When phone IS provided, it's validated against the Kuwaiti regex before submission, with a clear inline error on mismatch.",
        "Password under 8 characters, or a confirmPassword mismatch, blocks submission with inline errors.",
        "Submitting with no phone skips the OTP step entirely and logs the user straight in (see mobile-signup-otp-skip-logic) — submitting WITH a valid phone routes to the OTP step instead.",
      ],
      testScenarios: [
        "Sign up with email + password + confirmPassword and phone left blank — confirm the account is created and the OTP step is skipped (goes straight to success).",
        "Sign up with a phone that fails the Kuwaiti regex (wrong length/leading digit) and confirm inline rejection, not a failed network call.",
        "Sign up with a valid Kuwaiti phone in the +965XXXXXXXX, 965XXXXXXXX, and bare XXXXXXXX forms and confirm all three are accepted.",
        "Flag to design/product: either add the asterisk removal to the Figma frame, or file a ticket to make phone actually required in signupSchema + the register/individual endpoint — don't let this story get closed as 'passed' without that follow-up landing somewhere.",
      ],
    },
    {
      id: "mobile-signup-otp-skip-logic",
      title: "Signup only sends an OTP if a phone was provided — no email verification exists either way",
      priority: "P0",
      endUserStory:
        "As an individual user signing up with just my email, I want to be let into the app right away without waiting on a verification code, so that there's no friction between deciding to join and actually browsing properties.",
      story:
        "As a QA engineer, I want to verify that IndividualAuthScreen's onSignup only advances to the OTP step (IndividualSignupOtpStep) when a phone number was entered — if phone is blank, the app immediately calls POST /auth/login with the new credentials and shows the success sheet with zero verification of any kind — so that this security-relevant branch is deliberately signed off on, not discovered later as 'anyone can create an unverified account instantly'.",
      acceptanceCriteria: [
        "Signing up with email + password only (no phone) results in an immediately-active, logged-in account with no OTP and no email-verification link ever sent.",
        "Signing up WITH a phone sends an SMS OTP via POST /auth/register/verify-otp before the account becomes usable.",
        "Confirm with product/security whether 'no phone = instantly active, unverified account' is the intended trust model, since it means email ownership is never actually confirmed in that path.",
        "The Success bottom sheet's copy is consistent for both paths (see mobile-auth-success-copy for a text-mismatch nit already spotted here).",
      ],
      testScenarios: [
        "Sign up with a disposable/unowned email address and no phone — confirm the account is fully usable immediately, with no confirmation email ever required to be clicked.",
        "Sign up with a valid phone, then abandon the flow before entering the OTP — confirm the account is NOT usable yet (i.e. verification is actually gating something in that path).",
        "Sign up twice in a row with the same email but different phones (once with, once without) if the backend allows re-registration attempts, and confirm behavior is consistent and doesn't create duplicate/ghost accounts.",
      ],
    },
    {
      id: "mobile-otp-resend-countdown",
      title: "OTP verification: 45s resend countdown behaves correctly at the boundary",
      priority: "P1",
      endUserStory:
        "As an individual user verifying my phone number, I want to see clearly how long I have to wait before I can request a new code, and get an easy way to resend it once that time is up, so that I'm never left wondering whether my code is still valid or the app is just stuck.",
      story:
        "As a QA engineer, I want to verify the OTP screen's 6-box input and 45-second resend countdown (ForgotPasswordStep2, and the equivalent IndividualSignupOtpStep) match the Figma frame exactly and handle the boundary correctly, so that a user is never stuck unable to resend and never able to spam resends before the timer expires.",
      acceptanceCriteria: [
        "The 6 OTP boxes fill left-to-right as digits are typed, with the active box highlighted and an error state (red border) shown only after a failed verify attempt.",
        "The countdown starts at 00:45 and counts down to 0, then swaps to an 'إعادة إرسال الرمز' (resend) link.",
        "Tapping resend before the timer hits 0 is not possible (no resend UI is shown yet), and tapping it after reset the timer back to 45.",
        "The verify button stays disabled until exactly 6 digits are entered, matching the 'grey when disabled' state shown in the design.",
      ],
      testScenarios: [
        "Start the OTP step and confirm the timer reads exactly 00:45 initially, matching the Figma frame.",
        "Let the timer run to 0 and confirm the resend link appears immediately with no dead gap where neither the timer nor the link is visible.",
        "Enter an incorrect 6-digit code and confirm the boxes/border show an error state consistent with the design's error styling, with the actual error message visible.",
        "Enter 5 digits and confirm the verify button remains disabled (grey); enter the 6th and confirm it becomes enabled.",
      ],
    },
    {
      id: "mobile-forgot-password-inline-error",
      title: "Forgot-password 'account not found' error: design shows inline text, code shows a popup Alert (mismatch)",
      priority: "P2",
      endUserStory:
        "As an individual user who forgot my password, I want to be told clearly and right there on the screen if the email or phone I entered doesn't match any account, so that I immediately understand what went wrong instead of guessing why nothing happened.",
      story:
        "As a QA engineer, I want to flag that the Figma design for step 1 of Forgot Password shows an inline error message under the field ('لم نتمكن من العثور على حساب مرتبط بهذه البيانات') for an unrecognized identifier, but ForgotPasswordStep1.tsx has no inline error rendering at all — the actual implementation only surfaces failures via a native Alert.alert('خطأ', ...) popup — so this is a real design/implementation mismatch worth a product decision, not just a QA pass/fail.",
      acceptanceCriteria: [
        "Submitting an unrecognized identifier on the real Forgot Password step 1 screen triggers a native Alert dialog, not the inline red-text error shown in Figma.",
        "The submit button's disabled/enabled (grey vs. navy) states do match the design exactly — that part of the frame is implemented correctly.",
        "Decide and document whether the inline-error version should be built to match Figma, or whether the Figma frame should be updated to reflect the Alert-based pattern actually shipped.",
      ],
      testScenarios: [
        "Submit step 1 with an email/phone that has no matching account and confirm exactly what UI appears — screenshot it next to the Figma frame to make the mismatch concrete for the ticket.",
        "Confirm the disabled (grey, 'إرسال رمز التحقق' unclickable) state when the field is empty, and the enabled (navy) state once text is entered — this part should match the design.",
        "Repeat with a clearly malformed identifier (e.g. random string) to confirm the same Alert-based error path fires, not a different one.",
      ],
    },
    {
      id: "mobile-reset-password-skip-button",
      title: "Create-new-password step: design has a 'تخطي' skip option, code does not (mismatch)",
      priority: "P2",
      endUserStory:
        "As an individual user resetting my password, I want the option to back out of the process without being forced to pick a new password right then, so that I'm not stuck finishing a flow I started by mistake or no longer want to complete.",
      story:
        "As a QA engineer, I want to flag that the Figma frame for the final 'إنشاء كلمة مرور جديدة' (create new password) step shows a 'تخطي' (skip) link in the top-right corner, but ForgotPasswordStep3.tsx has no skip affordance at all — the user must set a new password to proceed, there's no way to abandon the reset and keep the old password from this screen — so this is a design/implementation mismatch that should be resolved deliberately rather than left ambiguous.",
      acceptanceCriteria: [
        "Confirm the real screen has no 'تخطي' button, contrary to the Figma frame.",
        "Password (8-char min) and confirmPassword (must match) validation blocks the 'تحديث كلمة المرور' button until both are valid — the disabled/enabled grey-vs-navy states should match the design.",
        "Decide whether 'skip' should mean 'cancel the whole reset flow and return to login unchanged' — if so, that needs an actual back/close affordance, since currently the ForgotPasswordHeader's back button is the only way out and it steps back to the OTP screen, not out of the flow entirely.",
      ],
      testScenarios: [
        "Reach the create-new-password step and confirm there is genuinely no skip control anywhere on screen — check the header row specifically, since that's where Figma places it.",
        "Enter a 7-character password and confirm the update button stays disabled; enter 8 and confirm it enables (once confirmPassword also matches).",
        "Use the screen's back button from this step and confirm exactly where it lands (expected: back to the OTP step, per handleBack's step-- logic) — compare that against what 'تخطي' in the design likely intended.",
      ],
    },
    {
      id: "mobile-auth-success-copy",
      title: "Success screens: account-created button copy differs between design and code (minor)",
      priority: "P2",
      endUserStory:
        "As an individual user who just created my account, I want a clear, encouraging confirmation that tells me what to do next, so that I feel confident the signup worked and know exactly where to go from there.",
      story:
        "As a QA engineer, I want to flag a small copy drift: the Figma frame for 'تم إنشاء حسابك بنجاح' (account created) shows a button labeled 'ابدأ الاستكشاف' (start exploring), while the actual SuccessBottomSheet rendered in individual-auth.tsx uses buttonText='ابدأ الآن' (start now) — a minor but real inconsistency worth a one-line fix, while confirming the password-reset success screen ('تم تحديث كلمة المرور بنجاح' / 'تسجيل الدخول') matches its Figma frame exactly.",
      acceptanceCriteria: [
        "Password-reset success sheet: title, description, and button text ('تسجيل الدخول') match the Figma frame exactly — verified, no action needed.",
        "Account-created success sheet: button currently reads 'ابدأ الآن' where the design specifies 'ابدأ الاستكشاف' — needs either a copy fix in code or a design-doc update, whichever is actually correct per product.",
        "Both success sheets correctly navigate on button press: password-reset → individual-auth (login), account-created → the identity's home route.",
      ],
      testScenarios: [
        "Trigger both success sheets (complete a password reset, and complete a no-phone signup) and read the exact button text on each against the two Figma frames side by side.",
        "Tap through both buttons and confirm the navigation destinations match what's described above.",
        "File the copy fix as a trivial ticket rather than a QA blocker — this is cosmetic, not functional.",
      ],
    },
    {
      id: "mobile-identity-switcher-sheet",
      title: "Profile/identity switcher bottom sheet matches design functionally, with a minor label difference",
      priority: "P2",
      endUserStory:
        "As an individual user who also manages a company or office account, I want to see all of my identities in one place and switch between them with a tap, so that I don't have to log out and back in every time I need to act under a different role.",
      story:
        "As a QA engineer, I want to verify ProfileBottomSheet (opened via 'المتابعة بحساب محفوظ' on login, or the profile icon elsewhere) correctly lists all of a user's identities with type badges and lets them switch or add a new one, matching the Figma 'اختر الملف الشخصي' frame functionally, while noting the add-account button reads 'إضافة هوية جديدة' (add new identity) in code versus 'اضافة حساب جديد' (add new account) in the design — a wording nit, not a functional gap.",
      acceptanceCriteria: [
        "Every identity the user owns (individual/company/office) appears in the list with the correct type badge and icon, and the currently-active one is visually marked ('الهوية النشطة').",
        "Tapping a non-active identity shows a loading spinner on that row, then switches and routes to that identity's home screen.",
        "Tapping the already-active identity simply closes the sheet with no network call.",
        "The add-identity button opens the signup flow (onAddAccount → handleModeChange('signup')) rather than a dead end.",
      ],
      testScenarios: [
        "As a user with 2+ identities, open the sheet and confirm all are listed with correct labels ('فرد' vs. company/office labels) and the right one is marked active.",
        "Switch identities and confirm the sheet closes and the app navigates to the correct home route for the new identity type — for a company/office identity, confirm it lands cleanly on ComingSoonGate (see mobile-company-office-gate in Mobile — Shared) rather than something broken.",
        "Tap the currently-active identity's row and confirm it just closes the sheet without a spinner or network call.",
        "Tap 'إضافة هوية جديدة' and confirm it opens the signup form step (individual signup only — company/office signup is gated, see Mobile — Shared).",
      ],
    },
  ],
};
