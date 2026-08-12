import { DocSection } from "./types";

export const management: DocSection = {
  slug: "web-management",
  title: "Web Management",
  summary:
    "Next.js property management portal (apps/web/management, port 3004). Same auth-only shell pattern as web-companies/web-offices, but with a likely-unfinished detail: SignupForm's defaultRole is currently \"INDIVIDUAL\", not a management-specific role.",
  stories: [
    {
      id: "management-shell-scope",
      title: "Portal is correctly scoped to an auth-only shell (known gap)",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify that apps/web/management currently only exposes the splash page and the three auth routes, so that this is tracked as expected current scope rather than filed as a missing property-manager-dashboard bug.",
      acceptanceCriteria: [
        "/ shows the 'بيوتنا للإدارة' splash with working links to login/signup.",
        "No property-management-specific routes (unit management, maintenance requests, etc.) exist yet.",
        "This story should be replaced with real dashboard coverage once a management dashboard ships.",
      ],
      testScenarios: [
        "Crawl all links from the splash page and confirm none 404.",
        "Deep-link a plausible dashboard URL and confirm a clean 404.",
      ],
    },
    {
      id: "management-signup-role-bug",
      title: "Signup defaults to INDIVIDUAL instead of a management-specific role — verify intentional or file as a bug",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify what role is actually submitted when a user signs up through apps/web/management, because SignupForm here is configured with defaultRole=\"INDIVIDUAL\" — the same as no role selection at all — which looks like it may be an oversight left over from copying the web-companies/web-offices template rather than an intentional choice.",
      acceptanceCriteria: [
        "Confirm with product/eng whether accounts created via this portal are supposed to be INDIVIDUAL, or a dedicated MANAGEMENT-type role that hasn't been wired up yet.",
        "If INDIVIDUAL is unintentional: file a bug against apps/web/management/src/app/auth/signup (or wherever defaultRole is set) rather than treating current behavior as correct.",
        "If INDIVIDUAL is intentional (e.g. management accounts are provisioned differently, not via self-signup): document that explicitly so this story doesn't get re-flagged every regression pass.",
      ],
      testScenarios: [
        "Complete signup on this portal and check via network inspector / admin /users table what role the created account actually has.",
        "Compare against the equivalent signup flow on web-companies (defaultRole=\"COMPANY\") and web-offices (defaultRole=\"OFFICE\") to confirm this portal is the outlier.",
        "Escalate to the team before closing this out either way — this is exactly the kind of copy-paste-template bug that's easy to miss without cross-portal comparison.",
      ],
    },
    {
      id: "management-shared-form-parity",
      title: "Shared auth-form behavior stays in parity with the other portal shells",
      priority: "P2",
      story:
        "As a QA engineer, I want to verify that, aside from the role question above, apps/web/management's auth forms behave identically to web-companies/web-offices since they share the same @buyootna/ui components, so that any shared-component fix or regression is checked across all three portals, not just the one where it was first found.",
      acceptanceCriteria: [
        "Validation behavior (non-empty checks, password confirm match, no zod/regex) matches web-companies and web-offices exactly.",
        "Forgot-password success/error states match the other two portals.",
      ],
      testScenarios: [
        "Run the same auth test cases used for web-companies and web-offices against web-management and confirm identical behavior apart from the role field.",
      ],
    },
  ],
};
