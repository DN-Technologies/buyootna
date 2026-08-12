import { DocSection } from "./types";

export const companies: DocSection = {
  slug: "web-companies",
  title: "Web Companies",
  summary:
    "Next.js corporate portal (apps/web/companies, port 3002). Currently an auth-only shell: a splash page plus login/signup/forgot-password, all reusing the shared @buyootna/ui forms. No company dashboard exists yet.",
  stories: [
    {
      id: "companies-shell-scope",
      title: "Portal is correctly scoped to an auth-only shell (known gap)",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify that apps/web/companies currently only exposes the splash page and the three auth routes, so that this is tracked as the expected current scope rather than QA repeatedly filing 'missing dashboard' bugs against a portal that hasn't been built yet.",
      acceptanceCriteria: [
        "/ shows the 'بيوتنا للشركات' splash with working links to login/signup.",
        "No dashboard, property-management, or service-management routes exist or are linked from the splash — any such link would be a regression against current scope, not a missing feature to test.",
        "This story should be replaced with real dashboard test coverage once a company dashboard ships.",
      ],
      testScenarios: [
        "Crawl all links from the splash page and confirm none 404 and none point to unbuilt dashboard routes.",
        "Attempt to guess/deep-link a plausible dashboard URL (e.g. /dashboard, /properties) and confirm it correctly 404s rather than partially rendering a broken page.",
      ],
    },
    {
      id: "companies-signup-role",
      title: "Signup correctly defaults to and submits the COMPANY role",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify that SignupForm on this portal is configured with defaultRole=\"COMPANY\" and actually submits COMPANY as the role to POST auth/register, so that a company signing up through this portal doesn't accidentally get provisioned as an individual account.",
      acceptanceCriteria: [
        "The signup form does not require the user to manually pick a role — COMPANY is implicit for this portal.",
        "The network request to auth/register includes role: \"COMPANY\".",
        "A completed signup results in a user whose role/identity is COMPANY when inspected via the admin /users table.",
      ],
      testScenarios: [
        "Complete signup on this portal and verify (via network inspector or admin panel) the created account is role COMPANY, not INDIVIDUAL.",
        "Compare the created account's role against the same signup flow run on apps/web/offices to confirm the two portals don't cross-wire roles.",
      ],
    },
    {
      id: "companies-shared-form-validation",
      title: "Shared auth forms validate consistently with the mobile app's rules",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify that LoginForm/SignupForm/ForgotPasswordForm from @buyootna/ui only enforce plain non-empty/match checks (no zod, no length/regex rules) here, unlike mobile's zod schemas, so that this known validation gap between web and mobile is documented rather than assumed to match.",
      acceptanceCriteria: [
        "Signup accepts a password as short as 1 character and any phone format, since no zod/regex validation runs on web.",
        "Login accepts any non-empty identifier + password combination for client-side validation (server-side auth still enforces actual credentials).",
        "Password/confirm-password mismatch is still caught client-side even without zod.",
      ],
      testScenarios: [
        "Attempt signup with a 1-character password and a non-Kuwaiti phone number format — confirm it's accepted client-side (contrast with mobile-auth-validation, where the same input is rejected).",
        "Submit signup with password and confirm-password mismatched — confirm client-side rejection before any network call.",
        "File a cross-platform consistency ticket if product wants web to match mobile's stricter zod rules — this story exists to make the current gap explicit, not to silently 'pass' it as fine.",
      ],
    },
    {
      id: "companies-forgot-password",
      title: "Forgot-password flow reaches a clear success state",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify ForgotPasswordForm posts to auth/forgot-password and shows a clear 'check your email' success state, so that a company admin who forgets their password isn't left wondering whether the request went through.",
      acceptanceCriteria: [
        "Submitting a registered email shows the success state.",
        "Submitting an unregistered email either shows the same success state (to avoid account enumeration) or a clear, non-revealing error — confirm which behavior is intended and that it's consistent.",
        "The success state doesn't allow indefinite resubmission spam without at least a basic client-side debounce/disable-on-submit.",
      ],
      testScenarios: [
        "Submit with a known-registered email and confirm the success message appears and (separately, via email/inbox) that a reset email/OTP actually arrives.",
        "Submit with an obviously fake email and compare the response/UI to the registered-email case for enumeration risk.",
        "Rapidly click submit multiple times and confirm no duplicate emails/OTPs are triggered by the UI (button disables during submission).",
      ],
    },
  ],
};
