import { DocSection } from "./types";

export const landing: DocSection = {
  slug: "web-landing",
  title: { en: "Web Landing", ar: "الصفحة التسويقية (ويب)" },
  summary: {
    en: "Next.js marketing site (apps/web/landing, port 3001): the public splash plus login/signup/forgot-password — the front door most real users and search engines hit. Sign-in and sign-up use the shared createPortalAuth (see the signup story).",
    ar: "موقع التسويق (apps/web/landing، المنفذ 3001): الصفحة الترحيبية العامة مع الدخول/التسجيل/استعادة كلمة المرور — البوابة الأولى لمعظم المستخدمين ومحركات البحث. الدخول والتسجيل عبر createPortalAuth المشترك (راجع قصة التسجيل).",
  },
  stories: [
    {
      id: "landing-marketing-splash",
      title: {
        en: "Marketing splash renders correctly and links work",
        ar: "الصفحة الترحيبية التسويقية تُعرض بشكل صحيح والروابط تعمل",
      },
      priority: "P1",
      story: {
        en: "Verify the landing splash (Arabic RTL copy describing Buyootna, with 'تسجيل الدخول'/'حساب جديد' links) renders correctly and its links route to the right auth pages, so that this is a trustworthy first impression rather than a broken landing page for real prospective users and SEO crawlers.",
        ar: "تحقق من أن الصفحة الترحيبية (نص عربي بامتداد من اليمين لليسار يصف بيوتنا، مع رابطَي 'تسجيل الدخول'/'حساب جديد') تُعرض بشكل صحيح وأن روابطها تنقل إلى صفحات المصادقة الصحيحة، حتى تكون هذه انطباعاً أولياً موثوقاً لا صفحة هبوط معطوبة أمام المستخدمين المحتملين الحقيقيين وزواحف محركات البحث.",
      },
      acceptanceCriteria: {
        en: [
          "Page renders correctly in RTL with no mirrored/broken layout elements.",
          "'تسجيل الدخول' (login) and 'حساب جديد' (signup) links route to /auth/login and /auth/signup respectively.",
          "Page has correct metadata (title/description) for SEO — verify against what's actually set in layout.tsx.",
          "Page loads acceptably fast and without console errors on both desktop and mobile-width viewports.",
        ],
        ar: [
          "الصفحة تُعرض بشكل صحيح من اليمين لليسار دون عناصر تخطيط معكوسة أو معطوبة.",
          "رابطا 'تسجيل الدخول' و'حساب جديد' ينقلان إلى /auth/login و/auth/signup على التوالي.",
          "الصفحة تحتوي بيانات وصفية صحيحة (العنوان/الوصف) لتحسين محركات البحث — تحقق من ذلك مقابل ما هو مضبوط فعلياً في layout.tsx.",
          "الصفحة تُحمَّل بسرعة مقبولة ودون أخطاء console على عرضَي سطح المكتب والجوال.",
        ],
      },
      testScenarios: {
        en: [
          "Load the page fresh (cleared cache) and confirm no layout shift/flash of unstyled content, and no console errors.",
          "Click both CTAs and confirm correct destination.",
          "Inspect page <title> and meta description in dev tools/view-source and confirm they match the intended marketing copy (not a generic 'Next.js App' default).",
          "Test at a narrow mobile viewport width and confirm RTL layout doesn't overflow or clip text.",
        ],
        ar: [
          "حمّل الصفحة من جديد (بعد مسح الذاكرة المؤقتة) وتأكد من عدم وجود انزياح تخطيط/وميض محتوى بلا تنسيق، وعدم وجود أخطاء console.",
          "اضغط كلا الزرَّين الرئيسيَّين وتأكد من الوجهة الصحيحة.",
          "افحص عنصر <title> والوصف الوصفي عبر أدوات المطور/عرض المصدر وتأكد أنهما يطابقان النص التسويقي المقصود (لا القيمة الافتراضية العامة 'Next.js App').",
          "اختبر على عرض شاشة جوال ضيق وتأكد أن التخطيط من اليمين لليسار لا يفيض أو يقص النص.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "landing-signup-role-picker",
      title: {
        en: "Landing portal: sign up and sign in work",
        ar: "بوابة الموقع الرئيسي: التسجيل والدخول يعملان",
      },
      priority: "P0",
      story: {
        en: "Verify the portal's auth against the current API (shared createPortalAuth in packages/ui): login sends identifier and stores access_token; an individual signs up with POST /users/register/individual and confirms the SMS/email code (/auth/register/verify-otp or verify-email-otp); a company/office signs up with POST /users/register/company|office (email and licence required) and is signed in. Previously login always failed and signup hit the removed /auth/register. This portal defaults to INDIVIDUAL (role picker shown).",
        ar: "تحقق من مصادقة البوابة مع الواجهة البرمجية الحالية (createPortalAuth المشترك في packages/ui): الدخول يرسل identifier ويحفظ access_token؛ والفرد يسجّل عبر POST /users/register/individual ويؤكد رمز SMS/البريد (/auth/register/verify-otp أو verify-email-otp)؛ والشركة/المكتب يسجّل عبر POST /users/register/company|office (البريد والترخيص مطلوبان) ثم يدخل مباشرة. سابقاً كان الدخول يفشل دائماً والتسجيل يستدعي /auth/register المحذوفة. هذه البوابة تبدأ بالدور INDIVIDUAL (role picker shown).",
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
      id: "landing-auth-field-rules",
      title: {
        en: "Signup/login field requirements match the documented (non-zod) web rules",
        ar: "متطلبات حقول التسجيل/الدخول تطابق قواعد الويب الموثَّقة (دون zod)",
      },
      priority: "P1",
      story: {
        en: "Verify the landing signup form's required fields (name*, phone*, password*, confirmPassword*, with email and whatsapp optional) and the plain non-empty/match-only validation (no zod regex, unlike mobile) behave as documented, so that real users signing up on the public site aren't blocked by mismatched expectations between mobile and web validation.",
        ar: "تحقق من أن حقول نموذج التسجيل المطلوبة في الموقع التسويقي (الاسم*، الهاتف*، كلمة المرور*، تأكيد كلمة المرور*، مع كون البريد الإلكتروني والواتساب اختياريَّين) والتحقق البسيط من عدم الفراغ/التطابق فقط (دون regex عبر zod، خلافاً للجوال) يتصرفان كما هو موثَّق، حتى لا يُعاق المستخدمون الحقيقيون المسجَّلون على الموقع العام بتوقعات متضاربة بين تحقق الجوال والويب.",
      },
      acceptanceCriteria: {
        en: [
          "Submitting without name, phone, password, or confirmPassword is blocked client-side with visible errors; email and whatsapp can be left blank.",
          "Password and confirmPassword must match exactly (case-sensitive) or submission is blocked.",
          "Any phone number format is currently accepted (no Kuwaiti-number regex enforced on web) — confirm this matches product's actual intent for the public-facing site.",
          "Login accepts any non-empty identifier (email or phone) plus password combination client-side, deferring real validation to the server.",
        ],
        ar: [
          "الإرسال دون الاسم أو الهاتف أو كلمة المرور أو تأكيد كلمة المرور يُمنَع من جهة العميل مع أخطاء ظاهرة؛ يمكن ترك البريد الإلكتروني والواتساب فارغَين.",
          "يجب أن تتطابق كلمة المرور وتأكيدها تماماً (حساس لحالة الأحرف) وإلا يُمنع الإرسال.",
          "أي صيغة لرقم الهاتف تُقبل حالياً (لا يوجد فرض لصيغة رقم كويتي عبر regex على الويب) — تأكد أن هذا يطابق نية فريق المنتج الفعلية لهذا الموقع العام.",
          "تسجيل الدخول يقبل أي معرّف غير فارغ (بريد إلكتروني أو هاتف) مع كلمة مرور من جهة العميل، تاركاً التحقق الفعلي للخادم.",
        ],
      },
      testScenarios: {
        en: [
          "Submit the signup form with each required field individually blank and confirm each triggers its own visible error.",
          "Submit with email and whatsapp blank and confirm the form proceeds (they're optional).",
          "Enter a clearly invalid phone format (e.g. '123') and confirm whether it's blocked or accepted — flag to product if accepted, since this diverges from the mobile app's stricter rule.",
          "Submit login with an obviously malformed identifier and confirm the client doesn't block it, then confirm the server correctly rejects it with a clear error message rather than a generic failure.",
        ],
        ar: [
          "أرسل نموذج التسجيل مع ترك كل حقل مطلوب فارغاً بدوره، وتأكد أن كل حقل يُطلق خطأه الظاهر الخاص به.",
          "أرسل مع ترك البريد الإلكتروني والواتساب فارغَين وتأكد أن النموذج يستمر (فهما اختياريان).",
          "أدخل صيغة هاتف غير صالحة بوضوح (مثل '123') وتأكد ما إذا كانت تُمنع أم تُقبل — أبلغ فريق المنتج إن قُبلت، لأن هذا يختلف عن قاعدة تطبيق الجوال الأكثر صرامة.",
          "أرسل تسجيل دخول بمعرّف مشوَّه بوضوح وتأكد أن جهة العميل لا تمنعه، ثم تأكد أن الخادم يرفضه بشكل صحيح مع رسالة خطأ واضحة لا فشلاً عاماً.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
  ],
};
