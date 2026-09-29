import { DocSection } from "./types";

export const mobileOffice: DocSection = {
  slug: "mobile-office",
  title: { en: "Mobile — Office", ar: "الجوال — المكتب العقاري" },
  summary: {
    en: "The (office) route group (office-home, office-more, office-chats, office-properties). IMPORTANT: in store builds this route group is behind ComingSoonGate unless EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS is 'true' (see mobile-company-office-gate). The stories below are a readiness checklist for when it's switched on; the server-side office rules (one per account, unique licence, approval before publishing) are covered in API → api-persona-rules.",
    ar: "مجموعة مسارات (office) (office-home و office-more و office-chats و office-properties). مهم: في نسخ المتاجر تبقى هذه المجموعة خلف ComingSoonGate ما لم تكن قيمة EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS هي 'true' (راجع mobile-company-office-gate). القصص أدناه قائمة جاهزية لوقت تفعيلها؛ أما قواعد المكتب في الخادم (واحد لكل حساب، ترخيص فريد، اعتماد قبل النشر) فموجودة في الواجهة البرمجية ← api-persona-rules.",
  },
  stories: [
    {
      id: "mobile-office-dashboard-mock-data",
      title: {
        en: "Office Home dashboard stats and trial banner are 100% hardcoded (not live data)",
        ar: "إحصاءات لوحة معلومات المكتب العقاري وشريط النسخة التجريبية ثابتان بالكامل في الكود (ليسا بيانات حية)",
      },
      priority: "P1",
      endUserStory: {
        en: "As an office user, I want my dashboard to show real numbers for my active listings, services, views, and messages, so that I can actually gauge how my office's listings are performing instead of looking at numbers that never change.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد أن تعرض لوحة المعلومات الخاصة بي أرقاماً حقيقية عن إعلاناتي النشطة وخدماتي ومشاهداتي ورسائلي، حتى أتمكن فعلياً من تقييم أداء إعلانات مكتبي بدلاً من النظر إلى أرقام لا تتغير أبداً.",
      },
      story: {
        en: "Flag that office-home.tsx's entire 2x2 stats grid (الإعلانات النشطة / خدمات نشطة / المشاهدات / الرسائل الجديدة, showing the literal strings '3', '3', '700+', '5') and the trial-countdown banner ('يتبقى 14 يومًا') are hardcoded JSX text with no state, hook, or API call feeding them — an identical pattern to company-home.tsx (mobile-company-dashboard-mock-data) — so this is tracked as a known readiness gap for whenever EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS is switched on in store builds.",
        ar: "تنويه: شبكة الإحصاءات 2×2 بالكامل في office-home.tsx (الإعلانات النشطة / خدمات نشطة / المشاهدات / الرسائل الجديدة، التي تعرض السلاسل النصية الحرفية '3' و'3' و'700+' و'5') وشريط العد التنازلي للنسخة التجريبية ('يتبقى 14 يومًا') هي نصوص JSX ثابتة دون أي حالة (state) أو hook أو طلب API يغذّيها — وهو نمط مطابق تماماً لـ company-home.tsx (mobile-company-dashboard-mock-data) — لذا يُوثَّق هذا كفجوة جاهزية معروفة لوقت تفعيل EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS في نسخ المتاجر.",
      },
      acceptanceCriteria: {
        en: [
          "Every number on the stats grid and the '14 يومًا' trial banner is confirmed static in the component source, not derived from any request, subscription record, or count.",
          "Tapping the 'الإعلانات النشطة' and 'خدمات نشطة' cards both currently navigate to office-properties — confirm whether that's intentional or a routing bug once services management exists as its own feature.",
          "This story's acceptance criteria must be rewritten once real data wiring lands — verify the numbers actually match backend state instead of just confirming they're currently fake.",
        ],
        ar: [
          "التأكد من أن كل رقم في شبكة الإحصاءات وشريط 'يتبقى 14 يومًا' التجريبي ثابت في كود المكوّن، وليس مشتقاً من أي طلب أو سجل اشتراك أو عدّاد.",
          "الضغط على بطاقتَي 'الإعلانات النشطة' و'خدمات نشطة' يوجّه المستخدم حالياً إلى office-properties في كلتا الحالتين — التأكد ما إذا كان هذا مقصوداً أم خللاً في التوجيه بمجرد أن تصبح إدارة الخدمات ميزة مستقلة.",
          "يجب إعادة صياغة معايير القبول لهذه القصة بمجرد ربط بيانات حقيقية — والتحقق حينها أن الأرقام تطابق فعلياً حالة الخادم بدلاً من مجرد تأكيد أنها وهمية حالياً.",
        ],
      },
      testScenarios: {
        en: [
          "Compare two different office test accounts with genuinely different amounts of activity and confirm the dashboard numbers are identical between them — if so, that reconfirms they're hardcoded.",
          "Tap both stat cards that route to office-properties and confirm the destination is the same for both.",
          "Cross-check against company-home.tsx (mobile-company-dashboard-mock-data) to confirm both dashboards were built from the same hardcoded template.",
        ],
        ar: [
          "قارن بين حسابَي اختبار لمكتبين عقاريين مختلفين بمستويات نشاط مختلفة فعلياً، وتأكد أن أرقام لوحة المعلومات متطابقة بينهما — إن كانت كذلك، فهذا يؤكد أنها ثابتة في الكود.",
          "اضغط بطاقتَي الإحصاء اللتين توجّهان إلى office-properties وتأكد أن الوجهة واحدة في كلتا الحالتين.",
          "قارن مع company-home.tsx (mobile-company-dashboard-mock-data) للتأكد أن كلا اللوحتين بُنيتا من نفس القالب الثابت في الكود.",
        ],
      },
    },
    {
      id: "mobile-office-more-dead-actions",
      title: {
        en: "Office profile 'معاينة' (Preview) and 'مشاركة' (Share) buttons have no onPress handler at all",
        ar: "زرا 'معاينة' و'مشاركة' في ملف المكتب العقاري بلا أي معالج onPress إطلاقاً",
      },
      priority: "P2",
      endUserStory: {
        en: "As an office user, I want to preview how my office profile looks to the public and easily share it, so that I can check my presentation and promote my agency without leaving the app.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد معاينة شكل ملف مكتبي كما يظهر للعامة ومشاركته بسهولة، حتى أتمكن من مراجعة عرضي والترويج لمكتبي دون مغادرة التطبيق.",
      },
      story: {
        en: "Verify that on office-more.tsx's profile header card, the 'معاينة' (Preview) and 'مشاركة' (Share) buttons render with no onPress prop whatsoever — only 'تعديل' (Edit) actually navigates anywhere (to /edit-profile) — an identical gap to company-more.tsx (mobile-company-more-dead-actions) — so this is documented ahead of the gate lifting rather than discovered fresh.",
        ar: "تحقق من أن زرَّي 'معاينة' و'مشاركة' في بطاقة رأس الملف الشخصي بملف office-more.tsx يُعرضان دون أي خاصية onPress إطلاقاً — وأن زر 'تعديل' فقط هو من يوجّه فعلياً إلى مكان ما (إلى /edit-profile) — وهي فجوة مطابقة تماماً لـ company-more.tsx (mobile-company-more-dead-actions) — لذا تُوثَّق هذه الفجوة مسبقاً قبل رفع القفل بدلاً من اكتشافها من جديد لاحقاً.",
      },
      acceptanceCriteria: {
        en: [
          "Tapping 'معاينة' does nothing — no navigation, no modal, no console log, no crash.",
          "Tapping 'مشاركة' does nothing for the same reason.",
          "'تعديل' correctly navigates to /edit-profile and is the only one of the three action buttons that's wired up.",
        ],
        ar: [
          "الضغط على 'معاينة' لا يفعل شيئاً — لا توجيه، لا نافذة منبثقة، لا سجل console، ولا تعطّل.",
          "الضغط على 'مشاركة' لا يفعل شيئاً للسبب نفسه.",
          "زر 'تعديل' يوجّه بشكل صحيح إلى /edit-profile وهو الزر الوحيد من بين الأزرار الثلاثة المفعَّل فعلياً.",
        ],
      },
      testScenarios: {
        en: [
          "Tap all three action buttons on the office profile card in sequence and confirm only Edit does anything.",
          "Cross-check against company-more.tsx (mobile-company-more-dead-actions) to confirm the two profile cards share the exact same unwired-buttons issue, not two unrelated bugs.",
          "Flag to product whether Preview/Share are meant to ship in the release that lifts the gate, or were intentionally left unwired for a later phase.",
        ],
        ar: [
          "اضغط الأزرار الثلاثة بالتتابع على بطاقة ملف المكتب العقاري وتأكد أن زر التعديل فقط هو من ينفّذ إجراءً.",
          "قارن مع company-more.tsx (mobile-company-more-dead-actions) للتأكد أن بطاقتَي الملف الشخصي تشتركان في نفس مشكلة الأزرار غير المفعَّلة تماماً، لا خللين منفصلين.",
          "أبلغ المنتج عمّا إذا كان زرا معاينة/مشاركة مخطط لهما ضمن الإصدار الذي يرفع القفل، أم أنهما تُركا عمداً غير مفعَّلين لمرحلة لاحقة.",
        ],
      },
    },
    {
      id: "mobile-office-coming-soon-menu-items",
      title: {
        en: "Office has 4 explicit 'قريباً' menu stubs — more than Company's 2 (expected, not a bug)",
        ar: "قائمة المكتب العقاري تحتوي 4 عناصر 'قريباً' صريحة — ضعف عدد الشركة البالغ 2 (متوقع، وليس خللاً)",
      },
      priority: "P2",
      endUserStory: {
        en: "As an office user, I want to eventually manage deals, auctions, and broker relationships, and see analytics on my listings, so that I can run my agency's operations from within the app.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد أن أتمكن مستقبلاً من إدارة الصفقات والمزادات وعلاقات الوسطاء، ورؤية تحليلات إعلاناتي، حتى أستطيع إدارة عمليات مكتبي من داخل التطبيق.",
      },
      story: {
        en: "Confirm that office-more.tsx shows Alert.alert('قريباً', ...) for 4 items — 'الصفقات' (Deals), 'المزادات' (Auctions), 'إدارة الوسطاء' (Broker Management), and 'التحليلات' (Analytics) — twice as many placeholder stubs as company-more.tsx's 2, so this asymmetry is tracked as an intentional difference in each role's roadmap, not an inconsistency to flag as a bug.",
        ar: "تأكد من أن office-more.tsx يعرض Alert.alert('قريباً', ...) لأربعة عناصر — 'الصفقات' و'المزادات' و'إدارة الوسطاء' و'التحليلات' — أي ضعف عدد العناصر النائبة الموجودة في company-more.tsx (2 فقط)، حتى يُوثَّق هذا التفاوت كاختلاف مقصود في خارطة طريق كل دور، لا كتضارب يُبلَّغ عنه كخلل.",
      },
      acceptanceCriteria: {
        en: [
          "Tapping each of the 4 items shows its corresponding 'قريباً' alert ('ميزة الصفقات ستكون متوفرة قريباً', 'ميزة المزادات ستكون متوفرة قريباً', 'ميزة إدارة الوسطاء ستكون متوفرة قريباً', 'ميزة التحليلات ستكون متوفرة قريباً') and nothing else happens.",
          "Every other menu item in office-more (chat, favorites, notifications, reviews, plans, account-balance, invoices, settings, about, faq, contact, privacy, terms) navigates to a real shared screen.",
          "This asymmetry with Company (2 stubs vs. 4) is confirmed intentional per the product roadmap, not a copy-paste gap between the two role's menu screens.",
        ],
        ar: [
          "الضغط على كل عنصر من العناصر الأربعة يعرض تنبيه 'قريباً' المطابق له ('ميزة الصفقات ستكون متوفرة قريباً'، 'ميزة المزادات ستكون متوفرة قريباً'، 'ميزة إدارة الوسطاء ستكون متوفرة قريباً'، 'ميزة التحليلات ستكون متوفرة قريباً') ولا يحدث شيء آخر.",
          "كل عنصر آخر في قائمة office-more (المحادثات، المفضلة، الإشعارات، التقييمات، الباقات، رصيد الحساب، الفواتير، الإعدادات، عن التطبيق، الأسئلة الشائعة، تواصل معنا، الخصوصية، الشروط) يوجّه إلى شاشة مشتركة حقيقية.",
          "التأكد أن هذا التفاوت مع الشركة (2 عنصر نائب مقابل 4) مقصود فعلاً حسب خارطة طريق المنتج، لا فجوة ناتجة عن نسخ غير مكتمل بين شاشتَي القوائم للدورين.",
        ],
      },
      testScenarios: {
        en: [
          "Tap all 4 'قريباً' items in office-more.tsx and confirm each shows its own correctly-worded alert.",
          "Tap every remaining menu item and confirm all route to a real, working shared screen.",
          "Cross-check against company-more.tsx's 2-item list (mobile-company-coming-soon-menu-items) to confirm the difference in scope is a deliberate roadmap choice.",
        ],
        ar: [
          "اضغط جميع عناصر 'قريباً' الأربعة في office-more.tsx وتأكد أن كل عنصر يعرض تنبيهه الخاص بصياغة صحيحة.",
          "اضغط كل عنصر متبقٍ في القائمة وتأكد أن الجميع يوجّه إلى شاشة مشتركة حقيقية وفعّالة.",
          "قارن مع قائمة الشركة المكونة من عنصرين (mobile-company-coming-soon-menu-items) للتأكد أن اختلاف النطاق قرار مقصود ضمن خارطة الطريق.",
        ],
      },
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
    },
    {
      id: "mobile-office-add-tab-empty",
      title: {
        en: "Office '+' tab renders a completely blank screen (not even a redirect)",
        ar: "تبويب '+' للمكتب العقاري يعرض شاشة فارغة تماماً (ولا حتى إعادة توجيه)",
      },
      priority: "P2",
      endUserStory: {
        en: "As an office user, I want a clear '+' action to list a new property, so that I have an obvious way to add new listings to my portfolio.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد إجراء '+' واضحاً لإدراج عقار جديد، حتى تكون لديّ طريقة واضحة لإضافة إعلانات جديدة إلى محفظتي.",
      },
      story: {
        en: "Flag that (office)/add.tsx is a literal `return <View />;` — a blank screen with no content, no redirect, and no action sheet — the identical stub to (company)/add.tsx (mobile-company-add-tab-empty), unlike the individual role's real '+' action sheet, so this genuinely blank screen doesn't get mistaken for a rendering bug once the gate lifts — it is the current implementation as written.",
        ar: "تنويه: الملف (office)/add.tsx ما هو إلا `return <View />;` حرفياً — شاشة فارغة دون أي محتوى أو إعادة توجيه أو شاشة إجراءات — وهو نفس العنصر النائب الموجود في (company)/add.tsx (mobile-company-add-tab-empty) تماماً، على عكس شاشة الإجراءات الحقيقية لزر '+' الخاصة بدور الفرد، حتى لا تُخلَط هذه الشاشة الفارغة فعلياً بخلل في العرض بمجرد رفع القفل — فهي التنفيذ الحالي كما هو مكتوب في الكود.",
      },
      acceptanceCriteria: {
        en: [
          "Tapping the '+' tab as an Office identity renders a blank screen with no visible content or action.",
          "Nothing crashes and no console error is thrown — it's empty, not unstable.",
          "This must be revisited before the gate lifts — shipping a genuinely blank tab to real office users would be a real regression, not just a documentation footnote.",
        ],
        ar: [
          "الضغط على تبويب '+' كهوية مكتب عقاري يعرض شاشة فارغة دون أي محتوى أو إجراء مرئي.",
          "لا يحدث أي تعطّل ولا يُطرح أي خطأ في console — الشاشة فارغة فقط، لا غير مستقرة.",
          "يجب إعادة النظر في هذا قبل رفع القفل — نشر تبويب فارغ فعلياً لمستخدمي مكتب عقاري حقيقيين سيكون تراجعاً حقيقياً، لا مجرد ملاحظة توثيقية.",
        ],
      },
      testScenarios: {
        en: [
          "Tap the '+' tab as an Office identity and confirm literally nothing renders beyond a blank screen.",
          "Compare directly against the Individual role's '+' action sheet to make the gap concrete for a ticket.",
          "Cross-check against (company)/add.tsx (mobile-company-add-tab-empty) to confirm both role stubs are identical, not two independently-introduced gaps.",
        ],
        ar: [
          "اضغط تبويب '+' كهوية مكتب عقاري وتأكد أنه لا يُعرض حرفياً أي شيء غير شاشة فارغة.",
          "قارن مباشرةً مع شاشة إجراءات '+' الخاصة بدور الفرد لجعل الفجوة ملموسة عند فتح تذكرة.",
          "قارن مع (company)/add.tsx (mobile-company-add-tab-empty) للتأكد أن العنصرين النائبين لكلا الدورين متطابقان، لا فجوتين مستقلتين نشأتا بشكل منفصل.",
        ],
      },
    },
  ],
};
