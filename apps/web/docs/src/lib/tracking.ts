import type { Localized } from "@/data/types";
import type { DocsRole } from "./access";

export const RESULT_STATUSES = [
  "PASS",
  "FAIL",
  "BLOCKED",
  "NOT_RUN",
  "READY_FOR_RETEST",
] as const;
export type ResultStatus = (typeof RESULT_STATUSES)[number];

export interface DocsRelease {
  id: string;
  name: string;
  platform: string | null;
  notes: string | null;
  status: "OPEN" | "CLOSED";
  createdBy: string;
  createdAt: string;
  closedAt: string | null;
}

export interface StoryResult {
  id: string;
  storyId: string;
  status: ResultStatus;
  note: string | null;
  bugUrl: string | null;
  attachments: string[];
  authorName: string;
  authorRole: DocsRole;
  createdAt: string;
}

export interface StoryComment {
  id: string;
  storyId: string;
  kind: "COMMENT" | "DESIGN_MISMATCH";
  body: string;
  attachments: string[];
  authorName: string;
  authorRole: DocsRole;
  createdAt: string;
}

export const RELEASE_COOKIE = "docs_release";

export const STATUS_LABELS: Record<ResultStatus | "UNTESTED", Localized<string>> = {
  PASS: { en: "Passed", ar: "نجح" },
  FAIL: { en: "Failed", ar: "فشل" },
  BLOCKED: { en: "Blocked", ar: "متعثر" },
  NOT_RUN: { en: "Not run", ar: "لم يُنفَّذ" },
  READY_FOR_RETEST: { en: "Ready to retest", ar: "جاهز لإعادة الاختبار" },
  UNTESTED: { en: "Not tested yet", ar: "لم يُختبر بعد" },
};

export const STATUS_STYLES: Record<ResultStatus | "UNTESTED", string> = {
  PASS: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  FAIL: "border-red-500/40 bg-red-500/10 text-red-300",
  BLOCKED: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  NOT_RUN: "border-[#2A3A47] bg-[#0F1E2E] text-[#B9C3CC]",
  READY_FOR_RETEST: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  UNTESTED: "border-dashed border-[#2A3A47] text-[#7C8894]",
};

/** Which statuses a role may record (the API enforces the same rules). */
export function recordableStatuses(role: DocsRole): ResultStatus[] {
  if (role === "QA") return ["PASS", "FAIL", "BLOCKED", "NOT_RUN"];
  if (role === "ADMIN") return [...RESULT_STATUSES];
  if (role === "DEVELOPER") return ["READY_FOR_RETEST"];
  return [];
}

export const canComment = (role: DocsRole) => role !== "CLIENT";
export const canAddDesignNote = (role: DocsRole) =>
  role === "UIUX" || role === "ADMIN";

/** UI strings for test tracking (kept apart from chrome.ts's page chrome). */
export const trackingText = {
  en: {
    releasesNav: "Releases",
    releasePicker: "Testing release",
    noRelease: "No release yet",
    closed: "closed",
    recordResult: "Record result",
    readyToRetest: "Mark ready to retest",
    comment: "Comment",
    designNote: "Design note",
    history: "History & comments",
    hideHistory: "Hide history",
    status: "Status",
    note: "Note",
    notePlaceholderFail: "What failed? Steps, expected vs actual",
    bugUrl: "Bug link",
    screenshots: "Screenshots",
    addScreenshot: "Add screenshot",
    save: "Save",
    cancel: "Cancel",
    saving: "Saving…",
    nothingYet: "Nothing recorded yet.",
    by: "by",
    releaseClosedNote: "This release is closed — results are read-only.",
    releasesTitle: "Releases",
    releasesDescription: "Each release is one round of testing. Progress counts every story's latest result.",
    newRelease: "New release",
    releaseName: "Name",
    releaseNamePlaceholder: "e.g. 1.4.0 OTA 2026-09-29",
    platform: "Platform",
    create: "Create",
    closeRelease: "Close",
    reopenRelease: "Reopen",
    passed: "passed",
    ofStories: "of stories",
    openIssues: "Failing or blocked",
    noIssues: "Nothing failing or blocked.",
  },
  ar: {
    releasesNav: "الإصدارات",
    releasePicker: "إصدار الاختبار",
    noRelease: "لا يوجد إصدار بعد",
    closed: "مغلق",
    recordResult: "تسجيل نتيجة",
    readyToRetest: "جاهز لإعادة الاختبار",
    comment: "تعليق",
    designNote: "ملاحظة تصميم",
    history: "السجل والتعليقات",
    hideHistory: "إخفاء السجل",
    status: "الحالة",
    note: "ملاحظة",
    notePlaceholderFail: "ما الذي فشل؟ الخطوات والمتوقع مقابل الفعلي",
    bugUrl: "رابط البلاغ",
    screenshots: "لقطات الشاشة",
    addScreenshot: "إضافة لقطة",
    save: "حفظ",
    cancel: "إلغاء",
    saving: "جارٍ الحفظ…",
    nothingYet: "لم يُسجَّل شيء بعد.",
    by: "بواسطة",
    releaseClosedNote: "هذا الإصدار مغلق — النتائج للقراءة فقط.",
    releasesTitle: "الإصدارات",
    releasesDescription: "كل إصدار جولة اختبار واحدة. يُحسب التقدم من آخر نتيجة لكل قصة.",
    newRelease: "إصدار جديد",
    releaseName: "الاسم",
    releaseNamePlaceholder: "مثال: 1.4.0 OTA 2026-09-29",
    platform: "المنصة",
    create: "إنشاء",
    closeRelease: "إغلاق",
    reopenRelease: "إعادة فتح",
    passed: "ناجحة",
    ofStories: "من القصص",
    openIssues: "فاشلة أو متعثرة",
    noIssues: "لا شيء فاشل أو متعثر.",
  },
} as const;
