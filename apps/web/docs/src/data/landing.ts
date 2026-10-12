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
    {
      id: "landing-home-page",
      title: {
        en: "Home page: hero search, live listings, companies, offices and the app promo",
        ar: "الصفحة الرئيسية: بحث الواجهة، إعلانات حية، الشركات، المكاتب، والتعريف بالتطبيق",
      },
      priority: "P1",
      story: {
        en: "The public home (/) follows the Figma home frame in a light theme and right-to-left: the rounded nav, the hero headline with the search box, 'ابدأ بخطوتك التالية' with three cards, 'استكشف عقارات' with للبيع / للايجار / للبدل tabs, 'احدث العقارات', the 'اعرض عقارك أو خدمتك' banner, 'اكتشف شركات الخدمات' with category tabs, 'المكاتب العقارية', the mobile app promo, the join banner and the footer. Property, company and office cards are live data from the public API, refreshed every five minutes. A list that fails to load or is empty leaves its section out instead of breaking the page. Anything that needs an account (the three next-step cards, hearts, طلب عرض سعر, chat, نشاطي, the nav icons, the banner buttons) goes to /auth/login. The partners section of the design is not built yet, and the store and social links are placeholders.",
        ar: "الصفحة الرئيسية العامة (/) تتبع إطار فيجما بمظهر فاتح ومن اليمين لليسار: شريط التنقل المستدير، عنوان الواجهة مع مربع البحث، 'ابدأ بخطوتك التالية' بثلاث بطاقات، 'استكشف عقارات' بتبويبات للبيع / للايجار / للبدل، 'احدث العقارات'، شريط 'اعرض عقارك أو خدمتك'، 'اكتشف شركات الخدمات' بتبويبات التصنيف، 'المكاتب العقارية'، التعريف بالتطبيق، شريط الانضمام، والتذييل. بطاقات العقارات والشركات والمكاتب بيانات حية من الواجهة البرمجية العامة تُحدَّث كل خمس دقائق. والقائمة التي يتعذر تحميلها أو تكون فارغة يُحذف قسمها بدل أن تتعطل الصفحة. وكل ما يحتاج حساباً (بطاقات الخطوة التالية، المفضلة، طلب عرض سعر، المحادثة، نشاطي، أيقونات الشريط، أزرار الشريط الداكن) ينقل إلى /auth/login. وقسم شركاء النجاح في التصميم لم يُبنَ بعد، وروابط المتاجر والتواصل الاجتماعي مؤقتة.",
      },
      acceptanceCriteria: {
        en: [
          "At 1440px the sections appear in the design's order with four property cards per row, three company cards and four office cards.",
          "The hero search: choosing بيع / ايجار / بدل, a governorate, then an area (enabled only after a governorate), a type and a price, and pressing تصفية البحث opens /properties with those choices in the URL; on the خدمات tab it opens /companies with the chosen service.",
          "The property tabs switch the row without reloading; a tab with no ads is not shown; عرض الكل opens /properties for the selected type.",
          "The arrows under a row scroll it; the row also scrolls by swipe.",
          "A company category tab loads that category's companies; a category with none says so.",
          "An ad without a price shows 'السعر غير معلن'; مدخول العقار shows only when above zero; a missing logo shows the name's first letter.",
          "On a phone the nav collapses to a menu button and the cards stack or scroll with no sideways page scroll.",
          "With the API unreachable the static sections still render and the data sections are absent.",
          "/auth/login, /auth/signup and /auth/forgot-password keep their dark look and styling.",
        ],
        ar: [
          "بعرض 1440 تظهر الأقسام بترتيب التصميم بأربع بطاقات عقار في الصف وثلاث بطاقات شركات وأربع بطاقات مكاتب.",
          "بحث الواجهة: اختيار بيع / ايجار / بدل، ثم المحافظة، ثم المنطقة (تُفعَّل بعد اختيار المحافظة فقط)، والنوع والسعر، ثم الضغط على تصفية البحث يفتح /properties بهذه الخيارات في الرابط؛ وفي تبويب خدمات يفتح /companies بالخدمة المختارة.",
          "تبويبات العقارات تبدّل الصف دون إعادة تحميل؛ والتبويب بلا إعلانات لا يظهر؛ وعرض الكل يفتح /properties للنوع المختار.",
          "الأسهم أسفل الصف تحرّكه؛ والصف يتحرك أيضاً بالسحب.",
          "تبويب تصنيف الشركات يحمّل شركات ذلك التصنيف؛ والتصنيف الفارغ يعرض رسالة بذلك.",
          "الإعلان بلا سعر يعرض 'السعر غير معلن'؛ ومدخول العقار يظهر فقط إن كان أكبر من صفر؛ والشعار المفقود يُستبدل بأول حرف من الاسم.",
          "على الهاتف يتحول شريط التنقل إلى زر قائمة وتتراص البطاقات أو تتحرك أفقياً دون تمرير أفقي للصفحة.",
          "عند تعذر الوصول للواجهة البرمجية تظهر الأقسام الثابتة وتغيب أقسام البيانات.",
          "صفحات /auth/login و/auth/signup و/auth/forgot-password تحتفظ بمظهرها الداكن وتنسيقها.",
        ],
      },
      testScenarios: {
        en: [
          "Open / at 1440px and compare each section with the Figma frame.",
          "Search بيع + a governorate + a price: the URL carries type, governorateId and maxPrice and the results match.",
          "Switch للبيع / للايجار / للبدل and use the arrows.",
          "Open / at 390px: open the menu, scroll the whole page, no horizontal scroll.",
          "Open /auth/login: the dark card form is styled as before.",
        ],
        ar: [
          "افتح / بعرض 1440 وقارن كل قسم بإطار فيجما.",
          "ابحث ببيع + محافظة + سعر: الرابط يحمل type وgovernorateId وmaxPrice والنتائج مطابقة.",
          "بدّل بين للبيع / للايجار / للبدل واستخدم الأسهم.",
          "افتح / بعرض 390: افتح القائمة ومرّر الصفحة كاملة دون تمرير أفقي.",
          "افتح /auth/login: نموذج البطاقة الداكنة منسق كما كان.",
        ],
      },
      figmaFrameUrls: [
        { url: "https://www.figma.com/design/mWeYnaTKGcPE8EMWJtCQj2/Byoutna-Web---Landing?node-id=7134-879", label: { en: "Home screen", ar: "الصفحة الرئيسية" } },
      ],
      updatedIn: "feat/landing-home-figma",
    },
    {
      id: "landing-listing-pages",
      title: {
        en: "Listing pages: properties, service companies and offices",
        ar: "صفحات القوائم: العقارات وشركات الخدمات والمكاتب",
      },
      priority: "P1",
      story: {
        en: "/properties, /companies and /offices give the nav, 'عرض الكل' and the search a destination. Each reads its filters from the URL and is rendered on the server, so a result page can be linked and indexed. /properties shows the search box pre-filled with the applied filters, the number of matching ads, a grid of cards and previous/next paging. /companies has a name search, category chips and paging; /offices has a name search and paging. There are no Figma frames for these pages; they reuse the home page's cards. Cards do not open a detail page yet.",
        ar: "صفحات /properties و/companies و/offices هي وجهة شريط التنقل و'عرض الكل' والبحث. كل منها يقرأ فلاتره من الرابط ويُعرض من الخادم، فيمكن مشاركة صفحة النتائج وفهرستها. /properties تعرض مربع البحث معبأ بالفلاتر المطبقة، وعدد الإعلانات المطابقة، وشبكة بطاقات، والتنقل بين الصفحات. /companies فيها بحث بالاسم وتصنيفات وتنقل بين الصفحات؛ و/offices فيها بحث بالاسم وتنقل بين الصفحات. لا توجد إطارات فيجما لهذه الصفحات؛ فهي تستخدم بطاقات الصفحة الرئيسية. والبطاقات لا تفتح صفحة تفاصيل بعد.",
      },
      acceptanceCriteria: {
        en: [
          "/properties?type=RENT&governorateId=hawally shows only matching ads and the search box shows ايجار and حولي selected.",
          "Unknown or invalid filter values in the URL are ignored rather than causing an error.",
          "السابق / التالي keep the current filters and show 'صفحة X من Y'; they are disabled at the ends.",
          "A search with no matches shows the empty message, not a blank page.",
          "/companies?category=<name> highlights that chip; searching by name keeps the chip.",
          "/offices lists offices with the phone button only when the office has a number.",
        ],
        ar: [
          "/properties?type=RENT&governorateId=hawally يعرض الإعلانات المطابقة فقط ومربع البحث يُظهر ايجار وحولي مختارين.",
          "قيم الفلاتر غير المعروفة أو غير الصالحة في الرابط تُتجاهل ولا تسبب خطأ.",
          "السابق / التالي يحتفظان بالفلاتر الحالية ويعرضان 'صفحة X من Y'؛ ويُعطَّلان عند الأطراف.",
          "البحث بلا نتائج يعرض رسالة فارغة لا صفحة بيضاء.",
          "/companies?category=<الاسم> يميّز ذلك التصنيف؛ والبحث بالاسم يحتفظ بالتصنيف.",
          "/offices تعرض المكاتب مع زر الهاتف فقط إن كان للمكتب رقم.",
        ],
      },
      testScenarios: {
        en: [
          "From the home search for rent in a governorate, then go to page 2: the filters stay in the URL.",
          "Open /properties?type=FOO&maxPrice=abc: the unfiltered list shows.",
          "On /companies pick a category, then search a name.",
        ],
        ar: [
          "من الرئيسية ابحث عن ايجار في محافظة ثم انتقل للصفحة 2: الفلاتر تبقى في الرابط.",
          "افتح /properties?type=FOO&maxPrice=abc: تظهر القائمة بلا فلاتر.",
          "في /companies اختر تصنيفاً ثم ابحث باسم.",
        ],
      },
      updatedIn: "feat/landing-home-figma",
    },
  ],
};
