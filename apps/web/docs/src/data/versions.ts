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
    version: "1.5.0",
    platform: {
      en: "iOS & Android (Expo SDK ~54.0.33)",
      ar: "iOS و Android (Expo SDK ~54.0.33)",
    },
    notes: {
      en: "The app version lives in apps/mobile/app.config.ts (package.json's is stale). iOS bundle com.constyoussef.buyootna (build 10 on TestFlight); Android package com.constyoussef.buyootna.login (versionCode 4 built on EAS). 1.5.0 is a native release (video tours, voice notes, the chat notification tone, camera / microphone permissions); its OTA updates target runtime 1.5.0, while builds still on 1.4.0 keep receiving runtime-1.4.0 updates — the latest production OTA was published from main (81cec03) on 2026-09-29. Build numbers auto-increment on EAS; check the EAS dashboard for the build tied to a report.",
      ar: "رقم إصدار التطبيق موجود في apps/mobile/app.config.ts (رقم package.json قديم). معرّف iOS هو com.constyoussef.buyootna (البناء 10 على TestFlight)؛ وحزمة Android هي com.constyoussef.buyootna.login (versionCode 4 مبني على EAS). الإصدار 1.5.0 إصدار أصلي (فيديو، رسائل صوتية، نغمة إشعارات المحادثة، أذونات الكاميرا والميكروفون)، وتحديثات OTA له تستهدف 1.5.0، بينما تبقى النسخ التي على 1.4.0 تستقبل تحديثات 1.4.0 — آخر تحديث OTA للإنتاج نُشر من main (81cec03) بتاريخ 2026-09-29. أرقام البناء تزداد تلقائياً على EAS؛ راجع لوحة EAS لمعرفة البناء المرتبط بالبلاغ.",
    },
  },
  {
    name: { en: "API", ar: "واجهة البرمجة (API)" },
    packageName: "api",
    version: "0.0.1",
    platform: { en: "NestJS backend", ar: "الواجهة الخلفية (NestJS)" },
    notes: {
      en: "Not bumped per release. Production is deployed by manually running the CD Pipeline (workflow_dispatch in .github/workflows/cd.yml) on main; it also applies pending Prisma migrations. The commit that was deployed is the source of truth for what's in production, not this number.",
      ar: "لا يتم رفع رقمه مع كل إصدار. يُنشر الإنتاج بتشغيل خط النشر CD يدوياً (workflow_dispatch في .github/workflows/cd.yml) على main، ويطبّق أيضاً ترحيلات Prisma المعلّقة. الـ commit المنشور هو المرجع لما هو موجود في الإنتاج، وليس هذا الرقم.",
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
    notes: {
      en: "This site. Sign-in with a password per role (QA, Developer, UI/UX, Client/Management, Admin); stories live in apps/web/docs/src/data and are updated in the same PR as the code they describe.",
      ar: "هذا الموقع. الدخول بكلمة مرور لكل دور (ضمان الجودة، المطور، مصمم الواجهات، العميل/الإدارة، المسؤول)؛ القصص موجودة في apps/web/docs/src/data وتُحدَّث في نفس طلب الدمج مع الكود الذي تصفه.",
    },
  },
];
