import { DocSection } from "./types";

export const mobileIndividual: DocSection = {
  slug: "mobile-individual",
  title: { en: "Mobile — Individual", ar: "الجوال — الفرد" },
  summary: {
    en: "The (individual) route group and (auth) individual-auth/forgot-password screens — the only account type currently reachable in the mobile app (Company/Office are gated, see Mobile — Shared). Covers login, signup, OTP, password recovery, the identity switcher, and favorites.",
    ar: "مجموعة مسارات (individual) وشاشات (auth) الخاصة بـ individual-auth/forgot-password — نوع الحساب الوحيد القابل للوصول حالياً في التطبيق (الشركة والمكتب العقاري مقفلان، راجع الجوال — مشترك). يغطي هذا القسم تسجيل الدخول، التسجيل، رمز التحقق OTP، استعادة كلمة المرور، مبدّل الهوية، والمفضلة.",
  },
  stories: [
    {
      id: "mobile-favorites",
      title: {
        en: "Favorites persist correctly across the property lifecycle",
        ar: "المفضلة تُحفظ بشكل صحيح طوال دورة حياة العقار",
      },
      priority: "P0",
      endUserStory: {
        en: "As an individual user, I want to save properties I'm interested in and find them again easily later, so that I don't lose track of listings while I'm comparing options across multiple browsing sessions.",
        ar: "بصفتي مستخدماً فردياً، أريد حفظ العقارات التي تهمني والعثور عليها بسهولة لاحقاً، حتى لا أفقد تتبع الإعلانات أثناء مقارنة الخيارات عبر عدة جلسات تصفح.",
      },
      story: {
        en: "Verify the Favorites system (POST /favorites/:propertyId toggle, GET /favorites, GET /favorites/ids, GET /favorites/check/:propertyId, useFavoritesStore) behaves correctly end to end, so that a saved property reliably shows as saved everywhere in the app and survives logout/login.",
        ar: "تحقق من أن نظام المفضلة (POST /favorites/:propertyId للتبديل، GET /favorites، GET /favorites/ids، GET /favorites/check/:propertyId، useFavoritesStore) يعمل بشكل صحيح من البداية للنهاية، حتى يظهر العقار المحفوظ بشكل موثوق كمحفوظ في كل مكان بالتطبيق ويصمد أمام تسجيل الخروج/الدخول.",
      },
      acceptanceCriteria: {
        en: [
          "Toggling favorite on Property Detail updates the heart icon instantly (optimistic) and reflects the server state after refresh.",
          "The Favorites tab (more)/favorites shows exactly the set of properties the user has favorited, in a stable order.",
          "Un-favoriting from the Favorites list removes it from that list without requiring a manual refresh.",
          "Favorite state is per-user: switching identities (see mobile-identity-switch in Mobile — Shared) does not leak another identity's favorites.",
        ],
        ar: [
          "تبديل حالة المفضلة في شاشة تفاصيل العقار يحدّث أيقونة القلب فوراً (بشكل تفاؤلي) ويعكس حالة الخادم بعد التحديث.",
          "تبويب المفضلة (more)/favorites يعرض بالضبط مجموعة العقارات التي فضّلها المستخدم، بترتيب ثابت.",
          "إلغاء التفضيل من قائمة المفضلة يزيله من تلك القائمة دون الحاجة لتحديث يدوي.",
          "حالة التفضيل خاصة بكل مستخدم: تبديل الهويات (راجع mobile-identity-switch في الجوال — مشترك) لا يسرّب مفضلة هوية أخرى.",
        ],
      },
      testScenarios: {
        en: [
          "Favorite a property from Search results, then verify it appears favorited on Property Detail and in the Favorites tab.",
          "Favorite 15+ properties and confirm the Favorites list paginates/scrolls without duplication or drops.",
          "Favorite a property, then have it deleted/archived by its owner — confirm the Favorites tab handles the now-missing property gracefully (no crash, sensible empty/removed state).",
          "Toggle favorite rapidly (double-tap) and confirm no duplicate POSTs desync the heart icon from server state.",
        ],
        ar: [
          "فضّل عقاراً من نتائج البحث، ثم تحقق من ظهوره كمفضّل في شاشة تفاصيل العقار وفي تبويب المفضلة.",
          "فضّل أكثر من 15 عقاراً وتأكد أن قائمة المفضلة تتصفح/تُحمَّل تدريجياً دون تكرار أو فقدان عناصر.",
          "فضّل عقاراً، ثم اجعل صاحبه يحذفه/يؤرشفه — تأكد أن تبويب المفضلة يتعامل مع العقار المفقود بسلاسة (دون تعطّل، مع حالة فارغة/محذوفة منطقية).",
          "بدّل حالة المفضلة بسرعة (نقر مزدوج) وتأكد أن طلبات POST المكررة لا تُفقد تزامن أيقونة القلب مع حالة الخادم.",
        ],
      },
    },
    {
      id: "mobile-home-feed-actions-unwired",
      title: {
        en: "Home feed favoriting is broken on three surfaces — Properties cards, the details sheet, and Offices' fake toggle",
        ar: "التفضيل في الصفحة الرئيسية معطّل في ثلاث واجهات — بطاقات العقارات، شاشة التفاصيل، وتبديل المكاتب العقارية الوهمي",
      },
      priority: "P0",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=3539-122605&m=dev",
          label: { en: "Home — Properties tab (بيع/Sale)", ar: "الرئيسية — تبويب العقارات (بيع)" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=5210-113445&m=dev",
          label: { en: "Home — Offices tab", ar: "الرئيسية — تبويب المكاتب العقارية" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1258-59665&m=dev",
          label: { en: "Property details bottom sheet — Sale (home-main)", ar: "شاشة تفاصيل العقار السفلية — بيع (home-main)" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1247-50901&m=dev",
          label: { en: "Property details bottom sheet — Rent", ar: "شاشة تفاصيل العقار السفلية — إيجار" },
        },
      ],
      endUserStory: {
        en: "As an individual user browsing the home feed, I want to tap the heart icon on any listing — whether I'm scrolling the feed or looking at the expanded details sheet — to save it instantly, so that I can bookmark things wherever I encounter them instead of hunting for the one screen where it actually works.",
        ar: "بصفتي مستخدماً فردياً أتصفح الصفحة الرئيسية، أريد أن أضغط أيقونة القلب على أي إعلان — سواء كنت أتصفح القائمة أو أنظر إلى شاشة التفاصيل الموسّعة — لحفظه فوراً، حتى أستطيع التفضيل أينما وجدت الإعلان بدلاً من البحث عن الشاشة الوحيدة التي تعمل فيها هذه الميزة فعلياً.",
      },
      story: {
        en: "Home-feed favoriting is broken across THREE surfaces, each in a slightly different way — track them as distinct findings, not one vague 'favorites are broken' ticket. On the عقارات (Properties) tab, PropertyCard.tsx's and PropertyListItem.tsx's heart buttons both call onPress={onFavorite} — but apps/mobile/src/features/individual/components/home/sections/HomeProperties.tsx never passes an onFavorite prop to either component, in Card view or List view. The same file's <PropertyDetailsSheet> instance — the 'عرض تفاصيل' bottom sheet opened from any of those cards — has the identical gap: PropertyDetailsSheet.tsx accepts onFavorite/onShare props and wires its own heart/share buttons to them correctly, but HomeProperties.tsx only ever passes property, onClose, and onViewProperty when rendering it. Three tap targets, one missing prop, zero functionality, and none of them show any disabled state to hint that. On the مكاتب عقارية (Offices) tab, HomeOffices.tsx DOES wire onToggleFavorite — but only into a local `favoriteOverrides` useState dictionary with no API call behind it, so the heart visually fills in and then silently reverts the moment the screen unmounts. That Offices variant is the most dangerous of the three because it's the only one that will pass a five-second smoke test.",
        ar: "ميزة التفضيل في الصفحة الرئيسية معطّلة عبر ثلاث واجهات، كل واحدة بطريقة مختلفة قليلاً — وثّقها كنتائج منفصلة لا كتذكرة واحدة غامضة بعنوان 'المفضلة معطّلة'. في تبويب عقارات، أزرار القلب في كل من PropertyCard.tsx وPropertyListItem.tsx تستدعي onPress={onFavorite} — لكن الملف apps/mobile/src/features/individual/components/home/sections/HomeProperties.tsx لا يمرّر خاصية onFavorite لأي من المكوّنين إطلاقاً، سواء في عرض البطاقات أو عرض القائمة. نفس هذا الملف يعرض <PropertyDetailsSheet> — شاشة 'عرض تفاصيل' السفلية التي تُفتح من أي من تلك البطاقات — ولديها نفس النقص: PropertyDetailsSheet.tsx يقبل خاصيتَي onFavorite/onShare ويربط زرَّي القلب والمشاركة بهما بشكل صحيح داخلياً، لكن HomeProperties.tsx يمرّر فقط property وonClose وonViewProperty عند عرضه. ثلاث نقاط ضغط، خاصية واحدة مفقودة، صفر وظائف، ولا يظهر أي منها أي حالة تعطيل تلمّح لذلك. في تبويب مكاتب عقارية، الملف HomeOffices.tsx يربط فعلياً onToggleFavorite — لكن فقط إلى قاموس محلي من نوع useState باسم `favoriteOverrides` دون أي طلب API خلفه، فتمتلئ أيقونة القلب بصرياً باللون الأحمر ثم تعود لحالتها الأصلية بصمت بمجرد إلغاء تحميل الشاشة. هذا النوع من مكاتب عقارية هو الأخطر بين الثلاثة لأنه الوحيد الذي سينجح في اختبار سريع من خمس ثوانٍ.",
      },
      acceptanceCriteria: {
        en: [
          "AC1 (Properties cards): tapping the heart on any card in Home > عقارات, in both Card and List view, produces zero visible change and the property does not appear in the Favorites tab afterward.",
          "AC2 (Properties cards): tapping the share icon on the same cards produces zero effect — no native share sheet opens, since onShare is equally unwired.",
          "AC3 (Details sheet): opening 'عرض تفاصيل' from any Home-feed card and tapping the heart or share icon inside the sheet's header produces zero effect — same root cause (HomeProperties.tsx never passing onFavorite/onShare), different tap target.",
          "AC4 (Offices): tapping the heart on an office card visibly fills red immediately (local state), but relaunching the app or navigating away and back reverts it to the server's real isFavorite value — because favoriteOverrides never reaches an API call.",
          "AC5: this is scoped specifically to Home-originated surfaces — Search results' and Property Detail's own (full-screen, not the sheet) heart icons are correctly wired (see mobile-favorites) and must not be lumped into the same fix or the same regression check.",
          "AC6: whatever fix lands must route all three Home surfaces through the same real POST /favorites/:propertyId (or an equivalent office-favoriting endpoint if one exists) and must correctly trigger the guest-auth-sheet for logged-out users rather than silently no-op or silently fake-toggle for them too.",
        ],
        ar: [
          "AC1 (بطاقات العقارات): الضغط على القلب في أي بطاقة ضمن الرئيسية > عقارات، في عرضَي البطاقات والقائمة، لا يُحدث أي تغيير مرئي ولا يظهر العقار لاحقاً في تبويب المفضلة.",
          "AC2 (بطاقات العقارات): الضغط على أيقونة المشاركة في نفس البطاقات لا ينتج عنه أي أثر — لا تفتح شاشة المشاركة الأصلية، لأن onShare غير مربوط بنفس الطريقة.",
          "AC3 (شاشة التفاصيل): فتح 'عرض تفاصيل' من أي بطاقة في الرئيسية والضغط على أيقونة القلب أو المشاركة داخل رأس الشاشة لا ينتج عنه أي أثر — نفس السبب الجذري (HomeProperties.tsx لا يمرّر onFavorite/onShare أبداً)، لكن نقطة ضغط مختلفة.",
          "AC4 (المكاتب العقارية): الضغط على القلب في بطاقة مكتب عقاري يملأه باللون الأحمر فوراً (حالة محلية)، لكن إعادة تشغيل التطبيق أو مغادرة الشاشة والعودة إليها يعيده لقيمة isFavorite الحقيقية من الخادم — لأن favoriteOverrides لا يصل أبداً إلى طلب API.",
          "AC5: هذا النقص مقتصر تحديداً على الواجهات المنبثقة من الصفحة الرئيسية — أيقونات القلب في نتائج البحث وفي شاشة تفاصيل العقار الكاملة (لا الشاشة السفلية) مربوطة بشكل صحيح (راجع mobile-favorites) ويجب عدم خلطها بنفس الإصلاح أو نفس فحص الانحدار.",
          "AC6: أي إصلاح يجب أن يمرّر الواجهات الثلاث عبر نفس الطلب الحقيقي POST /favorites/:propertyId (أو نقطة نهاية مكافئة لتفضيل المكاتب العقارية إن وُجدت)، ويجب أن يُفعّل بشكل صحيح شاشة مصادقة الزائر للمستخدمين غير المسجَّلين بدلاً من عدم فعل شيء بصمت أو تبديل وهمي بصمت لهم أيضاً.",
        ],
      },
      testScenarios: {
        en: [
          "TC1: As a logged-in user on Home > عقارات > بيع, tap the heart on the first 3 cards in Card view, then switch to List view and repeat on the same 3 cards — confirm neither view produces any visual or state change, and none of the 6 taps result in a new Favorites entry.",
          "TC2: From that same tab, tap 'عرض تفاصيل' on any card to open the details sheet, then tap its heart and share icons — confirm both are equally inert, and that the sheet's own 'عرض العقار' button still correctly navigates to the full property page (proving onViewProperty IS wired even though onFavorite/onShare aren't).",
          "TC3: As a logged-in user on Home > مكاتب عقارية, tap the heart on an office card and confirm it visually fills red. Force-quit and relaunch the app, return to the same tab, and confirm the heart has reverted to unfilled — proving the toggle never left the device.",
          "TC4: As a guest (logged out), repeat TC1–TC3 and confirm whether the guest-auth sheet opens for any of the three surfaces (per mobile-guest-guard's documented behavior for Favorites) — if it opens for none of them, that's further proof these taps aren't routed through the shared guarded-action path at all.",
          "TC5: Tap the heart on the exact same property from its own full-screen Property Detail page (not the Home card or its sheet) and confirm it DOES work there — screenshot all four side by side, since this contrast is what makes the Home-originated gaps easy to miss in a casual pass and trivial to prove once you know where to look.",
        ],
        ar: [
          "TC1: بصفتك مستخدماً مسجَّل الدخول في الرئيسية > عقارات > بيع، اضغط القلب على أول 3 بطاقات في عرض البطاقات، ثم بدّل إلى عرض القائمة وكرر على نفس البطاقات الثلاث — تأكد أن أياً من العرضين لا يُحدث تغييراً مرئياً أو في الحالة، وأن أياً من الضغطات الستة لا ينتج عنه إدخال جديد في المفضلة.",
          "TC2: من نفس التبويب، اضغط 'عرض تفاصيل' على أي بطاقة لفتح شاشة التفاصيل، ثم اضغط أيقونتَي القلب والمشاركة فيها — تأكد أن كليهما معطّل بنفس الدرجة، وأن زر 'عرض العقار' في الشاشة نفسها لا يزال يعمل بشكل صحيح للانتقال إلى صفحة العقار الكاملة (ما يثبت أن onViewProperty مربوط رغم أن onFavorite/onShare ليسا كذلك).",
          "TC3: بصفتك مستخدماً مسجَّل الدخول في الرئيسية > مكاتب عقارية، اضغط القلب على بطاقة مكتب عقاري وتأكد أنه يمتلئ باللون الأحمر بصرياً. أغلق التطبيق قسراً وأعد تشغيله، عد لنفس التبويب، وتأكد أن القلب عاد لحالته الفارغة — ما يثبت أن التبديل لم يغادر الجهاز إطلاقاً.",
          "TC4: بصفتك زائراً (غير مسجَّل الدخول)، كرر TC1 إلى TC3 وتأكد ما إذا كانت شاشة مصادقة الزائر تفتح في أي من الواجهات الثلاث (حسب السلوك الموثَّق في mobile-guest-guard للمفضلة) — إذا لم تفتح في أي منها، فهذا دليل إضافي على أن هذه الضغطات لا تمر إطلاقاً عبر مسار الإجراء المقيَّد المشترك.",
          "TC5: اضغط القلب على نفس العقار بالضبط من صفحته الكاملة الخاصة بتفاصيل العقار (لا من بطاقة الرئيسية أو شاشتها) وتأكد أنه يعمل هناك فعلاً — التقط لقطة شاشة للأربعة معاً جنباً إلى جنب، لأن هذا التباين هو ما يجعل النواقص المنبثقة من الرئيسية سهلة الإغفال في جولة عابرة وسهلة الإثبات بمجرد معرفة أين تنظر.",
        ],
      },
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
        en: "Verify HomeScreen's tab/filter state machine (activeTab: 'properties'|'offices', activePropFilter: 'all'|'sale'|'rent'|'exchange', viewMode: 'card'|'list') correctly re-triggers HomeProperties' fetch effect on every filter change and never leaks stale data from the previous filter into the newly-rendered list — this is exactly the class of state-transition bug that sails through a slow, deliberate manual pass and only shows up under real usage patterns like a user impatiently tapping between tabs.",
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
    },
    {
      id: "mobile-home-property-income-fallback",
      title: {
        en: "List-view property income silently defaults to a hardcoded 150,000 د.ك when the API sends no value",
        ar: "مدخول العقار في عرض القائمة يعود بصمت لقيمة ثابتة 150,000 د.ك عندما لا ترسل الواجهة الخلفية قيمة",
      },
      priority: "P2",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=3539-122605&m=dev",
          label: { en: "Properties tab — بيع (shows both a real 0 and a 150,000 income figure)", ar: "تبويب العقارات — بيع (يعرض قيمة 0 حقيقية وقيمة 150,000 معاً)" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1258-55624&m=dev",
          label: { en: "Properties tab — إيجار", ar: "تبويب العقارات — إيجار" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1258-60524&m=dev",
          label: { en: "Details sheet (building) — correct implementation for contrast: no default fallback here", ar: "شاشة التفاصيل (عمارة) — تنفيذ صحيح للمقارنة: لا يوجد قيمة احتياطية افتراضية هنا" },
        },
      ],
      endUserStory: {
        en: "As an individual user comparing properties in list view, I want the 'مدخول العقار' figure to always reflect that specific property's real rental-income data, so that I can actually trust it when deciding which property is the better investment.",
        ar: "بصفتي مستخدماً فردياً أقارن العقارات في عرض القائمة، أريد أن تعكس قيمة 'مدخول العقار' دائماً بيانات دخل الإيجار الحقيقية لذلك العقار تحديداً، حتى أستطيع فعلاً الوثوق بها عند اختيار العقار الأفضل استثمارياً.",
      },
      story: {
        en: "Flag that PropertyListItem.tsx declares `propertyIncome = 150_000` as a destructured default parameter — meaning any listing where the API's item.propertyIncome comes back undefined renders 'مدخول العقار 150,000 د.ك' in the exact same confident green styling as a genuine figure, with zero visual distinction between 'this property really yields 150,000' and 'we have no income data for this property at all.' On a financial field specifically, a senior QA pass can't stop at 'a number displays' — the number's provenance is the actual thing under test, and right now the UI has no way to tell a real value from a fabricated placeholder that happens to look completely plausible. Worth noting for the fix: PropertyDetailsSheet.tsx renders the identical field correctly — its `property.propertyIncome !== undefined && property.propertyIncome !== null` guard has no default-parameter fallback poisoning it, so the details sheet is the reference implementation to copy, not a second place that needs the same fix.",
        ar: "أبلغ بأن الملف PropertyListItem.tsx يُعرّف `propertyIncome = 150_000` كقيمة افتراضية عند تفكيك الخصائص — أي أن أي إعلان تعود فيه قيمة item.propertyIncome من الواجهة الخلفية غير محددة (undefined) يعرض 'مدخول العقار 150,000 د.ك' بنفس التنسيق الأخضر الواثق تماماً كأنها قيمة حقيقية، دون أي تمييز بصري بين 'هذا العقار يُدرّ فعلاً 150,000' و'لا نملك أي بيانات دخل لهذا العقار إطلاقاً'. في حقل مالي تحديداً، لا يمكن لجولة اختبار جودة متمرّسة أن تكتفي بـ 'رقم يُعرض' — مصدر الرقم هو ما يُختبر فعلياً، والواجهة حالياً لا تملك أي طريقة لتمييز قيمة حقيقية عن عنصر نائب مُلفَّق يبدو معقولاً تماماً. جدير بالذكر للإصلاح: الملف PropertyDetailsSheet.tsx يعرض نفس الحقل بشكل صحيح — الشرط `property.propertyIncome !== undefined && property.propertyIncome !== null` فيه غير مسموم بأي قيمة افتراضية بديلة، لذا فشاشة التفاصيل هي التنفيذ المرجعي الذي يجب نسخه، لا مكان ثانٍ يحتاج نفس الإصلاح.",
      },
      acceptanceCriteria: {
        en: [
          "AC1: confirm whether any of the '150,000 د.ك' figures visible in the live feed today are coincidentally real, or are the fallback default masking missing data — this is only answerable via a database cross-check, never from the UI alone.",
          "AC2: the second card in the بيع frame shows a genuine '0 د.ك' income, proving the field renders real zero values correctly — which means every card showing exactly 150,000 is now suspect and needs the same verification, not a free pass because 'it's not zero so it must be real.'",
          "AC3: get a product decision on whether missing income data should hide the row entirely (matching the existing `propertyIncome !== undefined && propertyIncome !== null` guard's evident intent, which the default parameter currently defeats by never letting the value reach the guard as undefined) rather than fabricate a specific-looking number.",
          "AC4: confirm the fix only needs to touch PropertyListItem.tsx — PropertyDetailsSheet.tsx already implements this field correctly and should not be touched or re-tested as if it shared the bug.",
        ],
        ar: [
          "AC1: تأكد ما إذا كانت أي من قيم '150,000 د.ك' المرئية في القائمة الحية اليوم حقيقية بالصدفة، أو أنها القيمة الافتراضية البديلة التي تُخفي بيانات مفقودة — هذا سؤال لا تُجيب عنه إلا مطابقة قاعدة البيانات، لا الواجهة وحدها أبداً.",
          "AC2: البطاقة الثانية في إطار بيع تعرض قيمة دخل '0 د.ك' حقيقية، ما يثبت أن الحقل يعرض القيم الصفرية الحقيقية بشكل صحيح — أي أن كل بطاقة تعرض 150,000 بالضبط أصبحت الآن موضع شك وتحتاج نفس التحقق، لا إعفاء تلقائياً لأنها 'ليست صفراً فلا بد أنها حقيقية'.",
          "AC3: احصل على قرار من فريق المنتج بشأن ما إذا كان غياب بيانات الدخل يجب أن يُخفي الصف بالكامل (بما يطابق النية الواضحة للشرط الموجود `propertyIncome !== undefined && propertyIncome !== null`، الذي تُبطله القيمة الافتراضية حالياً بمنع القيمة من الوصول إليه كـ undefined أصلاً) بدلاً من تلفيق رقم يبدو محدداً.",
          "AC4: تأكد أن الإصلاح يحتاج فقط لمس PropertyListItem.tsx — الملف PropertyDetailsSheet.tsx ينفّذ هذا الحقل بشكل صحيح مسبقاً ويجب عدم لمسه أو إعادة اختباره وكأنه يشارك نفس الخلل.",
        ],
      },
      testScenarios: {
        en: [
          "TC1: cross-reference 5+ properties currently showing exactly '150,000 د.ك' against their database record — if any has a null/undefined propertyIncome column, that's confirmed evidence real users are being shown fabricated financial data, not a hypothetical.",
          "TC2: create or find a test property with propertyIncome explicitly set to 0 and confirm it renders '0 د.ك', not the 150,000 fallback — the بيع frame already demonstrates this works for one such card, so use it as the known-good baseline.",
          "TC3: file this as a data-integrity bug rather than a cosmetic one — it's a specific financial figure a buyer could reasonably factor into a real offer.",
        ],
        ar: [
          "TC1: طابق أكثر من 5 عقارات تعرض حالياً '150,000 د.ك' بالضبط مع سجلها في قاعدة البيانات — إذا كان عمود propertyIncome لأي منها فارغاً (null/undefined)، فهذا دليل مؤكَّد على أن مستخدمين حقيقيين يُعرض لهم بيانات مالية ملفَّقة، لا افتراضاً نظرياً.",
          "TC2: أنشئ أو ابحث عن عقار اختبار بقيمة propertyIncome محددة صراحةً كـ 0 وتأكد أنه يعرض '0 د.ك'، لا القيمة الاحتياطية 150,000 — إطار بيع يُظهر مسبقاً أن هذا يعمل لبطاقة واحدة من هذا النوع، فاستخدمها كخط أساس معروف الصحة.",
          "TC3: وثّق هذا كخطأ في سلامة البيانات لا كخلل تجميلي — إنه رقم مالي محدد قد يعتمد عليه مشترٍ بشكل معقول عند تقديم عرض حقيقي.",
        ],
      },
    },
    {
      id: "mobile-property-details-rent-price-suffix",
      title: {
        en: "Property details sheet never shows '/شهرياً' for rentals — a rent price and a sale price render identically",
        ar: "شاشة تفاصيل العقار لا تعرض أبداً '/شهرياً' للإيجارات — سعر الإيجار وسعر البيع يُعرضان بشكل متطابق",
      },
      priority: "P1",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1247-50901&m=dev",
          label: { en: "Rent listing — '150,000 دك / شهرياً' per design", ar: "إعلان إيجار — '150,000 دك / شهرياً' حسب التصميم" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1258-59665&m=dev",
          label: { en: "Sale listing — '150,000 دك' for comparison", ar: "إعلان بيع — '150,000 دك' للمقارنة" },
        },
      ],
      endUserStory: {
        en: "As an individual user viewing a rental listing's details, I want the price to clearly say it's a monthly rent, so that I never mistake it for the total sale price of the property and misjudge whether I can actually afford it.",
        ar: "بصفتي مستخدماً فردياً أشاهد تفاصيل إعلان إيجار، أريد أن يوضّح السعر بجلاء أنه إيجار شهري، حتى لا أخلط بينه وبين سعر البيع الإجمالي للعقار وأخطئ في تقدير قدرتي على تحمّله فعلاً.",
      },
      story: {
        en: "Flag that PropertyDetailsSheet.tsx's formattedPrice logic renders the exact same markup — `{property.price.toLocaleString()} د.ك` — regardless of property.type, with no branch for 'RENT' at all, even though the Figma frame for a rental listing explicitly appends '/ شهرياً' (per month) after the price. This isn't a cosmetic omission: showing '150,000 د.ك' with no qualifier on a RENT-type listing is actively misleading — a real user has to infer from context (or the category label alone) whether that figure is a lump sum or a monthly recurring cost, and 150,000 KD/month is an absurd number that could easily be misread as a data-entry error rather than correctly understood as '150,000 KD total, paid monthly' being wrong on either reading. A senior QA pass treats price-unit ambiguity on a financial figure as a functional bug, not a copy nit.",
        ar: "أبلغ بأن منطق formattedPrice في PropertyDetailsSheet.tsx يعرض نفس التنسيق تماماً — `{property.price.toLocaleString()} د.ك` — بغض النظر عن property.type، دون أي فرع لحالة 'RENT' إطلاقاً، رغم أن إطار Figma الخاص بإعلان الإيجار يضيف صراحةً '/ شهرياً' بعد السعر. هذا ليس إغفالاً تجميلياً: عرض '150,000 د.ك' دون أي توضيح على إعلان من نوع RENT مضلّل فعلياً — يضطر المستخدم الحقيقي للاستنتاج من السياق (أو من تصنيف الفئة وحده) ما إذا كان الرقم مبلغاً إجمالياً أم تكلفة شهرية متكررة، ورقم 150,000 دينار كويتي شهرياً رقم غير معقول قد يُفهم خطأً كخطأ في إدخال البيانات بدلاً من فهمه الصحيح كـ 'إجمالي 150,000 دينار كويتي، يُدفع شهرياً' — وكلا الفهمَين خاطئ. جولة اختبار جودة متمرّسة تُعامل غموض وحدة السعر في رقم مالي كخلل وظيفي، لا كملاحظة نصية بسيطة.",
      },
      acceptanceCriteria: {
        en: [
          "AC1: confirm property.type is available on PropertyDetailsDto at render time (it is — 'SALE'|'RENT'|'EXCHANGE') and that formattedPrice currently ignores it entirely.",
          "AC2: a RENT-type listing's details sheet must render a per-month qualifier (matching the Figma frame's '/ شهرياً') distinguishing it from a SALE-type listing's one-time price — get explicit confirmation from design on the exact expected string before filing the fix, don't guess the copy.",
          "AC3: confirm the equivalent price displays elsewhere in the app (Home-feed cards, Search results, full Property Detail page) either already handle this correctly or have the identical gap — this bug may not be isolated to just the details sheet.",
        ],
        ar: [
          "AC1: تأكد أن property.type متاحة على PropertyDetailsDto وقت العرض (وهي كذلك — 'SALE'|'RENT'|'EXCHANGE') وأن formattedPrice تتجاهلها كلياً حالياً.",
          "AC2: شاشة تفاصيل إعلان من نوع RENT يجب أن تعرض توضيحاً شهرياً (مطابقاً لـ '/ شهرياً' في إطار Figma) يميّزه عن السعر لمرة واحدة لإعلان من نوع SALE — احصل على تأكيد صريح من فريق التصميم للنص المتوقع بالضبط قبل تقديم الإصلاح، لا تخمّن الصياغة.",
          "AC3: تأكد ما إذا كانت عروض السعر المكافئة في أماكن أخرى من التطبيق (بطاقات الرئيسية، نتائج البحث، صفحة تفاصيل العقار الكاملة) تتعامل مع هذا بشكل صحيح مسبقاً أو تحمل نفس النقص — قد لا يكون هذا الخلل مقتصراً على شاشة التفاصيل فقط.",
        ],
      },
      testScenarios: {
        en: [
          "TC1: Open the details sheet for a known RENT-type listing and a known SALE-type listing side by side (screenshot both) and confirm the price row is visually and textually identical between them today — that's the bug, reproduced.",
          "TC2: Check PropertyCard.tsx and PropertyListItem.tsx (the Home-feed card components) for the same formattedPrice pattern — if they also lack a rent qualifier, this is a shared-pattern bug, not a one-off in the sheet, and should be fixed in one place all three consume rather than patched three times.",
          "TC3: Once fixed, verify EXCHANGE-type listings are unaffected by whatever branch gets added — they use a different price/comparison model entirely (see mobile-property-details-exchange-fields-unrendered) and shouldn't accidentally inherit a rent suffix.",
        ],
        ar: [
          "TC1: افتح شاشة التفاصيل لإعلان معروف من نوع RENT وآخر من نوع SALE جنباً إلى جنب (التقط لقطة شاشة لكليهما) وتأكد أن صف السعر متطابق بصرياً ونصياً بينهما حالياً — هذا هو الخلل، مُعاد إنتاجه.",
          "TC2: تحقق من PropertyCard.tsx وPropertyListItem.tsx (مكوّنات بطاقات الرئيسية) لنفس نمط formattedPrice — إذا كانا يفتقران أيضاً لتوضيح الإيجار، فهذا خلل في نمط مشترك، لا حالة منفردة في الشاشة، ويجب إصلاحه في مكان واحد تستهلكه الثلاثة بدلاً من ترقيعه ثلاث مرات.",
          "TC3: بعد الإصلاح، تحقق أن إعلانات نوع EXCHANGE لا تتأثر بأي فرع يُضاف — فهي تستخدم نموذج سعر/مقارنة مختلفاً تماماً (راجع mobile-property-details-exchange-fields-unrendered) ويجب ألا ترث توضيح الإيجار عن طريق الخطأ.",
        ],
      },
    },
    {
      id: "mobile-property-details-exchange-fields-unrendered",
      title: {
        en: "Exchange listings' defining data (طلب/مع years) exists on the DTO but is rendered nowhere — not the details sheet, not the Home card",
        ar: "بيانات إعلانات البدل الأساسية (سنوات طلب/مع) موجودة في الـ DTO لكنها غير معروضة في أي مكان — لا في شاشة التفاصيل ولا في بطاقة الرئيسية",
      },
      priority: "P0",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1258-66769&m=dev",
          label: { en: "Exchange details sheet — أرض للبدل (land)", ar: "شاشة تفاصيل البدل — أرض للبدل" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1258-67042&m=dev",
          label: { en: "Exchange details sheet — بيت للبدل (house)", ar: "شاشة تفاصيل البدل — بيت للبدل" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=5210-115479&m=dev",
          label: { en: "Home card view — بدل (Exchange) tab, showing طلب/مع inline on the card itself", ar: "عرض بطاقة الرئيسية — تبويب بدل، يعرض طلب/مع مباشرة على البطاقة نفسها" },
        },
      ],
      endUserStory: {
        en: "As an individual user considering a property exchange, I want to see exactly what build year is being asked for and what year the offered property is from — right on the feed card, and again in full detail if I open it — so that I can judge whether the swap is actually fair before I ever reach out to the other party.",
        ar: "بصفتي مستخدماً فردياً أفكّر في مبادلة عقار، أريد أن أرى بالضبط سنة البناء المطلوبة وسنة العقار المعروض — مباشرة على بطاقة القائمة، ومرة أخرى بالتفصيل الكامل إذا فتحتها — حتى أستطيع الحكم على عدالة المبادلة فعلياً قبل التواصل مع الطرف الآخر.",
      },
      story: {
        en: "Flag this as the sharpest finding in this whole batch, and it just got sharper: PropertyDetailsDto (apps/mobile/src/types/property.ts) already declares `requestYear?: number` and `requiredYear?: number` — almost certainly the backing fields for the design's 'طلب 2021' / 'مع 2023' rows on Exchange listings — but neither PropertyDetailsSheet.tsx nor PropertyCard.tsx ever reads or renders property.requestYear or property.requiredYear anywhere in their JSX. The Exchange Home-feed frame shows طلب/مع rendered directly on the card itself, in place of beds/baths — but PropertyCard.tsx's specs row only ever renders 'شقة {type} • {area} م²', beds, and baths, with no branch for type === 'EXCHANGE' at all. So this isn't a details-sheet-only gap anymore — it's the same two DTO fields missing from BOTH places a user would ever see them, meaning an Exchange listing's one defining trait is currently invisible everywhere in the app except the raw database.",
        ar: "وثّق هذه النتيجة بصفتها الأبرز في هذه الدفعة كاملة، وقد ازدادت وضوحاً الآن: الملف PropertyDetailsDto (apps/mobile/src/types/property.ts) يُعرّف مسبقاً `requestYear?: number` و`requiredYear?: number` — وهما على الأرجح الحقلان الداعمان لصفَّي 'طلب 2021' / 'مع 2023' في تصميم إعلانات البدل — لكن لا PropertyDetailsSheet.tsx ولا PropertyCard.tsx يقرآن أو يعرضان property.requestYear أو property.requiredYear في أي مكان من كودهما. إطار الرئيسية الخاص بالبدل يُظهر طلب/مع معروضين مباشرة على البطاقة نفسها، مكان عدد الغرف/الحمامات — لكن صف المواصفات في PropertyCard.tsx يعرض فقط 'شقة {type} • {area} م²'، وعدد الغرف، وعدد الحمامات، دون أي فرع لحالة type === 'EXCHANGE' إطلاقاً. إذاً هذا لم يعد نقصاً في شاشة التفاصيل وحدها — بل نفس الحقلين من الـ DTO مفقودان من المكانين اللذين قد يراهما المستخدم فعلياً، ما يعني أن السمة الوحيدة المميّزة لإعلان البدل غير مرئية حالياً في أي مكان بالتطبيق باستثناء قاعدة البيانات الخام.",
      },
      acceptanceCriteria: {
        en: [
          "AC1: open the details sheet for a real EXCHANGE-type property and confirm today's actual rendered output — expected, per the code read, is either 'السعر غير معلن' or a blank price area, with no طلب/مع rows anywhere, contradicting the Figma frame entirely.",
          "AC2: view an EXCHANGE-type listing in the Home feed's Card view and confirm the specs row shows beds/baths (or omits them, since Exchange listings may have none) instead of the طلب/مع rows the design specifies — same root gap, second surface.",
          "AC3: confirm property.requestYear and property.requiredYear are in fact populated by the API for real Exchange listings (not just present on the TypeScript type) — if the backend never populates them either, this is a two-sided gap, not just a frontend rendering miss.",
          "AC4: this must be filed as a single P0 feature-completeness bug against the Exchange flow covering both surfaces, not two separate 'details sheet polish' and 'card polish' tickets that could ship independently and leave one half fixed.",
          "AC5: confirm whether rentConditions/additionalExpenses (also unrendered in the details sheet) are meant to show for RENT-type listings specifically, and scope a second, lower-priority ticket for those if so — don't let them get lost once the Exchange fix ships.",
        ],
        ar: [
          "AC1: افتح شاشة التفاصيل لعقار حقيقي من نوع EXCHANGE وتأكد من المُخرَج المعروض فعلياً اليوم — المتوقع، حسب قراءة الكود، إما 'السعر غير معلن' أو منطقة سعر فارغة، دون أي صفوف طلب/مع في أي مكان، بما يناقض إطار Figma كلياً.",
          "AC2: اعرض إعلان بدل من نوع EXCHANGE في عرض البطاقات بالرئيسية وتأكد أن صف المواصفات يعرض عدد الغرف/الحمامات (أو يحذفهما، لأن إعلانات البدل قد لا تملكهما) بدلاً من صفَّي طلب/مع اللذين يحدّدهما التصميم — نفس النقص الجذري، واجهة ثانية.",
          "AC3: تأكد أن property.requestYear وproperty.requiredYear مُعبَّآن فعلياً من الواجهة الخلفية لإعلانات بدل حقيقية (لا مجرد موجودَين في نوع TypeScript) — إذا كانت الواجهة الخلفية أيضاً لا تُعبّئهما أبداً، فهذا نقص من الجانبين، لا مجرد إغفال في العرض الأمامي.",
          "AC4: يجب توثيق هذا كخطأ واحد من أولوية P0 في اكتمال ميزة تدفق البدل يغطي الواجهتين معاً، لا تذكرتين منفصلتين بعنوان 'تحسين شاشة التفاصيل' و'تحسين البطاقة' قد تُنشران بشكل مستقل وتترك نصف الإصلاح فقط.",
          "AC5: تأكد ما إذا كانت rentConditions/additionalExpenses (وهما أيضاً غير معروضين في شاشة التفاصيل) مقصودتين للظهور في إعلانات نوع RENT تحديداً، وحدّد نطاق تذكرة ثانية أقل أولوية لهما إن كان الأمر كذلك — لا تدعهما يُنسيان بمجرد نشر إصلاح البدل.",
        ],
      },
      testScenarios: {
        en: [
          "TC1: Find or create a real Exchange-type listing with requestYear and requiredYear populated, open its details sheet, and document exactly what renders in place of the price row today.",
          "TC2: View that same listing in the Home feed's Card view (بدل tab) and document what the specs row shows in place of طلب/مع — compare directly against the Exchange Home-card Figma frame.",
          "TC3: Compare both actual outputs against the three Exchange Figma frames (two details-sheet variants + the card view) and list every row the design shows that's missing from each — expect at minimum the طلب/مع rows in both places.",
          "TC4: Query the database for a sample of real Exchange listings and confirm requestYear/requiredYear are actually being saved by the create-listing flow (useListingStore's ExchangePropertyTab, per mobile-add-listing in Mobile — Shared) — if they're null in the DB too, the fix needs to start at listing creation, not just at either rendering surface.",
          "TC5: Once a fix ships to both surfaces, re-verify formattedPrice's 'السعر غير معلن' fallback no longer fires for Exchange listings that do have requestYear/requiredYear data — both the card and the sheet should show the exchange comparison instead of a price-not-disclosed message that isn't even the relevant gap for this listing type.",
        ],
        ar: [
          "TC1: ابحث عن أو أنشئ إعلان بدل حقيقياً بقيمتَي requestYear وrequiredYear مُعبَّأتين، افتح شاشة تفاصيله، ووثّق بالضبط ما يُعرض مكان صف السعر اليوم.",
          "TC2: اعرض نفس الإعلان في عرض بطاقات الرئيسية (تبويب بدل) ووثّق ما يعرضه صف المواصفات مكان طلب/مع — قارن مباشرة مع إطار Figma لبطاقة البدل بالرئيسية.",
          "TC3: قارن المُخرَجين الفعليين مع أطر Figma الثلاثة للبدل (متغيّرا شاشة التفاصيل + عرض البطاقة) واذكر كل صف يعرضه التصميم ومفقود من كل منها — توقّع على الأقل صفَّي طلب/مع في كلا المكانين.",
          "TC4: استعلم قاعدة البيانات عن عيّنة من إعلانات بدل حقيقية وتأكد أن requestYear/requiredYear تُحفظ فعلياً عبر تدفق إنشاء الإعلان (ExchangePropertyTab ضمن useListingStore، حسب mobile-add-listing في الجوال — مشترك) — إذا كانتا فارغتين في قاعدة البيانات أيضاً، يجب أن يبدأ الإصلاح من إنشاء الإعلان، لا من واجهة العرض فقط.",
          "TC5: بعد نشر الإصلاح للواجهتين، تحقق مجدداً أن القيمة الاحتياطية 'السعر غير معلن' في formattedPrice لم تعد تظهر لإعلانات بدل تملك بيانات requestYear/requiredYear — يجب أن تعرض كل من البطاقة والشاشة مقارنة البدل بدلاً من رسالة سعر غير معلن ليست حتى النقص ذا الصلة بهذا النوع من الإعلانات.",
        ],
      },
    },
    {
      id: "mobile-home-card-view-layout-mismatches",
      title: {
        en: "Home Card view: badge and heart are swapped left/right, the share icon and income row are missing entirely",
        ar: "عرض بطاقات الرئيسية: الشارة والقلب متبادلا الموضع يميناً/يساراً، وأيقونة المشاركة وصف الدخل غائبان تماماً",
      },
      priority: "P1",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1504-76495&m=dev",
          label: { en: "Card view — بيع (Sale)", ar: "عرض البطاقات — بيع" },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=1504-80245&m=dev",
          label: { en: "Card view — إيجار (Rent)", ar: "عرض البطاقات — إيجار" },
        },
      ],
      endUserStory: {
        en: "As an individual user browsing the home feed in card view, I want the featured badge, favorite and share icons, and income figure to appear exactly where I'd expect and to actually be present, so that the app feels finished and I can compare listings at a glance the way the design intends.",
        ar: "بصفتي مستخدماً فردياً أتصفح الصفحة الرئيسية بعرض البطاقات، أريد أن تظهر شارة الإعلان المميز، وأيقونتا التفضيل والمشاركة، ورقم الدخل بالضبط في المكان الذي أتوقعه وأن تكون موجودة فعلاً، حتى يبدو التطبيق مكتملاً وأستطيع مقارنة الإعلانات بنظرة سريعة كما يقصد التصميم.",
      },
      story: {
        en: "Flag three concrete, code-verifiable mismatches between PropertyCard.tsx (the Home feed's Card view) and its Figma frame, none of which require guessing — they're each a direct line-by-line contradiction: (1) the 'مميز' badge is styled `absolute right-3 top-3` in code but appears on the LEFT edge of the image in the design; the heart icon is styled `absolute left-3 top-3` in code but appears on the RIGHT, paired with a share icon, in the design — the two elements are positioned as exact mirror images of the design. (2) The code's heart-icon container comment literally reads '/* Absolute Top Left: Actions (Heart & Share) */' but only a single heart TouchableOpacity is actually implemented underneath it — there's no share button in Card view at all, despite the comment writer's evident intent and despite List view (PropertyListItem.tsx) having one. (3) PropertyCardProps has no propertyIncome field and the JSX never renders a 'مدخول العقار' row anywhere, even though every card in both Figma frames shows one directly under the specs row, and PropertyListItem.tsx (List view) already implements this exact row correctly — meaning there's a working reference implementation sitting one file away that Card view simply never adopted.",
        ar: "أبلغ عن ثلاثة تناقضات ملموسة يمكن التحقق منها في الكود بين PropertyCard.tsx (عرض بطاقات الرئيسية) وإطار Figma الخاص به، لا يحتاج أي منها للتخمين — كل واحد تناقض مباشر سطراً بسطر: (1) شارة 'مميز' مصمَّمة بـ `absolute right-3 top-3` في الكود لكنها تظهر على الحافة اليسرى للصورة في التصميم؛ أيقونة القلب مصمَّمة بـ `absolute left-3 top-3` في الكود لكنها تظهر على اليمين، مقترنة بأيقونة مشاركة، في التصميم — العنصران في موضعين معكوسين تماماً مقارنة بالتصميم. (2) تعليق حاوية أيقونة القلب في الكود يقول حرفياً '/* Absolute Top Left: Actions (Heart & Share) */' لكن المُنفَّذ فعلياً تحته هو TouchableOpacity واحد للقلب فقط — لا يوجد زر مشاركة في عرض البطاقات إطلاقاً، رغم نية كاتب التعليق الواضحة ورغم أن عرض القائمة (PropertyListItem.tsx) يملك واحداً. (3) PropertyCardProps لا تملك حقل propertyIncome ولا يعرض الكود صف 'مدخول العقار' في أي مكان، رغم أن كل بطاقة في إطاري Figma تعرض واحداً مباشرة تحت صف المواصفات، وPropertyListItem.tsx (عرض القائمة) ينفّذ هذا الصف بالضبط بشكل صحيح مسبقاً — أي أن هناك تنفيذاً مرجعياً يعمل فعلياً في ملف مجاور لم يتبنّه عرض البطاقات إطلاقاً.",
      },
      acceptanceCriteria: {
        en: [
          "AC1: the featured badge renders on the image's right edge and the heart icon renders alone on the left edge in the live app today — both are mirrored from where the Figma frame places them.",
          "AC2: tapping the empty space in Card view's top-left corner where the design's share icon should be does nothing, because no such element exists in the DOM/view tree to tap — this is a missing element, not an unwired handler like the heart icon (see mobile-home-feed-actions-unwired for that separate issue).",
          "AC3: no property card in Card view shows a 'مدخول العقار' figure under any circumstance, regardless of whether the underlying property has income data — confirm this is a rendering omission, not a data-availability issue, by cross-checking the identical property in List view (which does show it, per mobile-home-property-income-fallback).",
          "AC4: get explicit confirmation from design/product on which layout is authoritative — since PropertyListItem.tsx (List view) already gets the badge/heart-share positioning and income row right, the fastest correct fix is likely to bring Card view's layout in line with List view's, not to redesign either from scratch.",
        ],
        ar: [
          "AC1: شارة الإعلان المميز تُعرض على الحافة اليمنى للصورة وأيقونة القلب تُعرض وحدها على الحافة اليسرى في التطبيق الحي اليوم — كلاهما معكوس عن موضعه في إطار Figma.",
          "AC2: الضغط على المساحة الفارغة في الزاوية العلوية اليسرى من عرض البطاقات، حيث يُفترض وجود أيقونة المشاركة في التصميم، لا يفعل شيئاً، لأن هذا العنصر غير موجود أصلاً في شجرة العرض ليُضغط — هذا عنصر مفقود، لا معالج غير مربوط كحال أيقونة القلب (راجع mobile-home-feed-actions-unwired لتلك المشكلة المنفصلة).",
          "AC3: لا تعرض أي بطاقة عقار في عرض البطاقات قيمة 'مدخول العقار' تحت أي ظرف، بغض النظر عن توفر بيانات الدخل للعقار المعني — تأكد أن هذا إغفال في العرض لا مشكلة في توفر البيانات، بمقارنة نفس العقار في عرض القائمة (الذي يعرضها فعلاً، حسب mobile-home-property-income-fallback).",
          "AC4: احصل على تأكيد صريح من فريق التصميم/المنتج بشأن أي تخطيط هو المرجعي — بما أن PropertyListItem.tsx (عرض القائمة) ينفّذ مواضع الشارة والقلب/المشاركة وصف الدخل بشكل صحيح مسبقاً، فالإصلاح الأسرع والأصح على الأرجح هو مواءمة تخطيط عرض البطاقات معه، لا إعادة تصميم أي منهما من الصفر.",
        ],
      },
      testScenarios: {
        en: [
          "TC1: Screenshot a Home-feed card in Card view next to its Figma frame at the same zoom level and confirm the badge and heart/share swap is visually obvious, not a subtle pixel-level nit.",
          "TC2: Confirm the same property viewed in List view DOES show a correctly-positioned income row (per PropertyListItem.tsx), establishing List view as the working reference implementation to copy from rather than building the Card view fix from scratch.",
          "TC3: After any fix, re-run mobile-home-feed-actions-unwired's Card-view test cases too — adding a share button here means there will be a new, similarly-unwired onShare tap target to verify, not just a visual fix.",
          "TC4: Confirm badge/heart positioning on a tablet/iPad layout (see mobile-ipad-layout in Mobile — Shared) in case the swap is somehow breakpoint-specific rather than present at every size.",
        ],
        ar: [
          "TC1: التقط لقطة شاشة لبطاقة من الرئيسية في عرض البطاقات بجانب إطار Figma بنفس مستوى التكبير وتأكد أن تبادل موضع الشارة والقلب/المشاركة واضح بصرياً، لا ملاحظة دقيقة على مستوى البكسل.",
          "TC2: تأكد أن نفس العقار عند عرضه في عرض القائمة يُظهر فعلاً صف دخل بموضع صحيح (حسب PropertyListItem.tsx)، ما يُثبت عرض القائمة كتنفيذ مرجعي عامل يُنسَخ منه بدلاً من بناء إصلاح عرض البطاقات من الصفر.",
          "TC3: بعد أي إصلاح، أعد تشغيل حالات اختبار عرض البطاقات في mobile-home-feed-actions-unwired أيضاً — إضافة زر مشاركة هنا تعني وجود نقطة ضغط onShare جديدة غير مربوطة بالمثل يجب التحقق منها، لا مجرد إصلاح بصري.",
          "TC4: تأكد من موضع الشارة/القلب على تخطيط جهاز لوحي/iPad (راجع mobile-ipad-layout في الجوال — مشترك) في حال كان التبادل مرتبطاً بحجم شاشة معيّن وليس موجوداً في كل الأحجام.",
        ],
      },
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
    },
    {
      id: "mobile-individual-signup",
      title: {
        en: "Individual signup: phone is optional in code but shown as required (*) in design",
        ar: "تسجيل حساب الفرد: الهاتف اختياري في الكود لكنه معروض كحقل مطلوب (*) في التصميم",
      },
      priority: "P1",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=271-21448&m=dev",
          label: { en: "Signup screen", ar: "شاشة إنشاء الحساب" },
        },
      ],
      endUserStory: {
        en: "As an individual user, I want to create an account with just an email and password, without being forced to hand over my phone number right away, so that I can start using the app immediately and decide later whether I trust it enough to add my phone.",
        ar: "بصفتي مستخدماً فردياً، أريد إنشاء حساب بالبريد الإلكتروني وكلمة المرور فقط، دون إجباري على تقديم رقم هاتفي فوراً، حتى أستطيع البدء باستخدام التطبيق مباشرة وأقرر لاحقاً ما إذا كنت أثق به بما يكفي لإضافة هاتفي.",
      },
      story: {
        en: "Verify the Individual Signup screen's actual validation against signupSchema (email required + valid format, phone OPTIONAL matching Kuwaiti regex ^(?:+?965)?[569]\\d{7}$ when provided, password 8-char min, confirmPassword must match), and flag that the Figma design marks 'رقم الهاتف*' with a required-field asterisk while the implementation treats phone as fully optional — so this is either a design/code drift to fix or a design annotation error to correct, not a live bug either way, but worth resolving so the two don't keep disagreeing.",
        ar: "تحقق من أن شاشة إنشاء حساب الفرد تتحقق فعلياً حسب signupSchema (البريد الإلكتروني مطلوب وبصيغة صحيحة، الهاتف اختياري ويطابق نمط الأرقام الكويتية ^(?:+?965)?[569]\\d{7}$ عند إدخاله، كلمة المرور 8 أحرف كحد أدنى، confirmPassword يجب أن يطابقها)، وأبلغ بأن تصميم Figma يضع علامة النجمة على 'رقم الهاتف*' كحقل مطلوب بينما يعامله الكود كاختياري بالكامل — فهذا إما انحراف بين التصميم والكود يحتاج إصلاحاً، أو خطأ في تعليق التصميم يحتاج تصحيحاً، وليس خطأً حياً في التطبيق على أي حال، لكنه يستحق الحل حتى لا يستمر الطرفان في التعارض.",
      },
      acceptanceCriteria: {
        en: [
          "Signup succeeds with email + password + confirmPassword only, leaving phone blank — confirming phone truly is optional today, in contrast with the design's asterisk.",
          "When phone IS provided, it's validated against the Kuwaiti regex before submission, with a clear inline error on mismatch.",
          "Password under 8 characters, or a confirmPassword mismatch, blocks submission with inline errors.",
          "Submitting with no phone skips the OTP step entirely and logs the user straight in (see mobile-signup-otp-skip-logic) — submitting WITH a valid phone routes to the OTP step instead.",
        ],
        ar: [
          "التسجيل ينجح بالبريد الإلكتروني وكلمة المرور وconfirmPassword فقط، مع ترك الهاتف فارغاً — ما يؤكد أن الهاتف اختياري فعلاً اليوم، على عكس علامة النجمة في التصميم.",
          "عند إدخال الهاتف، يُتحقق منه حسب نمط الأرقام الكويتية قبل الإرسال، مع خطأ واضح داخل الشاشة عند عدم التطابق.",
          "كلمة مرور أقل من 8 أحرف، أو عدم تطابق confirmPassword، يمنع الإرسال مع أخطاء داخل الشاشة.",
          "الإرسال دون هاتف يتخطى خطوة رمز التحقق OTP بالكامل ويسجّل دخول المستخدم مباشرة (راجع mobile-signup-otp-skip-logic) — أما الإرسال بهاتف صحيح فيوجّه إلى خطوة رمز التحقق بدلاً من ذلك.",
        ],
      },
      testScenarios: {
        en: [
          "Sign up with email + password + confirmPassword and phone left blank — confirm the account is created and the OTP step is skipped (goes straight to success).",
          "Sign up with a phone that fails the Kuwaiti regex (wrong length/leading digit) and confirm inline rejection, not a failed network call.",
          "Sign up with a valid Kuwaiti phone in the +965XXXXXXXX, 965XXXXXXXX, and bare XXXXXXXX forms and confirm all three are accepted.",
          "Flag to design/product: either add the asterisk removal to the Figma frame, or file a ticket to make phone actually required in signupSchema + the register/individual endpoint — don't let this story get closed as 'passed' without that follow-up landing somewhere.",
        ],
        ar: [
          "سجّل حساباً بالبريد الإلكتروني وكلمة المرور وconfirmPassword مع ترك الهاتف فارغاً — تأكد أن الحساب يُنشأ وأن خطوة رمز التحقق تُتخطى (ينتقل مباشرة إلى النجاح).",
          "سجّل حساباً برقم هاتف لا يطابق نمط الأرقام الكويتية (طول خاطئ/رقم بداية خاطئ) وتأكد من الرفض داخل الشاشة، لا فشل طلب شبكة.",
          "سجّل حساباً برقم كويتي صحيح بالصيغ +965XXXXXXXX وXXXXXXXX965 والصيغة المجردة XXXXXXXX وتأكد من قبول الصيغ الثلاث جميعها.",
          "أبلغ فريق التصميم/المنتج: إما إزالة علامة النجمة من إطار Figma، أو تقديم تذكرة لجعل الهاتف مطلوباً فعلياً في signupSchema ونقطة النهاية register/individual — لا تدع هذه القصة تُغلق كـ 'ناجحة' دون وصول تلك المتابعة لمكان ما.",
        ],
      },
    },
    {
      id: "mobile-signup-otp-skip-logic",
      title: {
        en: "Signup only sends an OTP if a phone was provided — no email verification exists either way",
        ar: "التسجيل يرسل رمز التحقق فقط عند إدخال هاتف — ولا يوجد تحقق من البريد الإلكتروني في أي حال",
      },
      priority: "P0",
      endUserStory: {
        en: "As an individual user signing up with just my email, I want to be let into the app right away without waiting on a verification code, so that there's no friction between deciding to join and actually browsing properties.",
        ar: "بصفتي مستخدماً فردياً أسجّل حساباً بالبريد الإلكتروني فقط، أريد الدخول إلى التطبيق فوراً دون انتظار رمز تحقق، حتى لا يكون هناك أي احتكاك بين قرار الانضمام والبدء فعلياً بتصفح العقارات.",
      },
      story: {
        en: "Verify that IndividualAuthScreen's onSignup only advances to the OTP step (IndividualSignupOtpStep) when a phone number was entered — if phone is blank, the app immediately calls POST /auth/login with the new credentials and shows the success sheet with zero verification of any kind — so that this security-relevant branch is deliberately signed off on, not discovered later as 'anyone can create an unverified account instantly'.",
        ar: "تحقق من أن onSignup في IndividualAuthScreen تنتقل إلى خطوة رمز التحقق (IndividualSignupOtpStep) فقط عند إدخال رقم هاتف — أما إذا كان الهاتف فارغاً، فإن التطبيق يستدعي فوراً POST /auth/login بالبيانات الجديدة ويعرض شاشة النجاح دون أي تحقق من أي نوع — حتى يُوافَق على هذا الفرع المرتبط بالأمان عن قصد وبوعي، لا أن يُكتشف لاحقاً كأن 'أي شخص يستطيع إنشاء حساب غير مُتحقَّق منه فوراً'.",
      },
      acceptanceCriteria: {
        en: [
          "Signing up with email + password only (no phone) results in an immediately-active, logged-in account with no OTP and no email-verification link ever sent.",
          "Signing up WITH a phone sends an SMS OTP via POST /auth/register/verify-otp before the account becomes usable.",
          "Confirm with product/security whether 'no phone = instantly active, unverified account' is the intended trust model, since it means email ownership is never actually confirmed in that path.",
          "The Success bottom sheet's copy is consistent for both paths (see mobile-auth-success-copy for a text-mismatch nit already spotted here).",
        ],
        ar: [
          "التسجيل بالبريد الإلكتروني وكلمة المرور فقط (دون هاتف) ينتج عنه حساب نشط ومسجَّل الدخول فوراً، دون رمز تحقق ودون إرسال أي رابط تحقق من البريد الإلكتروني إطلاقاً.",
          "التسجيل مع إدخال هاتف يرسل رمز تحقق عبر الرسائل النصية باستخدام POST /auth/register/verify-otp قبل أن يصبح الحساب قابلاً للاستخدام.",
          "تأكد مع فريق المنتج/الأمان ما إذا كان نموذج الثقة 'لا هاتف = حساب نشط فوراً وغير مُتحقَّق منه' مقصوداً، لأنه يعني أن ملكية البريد الإلكتروني لا تُؤكَّد فعلياً أبداً في هذا المسار.",
          "صياغة شاشة النجاح السفلية متسقة بين المسارين (راجع mobile-auth-success-copy لملاحظة تعارض نصي مرصودة مسبقاً هنا).",
        ],
      },
      testScenarios: {
        en: [
          "Sign up with a disposable/unowned email address and no phone — confirm the account is fully usable immediately, with no confirmation email ever required to be clicked.",
          "Sign up with a valid phone, then abandon the flow before entering the OTP — confirm the account is NOT usable yet (i.e. verification is actually gating something in that path).",
          "Sign up twice in a row with the same email but different phones (once with, once without) if the backend allows re-registration attempts, and confirm behavior is consistent and doesn't create duplicate/ghost accounts.",
        ],
        ar: [
          "سجّل حساباً ببريد إلكتروني مؤقت/غير مملوك ودون هاتف — تأكد أن الحساب قابل للاستخدام بالكامل فوراً، دون الحاجة لفتح أي بريد تأكيد إطلاقاً.",
          "سجّل حساباً بهاتف صحيح، ثم اترك التدفق قبل إدخال رمز التحقق — تأكد أن الحساب غير قابل للاستخدام بعد (أي أن التحقق يقيّد فعلياً شيئاً ما في هذا المسار).",
          "سجّل حسابين متتاليين بنفس البريد الإلكتروني لكن بهاتفين مختلفين (مرة مع هاتف، ومرة بدونه) إذا كانت الواجهة الخلفية تسمح بمحاولات إعادة التسجيل، وتأكد أن السلوك متسق ولا ينشئ حسابات مكررة/شبحية.",
        ],
      },
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
        en: "Flag that the Figma design for step 1 of Forgot Password shows an inline error message under the field ('لم نتمكن من العثور على حساب مرتبط بهذه البيانات') for an unrecognized identifier, but ForgotPasswordStep1.tsx has no inline error rendering at all — the actual implementation only surfaces failures via a native Alert.alert('خطأ', ...) popup — so this is a real design/implementation mismatch worth a product decision, not just a QA pass/fail.",
        ar: "أبلغ بأن تصميم Figma للخطوة 1 من استعادة كلمة المرور يعرض رسالة خطأ داخل الشاشة تحت الحقل ('لم نتمكن من العثور على حساب مرتبط بهذه البيانات') لمعرّف غير معروف، لكن ForgotPasswordStep1.tsx لا يعرض أي خطأ داخل الشاشة إطلاقاً — التنفيذ الفعلي يُظهر الفشل فقط عبر تنبيه أصلي Alert.alert('خطأ', ...) منبثق — فهذا تعارض حقيقي بين التصميم والتنفيذ يستحق قراراً من فريق المنتج، لا مجرد نجاح/فشل في اختبار الجودة.",
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
    },
  ],
};
