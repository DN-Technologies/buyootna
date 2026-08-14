import { Localized } from "@/data/types";

interface ChromeStrings {
  appName: string;
  appTagline: string;
  navGroupMobile: string;
  navGroupWeb: string;
  navGroupResources: string;
  navPostman: string;
  navVersions: string;
  homeEyebrow: string;
  homeTitle: string;
  homeDescription: string;
  homeStatsSections: string;
  homeStatsStories: string;
  homeResources: string;
  homePostmanCardSummary: string;
  homeVersionsCardSummary: string;
  storyIdTooltip: string;
  figmaViewFrame: string;
  figmaNoFrame: string;
  figmaNoFrameTooltip: string;
  acceptanceCriteria: string;
  testScenarios: string;
  acTooltip: string;
  tcTooltip: string;
  languageToggleLabel: string;
  postmanTitle: string;
  postmanDescriptionPre: string;
  postmanDescriptionCode: string;
  postmanDescriptionPost: string;
  postmanDownload: string;
  postmanSetupTitle: string;
  postmanStep1Title: string;
  postmanStep1Body: string;
  postmanStep2Title: string;
  postmanStep2Body: string;
  postmanStep3Title: string;
  postmanStep3Body: string;
  postmanStep4Title: string;
  postmanStep4Body: string;
  postmanStep5Title: string;
  postmanStep5Body: string;
  postmanSyncNoteBold: string;
  postmanSyncNotePrefix: string;
  postmanSyncNoteScript: string;
  postmanSyncNoteMid: string;
  postmanSyncNoteCommand: string;
  postmanSyncNoteSuffix: string;
  versionsTitle: string;
  versionsDescription: string;
  versionsColApp: string;
  versionsColVersion: string;
  versionsColPlatform: string;
  versionsColNotes: string;
  versionsWarningTitle: string;
  versionsWarningBody: string;
}

