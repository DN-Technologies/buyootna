import { DocSection } from "./types";

export const offices: DocSection = {
  slug: "web-offices",
  title: { en: "Web Offices", ar: "بوابة المكاتب العقارية (ويب)" },
  summary: {
    en: "Next.js real-estate office/agency portal (apps/web/offices, port 3003). Mirrors web-companies exactly today: a splash page plus login/signup/forgot-password on shared @buyootna/ui forms. No office dashboard exists yet.",
    ar: "بوابة المكاتب العقارية/الوكالات المبنية بـ Next.js (apps/web/offices، المنفذ 3003). تطابق حالياً بوابة web-companies تماماً: صفحة تعريفية بالإضافة إلى تسجيل الدخول/التسجيل/نسيت كلمة المرور عبر نماذج @buyootna/ui المشتركة. لا توجد لوحة تحكم للمكاتب العقارية بعد.",
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
    },
    {
      id: "offices-signup-role",
      title: {
        en: "Signup correctly defaults to and submits the OFFICE role",
        ar: "التسجيل يعتمد افتراضياً على دور OFFICE ويرسله بشكل صحيح",
      },
      priority: "P0",
      story: {
        en: 'Verify SignupForm here is configured with defaultRole="OFFICE" and actually submits OFFICE to POST auth/register, so that an agency signing up through this portal isn\'t misprovisioned as an individual or company account.',
        ar: 'تحقق من أن SignupForm هنا مُهيّأ بـ defaultRole="OFFICE" وأنه يرسل فعلياً OFFICE إلى POST auth/register، حتى لا يُنشأ حساب وكالة تُسجّل عبر هذه البوابة بشكل خاطئ كحساب فردي أو شركة.',
      },
      acceptanceCriteria: {
        en: [
          "Signup does not require the user to pick a role manually — OFFICE is implicit for this portal.",
          'The network request to auth/register includes role: "OFFICE".',
          "The resulting account shows as role OFFICE in the admin /users table, and correctly renders OfficeProfileOverview when viewed there.",
        ],
        ar: [
          "التسجيل لا يتطلب من المستخدم اختيار الدور يدوياً — OFFICE ضمني في هذه البوابة.",
          'طلب الشبكة إلى auth/register يتضمن role: "OFFICE".',
          "الحساب الناتج يظهر بدور OFFICE في جدول /users بلوحة تحكم المشرف، ويعرض بشكل صحيح مكوّن OfficeProfileOverview عند عرضه هناك.",
        ],
      },
      testScenarios: {
        en: [
          "Complete signup and confirm via network inspector or admin panel that the created account is OFFICE, not COMPANY or INDIVIDUAL.",
          "Cross-check against a company signup done via web-companies in the same test session to confirm no role cross-wiring between the two portals.",
        ],
        ar: [
          "أكمل التسجيل وتأكد عبر أداة فحص الشبكة أو لوحة تحكم المشرف أن الحساب المُنشأ بدور OFFICE، لا COMPANY أو INDIVIDUAL.",
          "قارن مع تسجيل شركة تم عبر web-companies في نفس جلسة الاختبار للتأكد من عدم تداخل الأدوار بين البوابتين.",
        ],
      },
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
    },
  ],
};
