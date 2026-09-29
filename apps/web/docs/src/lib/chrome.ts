import { Localized } from "@/data/types";

interface ChromeStrings {
  storyUpdatedIn: string;
  loginTitle: string;
  loginSubtitle: string;
  loginRole: string;
  loginPassword: string;
  loginName: string;
  loginNamePlaceholder: string;
  loginSubmit: string;
  loginFailed: string;
  signedInAs: string;
  logout: string;
  navAdminPasswords: string;
  passwordsTitle: string;
  passwordsDescription: string;
  passwordsRole: string;
  passwordsNew: string;
  passwordsSave: string;
  passwordsSaved: string;
  passwordsLastSet: string;
  passwordsNeverSet: string;
  passwordsMinLength: string;
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
    storyUpdatedIn: "Updated in",
    loginTitle: "Sign in to Buyootna Docs",
    loginSubtitle: "Choose your role, enter its password and your name. Your name is shown on everything you record.",
    loginRole: "Role",
    loginPassword: "Password",
    loginName: "Your name",
    loginNamePlaceholder: "e.g. Sara (QA)",
    loginSubmit: "Sign in",
    loginFailed: "Could not sign in",
    signedInAs: "Signed in as",
    logout: "Sign out",
    navAdminPasswords: "Role passwords",
    passwordsTitle: "Role passwords",
    passwordsDescription: "Set or change the password for each role. Changing a password signs everyone using that role out immediately.",
    passwordsRole: "Role",
    passwordsNew: "New password",
    passwordsSave: "Save password",
    passwordsSaved: "Password saved",
    passwordsLastSet: "Last set",
    passwordsNeverSet: "Not set yet",
    passwordsMinLength: "At least 10 characters",
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
      "— the web apps sit at the Next.js default (0.1.0) and the API at 0.0.1; only the mobile app's version (see app.config.ts) tracks real store releases. For the API and web apps, the commit deployed by the manual CD run on main is the source of truth for what's in production — cite that commit, not this table, when reporting a bug against a web/API build.",
  },
  ar: {
    storyUpdatedIn: "حُدّث في",
    loginTitle: "تسجيل الدخول إلى توثيق بيوتنا",
    loginSubtitle: "اختر دورك، وأدخل كلمة مروره واسمك. يظهر اسمك على كل ما تسجله.",
    loginRole: "الدور",
    loginPassword: "كلمة المرور",
    loginName: "اسمك",
    loginNamePlaceholder: "مثال: سارة (ضمان الجودة)",
    loginSubmit: "تسجيل الدخول",
    loginFailed: "تعذر تسجيل الدخول",
    signedInAs: "مسجل الدخول باسم",
    logout: "تسجيل الخروج",
    navAdminPasswords: "كلمات مرور الأدوار",
    passwordsTitle: "كلمات مرور الأدوار",
    passwordsDescription: "عيّن أو غيّر كلمة المرور لكل دور. تغيير كلمة المرور يسجّل خروج كل من يستخدم ذلك الدور فوراً.",
    passwordsRole: "الدور",
    passwordsNew: "كلمة المرور الجديدة",
    passwordsSave: "حفظ كلمة المرور",
    passwordsSaved: "تم حفظ كلمة المرور",
    passwordsLastSet: "آخر تعيين",
    passwordsNeverSet: "لم تُعيَّن بعد",
    passwordsMinLength: "10 أحرف على الأقل",
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
      "— تطبيقات الويب على القيمة الافتراضية لـ Next.js (0.1.0) وواجهة البرمجة على 0.0.1؛ فقط إصدار تطبيق الجوال (راجع app.config.ts) يتبع إصدارات المتاجر الفعلية. بالنسبة لواجهة البرمجة والويب، الـ commit المنشور عبر التشغيل اليدوي لخط النشر على main هو المرجع لما في الإنتاج — اذكر ذلك الـ commit، لا هذا الجدول، عند الإبلاغ عن خطأ في نسخة ويب أو واجهة برمجة.",
  },
};
