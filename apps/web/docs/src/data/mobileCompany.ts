import { DocSection } from "./types";

export const mobileCompany: DocSection = {
  slug: "mobile-company",
  title: "Mobile — Company",
  summary:
    "The (company) route group (company-home, company-more, company-chats, company-requests). IMPORTANT: this entire route group is currently gated behind ComingSoonGate — see mobile-company-office-gate in Mobile — Shared. None of the stories below are reachable by real users right now; they're a readiness checklist for when COMPANY_OFFICE_LOCKED flips off, grounded in what's actually built in the code today.",
  stories: [
    {
      id: "mobile-company-dashboard-mock-data",
      title: "Company Home dashboard stats and trial banner are 100% hardcoded (not live data)",
      priority: "P1",
      endUserStory:
        "As a company user, I want my dashboard to show real numbers for my requests, active services, views, and messages, so that I can actually gauge how my business is performing on the platform instead of looking at numbers that never change.",
      story:
        "As a QA engineer, I want to flag that company-home.tsx's entire 2x2 stats grid (طلبات / خدمات نشطة / المشاهدات / الرسائل الجديدة, showing the literal strings '3 هذا الأسبوع', '3', '+700', '5 اليوم') and the trial-countdown banner ('يتبقى 14 يومًا') are hardcoded JSX text with no state, hook, or API call feeding them, so this is tracked as a known readiness gap for whenever COMPANY_OFFICE_LOCKED flips off, rather than being freshly discovered as 'the metrics are wrong' at that point.",
      acceptanceCriteria: [
        "Every number on the stats grid and the '14 يومًا' trial banner is confirmed static in the component source, not derived from any request, subscription record, or count.",
        "Tapping both the 'طلبات' and 'خدمات نشطة' cards currently navigate to the same company-requests screen — confirm whether that's intentional or a routing bug once services management exists as its own feature.",
        "This story's acceptance criteria must be rewritten once real data wiring lands — verify the numbers actually match backend state instead of just confirming they're currently fake.",
      ],
      testScenarios: [
        "Compare two different company test accounts with genuinely different amounts of activity and confirm the dashboard numbers are identical between them — if so, that reconfirms they're hardcoded.",
        "Tap both 'طلبات' and 'خدمات نشطة' cards and confirm both currently navigate to company-requests.",
        "Cross-check office-home.tsx for the identical hardcoded-stats pattern (see mobile-office-dashboard-mock-data) since both dashboards share the same component structure.",
      ],
    },
    {
      id: "mobile-company-more-dead-actions",
      title: "Company profile 'معاينة' (Preview) and 'مشاركة' (Share) buttons have no onPress handler at all",
      priority: "P2",
      endUserStory:
        "As a company user, I want to preview how my company profile looks to the public and easily share it, so that I can check my presentation and promote my business without leaving the app.",
      story:
        "As a QA engineer, I want to verify that on company-more.tsx's profile header card, the 'معاينة' (Preview) and 'مشاركة' (Share) buttons render with no onPress prop whatsoever — only 'تعديل' (Edit) actually navigates anywhere (to /edit-profile) — so this dead-button gap is documented ahead of the gate lifting, not discovered fresh as 'nothing happens when I tap Preview.'",
      acceptanceCriteria: [
        "Tapping 'معاينة' does nothing — no navigation, no modal, no console log, no crash.",
        "Tapping 'مشاركة' does nothing for the same reason.",
        "'تعديل' correctly navigates to /edit-profile and is the only one of the three action buttons that's wired up.",
      ],
      testScenarios: [
        "Tap all three action buttons on the company profile card in sequence and confirm only Edit does anything.",
        "Repeat on office-more.tsx (see mobile-office-more-dead-actions) since the identical three-button row is duplicated there.",
        "Flag to product whether Preview/Share are meant to ship in the release that lifts the gate, or were intentionally left unwired for a later phase.",
      ],
    },
    {
      id: "mobile-company-coming-soon-menu-items",
      title: "'فريق العمل' and 'التحليلات' menu items are explicit 'قريباً' stubs (expected, not a bug)",
      priority: "P2",
      endUserStory:
        "As a company user, I want to eventually manage my team members and see analytics about my listings' performance, so that I can run my business operations from within the app.",
      story:
        "As a QA engineer, I want to confirm that company-more.tsx's 'إدارة الشركة' section deliberately shows an Alert.alert('قريباً', ...) for 'فريق العمل' (Team) and 'التحليلات' (Analytics) rather than navigating anywhere, so these are tracked as intentional not-yet-built placeholders and never mistaken for broken navigation.",
      acceptanceCriteria: [
        "Tapping 'فريق العمل' shows an alert reading 'ميزة فريق العمل ستكون متوفرة قريباً' and nothing else happens.",
        "Tapping 'التحليلات' shows an alert reading 'ميزة التحليلات ستكون متوفرة قريباً' and nothing else happens.",
        "Every other menu item in company-more (chat, favorites, notifications, reviews, plans, account-balance, invoices, settings, about, faq, contact, privacy, terms) navigates to a real shared screen — confirm none of those are silently broken alongside these two intentional stubs.",
      ],
      testScenarios: [
        "Tap every menu item in company-more.tsx once and record which ones show the 'قريباً' alert (expected: exactly 2) versus which navigate (expected: everything else).",
        "Confirm the alert text is grammatically correct Arabic, not a placeholder/lorem string.",
        "Cross-check against office-more.tsx's larger set of 4 'قريباً' items (see mobile-office-coming-soon-menu-items) to make sure the two lists don't diverge in unrelated, unintentional ways.",
      ],
    },
    {
      id: "mobile-company-requests-empty",
      title: "Company Requests tab is permanently empty regardless of filter (known gap)",
      priority: "P1",
      endUserStory:
        "As a company user, I want to see and manage the service requests customers send me, filtered by their status, so that I can respond to leads and track my pipeline.",
      story:
        "As a QA engineer, I want to verify that company-requests.tsx renders its all/pending/accepted/completed filter pills but the list stays empty no matter which is selected, so this known frontend/backend wiring gap is tracked explicitly and re-verified once real request data is wired in.",
      acceptanceCriteria: [
        "All 4 filter pills (all/pending/accepted/completed) render and are tappable.",
        "The list beneath stays empty for every filter — expected today.",
        "The screen settles into a clear empty state rather than an infinite spinner or crash.",
      ],
      testScenarios: [
        "Tap through all 4 filter pills and confirm each renders the same empty state.",
        "Navigate to company-requests both from the Company Home stats card and from wherever it's reachable in navigation, and confirm behavior is identical from both entry points.",
        "Re-run this check once backend wiring lands and flip the acceptance criteria to expect real data.",
      ],
    },
    {
      id: "mobile-company-add-tab-empty",
      title: "Company '+' tab renders a completely blank screen (not even a redirect)",
      priority: "P2",
      endUserStory:
        "As a company user, I want a clear '+' action to create a new listing, service, or offer, so that I have an obvious way to add new content to my profile.",
      story:
        "As a QA engineer, I want to flag that (company)/add.tsx is a literal `return <View />;` — a blank screen with no content, no redirect, and no action sheet — unlike the individual role's '+' button, which opens a real action sheet (Add Ad / Add Alert / Request Quote per docs/flows/guest-flow.md), so that if a company user ever taps '+' once the gate lifts, QA doesn't mistake a genuinely blank screen for a rendering bug — it is the current implementation as written.",
      acceptanceCriteria: [
        "Tapping the '+' tab as a Company identity renders a blank screen with no visible content or action.",
        "Nothing crashes and no console error is thrown — it's empty, not unstable.",
        "This must be revisited before the gate lifts — shipping a genuinely blank tab to real company users would be a real regression, not just a documentation footnote.",
      ],
      testScenarios: [
        "Tap the '+' tab as a Company identity and confirm literally nothing renders beyond a blank screen.",
        "Compare directly against the Individual role's '+' action sheet to make the gap concrete for a ticket.",
        "Repeat for Office (see mobile-office-add-tab-empty) since (office)/add.tsx has the identical empty stub.",
      ],
    },
  ],
};