export const chrome: Localized<ChromeStrings> = {
  en: {
    appName: "Buyootna QA Docs",
    appTagline: "docs.buyootna.cloud",
    navGroupMobile: "Mobile",
    navGroupWeb: "Web & API",
    navGroupResources: "Resources",
    navPostman: "Postman Collection",
    navVersions: "App Versions",
    homeEyebrow: "QA User Stories",
    homeTitle: "Buyootna QA Docs",
    homeDescription:
      "User stories and test scenarios for QA engineers testing the Buyootna platform — the mobile app, every web portal, and the API. Each story is grounded in features that actually exist in the codebase today, including known stubs and placeholders that should be tracked as gaps rather than re-filed as new bugs.",
    homeStatsSections: "sections",
    homeStatsStories: "user stories",
    homeResources: "Resources",
    homePostmanCardSummary:
      "85 requests generated straight from the live OpenAPI spec — auth, properties, chat, payments, and more.",
    homeVersionsCardSummary:
      "Current version per platform (mobile, each web app, API) — what QA should be testing against right now.",
    storyIdTooltip:
      "Stable story ID — cite this in bug reports and regression checklists",
    figmaViewFrame: "View Figma frame",
    figmaNoFrame: "No frame linked yet",
    figmaNoFrameTooltip:
      "No frame linked yet for this story — opens the general Figma file",
    acceptanceCriteria: "Acceptance Criteria",
    testScenarios: "Test Scenarios",
    acTooltip: "Acceptance criterion ID — cite this when a criterion isn't met",
    tcTooltip: "Test case ID — cite this in bug reports and regression runs",
    languageToggleLabel: "Language",
    postmanTitle: "Postman Collection",
    postmanDescriptionPre: "A real Postman collection generated from the NestJS controllers and DTOs in ",
    postmanDescriptionCode: "apps/api",
    postmanDescriptionPost:
      " — generated straight from the live OpenAPI spec apps/api serves, 21 folders, 85 requests, matching the routes and request bodies QA stories in the API section reference.",
    postmanDownload: "Download buyootna-api.postman_collection.json",
    postmanSetupTitle: "Setup",
    postmanStep1Title: "Download the collection",
    postmanStep1Body:
      "Click the download button above, or grab it directly from the running docs site at /buyootna-api.postman_collection.json.",
    postmanStep2Title: "Import into Postman",
    postmanStep2Body:
      'Postman → Import → File → select the downloaded .json. It creates a "Buyootna API" collection with 21 folders covering every controller in apps/api.',
    postmanStep3Title: "Set collection variables",
    postmanStep3Body:
      "Open the collection's Variables tab and set baseUrl (e.g. http://localhost:8000 for local, or the api.buyootna.cloud origin for staging/prod).",
    postmanStep4Title: "Get an access token",
    postmanStep4Body:
      "Run Auth → Login with a real identifier/password. Copy the JWT from the response into the accessToken collection variable — every other request inherits Bearer auth from it automatically.",
    postmanStep5Title: "Fill in path variables as you go",
    postmanStep5Body:
      "Requests with a URL segment like :propertyId or :reviewId show it in Postman's Path Variables tab, per request — fill it in from whatever record you're currently testing against.",
    postmanSyncNoteBold: "Always in sync:",
    postmanSyncNotePrefix: " the collection is generated from the live OpenAPI spec apps/api serves (",
    postmanSyncNoteScript: "apps/web/docs/scripts/generate-postman-collection.mjs",
    postmanSyncNoteMid:
      "), not hand-maintained — it reflects the real controllers/DTOs automatically. Start the API dev server, then re-run ",
    postmanSyncNoteCommand: "node scripts/generate-postman-collection.mjs",
    postmanSyncNoteSuffix: " any time you want a fresh copy of the downloadable file.",
    versionsTitle: "App Versions",
    versionsDescription:
      "Current version per platform, sourced from each app's package.json/app.json. This is what QA should be testing against right now.",
    versionsColApp: "App",
    versionsColVersion: "Version",
    versionsColPlatform: "Platform",
    versionsColNotes: "Notes",
    versionsWarningTitle: "Versions aren't currently bumped per release",
    versionsWarningBody:
      "— every web app sits at the Next.js scaffold default (0.1.0) and the API at 0.0.1, while only the mobile app's version (1.1.0) reflects real app-store submissions. Because the CD pipeline deploys straight from main on every push, the git commit SHA at deploy time is the actual source of truth for \"what's in production\" for the API and web apps — reference that commit (not this table) when filing a bug against a specific web/API build. Recommend adopting real semver bumps (or at least deploy-time commit tagging visible in the UI) if precise build-to-bug-report traceability becomes a priority.",
  },
  ar: {
    appName: "توثيق ضمان الجودة - بيوتنا",
    appTagline: "docs.buyootna.cloud",
    navGroupMobile: "تطبيق الجوال",
    navGroupWeb: "الويب وواجهة البرمجة",
    navGroupResources: "الموارد",
    navPostman: "مجموعة Postman",
    navVersions: "إصدارات التطبيق",
    homeEyebrow: "قصص المستخدم لفريق الجودة",
    homeTitle: "توثيق ضمان الجودة - بيوتنا",
    homeDescription:
      "قصص مستخدم وسيناريوهات اختبار لمهندسي ضمان الجودة الذين يختبرون منصة بيوتنا — تطبيق الجوال، وكل بوابات الويب، وواجهة البرمجة (API). كل قصة مبنية على ميزات موجودة فعلياً في الكود اليوم، بما في ذلك النواقص والواجهات غير المكتملة المعروفة التي يجب تتبعها كفجوات موثقة، لا الإبلاغ عنها كأخطاء جديدة.",
    homeStatsSections: "أقسام",
    homeStatsStories: "قصة مستخدم",
    homeResources: "الموارد",
    homePostmanCardSummary:
      "85 طلباً تم توليدها مباشرةً من مواصفة OpenAPI الحيّة — المصادقة، العقارات، المحادثات، المدفوعات، وغيرها.",
    homeVersionsCardSummary:
      "الإصدار الحالي لكل منصة (تطبيق الجوال، كل تطبيق ويب، وواجهة البرمجة) — وهو ما يجب على فريق الجودة اختباره حالياً.",
    storyIdTooltip: "معرّف ثابت للقصة — استخدمه عند الإبلاغ عن الأخطاء وفي قوائم اختبار الانحدار",
    figmaViewFrame: "عرض إطار Figma",
    figmaNoFrame: "لم يتم ربط إطار بعد",
    figmaNoFrameTooltip: "لم يتم ربط إطار Figma بهذه القصة بعد — يفتح ملف Figma العام",
    acceptanceCriteria: "معايير القبول",
    testScenarios: "سيناريوهات الاختبار",
    acTooltip: "معرّف معيار القبول — استخدمه عند الإبلاغ عن عدم تحقق معيار معيّن",
    tcTooltip: "معرّف حالة الاختبار — استخدمه عند الإبلاغ عن الأخطاء وفي جولات اختبار الانحدار",
    languageToggleLabel: "اللغة",
    postmanTitle: "مجموعة Postman",
    postmanDescriptionPre: "مجموعة Postman حقيقية تم توليدها من متحكمات وكائنات نقل البيانات (DTOs) الخاصة بـ NestJS في ",
    postmanDescriptionCode: "apps/api",
    postmanDescriptionPost:
      " — تم توليدها مباشرةً من مواصفة OpenAPI الحيّة التي تقدمها apps/api، وتحتوي على 21 مجلداً و85 طلباً، مطابقة للمسارات وهياكل الطلبات التي تشير إليها قصص الجودة في قسم واجهة البرمجة.",
    postmanDownload: "تنزيل buyootna-api.postman_collection.json",
    postmanSetupTitle: "الإعداد",
    postmanStep1Title: "تنزيل المجموعة",
    postmanStep1Body:
      "اضغط زر التنزيل أعلاه، أو احصل عليها مباشرة من موقع التوثيق الحيّ عبر /buyootna-api.postman_collection.json.",
    postmanStep2Title: "الاستيراد إلى Postman",
    postmanStep2Body:
      'Postman ← Import ← File ← اختر ملف الـ .json الذي تم تنزيله. سينشئ هذا مجموعة باسم "Buyootna API" تحتوي على 21 مجلداً تغطي كل متحكم (controller) في apps/api.',
    postmanStep3Title: "ضبط متغيرات المجموعة",
    postmanStep3Body:
      "افتح تبويب Variables الخاص بالمجموعة واضبط baseUrl (مثلاً http://localhost:8000 محلياً، أو نطاق api.buyootna.cloud للتجربة أو الإنتاج).",
    postmanStep4Title: "الحصول على رمز وصول (Access Token)",
    postmanStep4Body:
      "نفّذ طلب Auth ← Login ببيانات دخول حقيقية. انسخ الـ JWT من الاستجابة إلى متغير المجموعة accessToken — ستُطبَّق مصادقة Bearer تلقائياً على بقية الطلبات.",
    postmanStep5Title: "املأ متغيرات المسار أثناء الاستخدام",
    postmanStep5Body:
      "الطلبات التي تحتوي على جزء مسار مثل :propertyId أو :reviewId تعرضه في تبويب Path Variables الخاص بكل طلب على حدة — املأه حسب السجل الذي تختبره حالياً.",
    postmanSyncNoteBold: "متزامنة دائماً:",
    postmanSyncNotePrefix: " يتم توليد المجموعة من مواصفة OpenAPI الحيّة التي تقدمها apps/api (عبر ",
    postmanSyncNoteScript: "apps/web/docs/scripts/generate-postman-collection.mjs",
    postmanSyncNoteMid:
      ")، وليست مُصانة يدوياً — فهي تعكس المتحكمات وكائنات نقل البيانات الفعلية تلقائياً. شغّل خادم التطوير الخاص بواجهة البرمجة، ثم أعد تشغيل ",
    postmanSyncNoteCommand: "node scripts/generate-postman-collection.mjs",
    postmanSyncNoteSuffix: " في أي وقت تريد فيه نسخة محدّثة من الملف القابل للتنزيل.",
    versionsTitle: "إصدارات التطبيق",
    versionsDescription:
      "الإصدار الحالي لكل منصة، مأخوذ من ملفات package.json / app.json الخاصة بكل تطبيق. هذا ما يجب على فريق الجودة اختباره حالياً.",
    versionsColApp: "التطبيق",
    versionsColVersion: "الإصدار",
    versionsColPlatform: "المنصة",
    versionsColNotes: "ملاحظات",
    versionsWarningTitle: "لا يتم حالياً رفع أرقام الإصدارات مع كل إصدار",
    versionsWarningBody:
      "— كل تطبيقات الويب لا تزال على القيمة الافتراضية لهيكل Next.js (0.1.0) وواجهة البرمجة على 0.0.1، بينما إصدار تطبيق الجوال (1.1.0) فقط يعكس إصدارات حقيقية تم رفعها لمتاجر التطبيقات. ولأن خط النشر المستمر (CD) ينشر مباشرة من main مع كل push، فإن رقم الـ commit في git وقت النشر هو المرجع الحقيقي لمعرفة \"ما هو منشور فعلياً في الإنتاج\" بالنسبة لواجهة البرمجة وتطبيقات الويب — استخدم ذلك الـ commit (لا هذا الجدول) عند الإبلاغ عن خطأ في إصدار معيّن من الويب أو الواجهة الخلفية. يُنصح باعتماد ترقيم إصدارات حقيقي (semver) أو على الأقل إظهار رقم الـ commit وقت النشر في الواجهة، إذا أصبح تتبّع دقيق للإصدار مقابل الخطأ المُبلَّغ عنه أولوية.",
  },
};
