import { DocSection } from "./types";

export const mobileOffice: DocSection = {
  slug: "mobile-office",
  title: "Mobile — Office",
  summary:
    "The (office) route group (office-home, office-more, office-chats, office-properties). IMPORTANT: this entire route group is currently gated behind ComingSoonGate — see mobile-company-office-gate in Mobile — Shared. None of the stories below are reachable by real users right now; they're a readiness checklist for when COMPANY_OFFICE_LOCKED flips off, grounded in what's actually built in the code today.",
  stories: [
    {
      id: "mobile-office-dashboard-mock-data",
      title: "Office Home dashboard stats and trial banner are 100% hardcoded (not live data)",
      priority: "P1",
      endUserStory:
        "As an office user, I want my dashboard to show real numbers for my active listings, services, views, and messages, so that I can actually gauge how my office's listings are performing instead of looking at numbers that never change.",
      story:
        "As a QA engineer, I want to flag that office-home.tsx's entire 2x2 stats grid (الإعلانات النشطة / خدمات نشطة / المشاهدات / الرسائل الجديدة, showing the literal strings '3', '3', '700+', '5') and the trial-countdown banner ('يتبقى 14 يومًا') are hardcoded JSX text with no state, hook, or API call feeding them — an identical pattern to company-home.tsx (mobile-company-dashboard-mock-data) — so this is tracked as a known readiness gap for whenever COMPANY_OFFICE_LOCKED flips off.",
      acceptanceCriteria: [
        "Every number on the stats grid and the '14 يومًا' trial banner is confirmed static in the component source, not derived from any request, subscription record, or count.",
        "Tapping the 'الإعلانات النشطة' and 'خدمات نشطة' cards both currently navigate to office-properties — confirm whether that's intentional or a routing bug once services management exists as its own feature.",
        "This story's acceptance criteria must be rewritten once real data wiring lands — verify the numbers actually match backend state instead of just confirming they're currently fake.",
      ],
      testScenarios: [
        "Compare two different office test accounts with genuinely different amounts of activity and confirm the dashboard numbers are identical between them — if so, that reconfirms they're hardcoded.",
        "Tap both stat cards that route to office-properties and confirm the destination is the same for both.",
        "Cross-check against company-home.tsx (mobile-company-dashboard-mock-data) to confirm both dashboards were built from the same hardcoded template.",
      ],
    },
    {
      id: "mobile-office-more-dead-actions",
      title: "Office profile 'معاينة' (Preview) and 'مشاركة' (Share) buttons have no onPress handler at all",
      priority: "P2",
      endUserStory:
        "As an office user, I want to preview how my office profile looks to the public and easily share it, so that I can check my presentation and promote my agency without leaving the app.",
      story:
        "As a QA engineer, I want to verify that on office-more.tsx's profile header card, the 'معاينة' (Preview) and 'مشاركة' (Share) buttons render with no onPress prop whatsoever — only 'تعديل' (Edit) actually navigates anywhere (to /edit-profile) — an identical gap to company-more.tsx (mobile-company-more-dead-actions) — so this is documented ahead of the gate lifting rather than discovered fresh.",
      acceptanceCriteria: [
        "Tapping 'معاينة' does nothing — no navigation, no modal, no console log, no crash.",
        "Tapping 'مشاركة' does nothing for the same reason.",
        "'تعديل' correctly navigates to /edit-profile and is the only one of the three action buttons that's wired up.",
      ],
      testScenarios: [
        "Tap all three action buttons on the office profile card in sequence and confirm only Edit does anything.",
        "Cross-check against company-more.tsx (mobile-company-more-dead-actions) to confirm the two profile cards share the exact same unwired-buttons issue, not two unrelated bugs.",
        "Flag to product whether Preview/Share are meant to ship in the release that lifts the gate, or were intentionally left unwired for a later phase.",
      ],
    },
    {
      id: "mobile-office-coming-soon-menu-items",
      title: "Office has 4 explicit 'قريباً' menu stubs — more than Company's 2 (expected, not a bug)",
      priority: "P2",
      endUserStory:
        "As an office user, I want to eventually manage deals, auctions, and broker relationships, and see analytics on my listings, so that I can run my agency's operations from within the app.",
      story:
        "As a QA engineer, I want to confirm that office-more.tsx shows Alert.alert('قريباً', ...) for 4 items — 'الصفقات' (Deals), 'المزادات' (Auctions), 'إدارة الوسطاء' (Broker Management), and 'التحليلات' (Analytics) — twice as many placeholder stubs as company-more.tsx's 2, so QA tracks this asymmetry as an intentional difference in each role's roadmap, not an inconsistency to flag as a bug.",
      acceptanceCriteria: [
        "Tapping each of the 4 items shows its corresponding 'قريباً' alert ('ميزة الصفقات ستكون متوفرة قريباً', 'ميزة المزادات ستكون متوفرة قريباً', 'ميزة إدارة الوسطاء ستكون متوفرة قريباً', 'ميزة التحليلات ستكون متوفرة قريباً') and nothing else happens.",
        "Every other menu item in office-more (chat, favorites, notifications, reviews, plans, account-balance, invoices, settings, about, faq, contact, privacy, terms) navigates to a real shared screen.",
        "This asymmetry with Company (2 stubs vs. 4) is confirmed intentional per the product roadmap, not a copy-paste gap between the two role's menu screens.",
      ],
      testScenarios: [
        "Tap all 4 'قريباً' items in office-more.tsx and confirm each shows its own correctly-worded alert.",
        "Tap every remaining menu item and confirm all route to a real, working shared screen.",
        "Cross-check against company-more.tsx's 2-item list (mobile-company-coming-soon-menu-items) to confirm the difference in scope is a deliberate roadmap choice.",
      ],
    },
    {
      id: "mobile-office-properties-empty",
      title: "Office Properties tab is permanently empty regardless of filter (known gap)",
      priority: "P1",
      endUserStory:
        "As an office user, I want to see and manage my listed properties, filtered by their publish status, so that I can track what's live, in draft, or archived.",
      story:
        "As a QA engineer, I want to verify that office-properties.tsx renders its all/published/draft/archived filter pills but the list stays empty no matter which is selected, so this known frontend/backend wiring gap is tracked explicitly and re-verified once real property data is wired in.",
      acceptanceCriteria: [
        "All 4 filter pills (all/published/draft/archived) render and are tappable.",
        "The list beneath stays empty for every filter — expected today.",
        "The screen settles into a clear empty state rather than an infinite spinner or crash.",
      ],
      testScenarios: [
        "Tap through all 4 filter pills and confirm each renders the same empty state.",
        "Navigate to office-properties both from the Office Home stats cards and from wherever else it's reachable, and confirm behavior is identical from both entry points.",
        "Re-run this check once backend wiring lands and flip the acceptance criteria to expect real data.",
      ],
    },
    {
      id: "mobile-office-add-tab-empty",
      title: "Office '+' tab renders a completely blank screen (not even a redirect)",
      priority: "P2",
      endUserStory:
        "As an office user, I want a clear '+' action to list a new property, so that I have an obvious way to add new listings to my portfolio.",
      story:
        "As a QA engineer, I want to flag that (office)/add.tsx is a literal `return <View />;` — a blank screen with no content, no redirect, and no action sheet — the identical stub to (company)/add.tsx (mobile-company-add-tab-empty), unlike the individual role's real '+' action sheet, so QA doesn't mistake this genuinely blank screen for a rendering bug once the gate lifts — it is the current implementation as written.",
      acceptanceCriteria: [
        "Tapping the '+' tab as an Office identity renders a blank screen with no visible content or action.",
        "Nothing crashes and no console error is thrown — it's empty, not unstable.",
        "This must be revisited before the gate lifts — shipping a genuinely blank tab to real office users would be a real regression, not just a documentation footnote.",
      ],
      testScenarios: [
        "Tap the '+' tab as an Office identity and confirm literally nothing renders beyond a blank screen.",
        "Compare directly against the Individual role's '+' action sheet to make the gap concrete for a ticket.",
        "Cross-check against (company)/add.tsx (mobile-company-add-tab-empty) to confirm both role stubs are identical, not two independently-introduced gaps.",
      ],
    },
  ],
};
