import { DocSection } from "./types";

export const companies: DocSection = {
  slug: "web-companies",
  title: { en: "Web Companies", ar: "بوابة الشركات (ويب)" },
  summary: {
    en: "Next.js corporate portal (apps/web/companies, port 3002). An auth-only shell: a splash page plus login/signup/forgot-password on the shared @buyootna/ui forms. Sign-in and sign-up use the shared createPortalAuth (see the signup story). No dashboard exists yet.",
    ar: "Next.js بوابة الشركات (apps/web/companies، المنفذ 3002). هيكل مصادقة فقط: صفحة ترحيبية مع الدخول/التسجيل/استعادة كلمة المرور بنماذج @buyootna/ui المشتركة. الدخول والتسجيل عبر createPortalAuth المشترك (راجع قصة التسجيل). لا توجد لوحة تحكم بعد.",
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
      updatedIn: "feat/docs-platform",
    },
    {
      id: "companies-signup-role",
      title: {
        en: "Companies portal: sign up and sign in work",
        ar: "بوابة الشركات: التسجيل والدخول يعملان",
      },
      priority: "P0",
      story: {
        en: "Verify the portal's auth against the current API (shared createPortalAuth in packages/ui): login sends identifier and stores access_token; an individual signs up with POST /users/register/individual and confirms the SMS/email code (/auth/register/verify-otp or verify-email-otp); a company/office signs up with POST /users/register/company|office (email and licence required) and is signed in. Previously login always failed and signup hit the removed /auth/register. This portal defaults to COMPANY.",
        ar: "تحقق من مصادقة البوابة مع الواجهة البرمجية الحالية (createPortalAuth المشترك في packages/ui): الدخول يرسل identifier ويحفظ access_token؛ والفرد يسجّل عبر POST /users/register/individual ويؤكد رمز SMS/البريد (/auth/register/verify-otp أو verify-email-otp)؛ والشركة/المكتب يسجّل عبر POST /users/register/company|office (البريد والترخيص مطلوبان) ثم يدخل مباشرة. سابقاً كان الدخول يفشل دائماً والتسجيل يستدعي /auth/register المحذوفة. هذه البوابة تبدأ بالدور COMPANY.",
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
      updatedIn: "feat/docs-platform",
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
      updatedIn: "feat/docs-platform",
    },
    {
      id: "companies-subscription-plans",
      title: {
        en: "Companies portal: subscribe to a plan and pay on the web",
        ar: "بوابة الشركات: الاشتراك في باقة والدفع عبر الموقع",
      },
      priority: "P1",
      story: {
        en: "After signing in, the companies portal opens /plans: the three company plans, where the company's subscription stands (trial, active with days left, expired) and 'باقتك الحالية' on the current plan. اشترك الان sends the browser to the payment gateway and back to /plans/callback, which reports success or failure. The portal makes the account's company persona the active one first; an account with no company persona sees a message instead of plans. This is where iOS users subscribe.",
        ar: "بعد تسجيل الدخول تفتح بوابة الشركات صفحة /plans: باقات الشركات الثلاث، وحالة اشتراك الشركة (تجريبي، فعّال مع الأيام المتبقية، منتهٍ) و'باقتك الحالية' على الباقة الحالية. زر اشترك الان ينقل المتصفح إلى بوابة الدفع ثم إلى /plans/callback التي تعرض النجاح أو الفشل. وتجعل البوابة حساب الشركة هو الحساب النشط أولاً؛ والحساب الذي لا يملك حساب شركة يرى رسالة بدل الباقات. وهنا يشترك مستخدمو iOS.",
      },
      acceptanceCriteria: {
        en: [
          "Opening /plans signed out redirects to /auth/login; signing in lands on /plans.",
          "The page shows the three plans and a status line matching the company's subscription.",
          "اشترك الان opens the payment gateway; a paid charge returns to /plans/callback?status=success and the plan is then marked current on /plans and in the app.",
          "A cancelled or failed payment returns to /plans/callback with the failure message and nothing changes.",
          "The current plan's button is disabled.",
          "An account without a company persona sees 'الاشتراكات متاحة للشركات فقط'.",
        ],
        ar: [
          "فتح /plans بدون تسجيل دخول يحوّل إلى /auth/login؛ وتسجيل الدخول ينقل إلى /plans.",
          "الصفحة تعرض الباقات الثلاث وسطر حالة يطابق اشتراك الشركة.",
          "اشترك الان يفتح بوابة الدفع؛ والدفع الناجح يعود إلى /plans/callback?status=success ثم تظهر الباقة حالية في /plans وفي التطبيق.",
          "الدفع الملغى أو الفاشل يعود إلى /plans/callback برسالة الفشل ولا يتغير شيء.",
          "زر الباقة الحالية معطل.",
          "الحساب الذي لا يملك حساب شركة يرى 'الاشتراكات متاحة للشركات فقط'.",
        ],
      },
      testScenarios: {
        en: [
          "Sign in as a company, subscribe with a test card: the callback shows success; /plans marks the plan current; the iOS app shows the same.",
          "Start a payment and cancel it: the callback shows the failure message.",
          "Sign in with an individual-only account: the companies-only message shows.",
        ],
        ar: [
          "سجّل الدخول كشركة واشترك ببطاقة اختبار: صفحة العودة تعرض النجاح؛ و/plans تميّز الباقة الحالية؛ وتطبيق iOS يعرض الشيء نفسه.",
          "ابدأ عملية دفع وألغها: صفحة العودة تعرض رسالة الفشل.",
          "سجّل الدخول بحساب فرد فقط: تظهر رسالة أن الاشتراكات للشركات فقط.",
        ],
      },
      updatedIn: "feat/company-subscriptions",
    },
  ],
};
