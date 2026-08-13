import { Localized } from "./types";

export interface AppVersion {
  name: Localized<string>;
  packageName: string;
  version: string;
  platform: Localized<string>;
  notes: Localized<string>;
}

// Sourced from each app's package.json / app.json. Update alongside version bumps —
// there's no live introspection here.
export const appVersions: AppVersion[] = [
  {
    name: { en: "Mobile App", ar: "تطبيق الجوال" },
    packageName: "buyootna",
    version: "1.1.0",
    platform: {
      en: "iOS & Android (Expo SDK ~54.0.33)",
      ar: "iOS و Android (Expo SDK ~54.0.33)",
    },
    notes: {
      en: "Bundle id com.youssefusfdev.buyootna. No buildNumber/versionCode is set in app.json — check the EAS Build dashboard for the actual store build number tied to a given release, don't infer it from this version string alone.",
      ar: "معرّف الحزمة com.youssefusfdev.buyootna. لا يوجد buildNumber/versionCode محدد في app.json — راجع لوحة EAS Build لمعرفة رقم البناء الفعلي في المتجر المرتبط بإصدار معيّن، ولا تستنتجه من رقم الإصدار هذا وحده.",
    },
  },
  {
    name: { en: "API", ar: "واجهة البرمجة (API)" },
    packageName: "api",
    version: "0.0.1",
    platform: { en: "NestJS backend", ar: "الواجهة الخلفية (NestJS)" },
    notes: {
      en: "Not bumped per release. Production deploys automatically on every push to main via the CD pipeline (.github/workflows/cd.yml) — the deployed git commit SHA on main is the real source of truth for 'what's in prod right now', not this version number.",
      ar: "لا يتم رفع رقمه مع كل إصدار. ينشر تلقائياً في الإنتاج مع كل push إلى main عبر خط النشر المستمر (.github/workflows/cd.yml) — رقم الـ commit المنشور فعلياً على main هو المرجع الحقيقي لمعرفة \"ما هو منشور حالياً في الإنتاج\"، لا رقم الإصدار هذا.",
    },
  },
  {
    name: { en: "Web Landing", ar: "موقع الهبوط (Landing)" },
    packageName: "@buyootna/web-landing",
    version: "0.1.0",
    platform: {
      en: "Next.js (landing.buyootna.cloud)",
      ar: "Next.js (landing.buyootna.cloud)",
    },
    notes: {
      en: "Static package version, not bumped per deploy.",
      ar: "رقم إصدار ثابت في الحزمة، لا يُرفع مع كل نشر.",
    },
  },
  {
    name: { en: "Web Companies", ar: "بوابة الشركات (ويب)" },
    packageName: "@buyootna/web-companies",
    version: "0.1.0",
    platform: {
      en: "Next.js (companies.buyootna.cloud)",
      ar: "Next.js (companies.buyootna.cloud)",
    },
    notes: {
      en: "Auth-only shell today — see the Web Companies user stories.",
      ar: "هيكل مصادقة فقط حالياً — راجع قصص المستخدم الخاصة ببوابة الشركات.",
    },
  },
  {
    name: { en: "Web Offices", ar: "بوابة المكاتب العقارية (ويب)" },
    packageName: "@buyootna/web-offices",
    version: "0.1.0",
    platform: {
      en: "Next.js (offices.buyootna.cloud)",
      ar: "Next.js (offices.buyootna.cloud)",
    },
    notes: {
      en: "Auth-only shell today — see the Web Offices user stories.",
      ar: "هيكل مصادقة فقط حالياً — راجع قصص المستخدم الخاصة ببوابة المكاتب العقارية.",
    },
  },
  {
    name: { en: "Web Management", ar: "بوابة إدارة الأملاك (ويب)" },
    packageName: "@buyootna/web-management",
    version: "0.1.0",
    platform: {
      en: "Next.js (management.buyootna.cloud)",
      ar: "Next.js (management.buyootna.cloud)",
    },
    notes: {
      en: "Auth-only shell today — see the Web Management user stories.",
      ar: "هيكل مصادقة فقط حالياً — راجع قصص المستخدم الخاصة ببوابة إدارة الأملاك.",
    },
  },
  {
    name: { en: "Web Admin", ar: "لوحة تحكم المشرف (ويب)" },
    packageName: "@buyootna/web-admin",
    version: "0.1.0",
    platform: {
      en: "Next.js (admin.buyootna.cloud)",
      ar: "Next.js (admin.buyootna.cloud)",
    },
    notes: {
      en: "Most actively developed web portal — see the Web Admin user stories for what's real vs. placeholder.",
      ar: "أكثر بوابات الويب نشاطاً في التطوير — راجع قصص المستخدم الخاصة بلوحة تحكم المشرف لمعرفة ما هو فعلي وما هو نموذج أولي فقط.",
    },
  },
  {
    name: { en: "Web Docs", ar: "موقع التوثيق (ويب)" },
    packageName: "@buyootna/web-docs",
    version: "0.1.0",
    platform: {
      en: "Next.js (docs.buyootna.cloud)",
      ar: "Next.js (docs.buyootna.cloud)",
    },
    notes: { en: "This site.", ar: "هذا الموقع نفسه." },
  },
];
