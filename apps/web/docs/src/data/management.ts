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
        en: "Management portal: sign up and sign in work",
        ar: "بوابة إدارة الأملاك: التسجيل والدخول يعملان",
      },
      priority: "P0",
      story: {
        en: "Verify the portal's auth against the current API (shared createPortalAuth in packages/ui): login sends identifier and stores access_token; an individual signs up with POST /users/register/individual and confirms the SMS/email code (/auth/register/verify-otp or verify-email-otp); a company/office signs up with POST /users/register/company|office (email and licence required) and is signed in. Previously login always failed and signup hit the removed /auth/register. This portal defaults to INDIVIDUAL.",
        ar: "تحقق من مصادقة البوابة مع الواجهة البرمجية الحالية (createPortalAuth المشترك في packages/ui): الدخول يرسل identifier ويحفظ access_token؛ والفرد يسجّل عبر POST /users/register/individual ويؤكد رمز SMS/البريد (/auth/register/verify-otp أو verify-email-otp)؛ والشركة/المكتب يسجّل عبر POST /users/register/company|office (البريد والترخيص مطلوبان) ثم يدخل مباشرة. سابقاً كان الدخول يفشل دائماً والتسجيل يستدعي /auth/register المحذوفة. هذه البوابة تبدأ بالدور INDIVIDUAL.",
      },
      acceptanceCriteria: {
        en: [
          "A registered user signs in and lands on the portal home.",
          "Individual signup shows the code step; a wrong code is refused; the right one signs in.",
          "Company/office signup without a licence is refused; with one it signs in (as pending approval).",
          "A taken licence number is refused with 'رقم الترخيص مسجل مسبقاً'.",
        ],
        ar: [
          "المستخدم المسجّل يدخل ويصل إلى الصفحة الرئيسية للبوابة.",
          "تسجيل الفرد يعرض خطوة الرمز؛ والرمز الخاطئ يُرفض والصحيح يسجّل الدخول.",
          "تسجيل الشركة/المكتب دون ترخيص يُرفض؛ ومعه يدخل مباشرة (قيد المراجعة).",
          "رقم الترخيص المستخدم يُرفض برسالة 'رقم الترخيص مسجل مسبقاً'.",
        ],
      },
      testScenarios: {
        en: [
          "Sign up as each role on this portal, then sign out and sign in again.",
        ],
        ar: [
          "سجّل بكل دور في هذه البوابة ثم اخرج وادخل مجدداً.",
        ],
      },
      updatedIn: "fix/map-multi-location, fix/android-label-wrap, fix/review-findings",
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
