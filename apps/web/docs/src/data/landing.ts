import { DocSection } from "./types";

export const landing: DocSection = {
  slug: "web-landing",
  title: "Web Landing",
  summary:
    "Next.js marketing site (apps/web/landing, port 3001): the public splash plus login/signup/forgot-password, the front door most real users and search engines will actually hit.",
  stories: [
    {
      id: "landing-marketing-splash",
      title: "Marketing splash renders correctly and links work",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify the landing splash (Arabic RTL copy describing Buyootna, with 'تسجيل الدخول'/'حساب جديد' links) renders correctly and its links route to the right auth pages, so that this is a trustworthy first impression rather than a broken landing page for real prospective users and SEO crawlers.",
      acceptanceCriteria: [
        "Page renders correctly in RTL with no mirrored/broken layout elements.",
        "'تسجيل الدخول' (login) and 'حساب جديد' (signup) links route to /auth/login and /auth/signup respectively.",
        "Page has correct metadata (title/description) for SEO — verify against what's actually set in layout.tsx.",
        "Page loads acceptably fast and without console errors on both desktop and mobile-width viewports.",
      ],
      testScenarios: [
        "Load the page fresh (cleared cache) and confirm no layout shift/flash of unstyled content, and no console errors.",
        "Click both CTAs and confirm correct destination.",
        "Inspect page <title> and meta description in dev tools/view-source and confirm they match the intended marketing copy (not a generic 'Next.js App' default).",
        "Test at a narrow mobile viewport width and confirm RTL layout doesn't overflow or clip text.",
      ],
    },
    {
      id: "landing-signup-role-picker",
      title: "Signup's manual role picker (INDIVIDUAL/COMPANY/OFFICE) submits the selected role correctly",
      priority: "P0",
      story:
        "As a QA engineer, I want to verify that, unlike the companies/offices/management portals (which hardcode a defaultRole), the landing site's SignupForm lets the user pick INDIVIDUAL/COMPANY/OFFICE and correctly submits whichever role was actually selected, so that a general public visitor signing up here ends up with the account type they intended.",
      acceptanceCriteria: [
        "Selecting each of the 3 role options changes what's submitted to auth/register — verified via network inspection, not just UI state.",
        "The default/pre-selected role (if any) is sensible for a general-audience landing page (most likely INDIVIDUAL).",
        "Switching the role selection after filling in other fields doesn't clear already-entered data unnecessarily.",
      ],
      testScenarios: [
        "Sign up 3 separate test accounts, one per role option, and confirm via admin /users each ends up with the correct role.",
        "Fill in name/email/phone, then change the role picker, and confirm the other fields aren't wiped.",
        "Confirm the default selection on page load matches product intent (spot-check with whoever owns the marketing site).",
      ],
    },
    {
      id: "landing-auth-field-rules",
      title: "Signup/login field requirements match the documented (non-zod) web rules",
      priority: "P1",
      story:
        "As a QA engineer, I want to verify the landing signup form's required fields (name*, phone*, password*, confirmPassword*, with email and whatsapp optional) and the plain non-empty/match-only validation (no zod regex, unlike mobile) behave as documented, so that real users signing up on the public site aren't blocked by mismatched expectations between mobile and web validation.",
      acceptanceCriteria: [
        "Submitting without name, phone, password, or confirmPassword is blocked client-side with visible errors; email and whatsapp can be left blank.",
        "Password and confirmPassword must match exactly (case-sensitive) or submission is blocked.",
        "Any phone number format is currently accepted (no Kuwaiti-number regex enforced on web) — confirm this matches product's actual intent for the public-facing site.",
        "Login accepts any non-empty identifier (email or phone) plus password combination client-side, deferring real validation to the server.",
      ],
      testScenarios: [
        "Submit the signup form with each required field individually blank and confirm each triggers its own visible error.",
        "Submit with email and whatsapp blank and confirm the form proceeds (they're optional).",
        "Enter a clearly invalid phone format (e.g. '123') and confirm whether it's blocked or accepted — flag to product if accepted, since this diverges from the mobile app's stricter rule.",
        "Submit login with an obviously malformed identifier and confirm the client doesn't block it, then confirm the server correctly rejects it with a clear error message rather than a generic failure.",
      ],
    },
  ],
};
