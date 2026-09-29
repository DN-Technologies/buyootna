import { DocSection } from "./types";

export const offices: DocSection = {
  slug: "web-offices",
  title: { en: "Web Offices", ar: "بوابة المكاتب العقارية (ويب)" },
  summary: {
    en: "Next.js real-estate office/agency portal (apps/web/offices, port 3003). An auth-only shell: a splash page plus login/signup/forgot-password on the shared @buyootna/ui forms. Signup is currently broken — it posts to the removed POST /auth/register. No dashboard exists yet.",
    ar: "Next.js بوابة المكاتب العقارية (apps/web/offices، المنفذ 3003). هيكل مصادقة فقط: صفحة ترحيبية مع الدخول/التسجيل/استعادة كلمة المرور بنماذج @buyootna/ui المشتركة. التسجيل معطّل حالياً — يرسل إلى POST /auth/register المحذوفة. لا توجد لوحة تحكم بعد.",
  },
  stories: [
    {
      id: "offices-shell-scope",
      title: {
        en: "Portal is correctly scoped to an auth-only shell (known gap)",
        ar: "نطاق البوابة يقتصر بشكل صحيح على هيكل مصادقة فقط (فجوة معروفة)",
      },
      priority: "P1",
      story: {
        en: "Verify that apps/web/offices currently only exposes the splash page and the three auth routes, so that this is tracked as expected current scope, mirroring web-companies, rather than filed as a missing-dashboard bug.",
        ar: "تحقق من أن apps/web/offices لا يعرض حالياً سوى الصفحة التعريفية ومسارات المصادقة الثلاثة، حتى يُوثَّق هذا كنطاق حالي متوقَّع، مطابق لـ web-companies، لا أن يُبلَّغ عنه كخطأ 'لوحة تحكم مفقودة'.",
      },
      acceptanceCriteria: {
        en: [
          "/ shows the 'بيوتنا للمكاتب' splash with working links to login/signup.",
          "No office-listing or agency-management routes exist yet; any such link from the splash would be a regression against current scope.",
          "This story should be replaced with real dashboard coverage once an office dashboard ships.",
        ],
        ar: [
          "الصفحة / تعرض الشاشة التعريفية 'بيوتنا للمكاتب' مع روابط عاملة لتسجيل الدخول/التسجيل.",
          "لا توجد بعد مسارات لإدارة الإعلانات أو إدارة الوكالة؛ أي رابط من هذا النوع في الصفحة التعريفية يُعد تراجعاً عن النطاق الحالي.",
          "يجب استبدال هذه القصة بتغطية اختبار حقيقية للوحة التحكم بمجرد إطلاق لوحة تحكم للمكاتب العقارية.",
        ],
      },
      testScenarios: {
        en: [
          "Crawl all links from the splash page and confirm none 404 and none point to unbuilt routes.",
          "Deep-link a plausible dashboard URL and confirm a clean 404, not a partially-rendered broken page.",
        ],
        ar: [
          "افحص جميع الروابط في الصفحة التعريفية وتأكد أن لا شيء منها يعطي خطأ 404 أو يشير إلى مسارات غير مبنية.",
          "جرّب رابطاً مباشراً محتملاً للوحة التحكم وتأكد من ظهور خطأ 404 نظيف، لا صفحة معطوبة معروضة جزئياً.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "offices-signup-role",
      title: {
        en: "Signup on the Offices portal fails — it calls a removed endpoint",
        ar: "التسجيل في بوابة Offices يفشل — يستدعي نقطة نهاية محذوفة",
      },
      priority: "P0",
      story: {
        en: "Broken: the portal's signup page posts to POST /auth/register with role OFFICE, which the API no longer has (production answers 404). Signup now lives at POST /users/register/individual (with an email/SMS code) and POST /users/register/company|office (multipart, with licence details). Until the page is moved to those, nobody can create an account here.",
        ar: "معطّل: صفحة التسجيل في البوابة ترسل إلى POST /auth/register مع الدور OFFICE، وهي نقطة لم تعد موجودة في الواجهة البرمجية (الإنتاج يرد 404). التسجيل الآن عبر POST /users/register/individual (مع رمز بالبريد/SMS) و POST /users/register/company|office (بيانات متعددة الأجزاء مع الترخيص). إلى أن تُنقل الصفحة إليهما لا يمكن لأحد إنشاء حساب هنا.",
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
      id: "offices-shared-form-parity",
      title: {
        en: "Shared form behavior stays in parity with web-companies",
        ar: "سلوك النماذج المشتركة يبقى متطابقاً مع web-companies",
      },
      priority: "P2",
      story: {
        en: "Verify that because web-offices and web-companies both consume the same @buyootna/ui LoginForm/SignupForm/ForgotPasswordForm, any bug fix or regression found in one portal's auth forms is checked against the other, so that a fix applied to one doesn't leave the shared-component bug live in its sibling portal.",
        ar: "تحقق من أنه بما أن web-offices وweb-companies يستخدمان نفس مكوّنات @buyootna/ui وهي LoginForm/SignupForm/ForgotPasswordForm، فإن أي إصلاح خطأ أو تراجع يُكتشف في نماذج مصادقة إحدى البوابتين يجب اختباره أيضاً على الأخرى، حتى لا يترك إصلاح طُبِّق على إحداهما الخطأ المشترك حياً في البوابة الشقيقة.",
      },
      acceptanceCriteria: {
        en: [
          "Any validation, styling, or submission-flow bug found in web-companies' auth forms is re-tested against web-offices (and vice versa) before being closed.",
          "The only expected differences between the two portals' auth flows are the defaultRole value and the splash copy/branding.",
        ],
        ar: [
          "أي خطأ في التحقق من الصحة أو التنسيق أو تدفق الإرسال يُكتشف في نماذج مصادقة web-companies يُعاد اختباره على web-offices (والعكس صحيح) قبل إغلاقه.",
          "الفروق الوحيدة المتوقعة بين تدفقَي المصادقة في البوابتين هما قيمة defaultRole ونص/هوية الصفحة التعريفية.",
        ],
      },
      testScenarios: {
        en: [
          "Run the exact same auth test cases (companies-shared-form-validation, companies-forgot-password) against web-offices and confirm identical behavior aside from role and copy.",
          "If a fix lands in packages/ui for one of these forms, re-run this parity check across both companies and offices portals.",
        ],
        ar: [
          "شغّل نفس حالات اختبار المصادقة تماماً (companies-shared-form-validation، companies-forgot-password) على web-offices وتأكد من تطابق السلوك باستثناء الدور والنص.",
          "إذا وصل إصلاح إلى packages/ui لأحد هذه النماذج، أعد تشغيل فحص التطابق هذا على بوابتَي companies وoffices معاً.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
  ],
};
