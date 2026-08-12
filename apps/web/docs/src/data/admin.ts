import { DocSection } from "./types";

export const admin: DocSection = {
  slug: "web-admin",
  title: "Web Admin",
  summary:
    "Next.js system administrator dashboard (apps/web/admin, port 3005). Covers the dashboard, user management, Plans & Pricing, Subscriptions & Billing, and several intentionally-unbuilt placeholder sections (Notifications, Content, Roles, Settings, Logs).",
  stories: [
    {
      id: "admin-auth-guard",
      title: "Only verified admins reach the dashboard",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify that the admin dashboard layout guards every route via GET /users/me + isAdmin, redirecting unauthorized users to /auth/login, so that a non-admin account (or an expired session) can never view admin data even by deep-linking a URL.",
      acceptanceCriteria: [
        "Deep-linking any admin route (e.g. /users, /plans, /billing) while logged out redirects to /auth/login.",
        "Deep-linking as a logged-in but non-admin user also redirects to /auth/login (not just a blank/error page).",
        "A valid admin session loads the dashboard layout and SideNav without a flash of unauthorized content.",
        "Session expiry mid-session (token expires while dashboard is open) redirects to login on the next guarded request, not a silent broken state.",
      ],
      testScenarios: [
        "Log out, then directly navigate to /users/123 by URL — confirm redirect to login, no data flash.",
        "Log in as a regular (non-admin) app user, then hit an admin URL directly — confirm redirect.",
        "Log in as admin, let the session token expire (or revoke it server-side), then click a nav link — confirm graceful redirect rather than a broken fetch/500.",
      ],
    },
    {
      id: "admin-password-recovery",
      title: "Admin password recovery (OTP) flow completes correctly",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify the 3-step admin recovery flow (POST auth/recovery/request-otp → /auth/verify-otp → POST auth/recovery/verify-otp → /auth/reset-password) works end to end, so that an admin who is locked out can regain access without support intervention, and so that OTPs can't be reused or guessed.",
      acceptanceCriteria: [
        "Requesting an OTP from /auth/forgot-password sends it to the correct channel (email/SMS) and navigates to /auth/verify-otp.",
        "An incorrect OTP is rejected with a clear error and does not advance to reset-password.",
        "A correct OTP advances to /auth/reset-password, and the new password takes effect immediately for the next login.",
        "An OTP cannot be reused after a successful reset, and expires after its documented window.",
      ],
      testScenarios: [
        "Full happy path: request OTP → enter correct code → set new password → log in with new password.",
        "Enter an expired OTP (wait past the expiry window) and confirm rejection with a resend option.",
        "Attempt to reuse an already-consumed OTP on a second reset attempt — confirm rejection.",
        "Navigate directly to /auth/reset-password without completing OTP verification — confirm it's not reachable/usable without a valid verified session.",
      ],
    },
    {
      id: "admin-dashboard-metrics",
      title: "Dashboard metrics and charts reflect real data",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify the دashboard home (MetricsGrid, RevenueChart, UsersDonutChart, RecentRegistrationsTable, RecentActivitiesCard, ReportsCard, VerificationRequestsCard) renders numbers/charts consistent with the underlying user and revenue data, so that admins aren't making decisions off of stale or mismatched figures.",
      acceptanceCriteria: [
        "MetricsGrid totals (e.g. user counts) match what's independently visible in the /users table for the same period.",
        "RevenueChart and UsersDonutChart update when the underlying data changes (new registration, new payment) within an expected refresh window.",
        "RecentRegistrationsTable shows the most recent signups in correct order, matching /users sorted by creation date.",
        "VerificationRequestsCard counts match the actual number of pending verification requests.",
      ],
      testScenarios: [
        "Register a new test user, then confirm they appear in RecentRegistrationsTable and the relevant MetricsGrid count increments.",
        "Cross-check a date range on RevenueChart against invoice data for the same range.",
        "With zero data (fresh/empty environment), confirm every chart/card shows a sane empty/zero state rather than an error or NaN.",
      ],
    },
    {
      id: "admin-users-table",
      title: "User management table: search, filter, status changes, and delete are all correct",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify /users (fetchAdminUsers, tabs all/individual/office/company, updateUserStatus, deleteUser) correctly searches, filters, paginates, and mutates user records, so that admins can safely manage accounts without affecting the wrong user or losing data silently.",
      acceptanceCriteria: [
        "Switching between all/individual/office/company tabs filters the table to only that role, with correct total counts.",
        "Search narrows results by name/email/phone as expected, combined correctly with the active role tab.",
        "Pagination controls move through the full result set without skipping or duplicating rows across pages.",
        "updateUserStatus reflects immediately in the table (and ideally on that user's own next login/session), and deleteUser removes the user everywhere (their listings, chats, etc. handled per business rule, not left dangling).",
      ],
      testScenarios: [
        "Search for a known user by partial name and by full email, confirm both find the same record.",
        "Apply the 'company' tab filter, then search — confirm results are the intersection, not the search ignoring the tab.",
        "Change a user's status (e.g. disable) and confirm that user is immediately blocked from logging in via mobile/web.",
        "Delete a test user who has active listings/favorites/chats and verify the app doesn't crash for the other party in those relationships (e.g. a chat partner).",
        "Page through a list of 50+ users and confirm no row appears twice or is skipped across page boundaries.",
      ],
    },
    {
      id: "admin-user-detail-tabs",
      title: "User detail page's 11 tabs each show correct, role-appropriate data",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify /users/[id]'s tabs (overview, ads, requests, services, exhibition, packages, invoices, reports, ratings, logs, notes) each load correct data for the specific user, and that the Overview tab correctly switches between IndividualProfileOverview / OfficeProfileOverview / CompanyProfileOverview based on that user's role, so that admins never see one user's data rendered under another user's ID, or the wrong overview component for a role.",
      acceptanceCriteria: [
        "Opening an individual, office, and company user's detail page each renders the correct overview component variant.",
        "Every tab's data (ads, invoices, ratings, etc.) belongs strictly to the user in the URL — switching users updates every tab, not just Overview.",
        "The Packages tab correctly opens ChangePackageDrawer and AddExceptionalFeatureDrawer, and changes made there are reflected in the Packages tab afterward.",
        "Tabs with no data (e.g. a user with zero reports) show an empty state, not an error.",
      ],
      testScenarios: [
        "Open three different users (one of each role) by ID and confirm each renders its role-specific Overview.",
        "On a single user, click through all 11 tabs and confirm the URL/tab state updates correctly and back/forward browser navigation lands on the right tab.",
        "From the Packages tab, use Change Package and Add Exceptional Feature, confirm the success toast appears, then reload the tab and confirm the change persisted.",
        "Open two different user IDs in two browser tabs and confirm no cross-contamination of tab state (e.g. via shared client cache).",
      ],
    },
    {
      id: "admin-plans-pricing",
      title: "Plans & Pricing (Normal/Silver/Gold) edits apply correctly and can be safely discarded",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify the /plans page — PlanDetailDrawer for each tier and the 3-step EditPlanDrawer with DiscardEditsModal — saves edits correctly per tier and never silently loses or applies changes when a user backs out, so that pricing changes are intentional and accurately reflected to real users on their next billing cycle.",
      acceptanceCriteria: [
        "Opening PlanDetailDrawer for Normal, Silver, and Gold each shows that tier's correct current price/features, not a shared/stale state.",
        "Editing a plan through all 3 EditPlanDrawer steps and confirming saves the new values, visible immediately on reopening PlanDetailDrawer.",
        "Attempting to close the EditPlanDrawer mid-edit (with unsaved changes) triggers DiscardEditsModal; confirming discard reverts to the pre-edit values with nothing saved.",
        "Navigating away (browser back, or closing the drawer via the X) with unsaved changes is also caught by the discard flow — it isn't only the Cancel button that's guarded.",
      ],
      testScenarios: [
        "Edit the Gold plan's price on step 1, price a feature on step 2, review on step 3, save — reopen and confirm all three changes stuck.",
        "Start editing Silver, change a value, click the browser back button or press Escape — confirm DiscardEditsModal appears rather than silently discarding or silently saving.",
        "Start editing Normal, click Discard in the modal, reopen PlanDetailDrawer for Normal — confirm the original (pre-edit) values are shown, not a half-applied state.",
        "Edit Normal and Silver in two separate sessions without saving either, confirm no cross-tier bleed (editing Normal doesn't touch Silver's draft state).",
      ],
    },
    {
      id: "admin-billing-subscriptions",
      title: "Subscriptions table currently renders from mock data (known gap)",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify the /billing Subscriptions tab (BillingMetrics, BillingFilters, SubscriptionsTable, BillingPagination) renders and paginates correctly against MOCK_SUBSCRIPTIONS, so that UI behavior (filtering, sorting, pagination) is validated now while flagging that a live-data regression pass is required once this is wired to the real billing/invoices API.",
      acceptanceCriteria: [
        "BillingFilters correctly narrow the mock dataset (status, date range, plan tier as applicable) and BillingMetrics recalculates to match the filtered set.",
        "BillingPagination correctly pages through the full mock dataset with no duplicate/missing rows.",
        "This story must be re-verified against live data once MOCK_SUBSCRIPTIONS is replaced — track as a follow-up rather than a one-time pass.",
      ],
      testScenarios: [
        "Apply each available filter individually and in combination, confirming BillingMetrics totals always match the currently-filtered table rows.",
        "Page through the mock dataset fully and count total rows shown vs. the known mock dataset size to confirm no rows are lost.",
        "Flag explicitly in test reports that this is exercising mock data, so a future live-data pass isn't skipped once the backend is connected.",
      ],
    },
    {
      id: "admin-billing-invoices-empty",
      title: "Invoices tab currently shows a fixed empty state (known gap)",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify the /billing Invoices tab renders its documented empty state consistently, so that this intentionally-not-yet-built area doesn't get flagged as 'broken' rather than 'not yet implemented', and so regressions in that empty-state UI are still caught.",
      acceptanceCriteria: [
        "The Invoices tab always shows the empty state regardless of filters/search applied — expected today.",
        "The empty state renders correctly (no layout break, no console errors) across all supported browsers/breakpoints.",
        "This story's acceptance criteria must be replaced once real invoice data/listing is implemented.",
      ],
      testScenarios: [
        "Open the Invoices tab and confirm the empty state matches the same visual language as other empty states in the app (see admin-placeholder-pages).",
        "Resize the browser window / test on mobile-width viewport and confirm the empty state doesn't break layout.",
      ],
    },
    {
      id: "admin-placeholder-pages",
      title: "Notifications, Content, Roles, Settings, and Logs are intentionally unbuilt scaffolds",
      priority: "P2",
      story:
        "As a QA engineer, I want to verify that /notifications, /content, /roles, /settings, and /logs consistently render the 'no data — ready-to-develop skeleton' placeholder with a working (if alert()-only) Export/Add button, so that these are tracked as known scaffold pages rather than 5 separate 'broken page' bug reports.",
      acceptanceCriteria: [
        "Each of the 5 pages loads without error and shows the Arabic placeholder copy ('لا توجد بيانات لعرضها حالياً...').",
        "Each page's Export/Add button fires a browser alert() rather than throwing a JS error or doing nothing silently.",
        "None of the 5 pages appear in the SideNav with a broken/missing icon or label.",
      ],
      testScenarios: [
        "Visit each of the 5 pages once and confirm identical placeholder structure/copy pattern across all of them (catches accidental divergence during future partial builds).",
        "Click the Export/Add button on each and confirm the alert() fires without a console error.",
        "Re-run this check after any of these 5 pages gets real functionality shipped, since at that point this story should be split into a real per-page story.",
      ],
    },
  ],
};
