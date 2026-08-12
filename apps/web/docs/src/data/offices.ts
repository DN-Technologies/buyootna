import { DocSection } from "./types";

export const offices: DocSection = {
  slug: "web-offices",
  title: "Web Offices",
  summary:
    "Next.js real-estate office/agency portal (apps/web/offices, port 3003). Mirrors web-companies exactly today: a splash page plus login/signup/forgot-password on shared @buyootna/ui forms. No office dashboard exists yet.",
  stories: [
    {
      id: "offices-shell-scope",
      title: "Portal is correctly scoped to an auth-only shell (known gap)",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify that apps/web/offices currently only exposes the splash page and the three auth routes, so that this is tracked as expected current scope, mirroring web-companies, rather than filed as a missing-dashboard bug.",
      acceptanceCriteria: [
        "/ shows the 'بيوتنا للمكاتب' splash with working links to login/signup.",
        "No office-listing or agency-management routes exist yet; any such link from the splash would be a regression against current scope.",
        "This story should be replaced with real dashboard coverage once an office dashboard ships.",
      ],
      testScenarios: [
        "Crawl all links from the splash page and confirm none 404 and none point to unbuilt routes.",
        "Deep-link a plausible dashboard URL and confirm a clean 404, not a partially-rendered broken page.",
      ],
    },
    {
      id: "offices-signup-role",
      title: "Signup correctly defaults to and submits the OFFICE role",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify SignupForm here is configured with defaultRole=\"OFFICE\" and actually submits OFFICE to POST auth/register, so that an agency signing up through this portal isn't misprovisioned as an individual or company account.",
      acceptanceCriteria: [
        "Signup does not require the user to pick a role manually — OFFICE is implicit for this portal.",
        "The network request to auth/register includes role: \"OFFICE\".",
        "The resulting account shows as role OFFICE in the admin /users table, and correctly renders OfficeProfileOverview when viewed there.",
      ],
      testScenarios: [
        "Complete signup and confirm via network inspector or admin panel that the created account is OFFICE, not COMPANY or INDIVIDUAL.",
        "Cross-check against a company signup done via web-companies in the same test session to confirm no role cross-wiring between the two portals.",
      ],
    },
    {
      id: "offices-shared-form-parity",
      title: "Shared form behavior stays in parity with web-companies",
      priority: "P2",
      story:
        "As a QA engineer, I want to verify that because web-offices and web-companies both consume the same @buyootna/ui LoginForm/SignupForm/ForgotPasswordForm, any bug fix or regression found in one portal's auth forms is checked against the other, so that a fix applied to one doesn't leave the shared-component bug live in its sibling portal.",
      acceptanceCriteria: [
        "Any validation, styling, or submission-flow bug found in web-companies' auth forms is re-tested against web-offices (and vice versa) before being closed.",
        "The only expected differences between the two portals' auth flows are the defaultRole value and the splash copy/branding.",
      ],
      testScenarios: [
        "Run the exact same auth test cases (companies-shared-form-validation, companies-forgot-password) against web-offices and confirm identical behavior aside from role and copy.",
        "If a fix lands in packages/ui for one of these forms, re-run this parity check across both companies and offices portals.",
      ],
    },
  ],
};
