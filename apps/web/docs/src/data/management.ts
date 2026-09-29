import { DocSection } from "./types";

export const management: DocSection = {
  slug: "web-management",
  title: { en: "Web Management", ar: "بوابة إدارة الأملاك (ويب)" },
  summary: {
    en: 'Next.js property management portal (apps/web/management, port 3004). Same auth-only shell pattern as web-companies/web-offices, but with a likely-unfinished detail: SignupForm\'s defaultRole is currently "INDIVIDUAL", not a management-specific role.',
    ar: 'بوابة إدارة الأملاك المبنية على Next.js (apps/web/management، المنفذ 3004). نفس نمط الهيكل المقتصر على المصادقة الموجود في web-companies/web-offices، لكن مع تفصيل يُرجَّح أنه غير مكتمل: defaultRole في SignupForm هنا حالياً "INDIVIDUAL"، لا دوراً خاصاً بالإدارة.',
  },
  stories: [
    {
      id: "management-shell-scope",
      title: {
        en: "Portal is correctly scoped to an auth-only shell (known gap)",
        ar: "نطاق البوابة محصور بشكل صحيح في هيكل مصادقة فقط (فجوة معروفة)",
      },
      priority: "P1",
      story: {
        en: "Verify that apps/web/management currently only exposes the splash page and the three auth routes, so that this is tracked as expected current scope rather than filed as a missing property-manager-dashboard bug.",
        ar: "تحقق من أن apps/web/management تعرض حالياً فقط الصفحة الترحيبية ومسارات المصادقة الثلاثة، حتى يُوثَّق هذا كنطاق حالي متوقع بدلاً من أن يُبلَّغ عنه كخطأ 'لوحة تحكم مدير أملاك مفقودة'.",
      },
      acceptanceCriteria: {
        en: [
          "/ shows the 'بيوتنا للإدارة' splash with working links to login/signup.",
          "No property-management-specific routes (unit management, maintenance requests, etc.) exist yet.",
          "This story should be replaced with real dashboard coverage once a management dashboard ships.",
        ],
        ar: [
          "الصفحة / تعرض شاشة الترحيب 'بيوتنا للإدارة' مع روابط عاملة لتسجيل الدخول/التسجيل.",
          "لا توجد بعد مسارات خاصة بإدارة الأملاك (إدارة الوحدات، طلبات الصيانة، إلخ).",
          "يجب استبدال هذه القصة بتغطية اختبار حقيقية للوحة التحكم بمجرد إطلاق لوحة تحكم لإدارة الأملاك.",
        ],
      },
      testScenarios: {
        en: [
          "Crawl all links from the splash page and confirm none 404.",
          "Deep-link a plausible dashboard URL and confirm a clean 404.",
        ],
        ar: [
          "تفقّد كل الروابط من الصفحة الترحيبية وتأكد أن لا شيء منها يعطي خطأ 404.",
          "جرّب رابطاً مباشراً محتملاً للوحة التحكم وتأكد من ظهور خطأ 404 نظيف.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "management-signup-role-bug",
      title: {
        en: "Signup on the Management portal fails — it calls a removed endpoint",
        ar: "التسجيل في بوابة Management يفشل — يستدعي نقطة نهاية محذوفة",
      },
      priority: "P0",
      story: {
        en: "Broken: the portal's signup page posts to POST /auth/register with role INDIVIDUAL, which the API no longer has (production answers 404). Signup now lives at POST /users/register/individual (with an email/SMS code) and POST /users/register/company|office (multipart, with licence details). Until the page is moved to those, nobody can create an account here. Separately, decide whether management accounts should really be INDIVIDUAL.",
        ar: "معطّل: صفحة التسجيل في البوابة ترسل إلى POST /auth/register مع الدور INDIVIDUAL، وهي نقطة لم تعد موجودة في الواجهة البرمجية (الإنتاج يرد 404). التسجيل الآن عبر POST /users/register/individual (مع رمز بالبريد/SMS) و POST /users/register/company|office (بيانات متعددة الأجزاء مع الترخيص). إلى أن تُنقل الصفحة إليهما لا يمكن لأحد إنشاء حساب هنا. وبشكل منفصل، يجب تحديد ما إذا كانت حسابات الإدارة يجب أن تكون INDIVIDUAL فعلاً.",
      },
      acceptanceCriteria: {
        en: [
          "Today: submitting the form fails (404 from the API).",
          "After the fix: the form uses the right endpoint for the account type and the new account can log in on the portal.",
        ],
        ar: [
          "اليوم: إرسال النموذج يفشل (404 من الواجهة البرمجية).",
          "بعد الإصلاح: يستخدم النموذج نقطة النهاية الصحيحة لنوع الحساب ويمكن للحساب الجديد الدخول إلى البوابة.",
        ],
      },
      testScenarios: {
        en: [
          "Fill in the signup form with a new email and submit — watch the network request.",
        ],
        ar: [
          "املأ نموذج التسجيل ببريد جديد وأرسل — راقب طلب الشبكة.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "management-shared-form-parity",
      title: {
        en: "Shared auth-form behavior stays in parity with the other portal shells",
        ar: "سلوك نماذج المصادقة المشتركة يبقى متطابقاً مع هياكل البوابات الأخرى",
      },
      priority: "P2",
      story: {
        en: "Verify that, aside from the role question above, apps/web/management's auth forms behave identically to web-companies/web-offices since they share the same @buyootna/ui components, so that any shared-component fix or regression is checked across all three portals, not just the one where it was first found.",
        ar: "تحقق من أنه بصرف النظر عن مسألة الدور أعلاه، تتصرف نماذج المصادقة في apps/web/management بشكل مطابق لـ web-companies/web-offices لأنها تشترك في نفس مكوّنات @buyootna/ui، حتى يُختبر أي إصلاح أو تراجع في مكوّن مشترك على البوابات الثلاث جميعها، لا على البوابة التي اكتُشف فيها أولاً فقط.",
      },
      acceptanceCriteria: {
        en: [
          "Validation behavior (non-empty checks, password confirm match, no zod/regex) matches web-companies and web-offices exactly.",
          "Forgot-password success/error states match the other two portals.",
        ],
        ar: [
          "سلوك التحقق من الصحة (فحوصات عدم الفراغ، تطابق تأكيد كلمة المرور، دون zod/regex) مطابق تماماً لـ web-companies وweb-offices.",
          "حالتا النجاح/الخطأ في نسيت كلمة المرور مطابقتان للبوابتين الأخريين.",
        ],
      },
      testScenarios: {
        en: [
          "Run the same auth test cases used for web-companies and web-offices against web-management and confirm identical behavior apart from the role field.",
        ],
        ar: [
          "شغّل نفس حالات اختبار المصادقة المستخدمة لـ web-companies وweb-offices على web-management وتأكد من تطابق السلوك باستثناء حقل الدور.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
  ],
};
