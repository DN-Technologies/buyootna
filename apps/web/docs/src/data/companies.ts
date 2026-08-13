import { DocSection } from "./types";

export const companies: DocSection = {
  slug: "web-companies",
  title: { en: "Web Companies", ar: "بوابة الشركات (ويب)" },
  summary: {
    en: "Next.js corporate portal (apps/web/companies, port 3002). Currently an auth-only shell: a splash page plus login/signup/forgot-password, all reusing the shared @buyootna/ui forms. No company dashboard exists yet.",
    ar: "بوابة الشركات المبنية على Next.js (apps/web/companies، المنفذ 3002). حالياً مجرد هيكل مصادقة فقط: صفحة ترحيبية بالإضافة إلى تسجيل الدخول/التسجيل/نسيت كلمة المرور، وكلها تعيد استخدام نماذج @buyootna/ui المشتركة. لا توجد لوحة تحكم للشركة بعد.",
  },
  stories: [
    {
      id: "companies-shell-scope",
      title: {
        en: "Portal is correctly scoped to an auth-only shell (known gap)",
        ar: "نطاق البوابة محصور بشكل صحيح في هيكل مصادقة فقط (فجوة معروفة)",
      },
      priority: "P1",
      story: {
        en: "Verify that apps/web/companies currently only exposes the splash page and the three auth routes, so that this is tracked as the expected current scope rather than repeatedly filing 'missing dashboard' bugs against a portal that hasn't been built yet.",
        ar: "تحقق من أن apps/web/companies تعرض حالياً فقط الصفحة الترحيبية ومسارات المصادقة الثلاثة، حتى يُوثَّق هذا كنطاق حالي متوقع بدلاً من الإبلاغ مراراً عن أخطاء 'لوحة تحكم مفقودة' لبوابة لم تُبنَ بعد.",
      },
      acceptanceCriteria: {
        en: [
          "/ shows the 'بيوتنا للشركات' splash with working links to login/signup.",
          "No dashboard, property-management, or service-management routes exist or are linked from the splash — any such link would be a regression against current scope, not a missing feature to test.",
          "This story should be replaced with real dashboard test coverage once a company dashboard ships.",
        ],
        ar: [
          "الصفحة / تعرض شاشة الترحيب 'بيوتنا للشركات' مع روابط عاملة إلى تسجيل الدخول/التسجيل.",
          "لا توجد مسارات للوحة تحكم أو إدارة عقارات أو إدارة خدمات، ولا أي رابط لها من الصفحة الترحيبية — أي رابط من هذا النوع يُعتبر انحرافاً عن النطاق الحالي، لا ميزة ناقصة يجب اختبارها.",
          "يجب استبدال هذه القصة بتغطية اختبار حقيقية للوحة التحكم بمجرد إطلاقها.",
        ],
      },
      testScenarios: {
        en: [
          "Crawl all links from the splash page and confirm none 404 and none point to unbuilt dashboard routes.",
          "Attempt to guess/deep-link a plausible dashboard URL (e.g. /dashboard, /properties) and confirm it correctly 404s rather than partially rendering a broken page.",
        ],
        ar: [
          "تفقّد كل الروابط من الصفحة الترحيبية وتأكد أن لا شيء منها يعطي 404 أو يشير إلى مسارات لوحة تحكم غير مبنية.",
          "حاول تخمين/الوصول المباشر إلى رابط لوحة تحكم محتمل (مثل /dashboard أو /properties) وتأكد أنه يعطي 404 بشكل صحيح بدلاً من عرض صفحة معطوبة جزئياً.",
        ],
      },
    },
    {
      id: "companies-signup-role",
      title: {
        en: "Signup correctly defaults to and submits the COMPANY role",
        ar: "التسجيل يعتمد افتراضياً على دور COMPANY ويرسله بشكل صحيح",
      },
      priority: "P0",
      story: {
        en: 'Verify that SignupForm on this portal is configured with defaultRole="COMPANY" and actually submits COMPANY as the role to POST auth/register, so that a company signing up through this portal doesn\'t accidentally get provisioned as an individual account.',
        ar: 'تحقق من أن SignupForm في هذه البوابة مُهيّأ بـ defaultRole="COMPANY" وأنه يرسل فعلياً COMPANY كدور إلى POST auth/register، حتى لا تُنشأ شركة تسجّل عبر هذه البوابة بالخطأ كحساب فردي.',
      },
      acceptanceCriteria: {
        en: [
          "The signup form does not require the user to manually pick a role — COMPANY is implicit for this portal.",
          'The network request to auth/register includes role: "COMPANY".',
          "A completed signup results in a user whose role/identity is COMPANY when inspected via the admin /users table.",
        ],
        ar: [
          "نموذج التسجيل لا يتطلب من المستخدم اختيار دور يدوياً — COMPANY ضمني في هذه البوابة.",
          'طلب الشبكة إلى auth/register يتضمن role: "COMPANY".',
          "التسجيل المكتمل ينتج مستخدماً دوره/هويته COMPANY عند فحصه عبر جدول /users في لوحة تحكم المشرف.",
        ],
      },
      testScenarios: {
        en: [
          "Complete signup on this portal and verify (via network inspector or admin panel) the created account is role COMPANY, not INDIVIDUAL.",
          "Compare the created account's role against the same signup flow run on apps/web/offices to confirm the two portals don't cross-wire roles.",
        ],
        ar: [
          "أكمل التسجيل على هذه البوابة وتحقق (عبر أداة فحص الشبكة أو لوحة تحكم المشرف) أن الحساب المُنشأ دوره COMPANY، لا INDIVIDUAL.",
          "قارن دور الحساب المُنشأ مع نفس تدفق التسجيل المُنفَّذ على apps/web/offices للتأكد أن البوابتين لا تتبادلان الأدوار بالخطأ.",
        ],
      },
    },
    {
      id: "companies-shared-form-validation",
      title: {
        en: "Shared auth forms validate consistently with the mobile app's rules",
        ar: "نماذج المصادقة المشتركة تتحقق من صحة البيانات بما يتوافق مع قواعد تطبيق الجوال",
      },
      priority: "P1",
      story: {
        en: "Verify that LoginForm/SignupForm/ForgotPasswordForm from @buyootna/ui only enforce plain non-empty/match checks (no zod, no length/regex rules) here, unlike mobile's zod schemas, so that this known validation gap between web and mobile is documented rather than assumed to match.",
        ar: "تحقق من أن LoginForm/SignupForm/ForgotPasswordForm من @buyootna/ui تفرض هنا فقط تحققاً بسيطاً من عدم الفراغ/التطابق (دون zod، ودون قواعد طول أو regex)، خلافاً لمخططات zod في تطبيق الجوال، حتى تُوثَّق هذه الفجوة المعروفة بين الويب والجوال بدلاً من افتراض تطابقهما.",
      },
      acceptanceCriteria: {
        en: [
          "Signup accepts a password as short as 1 character and any phone format, since no zod/regex validation runs on web.",
          "Login accepts any non-empty identifier + password combination for client-side validation (server-side auth still enforces actual credentials).",
          "Password/confirm-password mismatch is still caught client-side even without zod.",
        ],
        ar: [
          "التسجيل يقبل كلمة مرور بطول حرف واحد فقط وأي صيغة رقم هاتف، لأنه لا يوجد تحقق zod/regex على الويب.",
          "تسجيل الدخول يقبل أي معرّف + كلمة مرور غير فارغَين للتحقق من جهة العميل (المصادقة من جهة الخادم لا تزال تفرض بيانات الاعتماد الفعلية).",
          "عدم تطابق كلمة المرور مع تأكيدها لا يزال يُكتشف من جهة العميل حتى دون zod.",
        ],
      },
      testScenarios: {
        en: [
          "Attempt signup with a 1-character password and a non-Kuwaiti phone number format — confirm it's accepted client-side (contrast with mobile-auth-validation, where the same input is rejected).",
          "Submit signup with password and confirm-password mismatched — confirm client-side rejection before any network call.",
          "File a cross-platform consistency ticket if product wants web to match mobile's stricter zod rules — this story exists to make the current gap explicit, not to silently 'pass' it as fine.",
        ],
        ar: [
          "حاول التسجيل بكلمة مرور من حرف واحد وصيغة رقم هاتف غير كويتية — تأكد من قبولها من جهة العميل (بالمقارنة مع mobile-individual-signup، حيث تُرفض نفس المدخلات).",
          "أرسل نموذج التسجيل بكلمة مرور وتأكيد كلمة مرور غير متطابقين — تأكد من الرفض من جهة العميل قبل أي طلب شبكة.",
          "افتح تذكرة اتساق بين المنصات إذا أراد فريق المنتج أن يطابق الويب قواعد zod الأكثر صرامة في الجوال — هذه القصة موجودة لجعل الفجوة الحالية صريحة، لا لتمريرها بصمت باعتبارها مقبولة.",
        ],
      },
    },
    {
      id: "companies-forgot-password",
      title: {
        en: "Forgot-password flow reaches a clear success state",
        ar: "تدفق نسيان كلمة المرور يصل إلى حالة نجاح واضحة",
      },
      priority: "P1",
      story: {
        en: "Verify that ForgotPasswordForm posts to auth/forgot-password and shows a clear 'check your email' success state, so that a company admin who forgets their password isn't left wondering whether the request went through.",
        ar: "تحقق من أن ForgotPasswordForm يرسل طلباً إلى auth/forgot-password ويعرض حالة نجاح واضحة ('تحقق من بريدك الإلكتروني')، حتى لا يبقى مسؤول الشركة الذي نسي كلمة مروره متسائلاً عمّا إذا كان الطلب قد نُفّذ أم لا.",
      },
      acceptanceCriteria: {
        en: [
          "Submitting a registered email shows the success state.",
          "Submitting an unregistered email either shows the same success state (to avoid account enumeration) or a clear, non-revealing error — confirm which behavior is intended and that it's consistent.",
          "The success state doesn't allow indefinite resubmission spam without at least a basic client-side debounce/disable-on-submit.",
        ],
        ar: [
          "إرسال بريد إلكتروني مسجَّل يعرض حالة النجاح.",
          "إرسال بريد إلكتروني غير مسجَّل يعرض إما نفس حالة النجاح (لتفادي كشف وجود الحسابات) أو خطأ واضحاً لا يكشف معلومات — تأكد من السلوك المقصود ومن اتساقه.",
          "حالة النجاح لا تسمح بإرسال متكرر لا نهائي دون على الأقل تعطيل بسيط للزر أو تأخير من جهة العميل عند الإرسال.",
        ],
      },
      testScenarios: {
        en: [
          "Submit with a known-registered email and confirm the success message appears and (separately, via email/inbox) that a reset email/OTP actually arrives.",
          "Submit with an obviously fake email and compare the response/UI to the registered-email case for enumeration risk.",
          "Rapidly click submit multiple times and confirm no duplicate emails/OTPs are triggered by the UI (button disables during submission).",
        ],
        ar: [
          "أرسل النموذج ببريد إلكتروني معروف أنه مسجَّل وتأكد من ظهور رسالة النجاح، ثم تحقق (بشكل منفصل عبر البريد الوارد) من وصول بريد/رمز إعادة تعيين فعلي.",
          "أرسل النموذج ببريد إلكتروني وهمي بوضوح وقارن الاستجابة/الواجهة مع حالة البريد المسجَّل لتقييم خطر كشف الحسابات.",
          "اضغط زر الإرسال بسرعة عدة مرات وتأكد من عدم إطلاق رسائل/رموز تحقق مكررة من الواجهة (الزر يُعطَّل أثناء الإرسال).",
        ],
      },
    },
  ],
};
