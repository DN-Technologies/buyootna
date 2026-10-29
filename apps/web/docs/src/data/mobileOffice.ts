import { DocSection } from "./types";

export const mobileOffice: DocSection = {
  slug: "mobile-office",
  title: { en: "Mobile — Office", ar: "الجوال — المكتب العقاري" },
  summary: {
    en: "The (office) route group (office-home, office-more, office-chats, office-properties) — live in every build (see mobile-company-office-gate). Some parts still show mock data (tracked in the stories below); the server-side office rules (one per account, unique licence, approval before publishing) are in API → api-persona-rules.",
    ar: "مجموعة مسارات (office) (office-home و office-more و office-chats و office-properties) — مفعّلة في كل النسخ (راجع mobile-company-office-gate). بعض الأجزاء ما زالت تعرض بيانات وهمية (موثّقة في القصص أدناه)؛ وقواعد المكتب في الخادم (واحد لكل حساب، ترخيص فريد، اعتماد قبل النشر) في الواجهة البرمجية ← api-persona-rules.",
  },
  stories: [
    {
      id: "mobile-office-dashboard-figma",
      title: {
        en: "Office Home matches the Figma home and its states",
        ar: "رئيسية المكتب العقاري مطابقة لتصميم فيجما وحالاته",
      },
      priority: "P1",
      endUserStory: {
        en: "As an office user, I want my home to show my stats, my ads (or how to get my first one up), my services, the market, other offices and companies, and my latest chats, so that I can run my office from one screen.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد أن تعرض رئيسيتي إحصاءاتي وإعلاناتي (أو كيف أنشر أول إعلان) وخدماتي والسوق والمكاتب والشركات الأخرى وأحدث محادثاتي، حتى أدير مكتبي من شاشة واحدة.",
      },
      story: {
        en: "office-home.tsx follows Figma home-main (4494:140318, with قطاعات الأعمال in 9797:21614 / 4494:140590) and its states home-state1 (4494:141157) and home-state2 (4494:140906). The header stays the home pill with the Studio switch (not the design's greeting), and the bottom bar keeps its notch and '+'. Sections, top to bottom: the 2x2 stats grid, اعلانات المكتب, الخدمات, عقارات السوق, قطاعات الأعمال (مكاتب عقارية / شركات), أحدث المحادثات. نشاط المجموعات is not shown: the app has no groups yet. The app runs RTL, so every row reads right to left as in the design.",
        ar: "office-home.tsx يتبع تصميم home-main في فيجما (4494:140318، وقطاعات الأعمال في 9797:21614 / 4494:140590) وحالتيه home-state1 (4494:141157) وhome-state2 (4494:140906). الترويسة تبقى كبسولة الرئيسية مع مفتاح الاستوديو (لا ترحيب التصميم)، والشريط السفلي يحتفظ بالتجويف وزر '+'. الأقسام من الأعلى: شبكة الإحصاءات 2×2، اعلانات المكتب، الخدمات، عقارات السوق، قطاعات الأعمال (مكاتب عقارية / شركات)، أحدث المحادثات. لا يظهر نشاط المجموعات: لا توجد مجموعات في التطبيق بعد. التطبيق يعمل من اليمين لليسار، فكل صف يُقرأ كما في التصميم.",
      },
      figmaFrameUrls: [
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=4494-140318", label: { en: "Home, with ads", ar: "الرئيسية مع إعلانات" } },
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=9797-21614", label: { en: "Business sectors: offices", ar: "قطاعات الأعمال: مكاتب" } },
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=4494-140590", label: { en: "Business sectors: companies", ar: "قطاعات الأعمال: شركات" } },
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=4494-141157", label: { en: "No ad package", ar: "بلا باقة إعلانات" } },
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=4494-140906", label: { en: "Can publish, no ads yet", ar: "يمكنه النشر ولا إعلانات بعد" } },
      ],
      acceptanceCriteria: {
        en: [
          "The header is the home pill alone, as in mobile-business-home-pill (no greeting, name or story row); the Studio switch still opens the stories studio.",
          "Stats grid (right to left): الإعلانات النشطة with 'N هذا الأسبوع' (ads published in the last 7 days; the active count when none), خدمات نشطة, المشاهدات (lifetime, rounded down to the hundred with '+', e.g. 712 → '700+'), الرسائل الجديدة with 'N اليوم' (messages others sent since midnight Kuwait time).",
          "اعلانات المكتب with active ads: a row of cards (photo carousel with dots, 'مميز' or 'التمييز نشط حتى <day month>' while featured, title from category and deal, price in د.ك or 'السعر غير معلن', views / saves / chats, 'إدارة الإعلان'). 'عرض الكل' and 'إدارة الإعلان' open العقارات; the card opens the ad.",
          "No ads and no way to publish (no active package, free ad used): the navy card with the three ✓ perks and 'اشتر باقة اعلانات', opening the plans screen (home-state1).",
          "No ads but a package or the free ad left: the navy card with 'ابدأ بإضافة أول إعلان لك', opening add-listing (home-state2).",
          "الخدمات: one card per service in the office profile with its icon and blurb by kind (rent / buy / exchange), 'إدارة الخدمة' and 'N طلب نشط' when requests sent to the office mention it; hidden when the profile lists no services. The cards and 'عرض الكل' open the office profile editor.",
          "عقارات السوق: up to 8 public ads mixed sale / rent / exchange (the office's own left out), with 'مميز', price or 'السعر غير معلن', 'طلب <year> مع <year>' on exchanges, area, location, 'مدخول العقار' when above 0, and 'تفاصيل'.",
          "قطاعات الأعمال: the gold segment switches مكاتب عقارية (office cards: live-ad count, بيع / إيجار / بدل tags for the deals it has live ads in, 'N خدمة', real rating and reviews or 'لا تقييمات', call and chat) and شركات (company cards with عدد الخدمات, مشاريع مكتملة, rating, 'طلب عرض سعر' and chat). The office never lists itself. No 'عرض الكل' (the full directories are in the individual tabs).",
          "أحدث المحادثات: the 5 latest chats (avatar, name, ad category pill, last message, unread badge, relative time); hidden when there are none.",
          "No section shows made-up numbers: while the dashboard loads a spinner shows, and if it fails, the message and 'إعادة المحاولة'.",
          "The bottom bar's المحادثات badge is the unread total of the loaded inbox (no longer a fixed 2), shown as '99+' above 99.",
        ],
        ar: [
          "الترويسة هي كبسولة الرئيسية وحدها، كما في mobile-business-home-pill (بلا تحية أو اسم أو شريط قصص)؛ ومفتاح الاستوديو ما زال يفتح استوديو القصص.",
          "شبكة الإحصاءات (من اليمين): الإعلانات النشطة مع 'N هذا الأسبوع' (الإعلانات المنشورة في آخر 7 أيام؛ وعدد النشطة إن لم يوجد)، خدمات نشطة، المشاهدات (الإجمالي، مقرّباً للمئة الأدنى مع '+'، مثلاً 712 ← '700+')، الرسائل الجديدة مع 'N اليوم' (رسائل الآخرين منذ منتصف الليل بتوقيت الكويت).",
          "اعلانات المكتب مع إعلانات نشطة: صف بطاقات (صور متتالية بنقاط، 'مميز' أو 'التمييز نشط حتى <يوم شهر>' أثناء التمييز، عنوان من الفئة ونوع الصفقة، السعر بالدينار أو 'السعر غير معلن'، المشاهدات / الحفظ / المحادثات، 'إدارة الإعلان'). 'عرض الكل' و'إدارة الإعلان' يفتحان العقارات؛ والبطاقة تفتح الإعلان.",
          "بلا إعلانات ولا إمكانية للنشر (لا باقة نشطة واستُخدم الإعلان المجاني): البطاقة الكحلية بالمزايا الثلاث ✓ و'اشتر باقة اعلانات'، تفتح شاشة الباقات (home-state1).",
          "بلا إعلانات مع باقة أو إعلان مجاني متبقٍ: البطاقة الكحلية مع 'ابدأ بإضافة أول إعلان لك'، تفتح إضافة إعلان (home-state2).",
          "الخدمات: بطاقة لكل خدمة في ملف المكتب بأيقونتها ووصفها حسب النوع (إيجار / شراء / تبادل)، 'إدارة الخدمة' و'N طلب نشط' حين تذكرها طلبات مرسلة للمكتب؛ ويختفي القسم إن لم يذكر الملف خدمات. البطاقات و'عرض الكل' تفتح تعديل ملف المكتب.",
          "عقارات السوق: حتى 8 إعلانات عامة مختلطة بيع / إيجار / بدل (دون إعلانات المكتب نفسه)، مع 'مميز'، والسعر أو 'السعر غير معلن'، و'طلب <سنة> مع <سنة>' في البدل، والمساحة، والموقع، و'مدخول العقار' إن تجاوز 0، و'تفاصيل'.",
          "قطاعات الأعمال: المفتاح الذهبي يبدّل بين مكاتب عقارية (بطاقات المكاتب: عدد الإعلانات الحية، وسوم بيع / إيجار / بدل للصفقات التي لها إعلانات حية، 'N خدمة'، التقييم والمراجعات الحقيقية أو 'لا تقييمات'، اتصال ومحادثة) وشركات (بطاقات الشركات مع عدد الخدمات، مشاريع مكتملة، التقييم، 'طلب عرض سعر' ومحادثة). لا يظهر المكتب نفسه. بلا 'عرض الكل' (الأدلة الكاملة في تبويبات الفرد).",
          "أحدث المحادثات: آخر 5 محادثات (الصورة، الاسم، وسم فئة الإعلان، آخر رسالة، عدّاد غير المقروء، الوقت النسبي)؛ ويختفي القسم إن لم توجد.",
          "لا يعرض أي قسم أرقاماً مختلقة: أثناء تحميل اللوحة يظهر مؤشر تحميل، وعند الفشل الرسالة و'إعادة المحاولة'.",
          "شارة المحادثات في الشريط السفلي هي مجموع غير المقروء في صندوق الوارد المحمّل (لم تعد 2 ثابتة)، وتظهر '99+' فوق 99.",
        ],
      },
      testScenarios: {
        en: [
          "Run office-home.spec.tsx: stats, ads with counts, both empty states and their targets, services with and without requests, market ads, chats, no group section, retry on failure.",
          "As a new office (free ad left, no package): the home shows zeros and 'ابدأ بإضافة أول إعلان لك'. Use the free ad on an ad, then open the home again with no package: 'اشتر باقة اعلانات'.",
          "Publish two ads and feature one: they appear in اعلانات المكتب, the featured one first with 'التمييز نشط حتى …'; save it from another account and chat about it: its heart and chat counts go up.",
          "Add 'عقار للايجار، تبادل عقاري' to the office services; from an individual, send the office a request whose category is 'عقار للايجار': the rent card shows '1 طلب نشط'.",
          "Switch قطاعات الأعمال to شركات and back; confirm your own office is not in the offices row.",
          "Compare each state side by side with the five Figma frames above.",
        ],
        ar: [
          "تشغيل office-home.spec.tsx: الإحصاءات، الإعلانات بعدّاداتها، حالتا الفراغ ووجهتاهما، الخدمات مع الطلبات وبدونها، عقارات السوق، المحادثات، غياب قسم المجموعات، وإعادة المحاولة عند الفشل.",
          "كمكتب جديد (إعلان مجاني متبقٍ، بلا باقة): الرئيسية تعرض أصفاراً و'ابدأ بإضافة أول إعلان لك'. استخدم الإعلان المجاني، ثم افتح الرئيسية بلا باقة: 'اشتر باقة اعلانات'.",
          "انشر إعلانين وميّز أحدهما: يظهران في اعلانات المكتب، المميز أولاً مع 'التمييز نشط حتى …'؛ احفظه من حساب آخر وراسل عنه: يزيد عدّادا القلب والمحادثات.",
          "أضف 'عقار للايجار، تبادل عقاري' إلى خدمات المكتب؛ ومن حساب فرد أرسل للمكتب طلباً فئته 'عقار للايجار': بطاقة الإيجار تعرض '1 طلب نشط'.",
          "بدّل قطاعات الأعمال إلى شركات ثم ارجع؛ وتأكد أن مكتبك ليس في صف المكاتب.",
          "قارن كل حالة جنباً إلى جنب مع إطارات فيجما الخمسة أعلاه.",
        ],
      },
      updatedIn: "feat/office-home-dashboard",
    },
    {
      id: "mobile-office-dashboard-live-data",
      title: {
        en: "Office Home runs on live data (GET /offices/me/dashboard and the public feeds)",
        ar: "رئيسية المكتب تعمل ببيانات حية (GET /offices/me/dashboard والخلاصات العامة)",
      },
      priority: "P1",
      endUserStory: {
        en: "As an office user, I want my dashboard to show real numbers for my active listings, services, views, and messages, so that I can actually gauge how my office's listings are performing.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد أن تعرض لوحة المعلومات أرقاماً حقيقية عن إعلاناتي النشطة وخدماتي ومشاهداتي ورسائلي، حتى أقيّم فعلياً أداء إعلانات مكتبي.",
      },
      story: {
        en: "The mock data (features/office/mockData.ts) is gone. useOfficeHome loads GET /offices/me/dashboard (stats, billing, ads, services; see api-office-dashboard), GET /properties/feed/home for عقارات السوق and GET /chat/conversations?limit=5 for أحدث المحادثات; قطاعات الأعمال loads GET /users/offices and GET /users/companies?sort=RATING_DESC when its tab is opened. Coming back to the home and pulling down refetch them.",
        ar: "حُذفت البيانات التجريبية (features/office/mockData.ts). يحمّل useOfficeHome ‏GET /offices/me/dashboard (الإحصاءات والفوترة والإعلانات والخدمات؛ راجع api-office-dashboard)، وGET /properties/feed/home لعقارات السوق، وGET /chat/conversations?limit=5 لأحدث المحادثات؛ ويحمّل قسم قطاعات الأعمال GET /users/offices وGET /users/companies?sort=RATING_DESC عند فتح تبويبه. العودة للرئيسية والسحب للأسفل يعيدان التحميل.",
      },
      acceptanceCriteria: {
        en: [
          "Every number and card on the office home comes from the API; none from bundled data.",
          "Switching to another profile and back loads that profile's home (the queries are keyed by the profile).",
          "A dashboard error does not hide the header or the Studio switch.",
        ],
        ar: [
          "كل رقم وبطاقة في رئيسية المكتب من الواجهة البرمجية؛ لا شيء من بيانات مضمّنة.",
          "التبديل إلى ملف آخر ثم العودة يحمّل رئيسية ذلك الملف (الاستعلامات مرتبطة بالملف).",
          "خطأ اللوحة لا يخفي الترويسة ولا مفتاح الاستوديو.",
        ],
      },
      testScenarios: {
        en: [
          "Sign in as an office with ads and chats, compare the stats with العقارات and المحادثات, then publish an ad, come back to the home: الإعلانات النشطة went up by one.",
          "Stop the API and pull to refresh: the error and 'إعادة المحاولة' show; start it and retry: the home loads.",
        ],
        ar: [
          "سجّل دخولك كمكتب له إعلانات ومحادثات، وقارن الإحصاءات بالعقارات والمحادثات، ثم انشر إعلاناً وعُد للرئيسية: زادت الإعلانات النشطة واحداً.",
          "أوقف الواجهة البرمجية واسحب للتحديث: تظهر رسالة الخطأ و'إعادة المحاولة'؛ شغّلها وأعد المحاولة: تُحمّل الرئيسية.",
        ],
      },
      updatedIn: "feat/office-home-dashboard",
    },
    {
      id: "mobile-office-more-dead-actions",
      title: {
        en: "Office profile single 'تعديل' button implemented matching Figma 4494:136610",
        ar: "تطبيق زر 'تعديل' الموحد لملف المكتب وفق تصميم فيجما 4494:136610",
      },
      priority: "P2",
      story: {
        en: "Resolved: In Figma 4494:136610, the Office profile card uses a single full-width primary 'تعديل' (Edit) button that routes to /office-edit-profile, superseding the older three-button row. Preview and Share actions were removed in the design specification in favor of the dedicated edit profile screen.",
        ar: "تم الحل: في تصميم فيجما 4494:136610، تستخدم بطاقة ملف المكتب زر 'تعديل' رئيسي واحد بعرض كامل ينقل إلى /office-edit-profile، مستبدلة صف الأزرار الثلاثة القديم. تم استبدال زري المعاينة والمشاركة في مواصفات التصميم لصالح شاشة تعديل الملف المخصصة.",
      },
      acceptanceCriteria: {
        en: [
          "Office profile card displays a single full-width 'تعديل' button with edit pencil icon.",
          "Tapping 'تعديل' routes to /office-edit-profile.",
        ],
        ar: [
          "بطاقة ملف المكتب تعرض زر 'تعديل' رئيسي واحد بعرض كامل مع أيقونة قلم التعديل.",
          "الضغط على 'تعديل' ينقل إلى /office-edit-profile.",
        ],
      },
      testScenarios: {
        en: [
          "Run office-more.spec.tsx and confirm pressing 'تعديل' routes to /office-edit-profile.",
        ],
        ar: [
          "تشغيل office-more.spec.tsx والتأكد من أن الضغط على 'تعديل' ينقل إلى /office-edit-profile.",
        ],
      },
      updatedIn: "feat/offices",
    },
    {
      id: "mobile-office-coming-soon-menu-items",
      title: {
        en: "Office menu has 4 intentional 'قريباً' items",
        ar: "قائمة المكتب فيها 4 عناصر 'قريباً' مقصودة",
      },
      priority: "P2",
      story: {
        en: "Confirm office-more.tsx shows a 'قريباً' alert for 'الصفقات' (Deals), 'المزادات' (Auctions), 'إدارة الوسطاء' (Broker management) and 'التحليلات' (Analytics) instead of navigating — planned features, not broken links. Company's menu no longer has such items.",
        ar: "تأكد من أن office-more.tsx يعرض تنبيه 'قريباً' لـ 'الصفقات' و'المزادات' و'إدارة الوسطاء' و'التحليلات' بدلاً من التنقل — ميزات مخططة وليست روابط معطلة. قائمة الشركة لم تعد تحتوي مثل هذه العناصر.",
      },
      acceptanceCriteria: {
        en: [
          "Each of the 4 items shows its 'ستكون متوفرة قريباً' alert and nothing else.",
          "Every other office menu item opens a real screen.",
        ],
        ar: [
          "كل عنصر من الأربعة يعرض تنبيه 'ستكون متوفرة قريباً' ولا شيء غيره.",
          "كل عناصر قائمة المكتب الأخرى تفتح شاشة حقيقية.",
        ],
      },
      testScenarios: {
        en: [
          "With the flag on, tap each menu item on the office More tab.",
        ],
        ar: [
          "مع تفعيل المفتاح اضغط كل عنصر في قائمة المزيد للمكتب.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-office-properties-empty",
      title: {
        en: "Office Properties tab is permanently empty regardless of filter (known gap)",
        ar: "تبويب عقارات المكتب العقاري فارغ بشكل دائم بغض النظر عن الفلتر المختار (نقص معروف)",
      },
      priority: "P1",
      endUserStory: {
        en: "As an office user, I want to see and manage my listed properties, filtered by their publish status, so that I can track what's live, in draft, or archived.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد رؤية وإدارة عقاراتي المُدرجة، مفلترةً حسب حالة النشر، حتى أتمكن من تتبع ما هو منشور، وما هو في مسودة، وما هو مؤرشف.",
      },
      story: {
        en: "Verify that office-properties.tsx renders its all/published/draft/archived filter pills but the list stays empty no matter which is selected. Track this known frontend/backend wiring gap explicitly and re-verify it once real property data is wired in.",
        ar: "تحقق من أن office-properties.tsx يعرض أزرار فلترة الكل/المنشور/المسودة/المؤرشف، لكن القائمة تبقى فارغة أياً كان الفلتر المختار. وثّق هذه الفجوة المعروفة في الربط بين الواجهة والخلفية صراحةً وأعد مراجعتها بمجرد ربط بيانات عقارات حقيقية.",
      },
      acceptanceCriteria: {
        en: [
          "All 4 filter pills (all/published/draft/archived) render and are tappable.",
          "The list beneath stays empty for every filter — expected today.",
          "The screen settles into a clear empty state rather than an infinite spinner or crash.",
        ],
        ar: [
          "أزرار الفلترة الأربعة (الكل/منشور/مسودة/مؤرشف) تُعرض جميعها وقابلة للضغط.",
          "القائمة أسفلها تبقى فارغة مع كل فلتر — وهذا متوقع حالياً.",
          "الشاشة تستقر على حالة فارغة واضحة، لا مؤشر تحميل لا ينتهي ولا تعطّل.",
        ],
      },
      testScenarios: {
        en: [
          "Tap through all 4 filter pills and confirm each renders the same empty state.",
          "Navigate to office-properties both from the Office Home stats cards and from wherever else it's reachable, and confirm behavior is identical from both entry points.",
          "Re-run this check once backend wiring lands and flip the acceptance criteria to expect real data.",
        ],
        ar: [
          "اضغط عبر أزرار الفلترة الأربعة جميعها وتأكد أن كل واحد يعرض نفس الحالة الفارغة.",
          "انتقل إلى office-properties من كل من بطاقات إحصاءات الصفحة الرئيسية للمكتب العقاري ومن أي مكان آخر يمكن الوصول منه، وتأكد أن السلوك متطابق من كلتا نقطتَي الدخول.",
          "أعد هذا الفحص بمجرد ربط الواجهة الخلفية، وعدّل معايير القبول لتتوقع بيانات حقيقية.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-office-add-tab-empty",
      title: {
        en: "Office '+' tab triggers OfficeAddActionSheet and routes to Add Listing screen (Figma 4494:141442 & 4494:141944)",
        ar: "تبويب '+' للمكتب يفتح نافذة الإجراءات OfficeAddActionSheet وينقل لشاشة إضافة إعلان (فيجما 4494:141442 و 4494:141944)",
      },
      priority: "P1",
      endUserStory: {
        en: "As an office user, I want a dedicated bottom sheet with office actions ('اضافة اعلان' and 'اضافة خدمة') and a comprehensive add listing screen matching Figma design, so that I can list my properties with full commercial specs and photos.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد نافذة سفلية مخصصة لإجراءات المكتب ('اضافة اعلان' و 'اضافة خدمة') وشاشة متكاملة لإضافة الإعلان مطابقة لتصميم فيجما، حتى أتمكن من إدراج عقاراتي بالمواصفات الكاملة والصور.",
      },
      story: {
        en: "Implements Figma nodes 4494:141442 and 4494:141944: In OfficeLayout, tapping the center '+' button triggers OfficeAddActionSheet ('إضافة جديد'). Tapping 'اضافة اعلان' routes to /(office)/add which provides the full property creation form: listing type selector (sell/rent/swap), property information (governorate, area, map location, category, space, property age, PACI number, room/bath steppers, amenities), price details (switch toggle, phone number, description, remaining quota card), image dropzone, and sticky preview CTA button ('معاينة الاعلان').",
        ar: "تطبيق تصاميم فيجما 4494:141442 و 4494:141944: في تخطيط المكتب OfficeLayout، الضغط على زر '+' الأوسط يفتح نافذة OfficeAddActionSheet ('إضافة جديد'). الضغط على 'اضافة اعلان' ينقل إلى /(office)/add التي توفر نموذجاً متكاملاً لإضافة العقار: محدد نوع الإعلان (بيع/إيجار/بدل)، معلومات العقار (المحافظة، المنطقة، الموقع على الخريطة، فئة العقار، المساحة، عمر العقار، الرقم الآلي للعقار، عدّادات الغرف والحمامات، المزايا)، السعر والتفاصيل (مفتاح السعر، رقم الهاتف، تفاصيل الإعلان، بطاقة الحصة المتبقية)، منطقة رفع الصور، وزر المعاينة الثابت في الأسفل ('معاينة الاعلان').",
      },
      acceptanceCriteria: {
        en: [
          "Tapping '+' in OfficeLayout presents OfficeAddActionSheet matching Figma 4494:141442 with title 'إضافة جديد'.",
          "OfficeAddActionSheet provides 'اضافة اعلان' (navigates to /(office)/add) and 'اضافة خدمة'.",
          "/(office)/add implements Figma 4494:141944 with top bar, listing type selector, property details, price switch, description, image dropzone, and sticky 'معاينة الاعلان' CTA.",
          "Unit tests in office-action-sheet.spec.tsx and office-add.spec.tsx verify component mounting and user interactions.",
        ],
        ar: [
          "الضغط على '+' في OfficeLayout يفتح نافذة OfficeAddActionSheet مطابقة لتصميم فيجما 4494:141442 بعنوان 'إضافة جديد'.",
          "نافذة OfficeAddActionSheet تحتوي خياري 'اضافة اعلان' (ينقل إلى /(office)/add) و 'اضافة خدمة'.",
          "مسار /(office)/add يطبق تصميم فيجما 4494:141944 مع الشريط العلوي، محدد نوع الإعلان، تفاصيل العقار، مفتاح السعر، الوصف، رفع الصور، وزر المعاينة الثابت 'معاينة الاعلان'.",
          "اختبارات الوحدة في office-action-sheet.spec.tsx و office-add.spec.tsx تؤكد صحة العرض وتفاعل المستخدم.",
        ],
      },
      testScenarios: {
        en: [
          "Run office-action-sheet.spec.tsx and verify sheet header and actions render and trigger callbacks.",
          "Run office-add.spec.tsx and verify form fields, steppers, and submit alerts function as expected.",
        ],
        ar: [
          "تشغيل office-action-sheet.spec.tsx والتأكد من عرض الترويسة والأزرار واستدعاء الإجراءات بشكل صحيح.",
          "تشغيل office-add.spec.tsx والتأكد من عمل حقول النموذج والعدّادات وتنبيهات الإرسال كما هو متوقع.",
        ],
      },
      updatedIn: "feat/offices",
    },
    {
      id: "mobile-office-add-listing-10-screens-figma",
      title: {
        en: "Office Add Listing complete flow across 10 Figma screens (Sell, Rent, Exchange, Frontage, Plan Quota, Preview, and Success)",
        ar: "مسار إضافة إعلان المكتب العقاري المتكامل عبر 10 شاشات فيجما (بيع، إيجار، بدل، واجهة العقار، حصص الباقة، المعاينة، والنجاح)",
      },
      priority: "P1",
      endUserStory: {
        en: "As an office user, I want dynamic property creation forms for Sell, Rent, and Exchange (Land vs House), frontage orientation selection, package quota badges, a full listing preview, and a verified success confirmation, so that I can accurately publish commercial listings.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد نماذج تفاعلية مرنة لإضافة عقارات البيع والإيجار والبدل (أرض مقابل بيت)، واختيار واجهة العقار، وشارات حصص الباقات، ومعاينة كاملة للإعلان، وتأكيداً موثقاً للنجاح، حتى أتمكن من نشر إعلاناتي التجارية بدقة واحترافية.",
      },
      story: {
        en: "Implements the 10 Figma designs: 4494:141833 (Sell with quota badges '2 فضي' and '20 عادي' and income toggle 'مدخول العقار'), 4494:142107 (Sell with active price field in KWD and '5 عادي' quota), 4494:142357 ('ما يميز عقارك' trigger box), 4494:141814 (Frontage orientation dropdown with 6 options: بطن وظهر، زاوية، شارع واحد، ثلاث شوارع، ثلاث شوارع غير متصلة، شارعين زاوية غير متصلين), 4494:142222 (Form with orientation dropdown open), 4494:142372 (Rent with floors stepper, monthly rent, additional expenses, and rental conditions), 4494:142486 (Exchange Land with request/desired years, allocation state, steppers hidden), 4494:142573 (Exchange House with request/desired years, allocation state, and floors/baths/rooms steppers), 4494:142685 (Preview screen with specifications key-value summary, image gallery, save as draft, and submit buttons), and 4494:142831 (Success bottom sheet modal with green rosette checkmark and 'عرض الإعلان' / 'العودة للرئيسية' buttons).",
        ar: "تطبيق تصاميم فيجما العشرة: 4494:141833 (البيع مع شارات الحصص '2 فضي' و '20 عادي' ومفتاح 'مدخول العقار')، 4494:142107 (البيع مع حقل السعر النشط بالدينار الكويتي وحصة '5 عادي')، 4494:142357 (مربع 'ما يميز عقارك')، 4494:141814 (قائمة واجهات العقار بـ 6 خيارات: بطن وظهر، زاوية، شارع واحد، ثلاث شوارع، ثلاث شوارع غير متصلة، شارعين زاوية غير متصلين)، 4494:142222 (النموذج مع القائمة المنسدلة مفتوحة)، 4494:142372 (الإيجار مع عدّاد الأدوار، الإيجار الشهري، المصاريف الإضافية، وشروط الإيجار)، 4494:142486 (بدل أرض مع سنوات الطلب وحالة التخصيص وإخفاء عدّادات الغرف)، 4494:142573 (بدل بيت مع سنوات الطلب وحالة التخصيص وإظهار عدّادات الأدوار والحمامات والغرف)، 4494:142685 (شاشة المعاينة بملخص المواصفات ومعرض الصور وزري حفظ كمسودة وإضافة الإعلان)، و 4494:142831 (نافذة النجاح السفلية بشارة التحقق الخضراء وزري 'عرض الإعلان' و'العودة للرئيسية').",
      },
      acceptanceCriteria: {
        en: [
          "Figma 4494:141833 & 4494:142107: Sell form includes property income toggle ('مدخول العقار') and OfficePlanQuotaSelector driven by the office persona's REAL wallet (GET /plans/wallet): 'لديك N عادي' and 'لديك M فضي' reflect the actual normal/silver slot balances — the Figma values ('2 فضي', '20 عادي', '5 عادي') are sample data, never literals.",
          "With no ad credits left in the wallet, publishing is blocked and the hint 'لا توجد إعلانات متبقية في باقتك...' shows.",
          "Figma 4494:142357 & 4494:141814: OrientationDropdown provides trigger 'ما يميز عقارك' and options menu with 6 orientation choices.",
          "Figma 4494:142372: Rent tab displays 'الايجار الشهري', additional expenses textarea, and rental conditions textarea.",
          "Categories and fields match the individual flow (see mobile-add-ad-category-fields): بيع/إيجار offer بيت، شقة، عمارة، أرض، تجاري، استثماري، شاليه، مزرعة and بدل offers أرض and بيت, each with its own fields from the requirements document. The ad is saved with the picked category. A sale or rent ad must have a price: the price switch is hidden and معاينة الاعلان stays off until it is filled.",
          "Figma 4494:142486 & 4494:142573: Exchange tab shows request year ('سنة الطلب') and desired year ('السنة المطلوبة') and allocation status; hides steppers for Land and displays baths/rooms for House.",
          "Figma 4494:142685: Office preview screen renders structured details card, image gallery, 'حفظ كمسودة' (Save as draft), and 'إضافة الاعلان' (Submit).",
          "Figma 4494:142831: SuccessModal displays rosette checkmark with 'عرض الإعلان' and 'العودة للرئيسية'.",
          "Unit tests verify all 10 states across office-add.spec.tsx, office-preview.spec.tsx, OrientationDropdown.spec.tsx, and OfficePlanQuotaSelector.spec.tsx.",
        ],
        ar: [
          "فيجما 4494:141833 و 4494:142107: نموذج البيع يشمل مفتاح مدخول العقار ومحدد حصص الباقة المربوط بمحفظة المكتب الحقيقية (GET /plans/wallet): 'لديك N عادي' و 'لديك M فضي' تعكسان أرصدة الحصص الفعلية — قيم فيجما ('2 فضي'، '20 عادي'، '5 عادي') بيانات نموذجية وليست أرقاماً ثابتة.",
          "عند عدم وجود رصيد إعلانات، يُمنع النشر ويظهر تنبيه 'لا توجد إعلانات متبقية في باقتك...'.",
          "فيجما 4494:142357 و 4494:141814: مكوّن OrientationDropdown يوفر زر 'ما يميز عقارك' وقائمة منسدلة بـ 6 خيارات لواجهة العقار.",
          "فيجما 4494:142372: تبويب الإيجار يعرض 'الايجار الشهري'، حقل المصاريف الإضافية، وحقل شروط الإيجار.",
          "الفئات والحقول مطابقة لمسار الأفراد (انظر mobile-add-ad-category-fields): البيع/الإيجار يعرضان بيت، شقة، عمارة، أرض، تجاري، استثماري، شاليه، مزرعة والبدل يعرض أرض وبيت، ولكل فئة حقولها من وثيقة المتطلبات. ويُحفظ الإعلان بالفئة المختارة. وإعلان البيع أو الإيجار يتطلب سعراً: مفتاح السعر مخفي ومعاينة الاعلان معطلة حتى يُملأ.",
          "فيجما 4494:142486 و 4494:142573: تبويب البدل يعرض سنة الطلب والسنة المطلوبة وحالة التخصيص، ويخفي العدّادات للأرض ويعرض الحمامات والغرف للبيت.",
          "فيجما 4494:142685: شاشة معاينة المكتب تعرض بطاقة تفاصيل المواصفات ومعرض الصور وزري 'حفظ كمسودة' و 'إضافة الاعلان'.",
          "فيجما 4494:142831: نافذة SuccessModal تعرض شارة النجاح الخضراء وزري 'عرض الإعلان' و 'العودة للرئيسية'.",
          "اختبارات الوحدة تؤكد صحة الشاشات العشر عبر office-add.spec.tsx و office-preview.spec.tsx و OrientationDropdown.spec.tsx و OfficePlanQuotaSelector.spec.tsx.",
        ],
      },
      testScenarios: {
        en: [
          "Run office-add.spec.tsx and confirm all 10 states pass (Sell, Rent, Exchange Land/House, Income toggle, Orientation dropdown, Quota selector).",
          "Run office-preview.spec.tsx and confirm details card, actions, and success modal wiring pass.",
          "Run OrientationDropdown.spec.tsx and OfficePlanQuotaSelector.spec.tsx to ensure isolated component correctness.",
          "With a wallet of 5 normal + 4 silver slots, the selector shows '5 عادي', '4 فضي' and '9 إعلانات متبقية في باقتك'; with 0 credits the publish button is disabled and the no-credits hint shows.",
        ],
        ar: [
          "تشغيل office-add.spec.tsx والتأكد من نجاح اختبارات الحالات العشر (بيع، إيجار، بدل أرض/بيت، مفتاح المدخول، قائمة الواجهة، محدد الحصة).",
          "تشغيل office-preview.spec.tsx والتأكد من صحة بطاقة التفاصيل والإجراءات ونافذة النجاح.",
          "تشغيل OrientationDropdown.spec.tsx و OfficePlanQuotaSelector.spec.tsx لضمان صحة المكونات المستقلة.",
          "بمحفظة 5 عادي + 4 فضي يعرض المحدد '5 عادي' و '4 فضي' و '9 إعلانات متبقية في باقتك'؛ وبرصيد صفر يُعطل زر النشر ويظهر تنبيه عدم وجود رصيد.",
        ],
      },
      updatedIn: "feat/add-ad-category-fields",
    },
    {
      id: "mobile-office-more-figma",
      title: {
        en: "Office More screen fully implemented matching Figma 4494:136610",
        ar: "تطبيق شاشة 'المزيد' للمكتب العقاري بالكامل وفق تصميم فيجما 4494:136610",
      },
      priority: "P1",
      endUserStory: {
        en: "As an office user, I want a dedicated More menu with my office profile card, licence number, bio, and business management links matching Figma design, so that I can manage my office operations, account, and settings seamlessly.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد قائمة 'المزيد' مخصصة مع بطاقة ملف مكتبي ورقم الترخيص والنبذة وروابط إدارة الأعمال وفق تصميم فيجما، حتى أتمكن من إدارة عمليات مكتبي وحسابي وإعداداتي بسلاسة.",
      },
      story: {
        en: "Implements Figma node 4494:136610: OfficeProfileCard with navy stripe, overlapping logo, verified badge, office licence number ('الرخصة: 2454685'), bio, locations with pin icon, and full-width 'تعديل' button; and 5 organized menu sections: Business Management ('ادارة الأعمال' with listings and services), My Activity ('نشاطي' with chats badge '3' and favorites), Reviews ('التقييمات'), Account & Subscription ('الحساب والاشتراك' with plans, balance, invoices), and Settings ('الإعدادات' with account settings and logout).",
        ar: "تطبيق تصميم فيجما 4494:136610: بطاقة OfficeProfileCard بالشريط الكحلي، الشعار المتداخل، شارة التحقق، رقم ترخيص المكتب ('الرخصة: 2454685')، النبذة التعريفية، المواقع مع أيقونة الموقع، وزر 'تعديل' بعرض كامل؛ و 5 أقسام منظمة للقائمة: إدارة الأعمال ('الاعلانات' و 'الخدمات')، نشاطي ('المحادثات' مع شارة '3' و 'المفضلة')، التقييمات ('التقييمات والمراجعات')، الحساب والاشتراك ('الباقات'، 'رصيد الحساب'، 'الفواتير')، والإعدادات ('اعدادات الحساب' و 'تسجيل الخروج').",
      },
      acceptanceCriteria: {
        en: [
          "Office profile card renders display name, verified badge, persona pill, licence number line, bio, locations, and single 'تعديل' button.",
          "Menu sections render exact Figma hierarchy: Business Management, My Activity (with unread badge), Reviews, Account & Subscription, and Settings.",
          "Tapping 'تعديل' routes to /office-edit-profile.",
          "Unit tests in office-more.spec.tsx verify all items, badges, and navigation actions.",
        ],
        ar: [
          "بطاقة ملف المكتب تعرض اسم العرض، شارة التحقق، محدد الصفة، سطر رقم الترخيص، النبذة، المواقع، وزر 'تعديل' الموحد.",
          "أقسام القائمة تطابق تسلسل فيجما بدقة: إدارة الأعمال، نشاطي (مع شارة غير المقروء)، التقييمات، الحساب والاشتراك، والإعدادات.",
          "الضغط على 'تعديل' ينقل إلى /office-edit-profile.",
          "اختبارات الوحدة في office-more.spec.tsx تؤكد صحة جميع العناصر والشارات وإجراءات التنقل.",
        ],
      },
      testScenarios: {
        en: [
          "Run office-more.spec.tsx and confirm all sections and navigation triggers pass.",
        ],
        ar: [
          "تشغيل office-more.spec.tsx والتأكد من نجاح اختبارات جميع الأقسام وروابط التنقل.",
        ],
      },
      updatedIn: "feat/offices",
    },
    {
      id: "mobile-office-edit-profile-figma",
      title: {
        en: "Office Edit Profile screen fully implemented matching Figma 4494:136911 & 4494:138999",
        ar: "تطبيق شاشة تعديل الملف الشخصي للمكتب العقاري بالكامل وفق تصميم فيجما 4494:136911 و 4494:138999",
      },
      priority: "P1",
      endUserStory: {
        en: "As an office user, I want a dedicated edit profile screen with sections for office info and commercial licence upload, so that I can keep my office details accurate and verify my account.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد شاشة تعديل ملف شخصي مخصصة مع أقسام لمعلومات المكتب ورفع رخصة العمل التجارية، حتى أتمكن من تحديث بيانات مكتبي بدقة وتوثيق حسابي.",
      },
      story: {
        en: "Implements Figma nodes 4494:136911 and 4494:138999: Header with back button and screen title ('تعديل الملف الشخصي'); logo upload with camera button; Section 1 'عن المكتب' (office name, email, phone with +965, whatsapp with +965, headquarters location with pin, about/bio textarea, working hours with calendar icon); Section 2 'رخصة المكتب' (activity selector, licence number, expiry date with date picker, licence document upload dropzone with 'صورة الرخصة تؤهلك لتوثيق حسابك'); and sticky bottom 'حفظ التغييرات' action button.",
        ar: "تطبيق تصاميم فيجما 4494:136911 و 4494:138999: الترويسة مع زر الرجوع وعنوان الشاشة ('تعديل الملف الشخصي')؛ رفع الشعار مع زر الكاميرا؛ القسم الأول 'عن المكتب' (اسم المكتب، البريد، الهاتف مع +965، الواتساب مع +965، المقر الرئيسي مع أيقونة الموقع، نبذة عن الشركة، ومواعيد العمل)؛ القسم الثاني 'رخصة المكتب' (محدد النشاط، رقم الرخصة، تاريخ الانتهاء مع محدد التاريخ، منطقة رفع صورة الرخصة مع عبارة 'صورة الرخصة تؤهلك لتوثيق حسابك')؛ وزر 'حفظ التغييرات' الثابت في الأسفل.",
      },
      acceptanceCriteria: {
        en: [
          "Header renders title 'تعديل الملف الشخصي' and back navigation.",
          "Section 1 'عن المكتب' renders inputs for name, email, phone (+965), whatsapp (+965), headquarters, bio, and working hours.",
          "Section 2 'رخصة المكتب' renders activity selector, licence number, expiry date picker, and document dropzone.",
          "Bottom CTA 'حفظ التغييرات' is disabled when pristine and active (#15304D) when form is dirty.",
          "Submitting form triggers apiClient.patch and refreshes profile.",
          "Unit tests in OfficeEditProfile.spec.tsx and office-edit-profile.spec.tsx pass.",
        ],
        ar: [
          "الترويسة تعرض عنوان 'تعديل الملف الشخصي' وزر الرجوع.",
          "القسم الأول 'عن المكتب' يعرض حقول الاسم، البريد، الهاتف (+965)، الواتساب (+965)، المقر الرئيسي، النبذة، ومواعيد العمل.",
          "القسم الثاني 'رخصة المكتب' يعرض اختيار النشاط، رقم الرخصة، تاريخ الانتهاء، ومنطقة رفع المستند.",
          "زر 'حفظ التغييرات' معطل عندما لا توجد تغييرات ونشط (#15304D) عند تعديل أي حقل.",
          "إرسال النموذج يستدعي apiClient.patch ويحدّث الملف الشخصي.",
          "نجاح اختبارات الوحدة في OfficeEditProfile.spec.tsx و office-edit-profile.spec.tsx.",
        ],
      },
      testScenarios: {
        en: [
          "Run OfficeEditProfile.spec.tsx and confirm all fields, dirty state detection, and submit handlers pass.",
          "Run office-edit-profile.spec.tsx and confirm screen wrapper renders without errors.",
        ],
        ar: [
          "تشغيل OfficeEditProfile.spec.tsx والتأكد من نجاح اختبارات جميع الحقول واكتشاف التعديلات ومعالجة الإرسال.",
          "تشغيل office-edit-profile.spec.tsx والتأكد من تحميل مغلّف الشاشة دون أخطاء.",
        ],
      },
      updatedIn: "feat/offices",
    },
  ],
};
