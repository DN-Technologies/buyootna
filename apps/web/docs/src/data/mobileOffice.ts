import { DocSection } from "./types";

export const mobileOffice: DocSection = {
  slug: "mobile-office",
  title: { en: "Mobile — Office", ar: "الجوال — المكتب العقاري" },
  summary: {
    en: "The (office) route group (office-home, office-more, office-chats, office-properties). Office tabs and dashboard have been implemented matching Figma designs 4494-140590 and 4494-140318. On the feat/offices branch, office accounts are enabled via EXPO_PUBLIC_ENABLE_OFFICE_ACCOUNTS=true.",
    ar: "مجموعة مسارات (office) (office-home و office-more و office-chats و office-properties). تم تطبيق تبويبات ولوحة معلومات المكتب العقاري وفق تصاميم فيجما 4494-140590 و 4494-140318. في فرع feat/offices، يتم تفعيل حسابات المكاتب عبر EXPO_PUBLIC_ENABLE_OFFICE_ACCOUNTS=true.",
  },
  stories: [
    {
      id: "mobile-office-dashboard-figma",
      title: {
        en: "Office Home dashboard fully implemented matching Figma designs",
        ar: "تطبيق لوحة تحكم المكتب العقاري بالكامل وفق تصاميم فيجما",
      },
      priority: "P1",
      endUserStory: {
        en: "As an office user, I want a rich dashboard matching the design specification with active stats, office listings, office services, market properties, recent conversations, and group activity, so that I can manage my office operations effectively.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد لوحة معلومات متكاملة مطابقة لمواصفات التصميم تعرض الإحصاءات النشطة، إعلانات المكتب، الخدمات، عقارات السوق، أحدث المحادثات، ونشاط المجموعات، حتى أتمكن من إدارة عمليات مكتبي بفاعلية.",
      },
      story: {
        en: "Implements Figma nodes 4494:140590 and 4494:140318: Top header with office logo, greeting, and verified badge; 2x2 stats grid (active listings, active services, views, new messages); office listings horizontal carousel with feature tags and interaction counters; services horizontal carousel with status request pills; market properties horizontal carousel with space, location, and rental income; recent conversations with unread badges; group activity with group letter avatars; and 5-tab navigation bar with floating center plus button.",
        ar: "تطبيق تصاميم فيجما 4494:140590 و 4494:140318: شريط علوي مع شعار المكتب والتحية وشارة التحقق؛ شبكة إحصاءات 2×2 (الإعلانات النشطة، الخدمات النشطة، المشاهدات، الرسائل الجديدة)؛ شريط أفقي لإعلانات المكتب مع شارات التمييز وعدّادات التفاعل؛ شريط أفقي للخدمات مع شارات الطلبات؛ شريط أفقي لعقارات السوق مع المساحة والموقع ومدخول العقار؛ أحدث المحادثات مع شارات غير المقروء؛ نشاط المجموعات مع الأحرف الرمزية للمجموعات؛ وشريط تنقل سفلي بـ 5 تبويبات مع زر الإضافة العائم في المنتصف.",
      },
      acceptanceCriteria: {
        en: [
          "Office header displays verified badge, office name, greeting, and notification bell.",
          "Stats grid renders 4 cards: active listings (with weekly count), active services, views count, and new messages (with today count).",
          "Office listings section renders horizontal carousel with image, featured gradient badge, price in KWD, stats (views, favorites, chats), and 'إدارة الإعلان' button.",
          "Services section renders horizontal carousel with circular dark icon, title, description, 'إدارة الخدمة'/'إدارة الإعلان' button, and status request pills ('12 طلب جديد' / '12 طلب نشط').",
          "Market properties section renders horizontal carousel with property type, featured badge, price, space (م2), location, and property income if applicable.",
          "Recent conversations section renders horizontal carousel with client avatar, category tag, message preview, unread count badge ('3+'), and timestamp.",
          "Group activity section renders horizontal carousel with group letter avatar, group name, message preview, unread count badge, and timestamp.",
          "Office layout mounts CustomTabBar with 5 tabs and wires the center '+' button to PlusActionsSheet.",
        ],
        ar: [
          "ترويسة المكتب تعرض شارة التحقق، اسم المكتب، التحية، وجرس الإشعارات.",
          "شبكة الإحصاءات تعرض 4 بطاقات: الإعلانات النشطة (مع عدّاد الأسبوع)، الخدمات النشطة، المشاهدات، والرسائل الجديدة (مع عدّاد اليوم).",
          "قسم إعلانات المكتب يعرض شريطاً أفقياً مع صورة العقار، شارة التمييز المتدرجة، السعر بالدينار الكويتي، إحصاءات التفاعل، وزر 'إدارة الإعلان'.",
          "قسم الخدمات يعرض شريطاً أفقياً بأيقونة داكنة دائرية، العنوان، الوصف، زر الإدارة، وشارات الطلبات ('12 طلب جديد' / '12 طلب نشط').",
          "قسم عقارات السوق يعرض شريطاً أفقياً بنوع العقار، شارة مميز، السعر، المساحة (م2)، الموقع، ومدخول العقار إن وجد.",
          "قسم أحدث المحادثات يعرض شريطاً أفقياً بصورة العميل، شارة التصنيف، معاينة الرسالة، عدّاد غير المقروء ('3+')، والوقت.",
          "قسم نشاط المجموعات يعرض شريطاً أفقياً بالحرف الرمزي للمجموعة، اسم المجموعة، معاينة الرسالة، عدّاد غير المقروء، والوقت.",
          "تخطيط المكتب يفعّل CustomTabBar بخمس تبويبات ويربط زر '+' الأوسط بنافذة PlusActionsSheet.",
        ],
      },
      testScenarios: {
        en: [
          "Run office-home.spec.tsx and confirm all sections, cards, and navigation actions pass.",
          "Run office-layout.spec.tsx and confirm all 5 tabs mount correctly when enabled.",
          "Verify visual layout matches Figma nodes 4494:140590 and 4494:140318.",
        ],
        ar: [
          "تشغيل office-home.spec.tsx والتأكد من نجاح اختبارات جميع الأقسام والبطاقات وإجراءات التنقل.",
          "تشغيل office-layout.spec.tsx والتأكد من تحميل التبويبات الخمسة بشكل صحيح عند التفعيل.",
          "التحقق من مطابقة التصميم المرئي لعقد فيجما 4494:140590 و 4494:140318.",
        ],
      },
      updatedIn: "feat/offices",
    },
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
        en: "Flag that office-home.tsx's stats grid and sections use mock data matching Figma specifications until backend APIs for office telemetry are wired in.",
        ar: "تنويه: شبكة الإحصاءات وأقسام office-home.tsx تستخدم بيانات تجريبية مطابقة لمواصفات فيجما ريثما يتم ربط واجهات برمجة التطبيقات الخاصة بإحصاءات المكتب العقاري.",
      },
      acceptanceCriteria: {
        en: [
          "Mock data reflects the realistic structure defined in Figma specifications (types and mockData in features/office).",
          "Backend wiring to replace mock data with live API telemetry once endpoints are ready.",
        ],
        ar: [
          "البيانات التجريبية تعكس الهيكل الواقعي المحدد في مواصفات فيجما (الأنواع والبيانات في features/office).",
          "ربط الواجهة الخلفية لاستبدال البيانات التجريبية ببيانات حية بمجرد جاهزية النقاط البرمجية.",
        ],
      },
      testScenarios: {
        en: [
          "Check that mock data matches the exact Figma nodes 4494:140590 and 4494:140318.",
        ],
        ar: [
          "التأكد من أن البيانات التجريبية تطابق عقد فيجما 4494:140590 و 4494:140318 بدقة.",
        ],
      },
      updatedIn: "feat/offices",
    },
    {
      id: "mobile-office-more-dead-actions",
      title: {
        en: "Office profile 'معاينة' and 'مشاركة' buttons do nothing",
        ar: "زرا 'معاينة' و'مشاركة' في ملف المكتب لا يفعلان شيئاً",
      },
      priority: "P2",
      story: {
        en: "Still open: on office-more.tsx's profile card, 'معاينة' (Preview) and 'مشاركة' (Share) have no onPress; only 'تعديل' navigates. Company's identical buttons were fixed (Preview opens /company/:id, Share opens the share sheet — see mobile-company-more-actions), so that's the pattern to copy.",
        ar: "ما زال قائماً: في بطاقة الملف في office-more.tsx لا يوجد onPress لزري 'معاينة' و'مشاركة'؛ وزر 'تعديل' فقط يعمل. أُصلحت الأزرار المطابقة في الشركة (المعاينة تفتح /company/:id والمشاركة تفتح نافذة المشاركة — راجع mobile-company-more-actions)، وهذا هو النمط الذي يُنسخ.",
      },
      acceptanceCriteria: {
        en: [
          "Today: tapping 'معاينة' or 'مشاركة' does nothing and doesn't crash.",
          "After the fix: they behave like the company's buttons.",
        ],
        ar: [
          "اليوم: الضغط على 'معاينة' أو 'مشاركة' لا يفعل شيئاً ولا يسبب تعطلاً.",
          "بعد الإصلاح: يتصرفان مثل أزرار الشركة.",
        ],
      },
      testScenarios: {
        en: [
          "With the flag on, open the office More tab and tap each button.",
        ],
        ar: [
          "مع تفعيل المفتاح افتح تبويب المزيد للمكتب واضغط كل زر.",
        ],
      },
      updatedIn: "feat/docs-platform",
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
        en: "Office '+' tab triggers PlusActionsSheet in CustomTabBar",
        ar: "تبويب '+' للمكتب العقاري يفتح نافذة PlusActionsSheet في شريط التنقل المخصص",
      },
      priority: "P2",
      endUserStory: {
        en: "As an office user, I want a clear '+' action to list a new property, so that I have an obvious way to add new listings to my portfolio.",
        ar: "بصفتي مستخدم مكتب عقاري، أريد إجراء '+' واضحاً لإدراج عقار جديد، حتى تكون لديّ طريقة واضحة لإضافة إعلانات جديدة إلى محفظتي.",
      },
      story: {
        en: "In the updated OfficeLayout, the custom SVG tab bar handles the central '+' button press by presenting PlusActionsSheet (or AuthGuardSheet if unauthenticated), matching the Individual tab bar workflow.",
        ar: "في تخطيط المكتب المحدث، يعالج شريط التنقل السفلي المخصص الضغط على زر '+' الأوسط بفتح PlusActionsSheet (أو AuthGuardSheet إذا لم يكن مسجل الدخول)، بما يطابق مسار شريط دور الفرد.",
      },
      acceptanceCriteria: {
        en: [
          "Tapping the '+' center button in OfficeLayout presents the PlusActionsSheet.",
          "Quota exhausted conditions present the QuotaExhaustedSheet.",
          "Unauthenticated taps present the AuthGuardSheet.",
        ],
        ar: [
          "الضغط على زر '+' الأوسط في OfficeLayout يفتح نافذة PlusActionsSheet.",
          "عند استنفاد الحصة تفتح نافذة QuotaExhaustedSheet.",
          "عند عدم تسجيل الدخول تفتح نافذة AuthGuardSheet.",
        ],
      },
      testScenarios: {
        en: [
          "Tap '+' button as an office user and verify PlusActionsSheet opens.",
        ],
        ar: [
          "اضغط زر '+' كمستخدم مكتب وتأكد من فتح PlusActionsSheet.",
        ],
      },
      updatedIn: "feat/offices",
    },
  ],
};
