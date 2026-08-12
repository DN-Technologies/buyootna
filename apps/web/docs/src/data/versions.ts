export interface AppVersion {
  name: string;
  packageName: string;
  version: string;
  platform: string;
  notes: string;
}

// Sourced from each app's package.json / app.json. Update alongside version bumps —
// there's no live introspection here.
export const appVersions: AppVersion[] = [
  {
    name: "Mobile App",
    packageName: "buyootna",
    version: "1.1.0",
    platform: "iOS & Android (Expo SDK ~54.0.33)",
    notes:
      "Bundle id com.youssefusfdev.buyootna. No buildNumber/versionCode is set in app.json — check the EAS Build dashboard for the actual store build number tied to a given release, don't infer it from this version string alone.",
  },
  {
    name: "API",
    packageName: "api",
    version: "0.0.1",
    platform: "NestJS backend",
    notes:
      "Not bumped per release. Production deploys automatically on every push to main via the CD pipeline (.github/workflows/cd.yml) — the deployed git commit SHA on main is the real source of truth for 'what's in prod right now', not this version number.",
  },
  {
    name: "Web Landing",
    packageName: "@buyootna/web-landing",
    version: "0.1.0",
    platform: "Next.js (landing.buyootna.cloud)",
    notes: "Static package version, not bumped per deploy.",
  },
  {
    name: "Web Companies",
    packageName: "@buyootna/web-companies",
    version: "0.1.0",
    platform: "Next.js (companies.buyootna.cloud)",
    notes: "Auth-only shell today — see the Web Companies user stories.",
  },
  {
    name: "Web Offices",
    packageName: "@buyootna/web-offices",
    version: "0.1.0",
    platform: "Next.js (offices.buyootna.cloud)",
    notes: "Auth-only shell today — see the Web Offices user stories.",
  },
  {
    name: "Web Management",
    packageName: "@buyootna/web-management",
    version: "0.1.0",
    platform: "Next.js (management.buyootna.cloud)",
    notes: "Auth-only shell today — see the Web Management user stories.",
  },
  {
    name: "Web Admin",
    packageName: "@buyootna/web-admin",
    version: "0.1.0",
    platform: "Next.js (admin.buyootna.cloud)",
    notes: "Most actively developed web portal — see the Web Admin user stories for what's real vs. placeholder.",
  },
  {
    name: "Web Docs",
    packageName: "@buyootna/web-docs",
    version: "0.1.0",
    platform: "Next.js (docs.buyootna.cloud)",
    notes: "This site.",
  },
];
