import { DocSection } from "./types";

export const offices: DocSection = {
  slug: "web-offices",
  title: { en: "Web Offices", ar: "بوابة المكاتب العقارية (ويب)" },
  summary: {
    en: "Next.js real-estate office/agency portal (apps/web/offices, port 3003). An auth-only shell: a splash page plus login/signup/forgot-password on the shared @buyootna/ui forms. Sign-in and sign-up use the shared createPortalAuth (see the signup story). No dashboard exists yet.",
    ar: "Next.js بوابة المكاتب العقارية (apps/web/offices، المنفذ 3003). هيكل مصادقة فقط: صفحة ترحيبية مع الدخول/التسجيل/استعادة كلمة المرور بنماذج @buyootna/ui المشتركة. الدخول والتسجيل عبر createPortalAuth المشترك (راجع قصة التسجيل). لا توجد لوحة تحكم بعد.",
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
        en: "Offices portal: sign up and sign in work",
        ar: "بوابة المكاتب: التسجيل والدخول يعملان",
      },
      priority: "P0",
      story: {
        en: "Verify the portal's auth against the current API (shared createPortalAuth in packages/ui): login sends identifier and stores access_token; an individual signs up with POST /users/register/individual and confirms the SMS/email code (/auth/register/verify-otp or verify-email-otp); a company/office signs up with POST /users/register/company|office (email and licence required) and is signed in. Previously login always failed and signup hit the removed /auth/register. This portal defaults to OFFICE.",
        ar: "تحقق من مصادقة البوابة مع الواجهة البرمجية الحالية (createPortalAuth المشترك في packages/ui): الدخول يرسل identifier ويحفظ access_token؛ والفرد يسجّل عبر POST /users/register/individual ويؤكد رمز SMS/البريد (/auth/register/verify-otp أو verify-email-otp)؛ والشركة/المكتب يسجّل عبر POST /users/register/company|office (البريد والترخيص مطلوبان) ثم يدخل مباشرة. سابقاً كان الدخول يفشل دائماً والتسجيل يستدعي /auth/register المحذوفة. هذه البوابة تبدأ بالدور OFFICE.",
      },
      acceptanceCriteria: {
        en: [
          "A registered user signs in and lands on the portal home.",
          "Individual signup shows the code step; a wrong code is refused; the right one signs in.",
          "Company/office signup without a licence is refused; with one it signs in (a company approved at once, an office pending approval).",
          "A taken licence number is refused with 'رقم الترخيص مسجل مسبقاً'.",
        ],
        ar: [
          "المستخدم المسجّل يدخل ويصل إلى الصفحة الرئيسية للبوابة.",
          "تسجيل الفرد يعرض خطوة الرمز؛ والرمز الخاطئ يُرفض والصحيح يسجّل الدخول.",
          "تسجيل الشركة/المكتب دون ترخيص يُرفض؛ ومعه يدخل مباشرة (الشركة معتمدة فوراً، والمكتب قيد المراجعة).",
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
      updatedIn: "feat/landing-home-figma",
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
