import { DocSection } from "./types";

export const mobileIndividual: DocSection = {
  slug: "mobile-individual",
  title: { en: "Mobile — Individual", ar: "الجوال — الفرد" },
  summary: {
    en: "The (individual) route group and the individual auth screens — company and office accounts are covered in their own sections. Covers login, signup, Google/Apple sign-in, OTP, password recovery, the persona switcher, favorites (properties, companies, offices), My Activity (drafts, archive, republish, feature, delete), home sort, and temporary account suspension.",
    ar: "مجموعة مسارات (individual) وشاشات مصادقة الفرد — حسابات الشركات والمكاتب موثّقة في أقسامها. يغطي تسجيل الدخول، التسجيل، الدخول عبر Google/Apple، رمز التحقق، استعادة كلمة المرور، مبدّل الهوية، المفضلة (عقارات وشركات ومكاتب)، نشاطي (المسودات، الأرشفة، إعادة النشر، التمييز، الحذف)، ترتيب الرئيسية، والتعليق المؤقت للحساب.",
  },
  stories: [
    {
      id: "mobile-favorites",
      title: {
        en: "Favorites for properties, companies and offices, with clear-all and undo",
        ar: "المفضلة للعقارات والشركات والمكاتب، مع مسح الكل والتراجع",
      },
      priority: "P0",
      endUserStory: {
        en: "As an individual user, I want to save properties, companies and offices and find them again later, so that I don't lose track of options while comparing.",
        ar: "بصفتي مستخدماً فردياً، أريد حفظ العقارات والشركات والمكاتب والعثور عليها لاحقاً، حتى لا أفقد تتبع الخيارات أثناء المقارنة.",
      },
      story: {
        en: "Verify the Favorites screen's three tabs: properties (POST /favorites/:propertyId toggle, GET /favorites), companies and offices (POST /favorites/providers/:providerId toggle, GET /favorites/providers?type=COMPANY|OFFICE). 'مسح الكل' clears the current tab in one call (DELETE /favorites/all?type=properties|COMPANY|OFFICE) and shows an undo toast; 'تراجع' puts them back (POST /favorites/restore with the returned ids). Favorites belong to the active persona.",
        ar: "تحقق من تبويبات شاشة المفضلة الثلاثة: العقارات (POST /favorites/:propertyId للتبديل، GET /favorites)، والشركات والمكاتب (POST /favorites/providers/:providerId للتبديل، GET /favorites/providers?type=COMPANY|OFFICE). 'مسح الكل' يمسح التبويب الحالي بطلب واحد (DELETE /favorites/all?type=properties|COMPANY|OFFICE) ويعرض إشعار تراجع؛ و'تراجع' يعيدها (POST /favorites/restore مع المعرّفات المُعادة). المفضلة تخص الهوية النشطة.",
      },
      acceptanceCriteria: {
        en: [
          "Toggling a heart updates instantly and matches the server after refresh, on ad cards, company cards and office cards.",
          "Each tab lists exactly what the persona saved, with pagination and pull-to-refresh.",
          "'مسح الكل' empties only the current tab; 'تراجع' within the toast restores the same items.",
          "Ads from suspended or blocked owners don't appear in Favorites.",
        ],
        ar: [
          "تبديل القلب يتحدّث فوراً ويطابق الخادم بعد التحديث، في بطاقات الإعلانات والشركات والمكاتب.",
          "كل تبويب يعرض بالضبط ما حفظته الهوية، مع التصفح والسحب للتحديث.",
          "'مسح الكل' يفرغ التبويب الحالي فقط؛ و'تراجع' خلال الإشعار يعيد نفس العناصر.",
          "إعلانات المالكين المعلّقين أو المحظورين لا تظهر في المفضلة.",
        ],
      },
      testScenarios: {
        en: [
          "Save 2 companies and 1 office; open each tab — counts match.",
          "In Companies, tap 'مسح الكل' then 'تراجع' — both companies return.",
          "Tap 'مسح الكل' and let the toast expire — the tab stays empty after reopening the app.",
          "Save 15+ properties — the list scrolls and paginates with no duplicates.",
        ],
        ar: [
          "احفظ شركتين ومكتباً واحداً؛ افتح كل تبويب — الأعداد مطابقة.",
          "في الشركات اضغط 'مسح الكل' ثم 'تراجع' — تعود الشركتان.",
          "اضغط 'مسح الكل' واترك الإشعار ينتهي — يبقى التبويب فارغاً بعد إعادة فتح التطبيق.",
          "احفظ أكثر من 15 عقاراً — القائمة تتصفح دون تكرار.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-home-feed-actions",
      title: {
        en: "Home feed: favorite and share work on every card, sheet and office",
        ar: "الرئيسية: المفضلة والمشاركة تعملان في كل بطاقة ونافذة ومكتب",
      },
      priority: "P0",
      story: {
        en: "Regression check for a fixed bug: on Home, the heart and share on property cards (Card and List view), inside the 'عرض تفاصيل' sheet, and the heart on office cards all go to the server — properties via POST /favorites/:propertyId, offices via POST /favorites/providers/:providerId — and share opens the native share sheet. Previously these were unwired or only changed local state.",
        ar: "فحص تراجع لخطأ تم إصلاحه: في الرئيسية، القلب والمشاركة في بطاقات العقارات (عرض البطاقات والقائمة)، وداخل نافذة 'عرض تفاصيل'، والقلب في بطاقات المكاتب، كلها تصل للخادم — العقارات عبر POST /favorites/:propertyId والمكاتب عبر POST /favorites/providers/:providerId — والمشاركة تفتح نافذة المشاركة في الجهاز. سابقاً كانت غير موصولة أو تغيّر الحالة المحلية فقط.",
      },
      acceptanceCriteria: {
        en: [
          "Tapping ANY property card on Home — Card view (with images) or List view — opens the 'عرض تفاصيل' details sheet; the full property page opens from the sheet's عرض العقار button (previously with-image cards skipped the sheet and navigated away).",
          "A heart tapped on a Home card, in the details sheet or on an office card is still filled after closing and reopening the app, and the item appears in Favorites.",
          "Share on a card and in the details sheet opens the native share sheet.",
          "As a guest, tapping a heart opens the sign-in sheet instead of doing nothing.",
          "The chat button on an office card opens a chat with that office (not its profile); a guest is asked to sign in.",
        ],
        ar: [
          "الضغط على أي بطاقة عقار في الرئيسية — عرض البطاقات (بصور) أو عرض القائمة — يفتح نافذة 'عرض تفاصيل'؛ وتفتح صفحة العقار الكاملة من زر عرض العقار داخل النافذة (سابقاً كانت البطاقات المصورة تتجاوز النافذة وتنتقل للصفحة).",
          "القلب المضغوط في بطاقة بالرئيسية أو في نافذة التفاصيل أو في بطاقة مكتب يبقى ممتلئاً بعد إغلاق التطبيق وفتحه، ويظهر العنصر في المفضلة.",
          "المشاركة في البطاقة وفي نافذة التفاصيل تفتح نافذة المشاركة في الجهاز.",
          "كزائر، الضغط على القلب يفتح نافذة تسجيل الدخول بدلاً من عدم فعل شيء.",
          "زر المحادثة في بطاقة المكتب يفتح محادثة مع المكتب (لا ملفه الشخصي)؛ ويُطلب من الزائر تسجيل الدخول.",
        ],
      },
      testScenarios: {
        en: [
          "Favorite from Card view, List view and the details sheet — all three show in Favorites → عقارات.",
          "Favorite an office on Home → مكاتب عقارية, relaunch — still favorited and listed under Favorites → مكاتب.",
          "On Home → مكاتب عقارية tap the chat button on an office — the chat with it opens.",
        ],
        ar: [
          "فضّل من عرض البطاقات وعرض القائمة ونافذة التفاصيل — تظهر الثلاثة في المفضلة ← عقارات.",
          "فضّل مكتباً في الرئيسية ← مكاتب عقارية، ثم أعد تشغيل التطبيق — يبقى مفضلاً ويظهر في المفضلة ← مكاتب.",
          "في الرئيسية ← مكاتب عقارية اضغط زر المحادثة في مكتب — تفتح المحادثة معه.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
    {
      id: "mobile-home-tabs-and-view-modes",
      title: {
        en: "Home feed's primary tabs, Sale/Rent/Exchange filters, and Card/List toggle each refetch and render correctly",
        ar: "التبويبات الرئيسية للصفحة الرئيسية، وفلاتر بيع/إيجار/بدل، ومبدّل عرض البطاقات/القائمة، كلها تُعيد الجلب والعرض بشكل صحيح",
      },
      priority: "P1",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=3539-122605&m=dev",
          label: { en: "Properties tab — بيع (Sale)", ar: "تبويب العقارات — بيع" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1258-55624&m=dev",
          label: { en: "Properties tab — إيجار (Rent)", ar: "تبويب العقارات — إيجار" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=5210-112649&m=dev",
          label: { en: "Properties tab — بدل (Exchange)", ar: "تبويب العقارات — بدل" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=5210-113445&m=dev",
          label: { en: "Offices tab", ar: "تبويب المكاتب العقارية" },
        },
      ],
      endUserStory: {
        en: "As an individual user, I want to switch between Properties and Offices, filter Properties by Sale/Rent/Exchange, and toggle between card and list layouts, so that I can browse the way that suits me without the feed ever showing stale or mismatched results from whatever I was looking at a moment ago.",
        ar: "بصفتي مستخدماً فردياً، أريد التبديل بين العقارات والمكاتب العقارية، وتصفية العقارات حسب بيع/إيجار/بدل، والتبديل بين تخطيطي البطاقات والقائمة، حتى أتصفح بالطريقة التي تناسبني دون أن تعرض القائمة أبداً نتائج قديمة أو غير متطابقة مما كنت أنظر إليه قبل لحظات.",
      },
      story: {
        en: "Verify HomeScreen's tab/filter/sort state (sort: الافتراضي/الأحدث/الأقدم, see mobile-home-sort) and its tab/filter state machine (activeTab: 'properties'|'offices', activePropFilter: 'all'|'sale'|'rent'|'exchange', viewMode: 'card'|'list') correctly re-triggers HomeProperties' fetch effect on every filter change and never leaks stale data from the previous filter into the newly-rendered list — this is exactly the class of state-transition bug that sails through a slow, deliberate manual pass and only shows up under real usage patterns like a user impatiently tapping between tabs.",
        ar: "تحقق من أن آلة الحالة الخاصة بتبويبات/فلاتر HomeScreen (activeTab: 'properties'|'offices'، activePropFilter: 'all'|'sale'|'rent'|'exchange'، viewMode: 'card'|'list') تُعيد تفعيل تأثير الجلب في HomeProperties بشكل صحيح مع كل تغيير في الفلتر، ولا تسرّب بيانات قديمة من الفلتر السابق إلى القائمة المعروضة حديثاً — هذا بالضبط نوع أخطاء انتقال الحالة الذي يمر مرور الكرام في جولة اختبار يدوية بطيئة ومتأنية، ولا يظهر إلا في أنماط الاستخدام الحقيقية مثل مستخدم يضغط بين التبويبات بنفاد صبر.",
      },
      acceptanceCriteria: {
        en: [
          "AC1: switching between بيع/إيجار/بدل triggers a fresh fetch (visible via the loading skeleton) and the list fully replaces — never appends to — the previous filter's results.",
          "AC2: switching to مكاتب عقارية swaps to HomeOffices entirely and HomeFilterPills correctly returns null, hiding the Sale/Rent/Exchange pills — confirm no orphaned filter state bleeds back in when returning to عقارات.",
          "AC3: toggling Card ↔ List view preserves the currently active Sale/Rent/Exchange filter and the already-loaded dataset rather than silently resetting to page 1 of 'all'.",
          "AC4: infinite scroll (onEndReached, page-based, deduplicated by item.id) continues to respect whichever filter is active after a filter change mid-scroll — no cross-filter duplicate or missing items.",
        ],
        ar: [
          "AC1: التبديل بين بيع/إيجار/بدل يُفعّل جلباً جديداً للبيانات (مرئياً عبر هيكل التحميل) وتستبدل القائمة نتائج الفلتر السابق بالكامل — لا تُضيف إليها أبداً.",
          "AC2: التبديل إلى مكاتب عقارية يستبدل المحتوى بالكامل بـ HomeOffices، ويُعيد HomeFilterPills القيمة null بشكل صحيح مخفياً فلاتر بيع/إيجار/بدل — تأكد من عدم تسرّب حالة فلتر يتيمة عند العودة إلى عقارات.",
          "AC3: التبديل بين عرض البطاقات وعرض القائمة يحافظ على فلتر بيع/إيجار/بدل النشط حالياً وعلى مجموعة البيانات المُحمّلة مسبقاً، بدلاً من إعادة التعيين الصامتة إلى الصفحة 1 من 'الكل'.",
          "AC4: التمرير اللانهائي (onEndReached، بنظام الصفحات، مع إزالة التكرار حسب item.id) يستمر باحترام الفلتر النشط بعد أي تغيير للفلتر أثناء التمرير — دون عناصر مكررة أو مفقودة بين الفلاتر.",
        ],
      },
      testScenarios: {
        en: [
          "TC1: Rapidly tap بيع → إيجار → بدل → بيع in quick succession and confirm the final rendered list matches بيع results only — not a race-condition mix of whichever fetch happened to resolve last.",
          "TC2: Scroll in بيع far enough to trigger infinite scroll (page 2+), switch to إيجار, then switch back to بيع — confirm بيع resets cleanly to page 1 rather than resuming from the stale page-2 offset.",
          "TC3: Switch to مكاتب عقارية, confirm the filter pills disappear, switch back to عقارات, and record whether your previous Sale/Rent/Exchange selection persisted or reset to a default — document whichever it actually does so this isn't re-litigated every pass.",
          "TC4: Load 20+ items in Card view, toggle to List view mid-scroll, and confirm the same dataset renders immediately in List view with no extra network fetch or flash of the empty state.",
        ],
        ar: [
          "TC1: اضغط بسرعة بيع ← إيجار ← بدل ← بيع بشكل متتابع وتأكد أن القائمة المعروضة نهائياً تطابق نتائج بيع فقط — لا مزيجاً ناتجاً عن تسابق طلبات وصل أحدها أخيراً بالصدفة.",
          "TC2: مرّر ضمن بيع بما يكفي لتفعيل التمرير اللانهائي (الصفحة 2+)، بدّل إلى إيجار، ثم عد إلى بيع — تأكد أن بيع يُعاد تعيينه بنظافة إلى الصفحة 1 بدلاً من الاستئناف من إزاحة الصفحة 2 القديمة.",
          "TC3: بدّل إلى مكاتب عقارية، تأكد من اختفاء فلاتر التبويب، عد إلى عقارات، وسجّل ما إذا كان اختيارك السابق لبيع/إيجار/بدل قد استمر أم أُعيد لقيمة افتراضية — وثّق أياً كان السلوك الفعلي حتى لا يُعاد الجدل حوله في كل جولة اختبار.",
          "TC4: حمّل أكثر من 20 عنصراً في عرض البطاقات، بدّل إلى عرض القائمة أثناء التمرير، وتأكد أن نفس البيانات تُعرض فوراً في عرض القائمة دون طلب شبكة إضافي أو ظهور مؤقت لحالة فارغة.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-property-details-rent-price-suffix",
      title: {
        en: "Rental prices don't say 'per month' anywhere",
        ar: "أسعار الإيجار لا تذكر 'شهرياً' في أي مكان",
      },
      priority: "P1",
      story: {
        en: "Still open: shared/components/property/PropertyCard.tsx and PropertyListItem.tsx (used by Home, search and the 'عرض تفاصيل' sheet) format every price the same way — '{price} د.ك' — with no branch for RENT listings, while the design shows '/ شهرياً' after a rental price. A monthly rent and a sale price look identical.",
        ar: "ما زال قائماً: shared/components/property/PropertyCard.tsx و PropertyListItem.tsx (المستخدمة في الرئيسية والبحث ونافذة 'عرض تفاصيل') تعرض كل الأسعار بنفس الشكل — '{price} د.ك' — دون فرع لإعلانات الإيجار، بينما يعرض التصميم '/ شهرياً' بعد سعر الإيجار. فيبدو الإيجار الشهري وسعر البيع متطابقين.",
      },
      acceptanceCriteria: {
        en: [
          "A RENT ad shows a per-month qualifier on cards, list rows, the details sheet and the Property Detail page; a SALE ad doesn't.",
          "The exact wording is confirmed with design before the fix.",
        ],
        ar: [
          "إعلان الإيجار يعرض 'شهرياً' في البطاقات وصفوف القائمة ونافذة التفاصيل وصفحة تفاصيل العقار؛ وإعلان البيع لا يعرضها.",
          "تُؤكَّد الصيغة الدقيقة مع التصميم قبل الإصلاح.",
        ],
      },
      testScenarios: {
        en: [
          "Open one SALE and one RENT ad on each surface — today both show only 'د.ك'.",
        ],
        ar: [
          "افتح إعلان بيع وإعلان إيجار في كل واجهة — اليوم كلاهما يعرض 'د.ك' فقط.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-property-details-exchange-fields-unrendered",
      title: {
        en: "Exchange ads never show their 'طلب / مع' years",
        ar: "إعلانات البدل لا تعرض سنوات 'طلب / مع' أبداً",
      },
      priority: "P0",
      story: {
        en: "Still open: the add and edit listing flows require requestYear and requiredYear for EXCHANGE ads, but no display surface reads them — PropertyCard.tsx, PropertyListItem.tsx, the details sheet and the Property Detail page show beds/baths/area instead. An exchange ad's defining information is only visible in the database and the edit form.",
        ar: "ما زال قائماً: مسارا إضافة وتعديل الإعلان يطلبان requestYear و requiredYear لإعلانات البدل، لكن لا توجد واجهة عرض تقرؤهما — PropertyCard.tsx و PropertyListItem.tsx ونافذة التفاصيل وصفحة تفاصيل العقار تعرض الغرف/الحمامات/المساحة بدلاً منهما. فالمعلومة الأساسية لإعلان البدل لا تظهر إلا في قاعدة البيانات ونموذج التعديل.",
      },
      acceptanceCriteria: {
        en: [
          "An EXCHANGE ad shows 'طلب {requestYear}' and 'مع {requiredYear}' on its card and in its details, as in the design.",
          "SALE and RENT ads are unaffected.",
        ],
        ar: [
          "إعلان البدل يعرض 'طلب {requestYear}' و 'مع {requiredYear}' في بطاقته وتفاصيله كما في التصميم.",
          "إعلانات البيع والإيجار لا تتأثر.",
        ],
      },
      testScenarios: {
        en: [
          "Create an exchange ad with 2021/2023, then view it in Home, search and its detail page — the years should appear (today they don't).",
        ],
        ar: [
          "أنشئ إعلان بدل بسنتي 2021/2023 ثم اعرضه في الرئيسية والبحث وصفحة تفاصيله — يجب أن تظهر السنوات (اليوم لا تظهر).",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-home-card-layout",
      title: {
        en: "Home cards: badge, share/heart and income row match the design",
        ar: "بطاقات الرئيسية: الشارة وأزرار المشاركة/القلب وسطر المدخول تطابق التصميم",
      },
      priority: "P2",
      story: {
        en: "Regression check for fixed layout gaps in shared/components/property/PropertyCard.tsx (Card view) and PropertyListItem.tsx (List view): the 'مميز' badge and the share + heart buttons sit on opposite corners as in the design (positions are mirrored for the app's right-to-left layout), and the 'مدخول العقار' row shows only when the ad has a real income above 0 — no placeholder figure.",
        ar: "فحص تراجع لفجوات تخطيط تم إصلاحها في shared/components/property/PropertyCard.tsx (عرض البطاقات) و PropertyListItem.tsx (عرض القائمة): شارة 'مميز' وزرا المشاركة والقلب في زاويتين متقابلتين كما في التصميم (المواضع معكوسة لاتجاه التطبيق من اليمين لليسار)، وسطر 'مدخول العقار' يظهر فقط عند وجود مدخول حقيقي أكبر من 0 — دون رقم افتراضي.",
      },
      acceptanceCriteria: {
        en: [
          "Card view shows both share and heart buttons, on the corner opposite the 'مميز' badge.",
          "An ad with no income shows no income row; an ad with income shows its real value in both views.",
        ],
        ar: [
          "عرض البطاقات يعرض زري المشاركة والقلب في الزاوية المقابلة لشارة 'مميز'.",
          "الإعلان دون مدخول لا يعرض سطر المدخول؛ والإعلان بمدخول يعرض قيمته الحقيقية في العرضين.",
        ],
      },
      testScenarios: {
        en: [
          "Compare a featured ad's card with the Figma frame.",
          "Create an ad without income and one with 1,200 — only the second shows 'مدخول العقار 1,200 د.ك'.",
        ],
        ar: [
          "قارن بطاقة إعلان مميز بإطار Figma.",
          "أنشئ إعلاناً دون مدخول وآخر بمدخول 1,200 — الثاني فقط يعرض 'مدخول العقار 1,200 د.ك'.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-individual-login",
      title: {
        en: "Individual login: remember-me checkbox currently has no effect (known gap)",
        ar: "تسجيل دخول الفرد: خانة 'تذكري' حالياً بلا أي تأثير (نقص معروف)",
      },
      priority: "P1",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=271-21298&m=dev",
          label: { en: "Login screen", ar: "شاشة تسجيل الدخول" },
        },
      ],
      endUserStory: {
        en: "As an individual user, I want to log in with either my email or phone, optionally stay signed in with 'remember me,' and quickly get back into an account I've already used on this device, so that returning to the app is fast and I never lose access to identities I've already set up.",
        ar: "بصفتي مستخدماً فردياً، أريد تسجيل الدخول بالبريد الإلكتروني أو الهاتف، والبقاء مسجَّل الدخول اختيارياً عبر 'تذكري'، والعودة بسرعة إلى حساب استخدمته مسبقاً على هذا الجهاز، حتى تكون العودة إلى التطبيق سريعة ولا أفقد الوصول إلى الهويات التي أعددتها مسبقاً.",
      },
      story: {
        en: "Verify the Individual Login screen (identifier + password, 'تذكري' remember-me checkbox, 'هل نسيت كلمة المرور؟' link, 'المتابعة بحساب محفوظ' saved-account entry point) behaves correctly end to end, while flagging that the rememberMe value captured in IndividualLoginForm is passed to onLogin but never actually used — session persistence/token lifetime doesn't currently change based on it.",
        ar: "تحقق من أن شاشة تسجيل دخول الفرد (المعرّف + كلمة المرور، خانة 'تذكري'، رابط 'هل نسيت كلمة المرور؟'، نقطة الدخول 'المتابعة بحساب محفوظ') تعمل بشكل صحيح من البداية للنهاية، مع الإبلاغ عن أن قيمة rememberMe المُلتقَطة في IndividualLoginForm تُمرَّر إلى onLogin لكنها لا تُستخدم فعلياً أبداً — مدة الجلسة/الرمز لا تتغيّر حالياً بناءً عليها.",
      },
      acceptanceCriteria: {
        en: [
          "loginSchema validation (identifier: email-or-phone string, password: 6-char min) blocks submission with inline errors before any network call.",
          "Toggling 'تذكري' visibly checks/unchecks the box, but confirm — and document — that it has no observable effect on session length or biometric re-prompt behavior today.",
          "'هل نسيت كلمة المرور؟' navigates to the forgot-password flow (see mobile-forgot-password-inline-error).",
          "'المتابعة بحساب محفوظ' opens ProfileBottomSheet (the saved-identities list), not a dead button.",
        ],
        ar: [
          "التحقق عبر loginSchema (المعرّف: نص بريد إلكتروني أو هاتف، كلمة المرور: 6 أحرف كحد أدنى) يمنع الإرسال مع أخطاء داخل الشاشة قبل أي طلب شبكة.",
          "تبديل خانة 'تذكري' يفعّل/يُلغي التحديد بصرياً، لكن تأكد — ووثّق — أنه لا يُحدث أي أثر ملحوظ على مدة الجلسة أو سلوك إعادة طلب المصادقة البيومترية حالياً.",
          "رابط 'هل نسيت كلمة المرور؟' ينتقل إلى تدفق استعادة كلمة المرور (راجع mobile-forgot-password-inline-error).",
          "'المتابعة بحساب محفوظ' يفتح ProfileBottomSheet (قائمة الهويات المحفوظة)، لا زراً معطلاً.",
        ],
      },
      testScenarios: {
        en: [
          "Log in with 'تذكري' checked, force-quit the app, relaunch after a day, and confirm whether the session persists any differently than with it unchecked — if there's no difference, that confirms the no-op and should be flagged to product as either wire it up or remove it.",
          "Submit the login form empty, with only identifier filled, and with only password filled — confirm inline validation catches each case before hitting the network.",
          "Tap 'المتابعة بحساب محفوظ' with zero saved identities on the device and confirm the bottom sheet handles the empty case gracefully rather than showing a blank sheet.",
          "Log in with a correct identifier and wrong password 3 times in a row and confirm the error Alert is clear each time (message comes from the backend, not a generic fallback, unless the network genuinely fails).",
        ],
        ar: [
          "سجّل الدخول مع تحديد 'تذكري'، أغلق التطبيق قسراً، أعد تشغيله بعد يوم، وتأكد ما إذا كانت الجلسة تستمر بشكل مختلف عن حالة عدم التحديد — إذا لم يكن هناك فرق، فهذا يؤكد أن الخاصية بلا تأثير ويجب إبلاغ فريق المنتج إما بربطها فعلياً أو إزالتها.",
          "أرسل نموذج تسجيل الدخول فارغاً، ومرة بالمعرّف فقط، ومرة بكلمة المرور فقط — تأكد أن التحقق داخل الشاشة يلتقط كل حالة قبل الوصول للشبكة.",
          "اضغط 'المتابعة بحساب محفوظ' دون أي هوية محفوظة على الجهاز وتأكد أن الشاشة السفلية تتعامل مع الحالة الفارغة بسلاسة بدلاً من عرض شاشة فارغة.",
          "سجّل الدخول بمعرّف صحيح وكلمة مرور خاطئة 3 مرات متتالية وتأكد أن تنبيه الخطأ واضح في كل مرة (الرسالة قادمة من الواجهة الخلفية، لا رسالة عامة بديلة، إلا إذا فشلت الشبكة فعلياً).",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-individual-signup",
      title: {
        en: "Individual signup: single phone-or-email identifier field now matches design",
        ar: "تسجيل حساب الفرد: حقل معرّف واحد (هاتف أو بريد إلكتروني) يطابق الآن التصميم",
      },
      priority: "P1",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=271-21448&m=dev",
          label: { en: "Signup screen", ar: "شاشة إنشاء الحساب" },
        },
      ],
      endUserStory: {
        en: "As an individual user, I want to create an account with either just my email or just my phone number, whichever I prefer, without being forced to fill in both, so that I can start using the app immediately with the identifier I actually trust the app with.",
        ar: "بصفتي مستخدماً فردياً، أريد إنشاء حساب إما بالبريد الإلكتروني فقط أو برقم الهاتف فقط، أيّهما أفضّل، دون إجباري على تعبئة كليهما، حتى أستطيع البدء باستخدام التطبيق فوراً بالمعرّف الذي أثق بمشاركته مع التطبيق فعلاً.",
      },
      story: {
        en: "Verify the Individual Signup screen's single 'رقم الهاتف أو البريد الالكتروني' identifier field (previously two separate email + optional-phone fields, now merged to match both the Figma frame and the Login screen's existing identifier field) against signupSchema (identifier required, matching either the email regex or the Kuwaiti phone regex ^(?:+?965)?[569]\\d{7}$, password 8-char min, confirmPassword must match), and confirm the backend's RegisterIndividualDto/registerIndividual now accepts the same single `identifier` field and classifies it server-side via the shared isEmail/isPhone helpers — so this closes out the design/code drift the previous version of this story flagged (design showed one required field; code had two, one optional).",
        ar: "تحقق من أن حقل المعرّف الواحد 'رقم الهاتف أو البريد الالكتروني' في شاشة إنشاء حساب الفرد (كان سابقاً حقلين منفصلين — بريد إلكتروني وهاتف اختياري — وأصبح الآن حقلاً واحداً مطابقاً لإطار Figma ولحقل المعرّف الموجود أصلاً في شاشة تسجيل الدخول) يعمل بشكل صحيح حسب signupSchema (المعرّف مطلوب، ويطابق إما نمط البريد الإلكتروني أو نمط الهاتف الكويتي ^(?:+?965)?[569]\\d{7}$، كلمة المرور 8 أحرف كحد أدنى، confirmPassword يجب أن يطابقها)، وتأكد أن RegisterIndividualDto/registerIndividual في الواجهة الخلفية تقبل الآن نفس حقل `identifier` الواحد وتصنّفه في الخادم عبر دوال isEmail/isPhone المشتركة — فهذا يغلق انحراف التصميم/الكود الذي رصدته النسخة السابقة من هذه القصة (التصميم يعرض حقلاً واحداً مطلوباً؛ الكود كان يعرض حقلين، أحدهما اختياري).",
      },
      acceptanceCriteria: {
        en: [
          "The signup screen shows exactly one identifier field labeled 'رقم الهاتف أو البريد الالكتروني', with no separate phone field — matching the Figma frame.",
          "Submitting an email-shaped identifier (e.g. ali@example.com) succeeds and is stored as the account's email.",
          "Submitting a Kuwaiti-phone-shaped identifier (e.g. 51234567, +96551234567, 96551234567) succeeds and is stored as the account's phone.",
          "Submitting a value that is neither a valid email nor a valid Kuwaiti phone is rejected inline before any network call, both on the mobile form (signupSchema) and — as a defense-in-depth check — by the backend's IsEmailOrPhone validator if the client-side check were ever bypassed.",
          "Password under 8 characters, or a confirmPassword mismatch, blocks submission with inline errors.",
          "Both an email-shaped and a phone-shaped identifier go to a verification-code step before the account is created (see mobile-signup-verification) — submitting a phone-shaped identifier routes to the OTP step instead.",
        ],
        ar: [
          "شاشة إنشاء الحساب تعرض حقل معرّف واحد بالضبط بعنوان 'رقم الهاتف أو البريد الالكتروني'، دون حقل هاتف منفصل — مطابقاً لإطار Figma.",
          "إرسال معرّف بصيغة بريد إلكتروني (مثل ali@example.com) ينجح ويُخزَّن كبريد إلكتروني للحساب.",
          "إرسال معرّف بصيغة هاتف كويتي (مثل 51234567 أو +96551234567 أو 96551234567) ينجح ويُخزَّن كهاتف للحساب.",
          "إرسال قيمة لا تطابق بريداً إلكترونياً صحيحاً ولا هاتفاً كويتياً صحيحاً يُرفض داخل الشاشة قبل أي طلب شبكة، سواء في نموذج الجوال (signupSchema) أو — كطبقة حماية إضافية — عبر مُدقِّق IsEmailOrPhone في الواجهة الخلفية إذا تم تجاوز التحقق في العميل.",
          "كلمة مرور أقل من 8 أحرف، أو عدم تطابق confirmPassword، يمنع الإرسال مع أخطاء داخل الشاشة.",
          "المعرّف بصيغة بريد إلكتروني وبصيغة هاتف كلاهما ينتقل إلى خطوة رمز التحقق قبل إنشاء الحساب (راجع mobile-signup-verification).",
        ],
      },
      testScenarios: {
        en: [
          "Sign up with a valid email identifier + password + confirmPassword — confirm the account is created with that email and the OTP step is skipped (goes straight to success).",
          "Sign up with a value that fails both the email and Kuwaiti-phone regex (e.g. a random string, or a non-Kuwaiti phone number) and confirm inline rejection, not a failed network call.",
          "Sign up with a valid Kuwaiti phone in the +965XXXXXXXX, 965XXXXXXXX, and bare XXXXXXXX forms and confirm all three are accepted and route to the OTP step.",
          "Attempt to sign up twice with the same identifier (once as the only field) and confirm the second attempt is rejected as 'البريد الإلكتروني مسجل بالفعل' / 'رقم الهاتف مسجل بالفعل' rather than silently succeeding or leaving an unusable half-created account.",
        ],
        ar: [
          "سجّل حساباً بمعرّف بريد إلكتروني صحيح وكلمة مرور وconfirmPassword — تأكد أن الحساب يُنشأ بذلك البريد وأن خطوة رمز التحقق تُتخطى (ينتقل مباشرة إلى النجاح).",
          "سجّل حساباً بقيمة لا تطابق لا نمط البريد الإلكتروني ولا نمط الهاتف الكويتي (نص عشوائي، أو رقم هاتف غير كويتي) وتأكد من الرفض داخل الشاشة، لا فشل طلب شبكة.",
          "سجّل حساباً برقم كويتي صحيح بالصيغ +965XXXXXXXX وXXXXXXXX965 والصيغة المجردة XXXXXXXX وتأكد من قبول الصيغ الثلاث جميعها وتوجيهها إلى خطوة رمز التحقق.",
          "حاول التسجيل مرتين بنفس المعرّف (كحقل وحيد) وتأكد أن المحاولة الثانية تُرفض برسالة 'البريد الإلكتروني مسجل بالفعل' / 'رقم الهاتف مسجل بالفعل' بدلاً من النجاح بصمت أو ترك حساب نصف مكتمل غير قابل للاستخدام.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-signup-verification",
      title: {
        en: "Signup verifies the email or phone with a code before creating the account",
        ar: "التسجيل يتحقق من البريد أو الهاتف برمز قبل إنشاء الحساب",
      },
      priority: "P0",
      story: {
        en: "Verify POST /users/register/individual sends a code — by email for an email identifier, by SMS for a phone number — and creates nothing until it's confirmed: POST /auth/register/verify-email-otp or /auth/register/verify-otp creates the account (User + individual persona together) and signs the user in. An abandoned signup leaves no account and doesn't reserve the email/phone.",
        ar: "تحقق من أن POST /users/register/individual يرسل رمزاً — بالبريد لمعرّف بريد، وبرسالة SMS لرقم هاتف — ولا يُنشئ شيئاً حتى التأكيد: POST /auth/register/verify-email-otp أو /auth/register/verify-otp ينشئ الحساب (المستخدم مع هوية الفرد معاً) ويسجّل الدخول. التسجيل المتروك لا يترك حساباً ولا يحجز البريد/الهاتف.",
      },
      acceptanceCriteria: {
        en: [
          "Email signup: a code arrives by email; the account exists only after entering it.",
          "Phone signup: a code arrives by SMS; same rule.",
          "The first login right after verification never shows 'لا توجد هوية مرتبطة بهذا الحساب'.",
          "Starting a signup and quitting at the code step lets someone sign up with the same email/phone later.",
        ],
        ar: [
          "التسجيل بالبريد: يصل رمز بالبريد؛ ولا يوجد الحساب إلا بعد إدخاله.",
          "التسجيل بالهاتف: يصل رمز برسالة SMS؛ بنفس القاعدة.",
          "أول دخول بعد التحقق لا يعرض 'لا توجد هوية مرتبطة بهذا الحساب' أبداً.",
          "بدء التسجيل ثم الخروج عند خطوة الرمز يسمح بالتسجيل لاحقاً بنفس البريد/الهاتف.",
        ],
      },
      testScenarios: {
        en: [
          "Sign up with a new email, enter the emailed code — lands signed in.",
          "Sign up with a phone, close the app at the code step, sign up again with the same phone — allowed.",
        ],
        ar: [
          "سجّل ببريد جديد وأدخل الرمز المرسل — يدخل مباشرة.",
          "سجّل برقم هاتف وأغلق التطبيق عند خطوة الرمز، ثم سجّل مجدداً بنفس الرقم — مسموح.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-social-signin",
      title: {
        en: "Google/Apple sign-in buttons on login and signup — new, not yet configured with real credentials",
        ar: "أزرار تسجيل الدخول عبر Google/Apple في شاشتَي الدخول والتسجيل — ميزة جديدة، غير مُهيَّأة بعد ببيانات اعتماد حقيقية",
      },
      priority: "P1",
      endUserStory: {
        en: "As an individual user, I want to sign in or create an account with my existing Google or Apple account in one tap, so that I don't have to invent and remember another password just to try the app.",
        ar: "بصفتي مستخدماً فردياً، أريد تسجيل الدخول أو إنشاء حساب باستخدام حسابي الحالي في Google أو Apple بضغطة واحدة، حتى لا أضطر لابتكار وتذكّر كلمة مرور أخرى فقط لتجربة التطبيق.",
      },
      story: {
        en: "Verify the new SocialAuthButtons component (the 'أو قم بالتسجيل باستخدام' divider + Google icon button + Apple's native AppleAuthenticationButton, rendered on both IndividualLoginForm and IndividualSignupForm) correctly drives POST /auth/google and POST /auth/apple, and — critically for this environment — confirm whether GOOGLE_CLIENT_ID/APPLE_CLIENT_ID are actually configured on the target API environment before treating any failure here as a bug: both services are designed to fail closed with a clear 'غير مُفعّل حالياً' (not currently enabled) error rather than silently succeeding when unconfigured, and the buttons themselves are native modules that do not work inside Expo Go — they require a build produced by `eas build`/`expo prebuild` with the Google/Apple config plugins applied.",
        ar: "تحقق من أن مكوّن SocialAuthButtons الجديد (الفاصل النصي 'أو قم بالتسجيل باستخدام' + زر أيقونة Google + زر Apple الأصلي AppleAuthenticationButton، المعروضان في كل من IndividualLoginForm وIndividualSignupForm) يستدعيان بشكل صحيح POST /auth/google وPOST /auth/apple، وتأكد — وهذا أمر حاسم في هذه البيئة — ما إذا كانت GOOGLE_CLIENT_ID/APPLE_CLIENT_ID مُهيَّأتين فعلياً في بيئة الواجهة الخلفية المستهدفة قبل اعتبار أي فشل هنا خللاً: كلتا الخدمتين مصمَّمتان للفشل بأمان (fail closed) برسالة واضحة 'غير مُفعّل حالياً' بدلاً من النجاح بصمت عند عدم التهيئة، كما أن الزرّين أنفسهما وحدتان أصليّتان (native modules) لا تعملان داخل Expo Go — تتطلبان نسخة مبنية عبر `eas build`/`expo prebuild` مع تفعيل إضافات (plugins) إعداد Google/Apple.",
      },
      acceptanceCriteria: {
        en: [
          "Both buttons render on the Login screen and on step 1 of Signup, below the existing submit button, matching the divider + two-button layout in the mockups shared for this update.",
          "The Apple button only renders on iOS (Android has no Apple Sign-In) — confirm Android shows the Google button alone with no layout gap or crash.",
          "Tapping Google opens the native Google account picker; tapping Apple opens the native Apple Sign-In sheet — cancelling either flow returns silently to the auth screen with no error alert (this is a deliberate no-op, not a bug).",
          "On successful sign-in via either provider, the user is logged in and routed to the identity home screen exactly like a normal email/phone login — there is no separate 'social signup success' screen.",
          "If GOOGLE_CLIENT_ID/APPLE_CLIENT_ID are not configured on the API, tapping the corresponding button surfaces a clear Arabic error ('تسجيل الدخول عبر Google/Apple غير مُفعّل حالياً') rather than a generic network-error message or a silent failure.",
          "A brand-new social sign-in (no prior account with that email) results in a fully usable account with an active Identity immediately — same regression class as mobile-signup-verification, verify it doesn't recur here on a different code path.",
        ],
        ar: [
          "يظهر كلا الزرّين في شاشة تسجيل الدخول وفي الخطوة الأولى من التسجيل، أسفل زر الإرسال الحالي، بما يطابق تخطيط الفاصل والزرّين في التصاميم المُشارَكة لهذا التحديث.",
          "زر Apple يظهر فقط على iOS (أندرويد لا يدعم تسجيل الدخول عبر Apple) — تأكد أن أندرويد يعرض زر Google وحده دون أي فجوة في التخطيط أو تعطّل.",
          "الضغط على زر Google يفتح منتقي حسابات Google الأصلي؛ والضغط على زر Apple يفتح شاشة تسجيل الدخول الأصلية من Apple — إلغاء أي من المسارين يعيد المستخدم بصمت إلى شاشة المصادقة دون رسالة خطأ (هذا سلوك مقصود، لا خلل).",
          "عند نجاح تسجيل الدخول عبر أي من المزوّدين، يتم تسجيل دخول المستخدم وتوجيهه إلى الشاشة الرئيسية لهويته تماماً كما في تسجيل الدخول العادي بالبريد/الهاتف — لا توجد شاشة نجاح منفصلة لـ 'التسجيل عبر مزوّد اجتماعي'.",
          "إذا لم تكن GOOGLE_CLIENT_ID/APPLE_CLIENT_ID مُهيَّأتين في الواجهة الخلفية، فإن الضغط على الزر المعني يُظهر رسالة خطأ عربية واضحة ('تسجيل الدخول عبر Google/Apple غير مُفعّل حالياً') بدلاً من رسالة خطأ شبكة عامة أو فشل صامت.",
          "تسجيل دخول اجتماعي جديد تماماً (لا يوجد حساب سابق بذلك البريد) ينتج عنه حساب قابل للاستخدام بالكامل مع Identity نشطة فوراً — نفس فئة العلة الموثّقة في mobile-signup-verification، تأكد من عدم تكرارها هنا على مسار كود مختلف.",
        ],
      },
      testScenarios: {
        en: [
          "Environment check first: confirm with the backend team whether GOOGLE_CLIENT_ID/APPLE_CLIENT_ID are set on the environment under test, and whether this build was produced via eas build/expo prebuild (not Expo Go) — record the answer, since it determines whether a tap failure is expected or a real bug.",
          "On a properly configured build, tap 'Continue with Google', complete the picker with a real Google account, and confirm you land on the identity home screen already logged in.",
          "Repeat with Apple on iOS, including once with 'Hide My Email' selected, and confirm the account still links correctly (the relay email address is acceptable as the stored email).",
          "Cancel the Google picker mid-flow and confirm the app returns to the auth screen with no error alert and isLoading resets (button is tappable again immediately).",
          "Sign in with a Google/Apple account whose email already has a password-based account on Buyootna, and confirm it links to the existing account (same identities, not a duplicate) rather than erroring or creating a second account.",
          "On Android, confirm only the Google button is visible and the layout doesn't leave an awkward empty space where the Apple button would be on iOS.",
        ],
        ar: [
          "تحقّق من البيئة أولاً: تأكد مع فريق الواجهة الخلفية ما إذا كانت GOOGLE_CLIENT_ID/APPLE_CLIENT_ID مُعدَّتين في بيئة الاختبار، وما إذا كانت هذه النسخة مبنية عبر eas build/expo prebuild (لا Expo Go) — سجّل الإجابة، لأنها تحدّد ما إذا كان فشل الضغط متوقَّعاً أم خللاً حقيقياً.",
          "على نسخة مُهيَّأة بشكل صحيح، اضغط 'المتابعة عبر Google'، أكمل المنتقي بحساب Google حقيقي، وتأكد من الوصول إلى الشاشة الرئيسية للهوية وأنت مسجَّل الدخول بالفعل.",
          "كرر نفس الخطوة مع Apple على iOS، بما في ذلك مرة مع تفعيل 'إخفاء بريدي الإلكتروني'، وتأكد أن الحساب لا يزال يُربَط بشكل صحيح (عنوان البريد الوسيط مقبول كبريد مُخزَّن).",
          "ألغِ منتقي Google في منتصف العملية وتأكد أن التطبيق يعود إلى شاشة المصادقة دون رسالة خطأ وأن isLoading يُعاد ضبطه (الزر قابل للضغط فوراً مجدداً).",
          "سجّل الدخول بحساب Google/Apple يملك بريده الإلكتروني حساباً قائماً بكلمة مرور على بيوتنا، وتأكد أنه يُربَط بالحساب الموجود (نفس الهويات، لا حساب مكرر) بدلاً من ظهور خطأ أو إنشاء حساب ثانٍ.",
          "على أندرويد، تأكد أن زر Google فقط هو الظاهر وأن التخطيط لا يترك فراغاً غريباً في مكان زر Apple الموجود على iOS.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-otp-resend-countdown",
      title: {
        en: "OTP verification: 45s resend countdown behaves correctly at the boundary",
        ar: "التحقق برمز OTP: عداد إعادة الإرسال (45 ثانية) يعمل بشكل صحيح عند الحد الفاصل",
      },
      priority: "P1",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=271-22306&m=dev",
          label: { en: "Forgot-password OTP: countdown running (00:45)", ar: "رمز تحقق استعادة كلمة المرور: العداد يعمل (00:45)" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=324-16604&m=dev",
          label: { en: "Forgot-password OTP: resend link visible", ar: "رمز تحقق استعادة كلمة المرور: رابط إعادة الإرسال ظاهر" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1850-76860&m=dev",
          label: { en: "Signup OTP: countdown running (00:45)", ar: "رمز تحقق التسجيل: العداد يعمل (00:45)" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1850-77001&m=dev",
          label: { en: "Signup OTP: resend link visible", ar: "رمز تحقق التسجيل: رابط إعادة الإرسال ظاهر" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1857-118241&m=dev",
          label: { en: "Signup OTP: disabled state (no digits entered)", ar: "رمز تحقق التسجيل: الحالة المعطَّلة (دون إدخال أرقام)" },
        },
      ],
      endUserStory: {
        en: "As an individual user verifying my phone number, I want to see clearly how long I have to wait before I can request a new code, and get an easy way to resend it once that time is up, so that I'm never left wondering whether my code is still valid or the app is just stuck.",
        ar: "بصفتي مستخدماً فردياً أتحقق من رقم هاتفي، أريد أن أرى بوضوح المدة المتبقية قبل أن أستطيع طلب رمز جديد، وطريقة سهلة لإعادة إرساله بعد انتهاء تلك المدة، حتى لا أبقى متسائلاً عمّا إذا كان رمزي لا يزال صالحاً أم أن التطبيق متعطّل فقط.",
      },
      story: {
        en: "Verify the OTP screen's 6-box input and 45-second resend countdown (ForgotPasswordStep2, and the equivalent IndividualSignupOtpStep) match the Figma frame exactly and handle the boundary correctly, so that a user is never stuck unable to resend and never able to spam resends before the timer expires.",
        ar: "تحقق من أن مدخل الأرقام الستة في شاشة رمز التحقق وعداد إعادة الإرسال البالغ 45 ثانية (في ForgotPasswordStep2، ونظيره IndividualSignupOtpStep) يطابقان إطار Figma تماماً ويتعاملان مع الحد الفاصل بشكل صحيح، حتى لا يعلق المستخدم عاجزاً عن إعادة الإرسال أبداً، ولا يستطيع إغراق النظام بطلبات إعادة إرسال قبل انتهاء المؤقت.",
      },
      acceptanceCriteria: {
        en: [
          "The 6 OTP boxes fill left-to-right as digits are typed, with the active box highlighted and an error state (red border) shown only after a failed verify attempt.",
          "The countdown starts at 00:45 and counts down to 0, then swaps to an 'إعادة إرسال الرمز' (resend) link.",
          "Tapping resend before the timer hits 0 is not possible (no resend UI is shown yet), and tapping it after reset the timer back to 45.",
          "The verify button stays disabled until exactly 6 digits are entered, matching the 'grey when disabled' state shown in the design.",
        ],
        ar: [
          "مربعات رمز التحقق الستة تُملأ من اليسار إلى اليمين أثناء الكتابة، مع تمييز المربع النشط وإظهار حالة خطأ (حدّ أحمر) فقط بعد محاولة تحقق فاشلة.",
          "العداد يبدأ من 00:45 وينخفض حتى 0، ثم يتحول إلى رابط 'إعادة إرسال الرمز'.",
          "الضغط على إعادة الإرسال قبل وصول المؤقت لـ 0 غير ممكن (لا تظهر واجهة إعادة الإرسال بعد)، والضغط عليها بعد ذلك يعيد ضبط المؤقت إلى 45.",
          "زر التحقق يبقى معطَّلاً حتى إدخال 6 أرقام بالضبط، مطابقاً لحالة 'رمادي عند التعطيل' الظاهرة في التصميم.",
        ],
      },
      testScenarios: {
        en: [
          "Start the OTP step and confirm the timer reads exactly 00:45 initially, matching the Figma frame.",
          "Let the timer run to 0 and confirm the resend link appears immediately with no dead gap where neither the timer nor the link is visible.",
          "Enter an incorrect 6-digit code and confirm the boxes/border show an error state consistent with the design's error styling, with the actual error message visible.",
          "Enter 5 digits and confirm the verify button remains disabled (grey); enter the 6th and confirm it becomes enabled.",
        ],
        ar: [
          "ابدأ خطوة رمز التحقق وتأكد أن المؤقت يعرض 00:45 بالضبط في البداية، مطابقاً لإطار Figma.",
          "اترك المؤقت يصل إلى 0 وتأكد أن رابط إعادة الإرسال يظهر فوراً دون أي فجوة ميتة لا يظهر فيها المؤقت ولا الرابط.",
          "أدخل رمزاً خاطئاً من 6 أرقام وتأكد أن المربعات/الحد يُظهران حالة خطأ متسقة مع تنسيق الخطأ في التصميم، مع ظهور رسالة الخطأ الفعلية.",
          "أدخل 5 أرقام وتأكد أن زر التحقق يبقى معطَّلاً (رمادي)؛ أدخل الرقم السادس وتأكد أنه يصبح مفعَّلاً.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-forgot-password-inline-error",
      title: {
        en: "Forgot-password 'account not found' error: design shows inline text, code shows a popup Alert (mismatch)",
        ar: "خطأ 'الحساب غير موجود' في استعادة كلمة المرور: التصميم يعرض نصاً داخل الشاشة، والكود يعرض تنبيهاً منبثقاً (تعارض)",
      },
      priority: "P2",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=271-22014&m=dev",
          label: { en: "Default state", ar: "الحالة الافتراضية" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=271-21893&m=dev",
          label: { en: "Inline error state", ar: "حالة الخطأ داخل الشاشة" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=271-22217&m=dev",
          label: { en: "Disabled (empty field) state", ar: "حالة التعطيل (حقل فارغ)" },
        },
      ],
      endUserStory: {
        en: "As an individual user who forgot my password, I want to be told clearly and right there on the screen if the email or phone I entered doesn't match any account, so that I immediately understand what went wrong instead of guessing why nothing happened.",
        ar: "بصفتي مستخدماً فردياً نسيت كلمة مروري، أريد أن يُخبرني التطبيق بوضوح ومباشرة داخل الشاشة إذا كان البريد الإلكتروني أو الهاتف الذي أدخلته لا يطابق أي حساب، حتى أفهم فوراً ما الخطأ بدلاً من تخمين سبب عدم حدوث شيء.",
      },
      story: {
        en: "Flag that the Figma design for step 1 of Forgot Password shows an inline error message under the field ('لم نتمكن من العثور على حساب مرتبط بهذه البيانات') for an unrecognized identifier, but ForgotPasswordStep1.tsx has no inline error rendering at all — the actual implementation only surfaces failures via a native showAlert('خطأ', ...) in app/(auth)/forgot-password.tsx popup — so this is a real design/implementation mismatch worth a product decision, not just a QA pass/fail.",
        ar: "أبلغ بأن تصميم Figma للخطوة 1 من استعادة كلمة المرور يعرض رسالة خطأ داخل الشاشة تحت الحقل ('لم نتمكن من العثور على حساب مرتبط بهذه البيانات') لمعرّف غير معروف، لكن ForgotPasswordStep1.tsx لا يعرض أي خطأ داخل الشاشة إطلاقاً — التنفيذ الفعلي يُظهر الفشل فقط عبر تنبيه أصلي showAlert('خطأ', ...) in app/(auth)/forgot-password.tsx منبثق — فهذا تعارض حقيقي بين التصميم والتنفيذ يستحق قراراً من فريق المنتج، لا مجرد نجاح/فشل في اختبار الجودة.",
      },
      acceptanceCriteria: {
        en: [
          "Submitting an unrecognized identifier on the real Forgot Password step 1 screen triggers a native Alert dialog, not the inline red-text error shown in Figma.",
          "The submit button's disabled/enabled (grey vs. navy) states do match the design exactly — that part of the frame is implemented correctly.",
          "Decide and document whether the inline-error version should be built to match Figma, or whether the Figma frame should be updated to reflect the Alert-based pattern actually shipped.",
        ],
        ar: [
          "إرسال معرّف غير معروف في شاشة استعادة كلمة المرور الحقيقية (الخطوة 1) يُطلق مربع تنبيه أصلي، لا رسالة الخطأ النصية الحمراء داخل الشاشة الظاهرة في Figma.",
          "حالتا زر الإرسال (معطَّل رمادي مقابل مفعَّل كحلي) تطابقان التصميم تماماً — هذا الجزء من الإطار منفَّذ بشكل صحيح.",
          "اتخذ ووثّق قراراً بشأن ما إذا كان يجب بناء نسخة الخطأ داخل الشاشة لتطابق Figma، أو تحديث إطار Figma ليعكس نمط التنبيه المنبثق المنشور فعلياً.",
        ],
      },
      testScenarios: {
        en: [
          "Submit step 1 with an email/phone that has no matching account and confirm exactly what UI appears — screenshot it next to the Figma frame to make the mismatch concrete for the ticket.",
          "Confirm the disabled (grey, 'إرسال رمز التحقق' unclickable) state when the field is empty, and the enabled (navy) state once text is entered — this part should match the design.",
          "Repeat with a clearly malformed identifier (e.g. random string) to confirm the same Alert-based error path fires, not a different one.",
        ],
        ar: [
          "أرسل الخطوة 1 ببريد إلكتروني/هاتف لا يطابق أي حساب وتأكد بالضبط من الواجهة التي تظهر — التقط لقطة شاشة لها بجانب إطار Figma لتوثيق التعارض بشكل ملموس للتذكرة.",
          "تأكد من الحالة المعطَّلة (رمادية، 'إرسال رمز التحقق' غير قابل للضغط) عندما يكون الحقل فارغاً، ومن الحالة المفعَّلة (كحلية) بعد إدخال نص — هذا الجزء يجب أن يطابق التصميم.",
          "كرر الاختبار بمعرّف مشوَّه بوضوح (مثل نص عشوائي) للتأكد من إطلاق نفس مسار الخطأ المبني على Alert، لا مساراً مختلفاً.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-reset-password-skip-button",
      title: {
        en: "Create-new-password step: design has a 'تخطي' skip option, code does not (mismatch)",
        ar: "خطوة إنشاء كلمة مرور جديدة: التصميم يحتوي خيار 'تخطي'، والكود لا يحتويه (تعارض)",
      },
      priority: "P2",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=271-22453&m=dev",
          label: { en: "Create new password screen", ar: "شاشة إنشاء كلمة مرور جديدة" },
        },
      ],
      endUserStory: {
        en: "As an individual user resetting my password, I want the option to back out of the process without being forced to pick a new password right then, so that I'm not stuck finishing a flow I started by mistake or no longer want to complete.",
        ar: "بصفتي مستخدماً فردياً أُعيد ضبط كلمة مروري، أريد خيار التراجع عن العملية دون إجباري على اختيار كلمة مرور جديدة في تلك اللحظة، حتى لا أُضطر لإكمال تدفق بدأته بالخطأ أو لم أعد أرغب بإكماله.",
      },
      story: {
        en: "Flag that the Figma frame for the final 'إنشاء كلمة مرور جديدة' (create new password) step shows a 'تخطي' (skip) link in the top-right corner, but ForgotPasswordStep3.tsx has no skip affordance at all — the user must set a new password to proceed, there's no way to abandon the reset and keep the old password from this screen — so this is a design/implementation mismatch that should be resolved deliberately rather than left ambiguous.",
        ar: "أبلغ بأن إطار Figma للخطوة الأخيرة 'إنشاء كلمة مرور جديدة' يعرض رابط 'تخطي' في الزاوية العلوية اليمنى، لكن ForgotPasswordStep3.tsx لا يحتوي أي وسيلة تخطٍّ إطلاقاً — يجب على المستخدم تعيين كلمة مرور جديدة للمتابعة، ولا توجد طريقة للتراجع عن إعادة الضبط والاحتفاظ بكلمة المرور القديمة من هذه الشاشة — فهذا تعارض بين التصميم والتنفيذ يجب حسمه بوعي، لا تركه غامضاً.",
      },
      acceptanceCriteria: {
        en: [
          "Confirm the real screen has no 'تخطي' button, contrary to the Figma frame.",
          "Password (8-char min) and confirmPassword (must match) validation blocks the 'تحديث كلمة المرور' button until both are valid — the disabled/enabled grey-vs-navy states should match the design.",
          "Decide whether 'skip' should mean 'cancel the whole reset flow and return to login unchanged' — if so, that needs an actual back/close affordance, since currently the ForgotPasswordHeader's back button is the only way out and it steps back to the OTP screen, not out of the flow entirely.",
        ],
        ar: [
          "تأكد أن الشاشة الحقيقية لا تحتوي زر 'تخطي'، على عكس إطار Figma.",
          "التحقق من كلمة المرور (8 أحرف كحد أدنى) وconfirmPassword (يجب أن يطابقها) يمنع زر 'تحديث كلمة المرور' حتى يكون كلاهما صحيحاً — حالتا التعطيل/التفعيل (رمادي مقابل كحلي) يجب أن تطابقا التصميم.",
          "احسم ما إذا كان 'تخطي' يعني 'إلغاء تدفق إعادة الضبط بالكامل والعودة لتسجيل الدخول دون تغيير' — إن كان كذلك، فهذا يحتاج وسيلة رجوع/إغلاق فعلية، لأن زر الرجوع في ForgotPasswordHeader هو الطريق الوحيد للخروج حالياً وهو يعيد فقط لشاشة رمز التحقق، لا خارج التدفق بالكامل.",
        ],
      },
      testScenarios: {
        en: [
          "Reach the create-new-password step and confirm there is genuinely no skip control anywhere on screen — check the header row specifically, since that's where Figma places it.",
          "Enter a 7-character password and confirm the update button stays disabled; enter 8 and confirm it enables (once confirmPassword also matches).",
          "Use the screen's back button from this step and confirm exactly where it lands (expected: back to the OTP step, per handleBack's step-- logic) — compare that against what 'تخطي' in the design likely intended.",
        ],
        ar: [
          "صل إلى خطوة إنشاء كلمة المرور الجديدة وتأكد أنه لا يوجد فعلياً أي عنصر تحكم للتخطي في أي مكان بالشاشة — تحقق تحديداً من صف الرأس، لأن هذا مكانه في Figma.",
          "أدخل كلمة مرور من 7 أحرف وتأكد أن زر التحديث يبقى معطَّلاً؛ أدخل 8 أحرف وتأكد أنه يُفعَّل (بمجرد تطابق confirmPassword أيضاً).",
          "استخدم زر الرجوع في الشاشة من هذه الخطوة وتأكد بالضبط أين ينتهي (المتوقع: العودة لخطوة رمز التحقق، حسب منطق step-- في handleBack) — قارن ذلك بما كان يُقصد على الأرجح بـ 'تخطي' في التصميم.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-auth-success-copy",
      title: {
        en: "Success screens: account-created button copy differs between design and code (minor)",
        ar: "شاشات النجاح: نص زر إنشاء الحساب يختلف بين التصميم والكود (طفيف)",
      },
      priority: "P2",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=301-29535&m=dev",
          label: { en: "Password-reset success (in context)", ar: "نجاح إعادة ضبط كلمة المرور (ضمن السياق)" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=312-12837&m=dev",
          label: { en: "Password-reset success (isolated component)", ar: "نجاح إعادة ضبط كلمة المرور (مكوّن منفصل)" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=468-21712&m=dev",
          label: { en: "Account-created success — 'ابدأ الاستكشاف' per design", ar: "نجاح إنشاء الحساب — 'ابدأ الاستكشاف' حسب التصميم" },
        },
      ],
      endUserStory: {
        en: "As an individual user who just created my account, I want a clear, encouraging confirmation that tells me what to do next, so that I feel confident the signup worked and know exactly where to go from there.",
        ar: "بصفتي مستخدماً فردياً أنشأت حسابي للتو، أريد تأكيداً واضحاً ومشجّعاً يخبرني بالخطوة التالية، حتى أشعر بالثقة أن التسجيل نجح وأعرف بالضبط إلى أين أذهب من هنا.",
      },
      story: {
        en: "Flag a small copy drift: the Figma frame for 'تم إنشاء حسابك بنجاح' (account created) shows a button labeled 'ابدأ الاستكشاف' (start exploring), while the actual SuccessBottomSheet rendered in individual-auth.tsx uses buttonText='ابدأ الآن' (start now) — a minor but real inconsistency worth a one-line fix. Confirm the password-reset success screen ('تم تحديث كلمة المرور بنجاح' / 'تسجيل الدخول') matches its Figma frame exactly.",
        ar: "أبلغ عن انحراف بسيط في الصياغة: إطار Figma الخاص بـ 'تم إنشاء حسابك بنجاح' يعرض زراً بنص 'ابدأ الاستكشاف'، بينما SuccessBottomSheet الفعلي المعروض في individual-auth.tsx يستخدم buttonText='ابدأ الآن' — تعارض طفيف لكنه حقيقي يستحق إصلاحاً بسطر واحد. تأكد أن شاشة نجاح إعادة ضبط كلمة المرور ('تم تحديث كلمة المرور بنجاح' / 'تسجيل الدخول') تطابق إطار Figma الخاص بها تماماً.",
      },
      acceptanceCriteria: {
        en: [
          "Password-reset success sheet: title, description, and button text ('تسجيل الدخول') match the Figma frame exactly — verified, no action needed.",
          "Account-created success sheet: button currently reads 'ابدأ الآن' where the design specifies 'ابدأ الاستكشاف' — needs either a copy fix in code or a design-doc update, whichever is actually correct per product.",
          "Both success sheets correctly navigate on button press: password-reset → individual-auth (login), account-created → the identity's home route.",
        ],
        ar: [
          "شاشة نجاح إعادة ضبط كلمة المرور: العنوان والوصف ونص الزر ('تسجيل الدخول') يطابقون إطار Figma تماماً — تم التحقق، لا حاجة لأي إجراء.",
          "شاشة نجاح إنشاء الحساب: الزر يعرض حالياً 'ابدأ الآن' بينما يحدّد التصميم 'ابدأ الاستكشاف' — يحتاج إما إصلاح صياغة في الكود أو تحديث مستند التصميم، أيهما الصحيح فعلياً حسب فريق المنتج.",
          "كلتا شاشتَي النجاح تنتقلان بشكل صحيح عند الضغط على الزر: إعادة ضبط كلمة المرور ← individual-auth (تسجيل الدخول)، إنشاء الحساب ← الصفحة الرئيسية للهوية.",
        ],
      },
      testScenarios: {
        en: [
          "Trigger both success sheets (complete a password reset, and complete a no-phone signup) and read the exact button text on each against the two Figma frames side by side.",
          "Tap through both buttons and confirm the navigation destinations match what's described above.",
          "File the copy fix as a trivial ticket rather than a QA blocker — this is cosmetic, not functional.",
        ],
        ar: [
          "فعّل كلتا شاشتَي النجاح (أكمل إعادة ضبط كلمة مرور، وأكمل تسجيلاً دون هاتف) واقرأ نص الزر بالضبط في كل منهما مقابل إطارَي Figma جنباً إلى جنب.",
          "اضغط الزرين وتأكد أن وجهات التنقل تطابق ما وُصف أعلاه.",
          "قدّم إصلاح الصياغة كتذكرة بسيطة لا كعائق يمنع اجتياز اختبار الجودة — هذا خلل تجميلي، لا وظيفي.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-identity-switcher-sheet",
      title: {
        en: "Profile/identity switcher bottom sheet matches design functionally, with a minor label difference",
        ar: "شاشة تبديل الملف الشخصي/الهوية السفلية تطابق التصميم وظيفياً، مع اختلاف طفيف في التسمية",
      },
      priority: "P2",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=466-13601&m=dev",
          label: { en: "Profile/identity switcher sheet", ar: "شاشة تبديل الملف الشخصي/الهوية" },
        },
      ],
      endUserStory: {
        en: "As an individual user who also manages a company or office account, I want to see all of my identities in one place and switch between them with a tap, so that I don't have to log out and back in every time I need to act under a different role.",
        ar: "بصفتي مستخدماً فردياً أدير أيضاً حساب شركة أو مكتب عقاري، أريد رؤية كل هوياتي في مكان واحد والتبديل بينها بضغطة واحدة، حتى لا أضطر لتسجيل الخروج والدخول مجدداً في كل مرة أحتاج فيها التصرف بدور مختلف.",
      },
      story: {
        en: "Verify ProfileBottomSheet (opened via 'المتابعة بحساب محفوظ' on login, or the profile icon elsewhere) correctly lists all of a user's identities with type badges and lets them switch or add a new one, matching the Figma 'اختر الملف الشخصي' frame functionally, while noting the add-account button reads 'إضافة هوية جديدة' (add new identity) in code versus 'اضافة حساب جديد' (add new account) in the design — a wording nit, not a functional gap.",
        ar: "تحقق من أن ProfileBottomSheet (تُفتح عبر 'المتابعة بحساب محفوظ' عند تسجيل الدخول، أو أيقونة الملف الشخصي في مواضع أخرى) تسرد بشكل صحيح كل هويات المستخدم مع شارات النوع وتتيح التبديل بينها أو إضافة هوية جديدة، مطابقة وظيفياً لإطار Figma 'اختر الملف الشخصي'، مع الإشارة إلى أن زر إضافة الحساب يعرض 'إضافة هوية جديدة' في الكود مقابل 'اضافة حساب جديد' في التصميم — ملاحظة صياغة، لا نقص وظيفي.",
      },
      acceptanceCriteria: {
        en: [
          "Every identity the user owns (individual/company/office) appears in the list with the correct type badge and icon, and the currently-active one is visually marked ('الهوية النشطة').",
          "Tapping a non-active identity shows a loading spinner on that row, then switches and routes to that identity's home screen.",
          "Tapping the already-active identity simply closes the sheet with no network call.",
          "The add-identity button opens the signup flow (onAddAccount → handleModeChange('signup')) rather than a dead end.",
        ],
        ar: [
          "كل هوية يملكها المستخدم (فرد/شركة/مكتب عقاري) تظهر في القائمة بشارة وأيقونة النوع الصحيحتين، وتُميَّز الهوية النشطة حالياً بصرياً ('الهوية النشطة').",
          "الضغط على هوية غير نشطة يُظهر مؤشر تحميل على ذلك الصف، ثم يبدّل وينتقل إلى الشاشة الرئيسية لتلك الهوية.",
          "الضغط على الهوية النشطة أصلاً يُغلق الشاشة فقط دون أي طلب شبكة.",
          "زر إضافة هوية يفتح تدفق التسجيل (onAddAccount → handleModeChange('signup')) لا طريقاً مسدوداً.",
        ],
      },
      testScenarios: {
        en: [
          "As a user with 2+ identities, open the sheet and confirm all are listed with correct labels ('فرد' vs. company/office labels) and the right one is marked active.",
          "Switch identities and confirm the sheet closes and the app navigates to the correct home route for the new identity type — for a company/office identity, confirm it lands cleanly on ComingSoonGate (see mobile-company-office-gate in Mobile — Shared) rather than something broken.",
          "Tap the currently-active identity's row and confirm it just closes the sheet without a spinner or network call.",
          "Tap 'إضافة هوية جديدة' and confirm it opens the signup form step (individual signup only — company/office signup is gated, see Mobile — Shared).",
        ],
        ar: [
          "بصفتك مستخدماً بهويتين أو أكثر، افتح الشاشة وتأكد أن الجميع مُدرَجون بالتسميات الصحيحة ('فرد' مقابل تسميات الشركة/المكتب العقاري) وأن الهوية الصحيحة مُميَّزة كنشطة.",
          "بدّل الهويات وتأكد أن الشاشة تُغلق وأن التطبيق ينتقل إلى الصفحة الرئيسية الصحيحة لنوع الهوية الجديدة — بالنسبة لهوية شركة/مكتب عقاري، تأكد من الوصول بسلاسة إلى ComingSoonGate (راجع mobile-company-office-gate في الجوال — مشترك) لا شيء معطوب.",
          "اضغط على صف الهوية النشطة حالياً وتأكد أنه يُغلق الشاشة فقط دون مؤشر تحميل أو طلب شبكة.",
          "اضغط 'إضافة هوية جديدة' وتأكد أنها تفتح خطوة نموذج التسجيل (تسجيل فردي فقط — تسجيل الشركة/المكتب العقاري مقفل، راجع الجوال — مشترك).",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-account-suspension",
      title: {
        en: "Deactivate the account for a while or until you come back, reactivated by signing in or when the period ends",
        ar: "تعطيل الحساب لمدة أو حتى العودة، ويُعاد تفعيله بتسجيل الدخول أو بانتهاء المدة",
      },
      priority: "P0",
      endUserStory: {
        en: "As a user taking a break, I want to hide my account and ads temporarily — until I come back or for a set period — and return just by signing in, so that I don't lose my data.",
        ar: "بصفتي مستخدماً يأخذ استراحة، أريد إخفاء حسابي وإعلاناتي مؤقتاً — حتى أعود أو لمدة محددة — والعودة بمجرد تسجيل الدخول، حتى لا أفقد بياناتي.",
      },
      story: {
        en: "Verify Settings → deactivate: after the reasons, 'مدة التعطيل' offers حتى أعود (default) / 7 أيام / 14 يوم / 30 يوم. POST /users/account/suspend/request-otp sends a code by SMS (or email for accounts without a phone); POST /users/account/suspend with the code, reasons and optional durationDays deactivates the account (status deactivated_by_user), stores suspendedUntil for a period, ends every session so all devices are signed out, and hides the user's ads, profile and chats from others. Signing in reactivates an open-ended deactivation. For a period still running, any sign-in (password, Google, Apple) answers 409 ACCOUNT_SCHEDULED_DEACTIVATION and the app asks 'حسابك معطل حالياً وسيُعاد تفعيله تلقائياً خلال {n} أيام. هل تريد إلغاء التعطيل وتسجيل الدخول الآن؟' — نعم reactivates via POST /auth/reactivate and signs in; لا stays on the login screen with the account still deactivated. An hourly job reactivates accounts whose period has ended.",
        ar: "تحقق من الإعدادات ← تعطيل الحساب: بعد الأسباب يعرض 'مدة التعطيل' الخيارات حتى أعود (افتراضي) / 7 أيام / 14 يوم / 30 يوم. POST /users/account/suspend/request-otp يرسل رمزاً عبر SMS (أو البريد للحسابات دون هاتف)؛ و POST /users/account/suspend مع الرمز والأسباب و durationDays الاختياري يعطّل الحساب (الحالة deactivated_by_user)، ويحفظ suspendedUntil عند اختيار مدة، وينهي كل الجلسات فيُسجَّل الخروج من كل الأجهزة، ويخفي إعلانات المستخدم وملفه ومحادثاته عن الآخرين. تسجيل الدخول يعيد تفعيل التعطيل المفتوح. أما إذا كانت المدة لم تنتهِ فأي تسجيل دخول (كلمة المرور، Google، Apple) يُرجع 409 ACCOUNT_SCHEDULED_DEACTIVATION ويسأل التطبيق 'حسابك معطل حالياً وسيُعاد تفعيله تلقائياً خلال {n} أيام. هل تريد إلغاء التعطيل وتسجيل الدخول الآن؟' — نعم يعيد التفعيل عبر POST /auth/reactivate ويسجّل الدخول؛ لا يبقى في شاشة الدخول والحساب ما زال معطلاً. مهمة كل ساعة تعيد تفعيل الحسابات التي انتهت مدتها.",
      },
      acceptanceCriteria: {
        en: [
          "A wrong or expired code is refused with 'رمز التحقق غير صحيح أو منتهي الصلاحية' and nothing changes.",
          "After deactivating, every device is signed out and the user's ads disappear from home, search, favorites and the map for others; opening a chat with them is refused.",
          "With 'حتى أعود', signing in again restores the account ('مرحباً بعودتك') and the ads reappear.",
          "With 7/14/30 days, the success message names the period, and signing in before it ends shows the question with the days left.",
          "'نعم' signs in and restores the ads; 'لا' leaves the user on the login screen and the account stays deactivated.",
          "Once the period passes, the account is active again within the hour with no action from the user.",
          "An account an admin suspended can't reactivate itself — see admin-account-suspension.",
        ],
        ar: [
          "الرمز الخاطئ أو المنتهي يُرفض برسالة 'رمز التحقق غير صحيح أو منتهي الصلاحية' ولا يتغير شيء.",
          "بعد التعطيل يُسجَّل الخروج من كل الأجهزة وتختفي إعلانات المستخدم من الرئيسية والبحث والمفضلة والخريطة للآخرين، ويُرفض فتح محادثة معه.",
          "مع 'حتى أعود'، تسجيل الدخول مجدداً يعيد الحساب ('مرحباً بعودتك') وتعود الإعلانات للظهور.",
          "مع 7/14/30 يوماً، تذكر رسالة النجاح المدة، وتسجيل الدخول قبل انتهائها يعرض السؤال مع الأيام المتبقية.",
          "'نعم' يسجّل الدخول ويعيد الإعلانات؛ 'لا' يُبقي المستخدم في شاشة الدخول ويبقى الحساب معطلاً.",
          "بعد انتهاء المدة يعود الحساب نشطاً خلال ساعة دون أي إجراء من المستخدم.",
          "الحساب الذي أوقفته الإدارة لا يمكنه إعادة التفعيل بنفسه — راجع admin-account-suspension.",
        ],
      },
      testScenarios: {
        en: [
          "Deactivate 'حتى أعود' with the SMS code; from a second account search for one of the ads — not found. Sign back in — visible again.",
          "Deactivate for 7 days, sign in: the question says 7 أيام. Tap لا — still on login, ads still hidden. Sign in again, tap نعم — home screen, ads visible.",
          "Deactivate for 7 days on two devices signed in — both are signed out.",
          "(Dev DB) set suspendedUntil to the past for a test account and wait for the hourly job (or run it) — the account is active and its ads are back.",
          "Request a code, wait until it expires, then submit it — refused.",
        ],
        ar: [
          "عطّل 'حتى أعود' برمز SMS؛ ومن حساب آخر ابحث عن أحد الإعلانات — غير موجود. سجّل الدخول مجدداً — يظهر من جديد.",
          "عطّل لمدة 7 أيام ثم سجّل الدخول: يذكر السؤال 7 أيام. اضغط لا — تبقى في شاشة الدخول والإعلانات مخفية. سجّل الدخول مجدداً واضغط نعم — الشاشة الرئيسية والإعلانات ظاهرة.",
          "عطّل لمدة 7 أيام وأنت مسجّل على جهازين — يُسجَّل الخروج من الاثنين.",
          "(قاعدة بيانات التطوير) اجعل suspendedUntil في الماضي لحساب اختبار وانتظر مهمة الساعة (أو شغّلها) — يعود الحساب نشطاً وتعود إعلاناته.",
          "اطلب رمزاً وانتظر انتهاءه ثم أرسله — يُرفض.",
        ],
      },
      updatedIn: "feat/account-state",
    },
    {
      id: "mobile-my-ads-lifecycle",
      title: {
        en: "My Activity: drafts, archive, republish, hide, delete and delete-all",
        ar: "نشاطي: المسودات والأرشفة وإعادة النشر والإخفاء والحذف وحذف الكل",
      },
      priority: "P0",
      endUserStory: {
        en: "As an advertiser, I want to manage my ads from one place, so that I can pause, bring back or remove them without contacting support.",
        ar: "بصفتي معلناً، أريد إدارة إعلاناتي من مكان واحد، حتى أتمكن من إيقافها أو إعادتها أو حذفها دون التواصل مع الدعم.",
      },
      story: {
        en: "Verify My Activity (GET /properties/me/activity): publish a draft (PATCH /properties/:id isDraft:false, spends a credit or the free ad; draft images show); archive an ad (POST /properties/:id/archive → the 'مؤرشفة' tab); republish an archived ad (POST /properties/:id/renew with the chosen credit — fresh publish date and duration); hide/show all (PATCH isHidden on each); delete one with a reason (DELETE /properties/:id) or delete all. Edit opens the edit form, not 'add new'.",
        ar: "تحقق من نشاطي (GET /properties/me/activity): نشر مسودة (PATCH /properties/:id مع isDraft:false، يستهلك رصيداً أو الإعلان المجاني؛ وتظهر صور المسودة)؛ أرشفة إعلان (POST /properties/:id/archive ← تبويب 'مؤرشفة')؛ إعادة نشر إعلان مؤرشف (POST /properties/:id/renew بالرصيد المختار — تاريخ نشر ومدة جديدان)؛ إخفاء/إظهار الكل (PATCH isHidden لكل إعلان)؛ حذف إعلان مع السبب (DELETE /properties/:id) أو حذف الكل. زر التعديل يفتح نموذج التعديل وليس 'إضافة جديد'.",
      },
      acceptanceCriteria: {
        en: [
          "Republishing spends exactly one credit; a second tap while the first is in flight is refused without spending (409).",
          "A republished ad moves to the top of 'الأحدث' (its publish date is now).",
          "A company/office persona still under review can save drafts but can't publish or republish ('حسابك قيد المراجعة…').",
          "Hidden ads are invisible to others but still listed in My Activity; 'show all' brings them back.",
          "Deleted ads disappear everywhere, including other users' favorites.",
        ],
        ar: [
          "إعادة النشر تستهلك رصيداً واحداً بالضبط؛ والضغط الثاني أثناء تنفيذ الأول يُرفض دون استهلاك (409).",
          "الإعلان المعاد نشره ينتقل لأعلى 'الأحدث' (تاريخ نشره الآن).",
          "هوية الشركة/المكتب قيد المراجعة يمكنها حفظ المسودات ولا يمكنها النشر أو إعادة النشر ('حسابك قيد المراجعة…').",
          "الإعلانات المخفية لا يراها الآخرون لكنها تظهر في نشاطي؛ و'إظهار الكل' يعيدها.",
          "الإعلانات المحذوفة تختفي في كل مكان بما في ذلك مفضلة المستخدمين الآخرين.",
        ],
      },
      testScenarios: {
        en: [
          "Create a draft with 3 images, reopen it — images visible; publish — status ACTIVE, credit −1.",
          "Archive an ad, republish with a Silver credit — featured days and duration follow Silver.",
          "Double-tap 'إعادة النشر' — one credit spent, one success, one refusal.",
          "Hide all, check from another account — none visible; show all — visible again.",
          "Delete all ads — My Activity is empty, and a favorite of one of them is gone for the other account.",
        ],
        ar: [
          "أنشئ مسودة بثلاث صور ثم أعد فتحها — الصور ظاهرة؛ انشرها — الحالة ACTIVE والرصيد −1.",
          "أرشف إعلاناً ثم أعد نشره برصيد فضي — أيام التمييز والمدة تتبع الفضية.",
          "اضغط 'إعادة النشر' مرتين — يُستهلك رصيد واحد، نجاح واحد ورفض واحد.",
          "أخفِ الكل وتحقق من حساب آخر — لا شيء ظاهر؛ أظهر الكل — تظهر مجدداً.",
          "احذف كل الإعلانات — نشاطي فارغ، والمفضلة لأحدها اختفت عند الحساب الآخر.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-home-sort",
      title: {
        en: "Home sort: default, oldest, newest and price (high→low, low→high)",
        ar: "ترتيب الرئيسية: الافتراضي والأقدم والأحدث والسعر (من الأعلى والأقل)",
      },
      priority: "P1",
      story: {
        en: "Verify 'الترتيب' on the listings screen opens 'الترتيب حسب' with, in order: الكل، الأقدم أولاً، الأحدث أولاً، السعر (من الأعلى للأقل)، السعر (من الأقل للأعلى), and reloads GET /properties with sort=DEFAULT|OLDEST|NEWEST|PRICE_DESC|PRICE_ASC. Default puts priority and featured ads first, then newest; Newest/Oldest order strictly by publish date; the price orders sort strictly by price, with ads that have no price at the end; pages never repeat or skip ads.",
        ar: "تحقق من أن 'الترتيب' في شاشة الإعلانات يفتح 'الترتيب حسب' بالترتيب: الكل، الأقدم أولاً، الأحدث أولاً، السعر (من الأعلى للأقل)، السعر (من الأقل للأعلى)، ويعيد تحميل GET /properties مع sort=DEFAULT|OLDEST|NEWEST|PRICE_DESC|PRICE_ASC. الافتراضي يضع إعلانات الأولوية والمميزة أولاً ثم الأحدث؛ الأحدث/الأقدم يرتبان حسب تاريخ النشر فقط؛ وترتيبا السعر حسب السعر فقط مع الإعلانات بلا سعر في النهاية؛ ولا تتكرر الصفحات أو تتخطى إعلانات.",
      },
      acceptanceCriteria: {
        en: [
          "The chosen option stays selected when the sheet is reopened.",
          "Newest shows a just-republished ad first; Oldest shows it last.",
          "Price high→low starts with the most expensive ad; low→high with the cheapest.",
          "Scrolling through several pages shows each ad exactly once.",
        ],
        ar: [
          "يبقى الخيار المختار محدداً عند إعادة فتح النافذة.",
          "الأحدث يعرض الإعلان المعاد نشره للتو أولاً؛ والأقدم يعرضه أخيراً.",
          "السعر من الأعلى يبدأ بأغلى إعلان؛ ومن الأقل يبدأ بأرخص إعلان.",
          "التمرير عبر عدة صفحات يعرض كل إعلان مرة واحدة فقط.",
        ],
      },
      testScenarios: {
        en: [
          "Switch between the five sorts and compare the first 5 ads.",
          "Republish an ad, then choose الأحدث أولاً — it's first.",
          "Choose each price order on the sale and rent tabs and check the prices go down / up.",
        ],
        ar: [
          "بدّل بين الترتيبات الخمسة وقارن أول 5 إعلانات.",
          "أعد نشر إعلان ثم اختر الأحدث أولاً — يظهر أولاً.",
          "اختر كل ترتيب سعر في تبويبي البيع والإيجار وتأكد أن الأسعار تنزل / تصعد.",
        ],
      },
      updatedIn: "feat/home-price-sort",
    },
    {
      id: "mobile-settings",
      title: {
        en: "Settings lists every section and each row opens its screen",
        ar: "الإعدادات تعرض كل الأقسام وكل صف يفتح شاشته",
      },
      priority: "P1",
      story: {
        en: "Verify More → اعدادات الحساب shows, in order: الاشعارات (notification preferences), الحساب والامان (change password, registered devices), الخصوصية (show phone, show WhatsApp, hide activity, hide office ads — saved through PATCH /settings and rolled back with a message if saving fails), الدعم والمساعدة (about, FAQ, contact), السياسات (privacy, terms), then delete account and temporary deactivation. Regression: a refactor had dropped the notifications, account & security, support rows and the show-phone switch.",
        ar: "تحقق من أن المزيد ← اعدادات الحساب تعرض بالترتيب: الاشعارات (تفضيلات الإشعارات)، الحساب والامان (تغيير كلمة المرور، الأجهزة المسجلة)، الخصوصية (اظهار رقم الهاتف، اظهار رقم الواتساب، اخفاء النشاط، اخفاء اعلانات المكاتب — تُحفظ عبر PATCH /settings وتُعاد مع رسالة إذا فشل الحفظ)، الدعم والمساعدة (عن بيوتنا، الأسئلة الشائعة، تواصل معنا)، السياسات (الخصوصية، الشروط)، ثم حذف الحساب والتعطيل المؤقت. فحص تراجع: إعادة هيكلة سابقة أسقطت صفوف الإشعارات والحساب والأمان والدعم ومفتاح اظهار رقم الهاتف.",
      },
      acceptanceCriteria: {
        en: [
          "Each row opens its screen: notifications, change password, devices, about, FAQ, contact, privacy, terms.",
          "Each privacy switch keeps its value after leaving and reopening the screen.",
          "Turning off 'اظهار رقم الهاتف' hides the phone from the user's ads and profile for others.",
        ],
        ar: [
          "كل صف يفتح شاشته: الإشعارات، تغيير كلمة المرور، الأجهزة، عن بيوتنا، الأسئلة الشائعة، تواصل معنا، الخصوصية، الشروط.",
          "كل مفتاح خصوصية يحتفظ بقيمته بعد مغادرة الشاشة وإعادة فتحها.",
          "إيقاف 'اظهار رقم الهاتف' يخفي الرقم من إعلانات المستخدم وملفه للآخرين.",
        ],
      },
      testScenarios: {
        en: [
          "Open settings and tap every row, returning each time.",
          "Toggle show phone off, check one of your ads from another account.",
        ],
        ar: [
          "افتح الإعدادات واضغط كل صف مع الرجوع في كل مرة.",
          "أوقف اظهار رقم الهاتف ثم افحص أحد إعلاناتك من حساب آخر.",
        ],
      },
      updatedIn: "fix/settings-missing-items",
    },
    {
      id: "mobile-change-password",
      title: {
        en: "Change password with an SMS code",
        ar: "تغيير كلمة المرور برمز SMS",
      },
      priority: "P0",
      story: {
        en: "Verify Settings → تغيير كلمة المرور: the form (current, new, confirm, 'تسجيل الخروج من جميع الأجهزة' — on by default) validates new ≠ current and confirm = new; submitting checks the current password first (POST /auth/change-password/request-otp with oldPassword) and only then sends the SMS code; the 'تحقق من الرقم' sheet shows the masked phone, six boxes and a 45 s resend; 'التحقق من الرمز' changes the password (PATCH /auth/change-password), signs out other devices if the switch is on, clears the form and returns. Accounts without a phone change it directly with the current password.",
        ar: "تحقق من الإعدادات ← تغيير كلمة المرور: النموذج (الحالية، الجديدة، التأكيد، 'تسجيل الخروج من جميع الأجهزة' — مفعّل افتراضياً) يتحقق أن الجديدة تختلف عن الحالية وأن التأكيد يطابق الجديدة؛ الإرسال يتحقق من كلمة المرور الحالية أولاً (POST /auth/change-password/request-otp مع oldPassword) ثم يرسل رمز SMS فقط؛ نافذة 'تحقق من الرقم' تعرض الرقم المخفي وست خانات وإعادة الإرسال بعد 45 ثانية؛ 'التحقق من الرمز' يغيّر كلمة المرور (PATCH /auth/change-password)، ويسجّل خروج الأجهزة الأخرى إذا كان المفتاح مفعّلاً، ويمسح النموذج ويعود. الحسابات دون رقم هاتف تغيّرها مباشرة بكلمة المرور الحالية.",
      },
      acceptanceCriteria: {
        en: [
          "A wrong current password shows 'كلمة المرور الحالية غير صحيحة' and no SMS is sent.",
          "A new password equal to the current one is refused in the form.",
          "A wrong code shows an inline error in the sheet and clears the boxes; the right one changes the password.",
          "With the switch on, other devices are signed out; the current device stays signed in.",
          "Leaving the screen clears every field.",
        ],
        ar: [
          "كلمة المرور الحالية الخاطئة تعرض 'كلمة المرور الحالية غير صحيحة' ولا يُرسل SMS.",
          "كلمة مرور جديدة مطابقة للحالية تُرفض في النموذج.",
          "الرمز الخاطئ يعرض خطأ داخل النافذة ويمسح الخانات؛ والصحيح يغيّر كلمة المرور.",
          "مع تفعيل المفتاح تُسجّل الأجهزة الأخرى خروجها؛ ويبقى الجهاز الحالي مسجلاً.",
          "مغادرة الشاشة تمسح كل الحقول.",
        ],
      },
      testScenarios: {
        en: [
          "Type a wrong current password — error, no SMS arrives.",
          "Change the password with the switch on; a second device is signed out on its next action.",
          "Wait 45 s in the sheet and resend — a new code arrives and works.",
        ],
        ar: [
          "اكتب كلمة مرور حالية خاطئة — خطأ ولا يصل SMS.",
          "غيّر كلمة المرور مع تفعيل المفتاح؛ الجهاز الثاني يُسجّل خروجه عند الإجراء التالي.",
          "انتظر 45 ثانية في النافذة وأعد الإرسال — يصل رمز جديد ويعمل.",
        ],
      },
      updatedIn: "fix/change-password-flow",
    },
    {
      id: "mobile-more-profile-card",
      title: {
        en: "More: the profile card has a single 'تعديل' button",
        ar: "المزيد: بطاقة الملف الشخصي فيها زر 'تعديل' فقط",
      },
      priority: "P2",
      story: {
        en: "Verify the profile card at the top of the individual More tab (AccountProfileHeaderCard): avatar, name, email/phone and the persona switcher (فرد ▾), then one full-width 'تعديل' button that opens Edit Profile. The 'معاينة' and 'مشاركة' buttons were removed — they had no action.",
        ar: "تحقق من بطاقة الملف الشخصي أعلى تبويب المزيد للفرد (AccountProfileHeaderCard): الصورة والاسم والبريد/الهاتف ومبدّل الهوية (فرد ▾)، ثم زر 'تعديل' واحد بعرض البطاقة يفتح تعديل الملف الشخصي. أُزيل زرا 'معاينة' و'مشاركة' — لم يكن لهما أي إجراء.",
      },
      acceptanceCriteria: {
        en: [
          "Only 'تعديل' appears under the name, spanning the card's width.",
          "Tapping it opens Edit Profile.",
        ],
        ar: [
          "يظهر زر 'تعديل' فقط تحت الاسم وبعرض البطاقة.",
          "الضغط عليه يفتح تعديل الملف الشخصي.",
        ],
      },
      testScenarios: {
        en: [
          "Open More as a signed-in individual — no 'معاينة' or 'مشاركة' buttons; tap 'تعديل' — Edit Profile opens.",
        ],
        ar: [
          "افتح المزيد كفرد مسجّل — لا يوجد زرا 'معاينة' أو 'مشاركة'؛ اضغط 'تعديل' — يفتح تعديل الملف الشخصي.",
        ],
      },
      updatedIn: "feat/account-state",
    },
    {
      id: "mobile-login-method",
      title: {
        en: "Login method: sign in with email, phone, or either — the phone only once verified by SMS",
        ar: "طريقة تسجيل الدخول: البريد أو الهاتف أو أيهما — والهاتف فقط بعد التحقق منه برمز SMS",
      },
      priority: "P1",
      endUserStory: {
        en: "As a user, I want to choose which identifier my account signs in with, so that only the one I trust works with my password.",
        ar: "بصفتي مستخدماً، أريد اختيار المعرّف الذي يُسجَّل به الدخول إلى حسابي، حتى لا يعمل مع كلمة المرور إلا المعرّف الذي أثق به.",
      },
      story: {
        en: "Verify Settings → الحساب والامان → 'طريقة تسجيل الدخول' opens a sheet with three choices: 'البريد الالكتروني أو رقم الهاتف' (the default for every account), 'البريد الالكتروني' with the address, and 'رقم الهاتف' with the number. A phone that isn't SMS-verified is greyed out; tapping it shows 'يجب التحقق من رقم الهاتف أولاً، يمكنك التحقق من رقم الهاتف من تعديل الملف الشخصي.' حفظ saves (PATCH /users/account/login-method) and shows 'تم تحديث طريقة تسجيل الدخول بنجاح.'; تراجع closes without saving. With email or phone chosen, password login with the other identifier is refused (403) — only after the password is proven. In Edit Profile, a new phone number is texted a code and only saved once the code is right; a saved phone that isn't verified shows 'الرقم غير موثق — تحقق من الرقم'. Google/Apple sign-in and password recovery are unaffected.",
        ar: "تحقق من الإعدادات ← الحساب والامان ← 'طريقة تسجيل الدخول': تفتح نافذة بثلاثة خيارات: 'البريد الالكتروني أو رقم الهاتف' (الافتراضي لكل الحسابات)، و'البريد الالكتروني' مع العنوان، و'رقم الهاتف' مع الرقم. الهاتف غير الموثق برمز SMS يظهر باهتاً؛ والضغط عليه يعرض 'يجب التحقق من رقم الهاتف أولاً، يمكنك التحقق من رقم الهاتف من تعديل الملف الشخصي.' زر حفظ يحفظ (PATCH /users/account/login-method) ويعرض 'تم تحديث طريقة تسجيل الدخول بنجاح.'؛ وتراجع يغلق دون حفظ. عند اختيار البريد أو الهاتف يُرفض الدخول بكلمة المرور بالمعرّف الآخر (403) — بعد التحقق من كلمة المرور فقط. في تعديل الملف الشخصي يُرسل رمز إلى رقم الهاتف الجديد ولا يُحفظ إلا بعد إدخال الرمز الصحيح؛ والرقم المحفوظ غير الموثق يعرض 'الرقم غير موثق — تحقق من الرقم'. تسجيل الدخول عبر Google/Apple واستعادة كلمة المرور لا يتأثران.",
      },
      acceptanceCriteria: {
        en: [
          "Every account starts on 'البريد الالكتروني أو رقم الهاتف'; both identifiers sign in.",
          "With 'رقم الهاتف' saved, signing in with the email and the right password shows 'طريقة تسجيل الدخول المحددة لحسابك هي رقم الهاتف، يرجى تسجيل الدخول به.'; with a wrong password the usual invalid-credentials message shows.",
          "With 'البريد الالكتروني' saved, the phone is refused the same way.",
          "An unverified phone can't be chosen and the warning toast explains why.",
          "Changing the phone in Edit Profile sends a code to the new number; a wrong code saves nothing; the right code saves the number and the rest of the form.",
          "A number already on another account is refused ('رقم الهاتف مستخدم في حساب آخر').",
        ],
        ar: [
          "كل الحسابات تبدأ على 'البريد الالكتروني أو رقم الهاتف'؛ والمعرّفان يعملان.",
          "عند حفظ 'رقم الهاتف'، الدخول بالبريد وكلمة المرور الصحيحة يعرض 'طريقة تسجيل الدخول المحددة لحسابك هي رقم الهاتف، يرجى تسجيل الدخول به.'؛ ومع كلمة مرور خاطئة تظهر رسالة بيانات الدخول المعتادة.",
          "عند حفظ 'البريد الالكتروني' يُرفض الهاتف بنفس الطريقة.",
          "لا يمكن اختيار هاتف غير موثق ويشرح التنبيه السبب.",
          "تغيير الهاتف في تعديل الملف الشخصي يرسل رمزاً للرقم الجديد؛ الرمز الخاطئ لا يحفظ شيئاً؛ والصحيح يحفظ الرقم وبقية النموذج.",
          "الرقم المستخدم في حساب آخر يُرفض ('رقم الهاتف مستخدم في حساب آخر').",
        ],
      },
      testScenarios: {
        en: [
          "On an email-only account open the sheet: phone is greyed; tap it — warning toast. Add a phone in Edit Profile, enter the SMS code, reopen the sheet — phone is selectable.",
          "Choose رقم الهاتف, save — success toast. Sign out and sign in with the email — refused with the message; sign in with the phone — works.",
          "Choose 'البريد الالكتروني أو رقم الهاتف' again — both work.",
          "In Edit Profile enter a new number, save, type a wrong code — error in the sheet; type the right code — profile saved with the new number.",
        ],
        ar: [
          "على حساب ببريد فقط افتح النافذة: الهاتف باهت؛ اضغطه — يظهر التنبيه. أضف هاتفاً من تعديل الملف الشخصي وأدخل رمز SMS ثم افتح النافذة — يمكن اختيار الهاتف.",
          "اختر رقم الهاتف واحفظ — يظهر تنبيه النجاح. سجّل الخروج وادخل بالبريد — يُرفض بالرسالة؛ وادخل بالهاتف — يعمل.",
          "اختر 'البريد الالكتروني أو رقم الهاتف' مجدداً — يعمل الاثنان.",
          "في تعديل الملف الشخصي أدخل رقماً جديداً واحفظ واكتب رمزاً خاطئاً — خطأ في النافذة؛ ثم الرمز الصحيح — يُحفظ الملف بالرقم الجديد.",
        ],
      },
      updatedIn: "feat/account-state",
    },
    {
      id: "mobile-service-invoices",
      title: {
        en: "فواتير الخدمات: invoices companies issued to you — search, sort, details, download, share, delete",
        ar: "فواتير الخدمات: الفواتير التي أصدرتها الشركات لك — بحث وترتيب وتفاصيل وتحميل ومشاركة وحذف",
      },
      priority: "P1",
      endUserStory: {
        en: "As a client, I want every invoice a company issued me in one place, so that I can check what I paid for and keep a copy.",
        ar: "بصفتي عميلاً، أريد كل فاتورة أصدرتها لي شركة في مكان واحد، حتى أراجع ما دفعت مقابله وأحتفظ بنسخة.",
      },
      story: {
        en: "Verify More → فواتير الخدمات opens the list (it no longer says قريباً). Each card shows the invoice number, the service, the amount, 'تم الدفع في: {date}' (or 'بانتظار الدفع' until the company marks it paid) and تحميل. The search box matches the invoice number, the service or the company name; the sort button opens 'الترتيب حسب' (الكل / الأحدث أولاً / الأقدم أولاً). Tapping a card opens 'تفاصيل الفاتورة': company logo, name and specialty, invoice number, issue date and time, service, warranty, line items, discount and total, with تحميل / مشاركة (a PDF via the share sheet) and حذف, which asks 'حذف فاتورة الخدمة ؟' and removes it from your list only. The download icon at the top exports the whole list as one PDF. With no invoices the empty state shows 'لا توجد فواتير للخدمات حتى الآن'. A new invoice and its payment also arrive as notifications.",
        ar: "تحقق من أن المزيد ← فواتير الخدمات يفتح القائمة (لم تعد تظهر قريباً). كل بطاقة تعرض رقم الفاتورة والخدمة والمبلغ و'تم الدفع في: {التاريخ}' (أو 'بانتظار الدفع' حتى تؤكد الشركة الدفع) وزر تحميل. البحث يطابق رقم الفاتورة أو الخدمة أو اسم الشركة؛ وزر الترتيب يفتح 'الترتيب حسب' (الكل / الأحدث أولاً / الأقدم أولاً). الضغط على بطاقة يفتح 'تفاصيل الفاتورة': شعار الشركة واسمها وتخصصها ورقم الفاتورة وتاريخ ووقت الإصدار والخدمة والكفالة والبنود والخصم والإجمالي، مع تحميل / مشاركة (ملف PDF عبر نافذة المشاركة) وحذف، الذي يسأل 'حذف فاتورة الخدمة ؟' ويزيلها من قائمتك فقط. أيقونة التحميل في الأعلى تصدّر القائمة كاملة كملف PDF واحد. عند عدم وجود فواتير تظهر حالة 'لا توجد فواتير للخدمات حتى الآن'. وتصل الفاتورة الجديدة وتأكيد دفعها كإشعارات أيضاً.",
      },
      acceptanceCriteria: {
        en: [
          "Only invoices addressed to the signed-in persona appear.",
          "Search and sort change the list; a search with no match shows 'لا توجد نتائج مطابقة'.",
          "The details total equals the items minus the discount.",
          "تحميل and مشاركة open the share sheet with a PDF of that invoice; the header icon exports the visible list.",
          "حذف asks first; after confirming the invoice disappears and stays gone after reopening the screen. تراجع keeps it.",
          "A card shows 'بانتظار الدفع' until the company marks it paid, then 'تم الدفع في'.",
        ],
        ar: [
          "تظهر فقط الفواتير الموجهة للهوية المسجّل بها الدخول.",
          "البحث والترتيب يغيّران القائمة؛ والبحث بلا نتائج يعرض 'لا توجد نتائج مطابقة'.",
          "إجمالي التفاصيل يساوي البنود ناقص الخصم.",
          "تحميل ومشاركة يفتحان نافذة المشاركة بملف PDF للفاتورة؛ وأيقونة الأعلى تصدّر القائمة الظاهرة.",
          "حذف يسأل أولاً؛ وبعد التأكيد تختفي الفاتورة وتبقى مختفية بعد إعادة فتح الشاشة. وتراجع يبقيها.",
          "البطاقة تعرض 'بانتظار الدفع' حتى تؤكد الشركة الدفع، ثم 'تم الدفع في'.",
        ],
      },
      testScenarios: {
        en: [
          "As an individual, send a request to a test company; as the company accept it and issue an invoice picking that client. Back as the individual: a notification arrives and the invoice is in فواتير الخدمات with 'بانتظار الدفع'.",
          "As the company mark it paid — the individual's card shows 'تم الدفع في' with today's date.",
          "Search by part of the company name and by the invoice number; switch to الأقدم أولاً.",
          "Open the details, tap تحميل and save to Files; tap مشاركة and send it; delete it and confirm it's gone.",
        ],
        ar: [
          "كفرد أرسل طلباً لشركة اختبار؛ وكشركة اقبله وأصدر فاتورة باختيار ذلك العميل. عد كفرد: يصل إشعار وتظهر الفاتورة في فواتير الخدمات مع 'بانتظار الدفع'.",
          "كشركة أكّد الدفع — تعرض بطاقة الفرد 'تم الدفع في' بتاريخ اليوم.",
          "ابحث بجزء من اسم الشركة وبرقم الفاتورة؛ وبدّل إلى الأقدم أولاً.",
          "افتح التفاصيل واضغط تحميل واحفظ في الملفات؛ واضغط مشاركة وأرسلها؛ ثم احذفها وتأكد أنها اختفت.",
        ],
      },
      updatedIn: "feat/service-invoices",
    },
    {
      id: "mobile-activity-open-ad",
      title: {
        en: "Tapping an ad in نشاطي opens its details sheet",
        ar: "الضغط على إعلان في نشاطي يفتح نافذة تفاصيله",
      },
      priority: "P0",
      story: {
        en: "Regression check for a fixed bug: in نشاطي, tapping a published ad did nothing, so the user couldn't open their own ad. The active ad card had no tap action, only its ⋮ menu. Now tapping anywhere on an active, hidden or featured ad opens its details sheet (photos, price, publish date, specs, location, features, description, views / saves / contacts) with a visible/hidden switch, share, ✕, and تعديل / تمييز / حذف buttons. The card's ⋮ menu is gone — those actions live in the sheet. Archived ads still open with their republish action; tapping a draft opens its preview.",
        ar: "فحص تراجع لخطأ تم إصلاحه: في نشاطي كان الضغط على إعلان منشور لا يفعل شيئاً، فلا يستطيع المستخدم فتح إعلانه. بطاقة الإعلان النشط لم يكن لها أي إجراء عند الضغط، فقط قائمة ⋮. الآن الضغط في أي مكان على إعلان نشط أو مخفي أو مميز يفتح نافذة تفاصيله (الصور والسعر وتاريخ النشر والمواصفات والموقع والمزايا والوصف والمشاهدات/الحفظ/التواصل) مع مفتاح إظهار/إخفاء ومشاركة و✕ وأزرار تعديل / تمييز / حذف. وأُزيلت قائمة ⋮ من البطاقة — هذه الإجراءات صارت داخل النافذة. والإعلانات المؤرشفة ما زالت تفتح مع إجراء إعادة النشر؛ والضغط على مسودة يفتح معاينتها.",
      },
      acceptanceCriteria: {
        en: [
          "Tapping the image or the text of an active ad opens that ad's details sheet, with its real publish date.",
          "Hidden (اعلان مخفي) and featured (إعلان مميز) ads open the same way; the active card has no ⋮ button.",
          "In the sheet: the switch shows/hides just this ad, تعديل opens the edit screen, تمييز opens the feature sheet, حذف asks to confirm, share opens the share sheet, ✕ closes it.",
          "An archived ad opens its details with the republish action, as before.",
          "Tapping a draft card opens its preview; its حذف button still only deletes.",
        ],
        ar: [
          "الضغط على صورة أو نص إعلان نشط يفتح نافذة تفاصيل هذا الإعلان بتاريخ نشره الحقيقي.",
          "الإعلانات المخفية (اعلان مخفي) والمميزة (إعلان مميز) تفتح بنفس الطريقة؛ ولا يوجد زر ⋮ في البطاقة.",
          "داخل النافذة: المفتاح يُظهر/يُخفي هذا الإعلان فقط، وتعديل يفتح شاشة التعديل، وتمييز يفتح نافذة التمييز، وحذف يطلب التأكيد، والمشاركة تفتح نافذة المشاركة، و✕ تغلقها.",
          "الإعلان المؤرشف يفتح تفاصيله مع إجراء إعادة النشر كما كان.",
          "الضغط على بطاقة مسودة يفتح معاينتها؛ وزر حذف فيها ما زال يحذف فقط.",
        ],
      },
      testScenarios: {
        en: [
          "Open نشاطي, tap an active ad's image, close the sheet, tap its price text — both open its details sheet.",
          "In the sheet flip the switch off — the card gets اعلان مخفي; flip it on — it goes back to نشط.",
          "In the sheet tap تمييز, then حذف — each closes the sheet and opens its own sheet.",
          "Switch to المؤرشفة and tap an ad — details open with إعادة نشر.",
          "Tap a draft card — its preview sheet opens.",
        ],
        ar: [
          "افتح نشاطي، اضغط على صورة إعلان نشط، أغلق النافذة، ثم اضغط على نص السعر — كلاهما يفتح نافذة تفاصيله.",
          "أطفئ المفتاح في النافذة — تظهر على البطاقة اعلان مخفي؛ وأشعله — تعود إلى نشط.",
          "اضغط تمييز في النافذة ثم حذف — كل منهما يغلق النافذة ويفتح نافذته.",
          "انتقل إلى المؤرشفة واضغط على إعلان — تفتح التفاصيل مع إعادة نشر.",
          "اضغط على بطاقة مسودة — تفتح نافذة معاينتها.",
        ],
      },
      updatedIn: "feat/activity-card-details-sheet",
    },
    {
      id: "mobile-edit-profile-verify-contacts",
      title: {
        en: "Edit Profile: a new email or phone is verified with a code, and phone-only accounts can save",
        ar: "تعديل الملف الشخصي: البريد أو الرقم الجديد يُتحقق منه برمز، وحسابات الهاتف فقط تستطيع الحفظ",
      },
      priority: "P0",
      story: {
        en: "In تعديل الملف الشخصي the email is now editable and optional. A new or added email shows 'ارسال رمز التحقق'; it opens the 'تحقق من البريد الإلكتروني' sheet with the 6-digit code sent to that address and a 45-second resend timer. Saving before verifying shows 'يرجى التحقق من البريد الإلكتروني قبل حفظ التغييرات.'; a correct code shows 'تم التحقق من البريد الالكتروني بنجاح.' and the profile can then be saved. A new or added phone still opens the 'تحقق من الرقم' SMS sheet on save. Fixes a bug: an account made with a phone number (no email) could never save, because the empty email was required.",
        ar: "في تعديل الملف الشخصي أصبح البريد الإلكتروني قابلاً للتعديل واختيارياً. البريد الجديد أو المضاف يُظهر 'ارسال رمز التحقق'، الذي يفتح نافذة 'تحقق من البريد الإلكتروني' مع رمز من 6 أرقام يُرسل إلى ذلك العنوان ومؤقت إعادة إرسال 45 ثانية. الحفظ قبل التحقق يُظهر 'يرجى التحقق من البريد الإلكتروني قبل حفظ التغييرات.'؛ والرمز الصحيح يُظهر 'تم التحقق من البريد الالكتروني بنجاح.' ثم يمكن حفظ الملف. الرقم الجديد أو المضاف ما زال يفتح نافذة 'تحقق من الرقم' برسالة SMS عند الحفظ. يصلح خطأ: الحساب المُنشأ برقم هاتف (بدون بريد) لم يكن يستطيع الحفظ أبداً لأن البريد الفارغ كان مطلوباً.",
      },
      acceptanceCriteria: {
        en: [
          "A user who signed up with a phone number (no email) can change their name and save.",
          "Typing a new valid email shows 'ارسال رمز التحقق' under the field; an invalid one shows 'بريد الكتروني غير صالح' and no link.",
          "Tapping the link sends a code to that email and opens the sheet showing the full address.",
          "Pressing تعديل البيانات before verifying shows the amber toast and saves nothing.",
          "The right code shows the green toast, the link disappears, and saving works.",
          "Changing or adding a phone number opens the SMS code sheet on save; the rest is saved after the code.",
          "The phone is always required (it's how people reach you); طريقة تسجيل الدخول only decides the email: PHONE → email '(اختياري)'; EMAIL and BOTH → email required. An EMAIL-sign-in account can't save with no phone.",
          "رقم الواتساب is optional: cleared, the profile still saves.",
          "Closing تعديل الملف الشخصي without saving and opening it again shows the saved profile, not the unsaved edits.",
          "A note above the fields says which is required and why, with 'يمكنك تغييرها من الإعدادات' opening Settings.",
          "Saving with a required field empty shows an amber toast naming it ('البريد الإلكتروني مطلوب حسب طريقة تسجيل الدخول لديك.' / 'رقم الهاتف مطلوب حسب طريقة تسجيل الدخول لديك.') and saves nothing.",
        ],
        ar: [
          "المستخدم الذي سجّل برقم هاتف (بدون بريد) يستطيع تغيير اسمه والحفظ.",
          "كتابة بريد جديد صحيح تُظهر 'ارسال رمز التحقق' تحت الحقل؛ والبريد غير الصحيح يُظهر 'بريد الكتروني غير صالح' بدون الرابط.",
          "الضغط على الرابط يرسل رمزاً إلى ذلك البريد ويفتح النافذة مع العنوان كاملاً.",
          "الضغط على تعديل البيانات قبل التحقق يُظهر التنبيه البرتقالي ولا يحفظ شيئاً.",
          "الرمز الصحيح يُظهر التنبيه الأخضر ويختفي الرابط ويعمل الحفظ.",
          "تغيير أو إضافة رقم هاتف يفتح نافذة رمز SMS عند الحفظ؛ ويُحفظ الباقي بعد الرمز.",
          "رقم الهاتف مطلوب دائماً (وسيلة التواصل معك)؛ وطريقة تسجيل الدخول تحدد البريد فقط: PHONE ← البريد '(اختياري)'؛ EMAIL و BOTH ← البريد مطلوب. لا يمكن لحساب يسجّل الدخول بالبريد الحفظ دون رقم هاتف.",
          "رقم الواتساب اختياري: عند مسحه يُحفظ الملف.",
          "إغلاق تعديل الملف الشخصي دون حفظ ثم فتحه مجدداً يعرض الملف المحفوظ وليس التعديلات غير المحفوظة.",
          "ملاحظة فوق الحقول توضح المطلوب وسببه، مع 'يمكنك تغييرها من الإعدادات' التي تفتح الإعدادات.",
          "الحفظ مع حقل مطلوب فارغ يُظهر تنبيهاً برتقالياً يسميه ('البريد الإلكتروني مطلوب حسب طريقة تسجيل الدخول لديك.' / 'رقم الهاتف مطلوب حسب طريقة تسجيل الدخول لديك.') ولا يحفظ شيئاً.",
        ],
      },
      testScenarios: {
        en: [
          "Sign in with a phone-only account, edit the name, tap تعديل البيانات — it saves.",
          "Add an email, tap تعديل البيانات — amber toast; tap ارسال رمز التحقق, enter the emailed code — green toast; save — the email is on the profile.",
          "Enter a wrong code — the error shows and the boxes clear for a retry.",
          "Change the phone number and save — the SMS sheet opens; after the code the profile saves.",
        ],
        ar: [
          "سجّل الدخول بحساب هاتف فقط، عدّل الاسم، اضغط تعديل البيانات — يُحفظ.",
          "أضف بريداً، اضغط تعديل البيانات — تنبيه برتقالي؛ اضغط ارسال رمز التحقق وأدخل الرمز المرسل — تنبيه أخضر؛ احفظ — يظهر البريد في الملف.",
          "أدخل رمزاً خاطئاً — يظهر الخطأ وتُفرغ الخانات لإعادة المحاولة.",
          "غيّر رقم الهاتف واحفظ — تفتح نافذة رمز SMS؛ وبعد الرمز يُحفظ الملف.",
        ],
      },
      updatedIn: "fix/individual-bugs, feat/identity-contact-phone",
    },
    {
      id: "mobile-plans-wallet-real-balance",
      title: {
        en: "Plans wallet section shows the real remaining-ad balance (no hardcoded counters)",
        ar: "قسم محفظتك الإعلانية في الباقات يعرض رصيد الإعلانات الحقيقي (بدون أرقام ثابتة)",
      },
      priority: "P1",
      story: {
        en: "QA bug fix: the 'الإعلان المجاني الترحيبي' card on الباقات used to hardcode 'متبقي 1 إعلان' regardless of the account's actual balance. It now renders the real freeAdsRemaining ('متبقي إعلان مجاني واحد' for one, 'متبقي N إعلانات' otherwise) and the whole wallet section disappears when the balance is zero and there are no plan slots — matching رصيد الحساب and My Activity.",
        ar: "إصلاح بلاغ QA: كانت بطاقة 'الإعلان المجاني الترحيبي' في الباقات تعرض 'متبقي 1 إعلان' ثابتة مهما كان الرصيد الفعلي. الآن تعرض freeAdsRemaining الحقيقي ('متبقي إعلان مجاني واحد' لواحد، 'متبقي N إعلانات' لغيره) ويختفي قسم المحفظة بالكامل عند صفر الرصيد وعدم وجود حصص باقات — بما يطابق رصيد الحساب ونشاطي.",
      },
      acceptanceCriteria: {
        en: [
          "The welcome free-ad card shows the account's real remaining count (singular wording for 1, plural otherwise) — never a hardcoded 1.",
          "With 0 free ads and no plan slots the whole 'محفظتك الإعلانية' section is hidden.",
          "Plan-tier rows keep rendering each tier's real remaining/total ads.",
        ],
        ar: [
          "بطاقة الإعلان المجاني الترحيبي تعرض العدد الحقيقي المتبقي (صيغة المفرد للواحد والجمع لغيره) — وليس رقماً ثابتاً.",
          "عند صفر إعلانات مجانية وعدم وجود حصص باقات يختفي قسم 'محفظتك الإعلانية' بالكامل.",
          "صفوف الباقات تستعرض رصيد كل باقة الحقيقي المتبقي من الإجمالي.",
        ],
      },
      testScenarios: {
        en: [
          "With a wallet of 3 free ads, الباقات shows 'متبقي 3 إعلانات' (not 1).",
          "With 1 free ad it shows 'متبقي إعلان مجاني واحد'.",
          "With 0 free ads and no slots the wallet section doesn't render at all.",
        ],
        ar: [
          "بمحفظة 3 إعلانات مجانية تعرض الباقات 'متبقي 3 إعلانات' (وليس 1).",
          "بإعلان مجاني واحد تعرض 'متبقي إعلان مجاني واحد'.",
          "بصفر إعلانات وبدون حصص لا يُعرض قسم المحفظة إطلاقاً.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
    {
      id: "mobile-activity-offers-tab-state",
      title: {
        en: "My Activity → عروضي: clean empty state, no auth buttons, and no ads ⋮ menu",
        ar: "نشاطي ← عروضي: حالة فارغة نظيفة بدون أزرار تسجيل، وبدون قائمة الإعلانات",
      },
      priority: "P1",
      story: {
        en: "QA bug fix: the عروضي (price-quote requests) tab used the shared GuestEmptyState, so it always rendered 'إنشاء حساب' / 'تسجيل الدخول' buttons even though the tab is only reachable signed-in (guests get the ActivityGuestView instead). It now renders a neutral empty state (icon + title + description, no auth actions). Also, the header ⋮ on عروضي used to open the ADS options menu (اخفاء/حذف جميع الاعلانات — the delete-ad flow), which has no meaning for quote requests: the ⋮ button is hidden on عروضي and only appears on إعلاناتي and تنبيهاتي where their dropdown menus apply.",
        ar: "إصلاح بلاغ QA: كان تبويب عروضي (طلبات عروض السعر) يستخدم GuestEmptyState المشترك، فيعرض دائماً زرّي 'إنشاء حساب' / 'تسجيل الدخول' رغم أن التبويب لا يُفتح إلا مسجلاً (الزائر يرى ActivityGuestView بدلاً منه). الآن يعرض حالة فارغة محايدة (أيقونة + عنوان + وصف بدون أزرار تسجيل). كما أن زر ⋮ في الترويسة على عروضي كان يفتح قائمة الإعلانات (اخفاء/حذف جميع الاعلانات — فلو حذف الإعلان) بلا معنى لطلبات عرض السعر: زر ⋮ مخفي على عروضي ويظهر فقط على إعلاناتي وتنبيهاتي حيث تنطبق قائماهما المنسدلتان.",
      },
      acceptanceCriteria: {
        en: [
          "With no submitted requests, عروضي shows the icon, 'لا توجد طلبات بعد' and the description — no إنشاء حساب/تسجيل الدخول buttons (signed-in or otherwise).",
          "The header ⋮ button is hidden on عروضي; it appears on إعلاناتي (dropdown: اخفاء/اظهار جميع الاعلانات + حذف جميع الاعلانات → confirmation sheet) and تنبيهاتي (its own dropdown).",
          "The + button on عروضي still routes to add-alert.",
        ],
        ar: [
          "بدون طلبات مرسلة يعرض عروضي الأيقونة و'لا توجد طلبات بعد' والوصف — بدون زرّي إنشاء حساب/تسجيل الدخول (مسجلاً كان أم لا).",
          "زر ⋮ في الترويسة مخفي على عروضي؛ ويظهر على إعلاناتي (قائمة منسدلة: اخفاء/اظهار جميع الاعلانات + حذف جميع الاعلانات ← نافذة التأكيد) وتنبيهاتي (قائمتها الخاصة).",
          "زر + على عروضي لا يزال ينقل إلى إضافة تنبيه.",
        ],
      },
      testScenarios: {
        en: [
          "Signed-in with no requests, open نشاطي → عروضي — the empty state shows without auth buttons.",
          "Switch to إعلاناتي — the ⋮ appears and opens the dropdown; switch to عروضي — the ⋮ disappears.",
          "Tap + on عروضي — the add-alert flow opens.",
        ],
        ar: [
          "مسجلاً وبدون طلبات، افتح نشاطي ← عروضي — تظهر الحالة الفارغة بدون أزرار تسجيل.",
          "انتقل إلى إعلاناتي — يظهر ⋮ ويفتح القائمة؛ وانتقل إلى عروضي — يختفي ⋮.",
          "اضغط + على عروضي — يُفتح فلو إضافة تنبيه.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
    {
      id: "mobile-account-balance-history-rtl",
      title: {
        en: "رصيد الحساب → سجل الاعلانات rows are right-aligned (RTL)",
        ar: "صفوف سجل الاعلانات في رصيد الحساب محاذاة لليمين (RTL)",
      },
      priority: "P2",
      story: {
        en: "QA bug fix: the ad-package history on رصيد الحساب (and the full list behind عرض الكل) was laid out as if the screen were LTR — package name, status dot and expiry date sat on the left with the ID on the right, and the section title was on the left with عرض الكل on the right. The app forces RTL, so rows now start from the right: status dot + package name with the expiry date under it on the right, the ID on the left; the section header shows سجل الاعلانات on the right and عرض الكل on the left.",
        ar: "إصلاح بلاغ QA: كان سجل الباقات في رصيد الحساب (والقائمة الكاملة خلف عرض الكل) مرتباً كأن الشاشة LTR — اسم الباقة ونقطة الحالة وتاريخ الانتهاء على اليسار والمعرّف على اليمين، وعنوان القسم على اليسار وعرض الكل على اليمين. التطبيق يفرض RTL، فأصبحت الصفوف تبدأ من اليمين: نقطة الحالة + اسم الباقة وتحته تاريخ الانتهاء على اليمين، والمعرّف على اليسار؛ وترويسة القسم تعرض سجل الاعلانات على اليمين وعرض الكل على اليسار.",
      },
      acceptanceCriteria: {
        en: [
          "On رصيد الحساب, each history row shows the status dot, package name and expiry date aligned to the right, and the ID (ID:XXXX) on the left.",
          "The section header shows سجل الاعلانات on the right and عرض الكل on the left.",
          "عرض الكل → سجل الاعلانات uses the same right-aligned row layout.",
        ],
        ar: [
          "في رصيد الحساب، يعرض كل صف في السجل نقطة الحالة واسم الباقة وتاريخ الانتهاء محاذاة لليمين، والمعرّف (ID:XXXX) على اليسار.",
          "ترويسة القسم تعرض سجل الاعلانات على اليمين وعرض الكل على اليسار.",
          "عرض الكل ← سجل الاعلانات يستخدم نفس تخطيط الصفوف المحاذى لليمين.",
        ],
      },
      testScenarios: {
        en: [
          "With purchased packages, open المزيد → رصيد الحساب — history rows and the section header read right-to-left.",
          "Tap عرض الكل — the full list rows are right-aligned too, including after toggling تصفية.",
        ],
        ar: [
          "مع باقات مشتراة، افتح المزيد ← رصيد الحساب — صفوف السجل وترويسة القسم تُقرأ من اليمين لليسار.",
          "اضغط عرض الكل — صفوف القائمة الكاملة محاذاة لليمين أيضاً، بما في ذلك بعد تبديل تصفية.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
    {
      id: "mobile-activity-filter-sheet-autofill",
      title: {
        en: "My Activity: تصفية البحث opens a filter sheet; free-text/number fields don't offer email/password autofill",
        ar: "نشاطي: تصفية البحث تفتح نافذة تصفية؛ وحقول النص/الأرقام لا تقترح البريد/كلمة المرور",
      },
      priority: "P2",
      story: {
        en: "QA bug fixes: (1) the تصفية البحث (filter) button next to الترتيب حسب on نشاطي had no UI — it silently toggled between الكل and نشطة. It now opens a 'تصفية البحث' bottom sheet with the ad-status filters (الكل / نشطة / مميزة / مسودة / مؤرشفة with counts, same as the pills); the button shows a dot while a filter other than الكل is applied, and it is hidden on عروضي and تنبيهاتي, which have no filters. (2) The 'سبب اخر' reason box in the delete-ad flow and the price/area inputs in Add Alert opened the OS autofill bar with saved email/password suggestions, as if they were login fields; they're now marked as plain fields so autofill stays out.",
        ar: "إصلاح بلاغات QA: (1) زر تصفية البحث بجوار الترتيب حسب في نشاطي لم يكن له أي واجهة — كان يبدّل بصمت بين الكل ونشطة. الآن يفتح نافذة 'تصفية البحث' بفلاتر حالة الإعلان (الكل / نشطة / مميزة / مسودة / مؤرشفة مع الأعداد، مثل الأزرار الصغيرة)؛ ويظهر على الزر نقطة عند تطبيق فلتر غير الكل، ويُخفى في عروضي وتنبيهاتي لعدم وجود فلاتر فيهما. (2) خانة 'سبب اخر' في فلو حذف الإعلان وحقول السعر/المساحة في إضافة تنبيه كانت تفتح شريط الملء التلقائي باقتراحات البريد/كلمة المرور المحفوظة كأنها حقول تسجيل دخول؛ الآن معرّفة كحقول عادية فلا يظهر الملء التلقائي.",
      },
      acceptanceCriteria: {
        en: [
          "On اعلاناتي, tapping the filter button opens 'تصفية البحث' with الكل / نشطة / مميزة / مسودة / مؤرشفة (with counts); picking one filters the list and syncs the pills.",
          "A dot shows on the filter button while the filter isn't الكل.",
          "The filter button doesn't appear on عروضي or تنبيهاتي.",
          "Typing a 'سبب اخر' delete reason, or a price/area in Add Alert, shows no email/password autofill suggestions (iOS and Android).",
        ],
        ar: [
          "في اعلاناتي، الضغط على زر التصفية يفتح 'تصفية البحث' بخيارات الكل / نشطة / مميزة / مسودة / مؤرشفة (مع الأعداد)؛ واختيار أحدها يصفّي القائمة ويتزامن مع الأزرار الصغيرة.",
          "تظهر نقطة على زر التصفية طالما الفلتر ليس الكل.",
          "زر التصفية لا يظهر في عروضي ولا تنبيهاتي.",
          "كتابة سبب حذف 'سبب اخر'، أو سعر/مساحة في إضافة تنبيه، لا تُظهر اقتراحات البريد/كلمة المرور (iOS وAndroid).",
        ],
      },
      testScenarios: {
        en: [
          "Open نشاطي → اعلاناتي, tap the filter button, pick مسودة — only drafts show, the مسودة pill is selected, and the button has a dot; pick الكل — the dot disappears.",
          "Switch to عروضي and تنبيهاتي — only the sort button remains.",
          "Delete an ad → choose سبب اخر → tap the text box — no saved-login suggestions; same for السعر/المساحة in Add Alert.",
        ],
        ar: [
          "افتح نشاطي ← اعلاناتي، اضغط زر التصفية واختر مسودة — تظهر المسودات فقط ويُحدد زر مسودة ويظهر على الزر نقطة؛ اختر الكل — تختفي النقطة.",
          "انتقل إلى عروضي وتنبيهاتي — يبقى زر الترتيب فقط.",
          "احذف إعلاناً ← اختر سبب اخر ← اضغط خانة النص — لا تظهر اقتراحات تسجيل الدخول المحفوظة؛ وكذلك السعر/المساحة في إضافة تنبيه.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
    {
      id: "mobile-activity-package-balance",
      title: {
        en: "My Activity shows the remaining ads from purchased packages",
        ar: "نشاطي يعرض الإعلانات المتبقية من الباقات المشتراة",
      },
      priority: "P1",
      story: {
        en: "QA bug fix: after buying an ad package, رصيد الحساب showed the remaining ads but نشاطي → إعلاناتي never did. My Activity decided between the free-quota banner and the عادي / فضي / ذهبي counters from /users/me's hasSubscription/subscription, which the API still returns as a placeholder (hardcoded 5/12/1, only for test emails/company/office). It now reads the real wallet (GET /plans/wallet balanceCounts — the same numbers as رصيد الحساب): with any remaining package ads it shows the three counters with the real per-tier remaining counts; with none it falls back to the free-quota banner. If the wallet request fails the ad list still loads with the free-quota banner. The republish sheet's fallback credit counts use the same real numbers.",
        ar: "إصلاح بلاغ QA: بعد شراء باقة إعلانات كان رصيد الحساب يعرض الإعلانات المتبقية بينما لم يعرضها نشاطي ← إعلاناتي أبداً. كان نشاطي يختار بين شريط الإعلان المجاني وعدادات عادي / فضي / ذهبي بناءً على hasSubscription/subscription من /users/me، والتي لا تزال الواجهة الخلفية ترجعها كقيمة مؤقتة (5/12/1 ثابتة، لحسابات الاختبار/الشركات/المكاتب فقط). الآن يقرأ المحفظة الحقيقية (GET /plans/wallet balanceCounts — نفس أرقام رصيد الحساب): عند وجود إعلانات متبقية في أي باقة تظهر العدادات الثلاثة بالأرقام الحقيقية لكل فئة؛ وعند عدم وجودها يظهر شريط الإعلان المجاني. وإذا فشل طلب المحفظة تُحمّل قائمة الإعلانات مع شريط الإعلان المجاني. كما تستخدم أعداد الرصيد الاحتياطية في نافذة إعادة النشر نفس الأرقام الحقيقية.",
      },
      acceptanceCriteria: {
        en: [
          "With a purchased package that has ads remaining, نشاطي → إعلاناتي shows the عادي / فضي / ذهبي counters, and each equals the same tier's number on رصيد الحساب.",
          "With no remaining package ads, the free-quota banner shows instead (with the real free-ad count).",
          "No placeholder numbers (1 / 12 / 5) ever appear.",
          "Counters update after publishing with a package credit, on returning to نشاطي.",
        ],
        ar: [
          "مع باقة مشتراة بها إعلانات متبقية، يعرض نشاطي ← إعلاناتي عدادات عادي / فضي / ذهبي، وكل منها يساوي رقم نفس الفئة في رصيد الحساب.",
          "بدون إعلانات متبقية في الباقات يظهر شريط الإعلان المجاني بدلاً منها (بعدد الإعلانات المجانية الحقيقي).",
          "لا تظهر أبداً أرقام مؤقتة (1 / 12 / 5).",
          "تتحدّث العدادات بعد النشر برصيد باقة، عند العودة إلى نشاطي.",
        ],
      },
      testScenarios: {
        en: [
          "Buy a silver package (or use an account that has one), open رصيد الحساب and note the counts, then open نشاطي — the same counts show.",
          "Publish an ad with that package, return to نشاطي — the فضي counter dropped by one.",
          "With an account that has never bought a package — the free-quota banner shows, no counters.",
        ],
        ar: [
          "اشترِ باقة فضية (أو استخدم حساباً لديه واحدة)، افتح رصيد الحساب ودوّن الأرقام، ثم افتح نشاطي — تظهر نفس الأرقام.",
          "انشر إعلاناً بتلك الباقة وارجع إلى نشاطي — نقص عداد فضي بواحد.",
          "بحساب لم يشترِ باقة من قبل — يظهر شريط الإعلان المجاني بدون عدادات.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
    {
      id: "mobile-companies-search-filter-sort",
      title: {
        en: "شركات tab: search keeps the keyboard, تصفية البحث + الترتيب حسب sheets, dimmed طلب عرض سعر sheet",
        ar: "تبويب الشركات: البحث لا يغلق الكيبورد، ونافذتا تصفية البحث والترتيب حسب، ونافذة طلب عرض سعر بخلفية داكنة",
      },
      priority: "P1",
      story: {
        en: "QA bug fixes on the شركات tab: (1) typing in 'ابحث باسم الشركة' closed the keyboard after every letter — the list header was rebuilt as a new component on each keystroke, remounting the input. (2) The row next to the search box now has the two icons from the design: تصفية البحث opens the company category sheet (الكل + categories, عرض النتائج / إعادة التعيين), and الترتيب حسب opens a sort sheet (الكل / الأعلى تقييماً / الأقل تقييماً / الأكثر مشاريعاً). Previously the single icon pushed the property search screen full-screen with the property (بيع/ايجار/بدل) filter sheet on top. (3) The طلب عرض سعر sheet now has the same dimmed backdrop as the app's other sheets, so it reads as a bottom sheet. API: GET /users/companies accepts sort=NEWEST|RATING_DESC|RATING_ASC|PROJECTS_DESC (default NEWEST = newest first; rating sorts break ties by review count).",
        ar: "إصلاح بلاغات QA في تبويب الشركات: (1) الكتابة في 'ابحث باسم الشركة' كانت تغلق الكيبورد بعد كل حرف — كانت ترويسة القائمة تُبنى كمكوّن جديد مع كل ضغطة فيُعاد تركيب الحقل. (2) بجوار خانة البحث أصبحت هناك الأيقونتان حسب التصميم: تصفية البحث تفتح نافذة تصنيفات الشركات (الكل + التصنيفات، عرض النتائج / إعادة التعيين)، والترتيب حسب تفتح نافذة ترتيب (الكل / الأعلى تقييماً / الأقل تقييماً / الأكثر مشاريعاً). سابقاً كانت الأيقونة الوحيدة تفتح شاشة بحث العقارات بملء الشاشة وفوقها فلتر العقارات (بيع/ايجار/بدل). (3) نافذة طلب عرض سعر أصبحت بخلفية داكنة مثل باقي النوافذ في التطبيق لتظهر كنافذة سفلية. API: يقبل GET /users/companies المعامل sort=NEWEST|RATING_DESC|RATING_ASC|PROJECTS_DESC (الافتراضي NEWEST = الأحدث أولاً؛ ترتيب التقييم يفصل التعادل بعدد المراجعات).",
      },
      acceptanceCriteria: {
        en: [
          "Typing a full company name in the search box keeps the keyboard open; results update after a short pause.",
          "The تصفية البحث icon opens the company category sheet (not the property search screen); choosing categories and عرض النتائج filters the list, like the التصنيف row.",
          "The الترتيب حسب icon opens الكل / الأعلى تقييماً / الأقل تقييماً / الأكثر مشاريعاً; each reorders the whole list, also across pages.",
          "طلب عرض سعر opens as a bottom sheet over a dimmed background.",
        ],
        ar: [
          "كتابة اسم شركة كامل في خانة البحث تُبقي الكيبورد مفتوحاً؛ وتتحدّث النتائج بعد توقف قصير.",
          "أيقونة تصفية البحث تفتح نافذة تصنيفات الشركات (وليس شاشة بحث العقارات)؛ واختيار التصنيفات ثم عرض النتائج يصفّي القائمة مثل صف التصنيف.",
          "أيقونة الترتيب حسب تفتح الكل / الأعلى تقييماً / الأقل تقييماً / الأكثر مشاريعاً؛ وكل خيار يعيد ترتيب القائمة كاملة عبر الصفحات أيضاً.",
          "طلب عرض سعر يُفتح كنافذة سفلية فوق خلفية داكنة.",
        ],
      },
      testScenarios: {
        en: [
          "On شركات type 'بابل' letter by letter — the keyboard never closes and the list narrows.",
          "Tap تصفية البحث, pick تشطيب, tap عرض النتائج — only تشطيب companies show; no full-screen search page appears.",
          "Tap الترتيب حسب → الأعلى تقييماً — highest-rated first; scroll to load more and the order continues; الأكثر مشاريعاً orders by مشاريع مكتملة.",
          "Tap طلب عرض سعر on a card — the sheet slides up over a darkened list.",
        ],
        ar: [
          "في الشركات اكتب 'بابل' حرفاً حرفاً — لا يُغلق الكيبورد وتضيق القائمة.",
          "اضغط تصفية البحث، اختر تشطيب، اضغط عرض النتائج — تظهر شركات التشطيب فقط؛ ولا تظهر شاشة بحث بملء الشاشة.",
          "اضغط الترتيب حسب ← الأعلى تقييماً — الأعلى تقييماً أولاً؛ مرّر لتحميل المزيد ويستمر الترتيب؛ والأكثر مشاريعاً يرتب حسب المشاريع المكتملة.",
          "اضغط طلب عرض سعر على بطاقة — تظهر النافذة فوق قائمة معتمة.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
    {
      id: "mobile-alert-success-view-alerts",
      title: {
        en: "After creating an alert, 'عرض تنبيهاتي' opens the alerts list",
        ar: "بعد إنشاء تنبيه، زر 'عرض تنبيهاتي' يفتح قائمة التنبيهات",
      },
      priority: "P1",
      story: {
        en: "On the success popup after creating an alert, 'عرض تنبيهاتي' closes the popup and opens نشاطي on the تنبيهاتي tab, whichever screen the form was opened from (activity, search results…). It no longer just goes back one screen.",
        ar: "في نافذة النجاح بعد إنشاء تنبيه، يغلق زر 'عرض تنبيهاتي' النافذة ويفتح نشاطي على تبويب تنبيهاتي، أياً كانت الشاشة التي فُتح منها النموذج (النشاط، نتائج البحث…). ولم يعد يرجع شاشة واحدة فقط.",
      },
      acceptanceCriteria: {
        en: [
          "From نشاطي → تنبيهاتي → +, create an alert and tap 'عرض تنبيهاتي': the alerts tab is shown with the new alert.",
          "From search results ('إنشاء تنبيه'), create an alert and tap 'عرض تنبيهاتي': نشاطي opens on تنبيهاتي (not back to the results).",
          "'العودة للرئيسية' still goes home.",
        ],
        ar: [
          "من نشاطي ← تنبيهاتي ← +، أنشئ تنبيهاً واضغط 'عرض تنبيهاتي': يظهر تبويب تنبيهاتي مع التنبيه الجديد.",
          "من نتائج البحث ('إنشاء تنبيه') أنشئ تنبيهاً واضغط 'عرض تنبيهاتي': يفتح نشاطي على تنبيهاتي (لا العودة للنتائج).",
          "'العودة للرئيسية' ما زال يذهب للرئيسية.",
        ],
      },
      testScenarios: {
        en: [
          "Create an alert from the search results screen, tap 'عرض تنبيهاتي' — the تنبيهاتي tab lists it.",
          "Create one from نشاطي, tap it again — same result, no stacked screens (swipe back doesn't return to the form).",
        ],
        ar: [
          "أنشئ تنبيهاً من شاشة نتائج البحث واضغط 'عرض تنبيهاتي' — يظهر في تبويب تنبيهاتي.",
          "أنشئ آخر من نشاطي واضغط الزر — النتيجة نفسها دون تكدّس شاشات (السحب للخلف لا يعيد إلى النموذج).",
        ],
      },
      updatedIn: "fix/alert-success-view-alerts",
    },
    {
      id: "mobile-required-optional-field-marks",
      title: {
        en: "Add Alert and Request a Quote mark required fields with * and optional ones with (اختياري)",
        ar: "إضافة تنبيه وطلب عرض سعر: * للحقول الإلزامية و(اختياري) للاختيارية",
      },
      priority: "P2",
      story: {
        en: "QA bug fix: nothing told the user which fields had to be filled before pressing send. Required fields now carry a red * after their label and optional ones '(اختياري)'. Add Alert (real estate and auctions): المحافظة is required; المنطقة, فئة العقار, price / rent / area, rooms / baths / floors, years, المزايا and both dates are optional. Request a Quote (the screen and a company's quote sheet): the service (مجال التخصص / نوع الطلب in the sheet), العنوان and وصف are required; نوع الطلب (screen), نطاق السعر and مرفقات are optional. The description is now checked before sending (the API rejects an empty one), with 'يرجى كتابة وصف الطلب'.",
        ar: "إصلاح بلاغ QA: لم يكن هناك ما يخبر المستخدم أي الحقول يجب ملؤها قبل الإرسال. الآن تحمل الحقول الإلزامية * أحمر بعد عنوانها والاختيارية '(اختياري)'. إضافة تنبيه (عقارات ومزادات): المحافظة إلزامية؛ والمنطقة وفئة العقار والسعر/الإيجار/المساحة والغرف/الحمامات/الأدوار والسنوات والمزايا والتاريخان اختيارية. طلب عرض سعر (الشاشة ونافذة الشركة): الخدمة (مجال التخصص / نوع الطلب في النافذة) والعنوان والوصف إلزامية؛ ونوع الطلب (في الشاشة) ونطاق السعر والمرفقات اختيارية. والوصف يُفحص قبل الإرسال (الواجهة البرمجية ترفض الوصف الفارغ) برسالة 'يرجى كتابة وصف الطلب'.",
      },
      acceptanceCriteria: {
        en: [
          "Add Alert → عقارات: المحافظة shows *; المنطقة, فئة العقار, السعر, المساحة and المزايا show (اختياري); exchange shows the rooms, baths, floors and years as optional.",
          "Add Alert → مزادات: المحافظة shows *; المنطقة, فئة العقار, التاريخ من and التاريخ الى show (اختياري).",
          "Request a Quote (screen and company sheet): the service, العنوان and وصف show *; نطاق السعر and مرفقات show (اختياري).",
          "Sending a quote with an empty description shows 'يرجى كتابة وصف الطلب' and sends nothing.",
          "Search / listing filters that reuse these fields are unchanged (no marks).",
        ],
        ar: [
          "إضافة تنبيه ← عقارات: المحافظة عليها *؛ والمنطقة وفئة العقار والسعر والمساحة والمزايا عليها (اختياري)؛ وفي التبادل الغرف والحمامات والأدوار والسنوات اختيارية.",
          "إضافة تنبيه ← مزادات: المحافظة عليها *؛ والمنطقة وفئة العقار والتاريخ من والتاريخ الى عليها (اختياري).",
          "طلب عرض سعر (الشاشة ونافذة الشركة): الخدمة والعنوان ووصف عليها *؛ ونطاق السعر ومرفقات عليها (اختياري).",
          "إرسال طلب بوصف فارغ يعرض 'يرجى كتابة وصف الطلب' ولا يرسل شيئاً.",
          "فلاتر البحث والإعلانات التي تعيد استخدام هذه الحقول لم تتغير (بلا علامات).",
        ],
      },
      testScenarios: {
        en: [
          "Open Add Alert on each tab and check the labels as above, then tap create with nothing chosen — the governorate message appears.",
          "Open Request a Quote, fill everything but the description and send — 'يرجى كتابة وصف الطلب' appears.",
        ],
        ar: [
          "افتح إضافة تنبيه في كل تبويب وافحص العناوين كما أعلاه، ثم اضغط إنشاء دون اختيار — تظهر رسالة المحافظة.",
          "افتح طلب عرض سعر واملأ كل شيء عدا الوصف وأرسل — تظهر 'يرجى كتابة وصف الطلب'.",
        ],
      },
      updatedIn: "fix/form-required-optional-labels",
    },
  ],
};
