import { DocSection } from "./types";

export const mobileShared: DocSection = {
  slug: "mobile-shared",
  title: "Mobile — Shared",
  summary:
    "Cross-role mobile features (apps/mobile) that apply regardless of which identity is active — guest gating, chat, search, listings, identity switching, payments, layout, and the App Store demo account. Includes the confirmed reason Company/Office roles are currently unreachable.",
  stories: [
    {
      id: "mobile-company-office-gate",
      title: "Company/Office accounts are entirely gated behind a 'Coming Soon' screen — confirmed intentional",
      priority: "P0",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=271-20996&m=dev",
          label: "Initial account-type selection sheet",
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=354-19799&m=dev",
          label: "Mid-signup 'change account type' sheet",
        },
      ],
      story:
        "As a QA engineer, I want to confirm that Company and Office account types are deliberately locked app-wide — apps/mobile/src/app/(auth)/business-auth.tsx checks `const COMPANY_OFFICE_LOCKED = true;` and renders <ComingSoonGate /> instead of the real signup/login form, and both (company)/_layout.tsx and (office)/_layout.tsx short-circuit their entire tab navigators to that same gate — so that this documented, intentional kill-switch is treated as a release-readiness checkpoint to re-verify every release, not something QA needs to rediscover or escalate as a bug each pass.",
      acceptanceCriteria: [
        "COMPANY_OFFICE_LOCKED is true in the current build, and every entry point into company/office (the business-auth screen, the (company) tab group, the (office) tab group) shows the same 'قريباً' ComingSoonGate bottom sheet — non-dismissible, with only a 'العودة للرئيسية' way out.",
        "'العودة للرئيسية' correctly returns the user to an individual identity if one exists on the account, or logs out to individual-auth if not — it never leaves the user stuck on a dead screen.",
        "This flag's state is an explicit, called-out line item in every release QA sign-off — before shipping, confirm whether it's intentionally still true or whether product has asked for it to flip to false.",
        "If/when this flips to false, every story in the Mobile — Company and Mobile — Office sections needs a full re-pass, since none of that functionality has been exercised by real users while the gate has been up.",
      ],
      testScenarios: [
        "Attempt to reach Office or Company signup from every entry point you can find (the selection screen doesn't offer them at all — see the Mobile — Individual section; also try deep-linking directly to /(auth)/business-auth?type=office) and confirm ComingSoonGate always appears, with no path reaching a real form.",
        "Log in as an existing company/office test account (if one exists in the DB from before the lock) and confirm the (company)/(office) tab navigator is also gated — not just the auth screens.",
        "Tap 'العودة للرئيسية' from the gate as a user with an individual identity available, and confirm it switches to that identity correctly; repeat as a user with no individual identity and confirm it logs out cleanly to individual-auth.",
        "Before each release, explicitly re-check this flag's value in the shipped build (not just in the repo) since a build/env mismatch here would silently ship two completely unqualified onboarding paths to real users.",
      ],
    },
    {
      id: "mobile-guest-guard",
      title: "Guest action-gating shows the auth sheet, never a dead end",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify that every guarded action (Chat, Favorites, Notifications, Add Ad, Add Alert, Ask for Offer, Write Review) opens the Authentication Bottom Sheet for guest users, so that guests are always offered a clear path to sign up or log in instead of hitting a silent failure or crash.",
      acceptanceCriteria: [
        "guardAction() intercepts all 7 listed actions when no session exists.",
        "The bottom sheet offers 'إنشاء حساب' (sign up), 'تسجيل دخول' (log in), and 'لاحقاً' (later/dismiss).",
        "Dismissing via 'لاحقاً' returns the guest to the exact screen/state they were on.",
        "The same actions work immediately (no sheet) once a real session exists.",
      ],
      testScenarios: [
        "As a guest, tap the heart icon on a property card in Search results, Property Detail, and Home feed — confirm the sheet appears in all three places, not just one.",
        "As a guest, tap the '+' add-listing button and the 'Ask for Offer' button on a property — confirm both are gated.",
        "Complete login from the sheet mid-flow (e.g. from Favorites) and confirm the originally-attempted action completes automatically or the user lands back where they intended.",
        "Kill and relaunch the app as a guest — confirm gating still triggers after a cold start (not just first-session state).",
      ],
    },
    {
      id: "mobile-chat-realtime",
      title: "Real-time chat delivers and syncs across devices",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify the Socket.IO-backed chat (join_conversation/leave_conversation/send_message events, new_message/conversation_updated broadcasts) delivers messages reliably, so that buyers and sellers can trust conversations aren't dropped or duplicated. This applies identically to Individual chat and to company-chats/office-chats once the account-type gate lifts (mobile-company-office-gate) — all three screens share the same useChatStore.",
      acceptanceCriteria: [
        "Sending a message from device A appears on device B (same account, two sessions) within a few seconds without manual refresh.",
        "conversation_updated correctly reorders/updates the chat list's last-message preview and unread badge.",
        "Reopening the app after being offline reconnects the socket and catches up on missed messages via GET conversations/:id/messages.",
        "POST conversations/:id/read clears the unread badge for that conversation only.",
      ],
      testScenarios: [
        "Two test accounts message each other; confirm delivery order matches send order on both ends.",
        "Put device A in airplane mode mid-conversation, send messages from B, then bring A back online — confirm A receives the backlog.",
        "Start a conversation from a Property Detail 'Chat' button as a guest — confirm this is gated by the auth sheet (see mobile-guest-guard), not a broken chat screen.",
        "KNOWN STUB: attempt 'Attach image' and image download in a chat thread — these currently only console.log and do nothing visible. Confirm the buttons at least fail silently/gracefully rather than crashing, and file this as a known gap rather than a new bug.",
      ],
    },
    {
      id: "mobile-search",
      title: "Search suggestions are live; recent-search history is mock-only",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify that Search's live suggestions (real searchService calls) work correctly while confirming the 'recent searches' list is currently a mock/local array, so that we don't misreport the mock history as a persistence bug and instead track it as a known gap (no Zustand/AsyncStorage persistence yet).",
      acceptanceCriteria: [
        "Typing a query in Search shows live suggestions sourced from the backend, updating as the user types (debounced, no stale results flashing in).",
        "The GlobalFilterSheet filters (opened from Search) correctly narrow /search/results by tab and filters params.",
        "'Recent searches' shown on the Search screen do NOT persist across app restarts (expected today) — confirm this matches the known mock behavior rather than treating it as a regression.",
        "Search Results screen correctly reflects the tab/filters passed in via navigation params.",
      ],
      testScenarios: [
        "Type a partial property title/location and confirm suggestions load, then clear the field and confirm suggestions clear too.",
        "Apply 2-3 filters in GlobalFilterSheet, submit, and confirm the results screen URL/params and rendered results match the selected filters.",
        "Perform a search, force-quit the app, relaunch, and confirm 'recent searches' resets — document as expected (mock-only) rather than filing as a bug.",
        "Search with no matching results and confirm a proper empty state renders (not a blank screen or infinite spinner).",
      ],
    },
    {
      id: "mobile-add-listing",
      title: "Multi-tab listing creation (Sell/Rent/Exchange) saves consistent data",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify the add-listing flow (SharedPropertyInfo + SellPropertyTab/RentPropertyTab/ExchangePropertyTab, driven by useListingStore, with a Preview step) produces a correctly-typed property regardless of which tab the user starts from, so that listings don't get created with the wrong type or missing required fields.",
      acceptanceCriteria: [
        "Fields entered in SharedPropertyInfo persist correctly when switching between Sell/Rent/Exchange tabs before submission.",
        "Preview screen accurately reflects every field entered, including images, before final submission.",
        "Required-field validation blocks submission with clear inline errors rather than a silent failure.",
        "Successfully created listings appear immediately in the user's own listings/'My Ads' and in relevant search feeds.",
      ],
      testScenarios: [
        "Create a Sell listing with all fields, submit, and verify it appears with correct type/price/fields on Property Detail.",
        "Start a Rent listing, switch to Exchange mid-flow, and confirm shared fields (location, images) aren't lost and type-specific fields (rent price vs. exchange terms) reset/validate appropriately.",
        "Attempt to submit with a required field missing (e.g. no images, no price) and confirm the app blocks submission with a visible error rather than sending an incomplete request.",
        "Edit an existing listing via /edit-listing/[id] and confirm changes save without duplicating the listing or resetting untouched fields.",
      ],
    },
    {
      id: "mobile-identity-switch",
      title: "Switching identities changes context everywhere, with no data bleed",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify that POST auth/identity/switch correctly changes the active identity across the whole app, so that a user managing multiple identities never sees another identity's listings, chats, or favorites mixed into the current one. Note: switching TO a company/office identity currently lands on the ComingSoonGate (see mobile-company-office-gate) rather than a real home screen — verify that transition is clean, not broken.",
      acceptanceCriteria: [
        "After switching identity, Home/tabs immediately reflect the new role's UI (individual tabs, or the ComingSoonGate for company/office while the lock is active).",
        "Listings, chats, and favorites shown are scoped strictly to the active identity.",
        "Switching back to a previous identity restores its exact prior state (scroll position not required, but data must match).",
        "Push notifications/chat sockets reconnect under the new identity's context rather than continuing to stream the old identity's events.",
      ],
      testScenarios: [
        "With an active chat open under identity A, switch to identity B and confirm identity A's conversation is no longer visible/reachable as B.",
        "Switch identities repeatedly (A→B→A) and confirm no duplicated tabs, stale cached screens, or crash.",
        "If a test account has a pre-existing company/office identity, switch to it and confirm landing cleanly on ComingSoonGate rather than a half-rendered tab bar underneath it.",
      ],
    },
    {
      id: "mobile-payments",
      title: "Tap payment checkout completes and reconciles invoices correctly",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify the Tap payment gateway flow (POST payments/charge → redirect → /payment-callback → webhook → GET payments/status/:invoiceId) correctly reflects success and failure states, so that users are never charged without an invoice being marked paid, or shown 'success' when payment actually failed.",
      acceptanceCriteria: [
        "A successful Tap payment redirects to /payment-callback showing a success state, and the related invoice's status updates (visible in more/invoices).",
        "A declined/cancelled Tap payment redirects to a failure state and does not mark the invoice as paid.",
        "Webhook-driven status updates are reflected even if the user closes the app before the redirect completes (poll GET status/:invoiceId on next launch).",
        "Account balance (more/account-balance) reflects completed payments accurately.",
      ],
      testScenarios: [
        "Complete a full checkout with Tap test card success credentials and confirm invoice + balance update.",
        "Trigger a decline (Tap test card failure credentials) and confirm no invoice is falsely marked paid, and the user sees a clear failure message.",
        "Start a payment, force-close the app before the in-app redirect fires, reopen, and confirm the invoice status still resolves correctly (webhook already landed server-side).",
        "Double-submit a charge (rapid double-tap 'Pay') and confirm no duplicate charge/invoice is created.",
      ],
    },
    {
      id: "mobile-ipad-layout",
      title: "Responsive layout holds up on iPad breakpoints",
      priority: "P2",
      story:
        "As a QA engineer, I want to verify the ContentContainer responsive breakpoints (md:/lg: Tailwind classes per docs/plans/07-ipad-layout.md) render correctly on iPad form factors, so that the App Store review team (and real iPad users) don't see a stretched/broken phone layout.",
      acceptanceCriteria: [
        "Key screens (Home, Search, Property Detail, Chat) use constrained/centered content width on iPad rather than full-bleed phone layout.",
        "Rotating an iPad between portrait and landscape doesn't break layout or clip content.",
        "Modals and bottom sheets (auth sheet, filter sheet, action sheet) remain usable and centered on iPad, not pinned oddly to a phone-sized area.",
      ],
      testScenarios: [
        "Run through Home → Search → Property Detail → Chat on an iPad simulator (or device) in both orientations.",
        "Open the Authentication Bottom Sheet and GlobalFilterSheet on iPad and confirm they aren't stretched edge-to-edge in a way that looks broken.",
        "Compare against the demo account (see mobile-demo-account) screens specifically, since those are what App Store reviewers will see.",
      ],
    },
    {
      id: "mobile-demo-account",
      title: "App Store demo account has believable, working seeded data",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify the demo account (demo@buyootna.cloud, per docs/plans/08-demo-account.md) has working seeded properties, a draft listing, favorites, chats, and an active subscription, so that App Store reviewers logging in with this account see a fully functional app rather than empty screens that could trigger another 4.2.2-style rejection.",
      acceptanceCriteria: [
        "Logging in as the demo account succeeds without OTP friction (or with clearly documented reviewer-facing OTP steps).",
        "Home/Search show seeded, real-looking properties — not empty states.",
        "The seeded draft listing is editable and viewable in add-listing/edit-listing flows.",
        "Seeded favorites and chats are visible and navigable (chat thread has readable seeded messages).",
        "The seeded subscription/plan shows correctly under more/plans and more/invoices.",
      ],
      testScenarios: [
        "Fresh install → log in as demo account → walk every guarded action (Chat, Favorites, Add Ad, etc.) end to end with no auth-sheet interruptions.",
        "Confirm the seeded data survives a backend restart/reseed cycle (i.e. the seed script is idempotent and reviewer access doesn't silently break).",
        "Verify no seeded content contains placeholder/lorem text visible to a reviewer.",
        "Confirm the demo account is an Individual identity (not company/office), since those are gated — see mobile-company-office-gate.",
      ],
    },
  ],
};
