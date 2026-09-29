import { DocSection } from "./types";

export const mobileCompany: DocSection = {
  slug: "mobile-company",
  title: { en: "Mobile — Company", ar: "الجوال — الشركة" },
  summary: {
    en: "The (company) route group (company-home, company-more, company-chats, company-requests). IMPORTANT: in store builds this route group is behind ComingSoonGate unless EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS is 'true' (see mobile-company-office-gate). The stories below are a readiness checklist for when it's switched on; the server-side company rules (one per account, unique licence, approval before publishing) are covered in API → api-persona-rules.",
    ar: "مجموعة مسارات (company) (company-home و company-more و company-chats و company-requests). مهم: في نسخ المتاجر تبقى هذه المجموعة خلف ComingSoonGate ما لم تكن قيمة EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS هي 'true' (راجع mobile-company-office-gate). القصص أدناه قائمة جاهزية لوقت تفعيلها؛ أما قواعد الشركة في الخادم (واحدة لكل حساب، ترخيص فريد، اعتماد قبل النشر) فموجودة في الواجهة البرمجية ← api-persona-rules.",
  },
  stories: [
    {
      id: "mobile-company-dashboard-mock-data",
      title: {
        en: "Company Home dashboard stats and trial banner are 100% hardcoded (not live data)",
        ar: "إحصاءات لوحة الشركة الرئيسية وشريط الفترة التجريبية ثابتة بنسبة 100% (ليست بيانات حية)",
      },
      priority: "P1",
      endUserStory: {
        en: "As a company user, I want my dashboard to show real numbers for my requests, active services, views, and messages, so that I can actually gauge how my business is performing on the platform instead of looking at numbers that never change.",
        ar: "بصفتي مستخدم شركة، أريد أن تعرض لوحتي الرئيسية أرقاماً حقيقية لطلباتي وخدماتي النشطة والمشاهدات والرسائل، حتى أتمكن فعلياً من قياس أداء عملي على المنصة بدلاً من النظر إلى أرقام لا تتغير أبداً.",
      },
      story: {
        en: "Flag that company-home.tsx's entire 2x2 stats grid (طلبات / خدمات نشطة / المشاهدات / الرسائل الجديدة, showing the literal strings '3 هذا الأسبوع', '3', '+700', '5 اليوم') and the trial-countdown banner ('يتبقى 14 يومًا') are hardcoded JSX text with no state, hook, or API call feeding them. Track this as a known readiness gap for whenever EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS is switched on in store builds, rather than letting it be freshly discovered as 'the metrics are wrong' at that point.",
        ar: "لاحظ أن شبكة الإحصاءات 2×2 كاملة في company-home.tsx (طلبات / خدمات نشطة / المشاهدات / الرسائل الجديدة، والتي تعرض النصوص الحرفية '3 هذا الأسبوع' و'3' و'+700' و'5 اليوم') وكذلك شريط العد التنازلي للفترة التجريبية ('يتبقى 14 يومًا') هي نصوص JSX ثابتة دون أي state أو hook أو استدعاء API يغذّيها. تتبّع هذا كنقص جاهزية معروف لما بعد تفعيل EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS في نسخ المتاجر، بدلاً من اكتشافه من جديد حينها على أنه 'الأرقام خاطئة'.",
      },
      acceptanceCriteria: {
        en: [
          "Every number on the stats grid and the '14 يومًا' trial banner is confirmed static in the component source, not derived from any request, subscription record, or count.",
          "Tapping both the 'طلبات' and 'خدمات نشطة' cards currently navigate to the same company-requests screen — confirm whether that's intentional or a routing bug once services management exists as its own feature.",
          "This story's acceptance criteria must be rewritten once real data wiring lands — verify the numbers actually match backend state instead of just confirming they're currently fake.",
        ],
        ar: [
          "تأكيد أن كل رقم في شبكة الإحصاءات وشريط '14 يومًا' التجريبي ثابت في كود المكوّن، وغير مشتق من أي طلب أو سجل اشتراك أو عدّاد فعلي.",
          "الضغط على بطاقتَي 'طلبات' و'خدمات نشطة' ينقل حالياً إلى نفس شاشة company-requests — تأكد ما إذا كان هذا مقصوداً أم خطأ توجيه بمجرد وجود إدارة خدمات كميزة مستقلة.",
          "يجب إعادة كتابة معايير القبول لهذه القصة بمجرد ربط بيانات حقيقية — تحقق حينها أن الأرقام تطابق فعلياً حالة الواجهة الخلفية، لا الاكتفاء بتأكيد أنها وهمية حالياً.",
        ],
      },
      testScenarios: {
        en: [
          "Compare two different company test accounts with genuinely different amounts of activity and confirm the dashboard numbers are identical between them — if so, that reconfirms they're hardcoded.",
          "Tap both 'طلبات' and 'خدمات نشطة' cards and confirm both currently navigate to company-requests.",
          "Cross-check office-home.tsx for the identical hardcoded-stats pattern (see mobile-office-dashboard-mock-data) since both dashboards share the same component structure.",
        ],
        ar: [
          "قارن بين حسابَي اختبار شركة مختلفَين بمستويات نشاط مختلفة فعلياً، وتأكد أن أرقام اللوحة الرئيسية متطابقة بينهما — إن كان كذلك، فهذا يؤكد أنها ثابتة.",
          "اضغط بطاقتَي 'طلبات' و'خدمات نشطة' وتأكد أن كلتيهما تنقل حالياً إلى company-requests.",
          "تحقق من وجود نفس نمط الإحصاءات الثابتة في office-home.tsx (راجع mobile-office-dashboard-mock-data) لأن اللوحتين تشتركان في نفس بنية المكوّن.",
        ],
      },
    },
    {
      id: "mobile-company-more-dead-actions",
      title: {
        en: "Company profile 'معاينة' (Preview) and 'مشاركة' (Share) buttons have no onPress handler at all",
        ar: "زرّا 'معاينة' و'مشاركة' في ملف الشركة الشخصي بلا أي معالج onPress إطلاقاً",
      },
      priority: "P2",
      endUserStory: {
        en: "As a company user, I want to preview how my company profile looks to the public and easily share it, so that I can check my presentation and promote my business without leaving the app.",
        ar: "بصفتي مستخدم شركة، أريد معاينة شكل ملف شركتي أمام الجمهور ومشاركته بسهولة، حتى أتحقق من طريقة عرضي وأروّج لعملي دون مغادرة التطبيق.",
      },
      story: {
        en: "Verify that on company-more.tsx's profile header card, the 'معاينة' (Preview) and 'مشاركة' (Share) buttons render with no onPress prop whatsoever — only 'تعديل' (Edit) actually navigates anywhere (to /edit-profile). Document this dead-button gap ahead of the gate lifting, rather than letting it be discovered fresh as 'nothing happens when I tap Preview.'",
        ar: "تحقق من أن زرّي 'معاينة' و'مشاركة' في بطاقة رأس الملف الشخصي في company-more.tsx يُعرضان دون أي خاصية onPress إطلاقاً — وأن 'تعديل' فقط هو من ينقل فعلياً إلى مكان ما (إلى /edit-profile). وثّق نقص هذين الزرّين الميتين قبل إلغاء القفل، لا أن يُكتشف من جديد على أنه 'لا يحدث شيء عند الضغط على معاينة'.",
      },
      acceptanceCriteria: {
        en: [
          "Tapping 'معاينة' does nothing — no navigation, no modal, no console log, no crash.",
          "Tapping 'مشاركة' does nothing for the same reason.",
          "'تعديل' correctly navigates to /edit-profile and is the only one of the three action buttons that's wired up.",
        ],
        ar: [
          "الضغط على 'معاينة' لا يفعل شيئاً — لا تنقّل، ولا نافذة منبثقة، ولا console log، ولا تعطّل.",
          "الضغط على 'مشاركة' لا يفعل شيئاً للسبب نفسه.",
          "'تعديل' ينقل بشكل صحيح إلى /edit-profile وهو الزر الوحيد من الأزرار الثلاثة المفعَّل فعلياً.",
        ],
      },
      testScenarios: {
        en: [
          "Tap all three action buttons on the company profile card in sequence and confirm only Edit does anything.",
          "Repeat on office-more.tsx (see mobile-office-more-dead-actions) since the identical three-button row is duplicated there.",
          "Flag to product whether Preview/Share are meant to ship in the release that lifts the gate, or were intentionally left unwired for a later phase.",
        ],
        ar: [
          "اضغط الأزرار الثلاثة بالترتيب على بطاقة ملف الشركة وتأكد أن 'تعديل' فقط هو من يفعل شيئاً.",
          "كرر الاختبار على office-more.tsx (راجع mobile-office-more-dead-actions) لأن نفس صف الأزرار الثلاثة مكرر هناك.",
          "أبلغ فريق المنتج ما إذا كان من المفترض أن يعمل معاينة/مشاركة في الإصدار الذي يرفع القفل، أم أنهما تُركا عمداً دون ربط لمرحلة لاحقة.",
        ],
      },
    },
    {
      id: "mobile-company-coming-soon-menu-items",
      title: {
        en: "'فريق العمل' and 'التحليلات' menu items are explicit 'قريباً' stubs (expected, not a bug)",
        ar: "عنصرا القائمة 'فريق العمل' و'التحليلات' نماذج 'قريباً' صريحة (متوقعة، وليست خطأ)",
      },
      priority: "P2",
      endUserStory: {
        en: "As a company user, I want to eventually manage my team members and see analytics about my listings' performance, so that I can run my business operations from within the app.",
        ar: "بصفتي مستخدم شركة، أريد في النهاية إدارة أعضاء فريقي ورؤية تحليلات أداء إعلاناتي، حتى أتمكن من إدارة عمليات عملي من داخل التطبيق.",
      },
      story: {
        en: "Confirm that company-more.tsx's 'إدارة الشركة' section deliberately shows an Alert.alert('قريباً', ...) for 'فريق العمل' (Team) and 'التحليلات' (Analytics) rather than navigating anywhere. Track these as intentional not-yet-built placeholders, never mistaken for broken navigation.",
        ar: "تأكد من أن قسم 'إدارة الشركة' في company-more.tsx يعرض عمداً Alert.alert('قريباً', ...) لكل من 'فريق العمل' و'التحليلات' بدلاً من التنقّل إلى أي مكان. تتبّع هذين العنصرين كنموذجين غير مبنيين بعد ومقصودين، ولا تخلطهما أبداً بتنقّل معطوب.",
      },
      acceptanceCriteria: {
        en: [
          "Tapping 'فريق العمل' shows an alert reading 'ميزة فريق العمل ستكون متوفرة قريباً' and nothing else happens.",
          "Tapping 'التحليلات' shows an alert reading 'ميزة التحليلات ستكون متوفرة قريباً' and nothing else happens.",
          "Every other menu item in company-more (chat, favorites, notifications, reviews, plans, account-balance, invoices, settings, about, faq, contact, privacy, terms) navigates to a real shared screen — confirm none of those are silently broken alongside these two intentional stubs.",
        ],
        ar: [
          "الضغط على 'فريق العمل' يعرض تنبيهاً نصه 'ميزة فريق العمل ستكون متوفرة قريباً' ولا يحدث شيء آخر.",
          "الضغط على 'التحليلات' يعرض تنبيهاً نصه 'ميزة التحليلات ستكون متوفرة قريباً' ولا يحدث شيء آخر.",
          "كل عنصر آخر في قائمة company-more (المحادثات، المفضلة، الإشعارات، التقييمات، الباقات، رصيد الحساب، الفواتير، الإعدادات، عن التطبيق، الأسئلة الشائعة، تواصل معنا، الخصوصية، الشروط) ينقل إلى شاشة مشتركة حقيقية — تأكد أن أياً منها ليس معطوباً بصمت إلى جانب هذين النموذجين المقصودين.",
        ],
      },
      testScenarios: {
        en: [
          "Tap every menu item in company-more.tsx once and record which ones show the 'قريباً' alert (expected: exactly 2) versus which navigate (expected: everything else).",
          "Confirm the alert text is grammatically correct Arabic, not a placeholder/lorem string.",
          "Cross-check against office-more.tsx's larger set of 4 'قريباً' items (see mobile-office-coming-soon-menu-items) to make sure the two lists don't diverge in unrelated, unintentional ways.",
        ],
        ar: [
          "اضغط كل عنصر في قائمة company-more.tsx مرة واحدة، وسجّل أي العناصر يعرض تنبيه 'قريباً' (المتوقع: عنصران بالضبط) وأيها ينقل فعلياً (المتوقع: كل الباقي).",
          "تأكد أن نص التنبيه عربي سليم نحوياً، لا نص عنصر نائب (placeholder/lorem).",
          "تحقق من مجموعة office-more.tsx الأكبر المكوّنة من 4 عناصر 'قريباً' (راجع mobile-office-coming-soon-menu-items) للتأكد أن القائمتين لا تختلفان بشكل غير مقصود وغير مرتبط.",
        ],
      },
    },
    {
      id: "mobile-company-requests-empty",
      title: {
        en: "Company Requests tab is permanently empty regardless of filter (known gap)",
        ar: "تبويب طلبات الشركة فارغ دائماً بغض النظر عن الفلتر (نقص معروف)",
      },
      priority: "P1",
      endUserStory: {
        en: "As a company user, I want to see and manage the service requests customers send me, filtered by their status, so that I can respond to leads and track my pipeline.",
        ar: "بصفتي مستخدم شركة، أريد رؤية وإدارة طلبات الخدمة التي يرسلها لي العملاء، مصنّفة حسب حالتها، حتى أتمكن من الرد على العملاء المحتملين وتتبّع مسار أعمالي.",
      },
      story: {
        en: "Verify that company-requests.tsx renders its all/pending/accepted/completed filter pills but the list stays empty no matter which is selected. Track this known frontend/backend wiring gap explicitly, and re-verify once real request data is wired in.",
        ar: "تحقق من أن company-requests.tsx يعرض شرائح الفلترة (الكل/قيد الانتظار/مقبول/مكتمل) لكن القائمة تبقى فارغة أياً كان الفلتر المختار. تتبّع هذا النقص المعروف في الربط بين الواجهة الأمامية والخلفية صراحةً، وأعد التحقق منه بمجرد ربط بيانات طلبات حقيقية.",
      },
      acceptanceCriteria: {
        en: [
          "All 4 filter pills (all/pending/accepted/completed) render and are tappable.",
          "The list beneath stays empty for every filter — expected today.",
          "The screen settles into a clear empty state rather than an infinite spinner or crash.",
        ],
        ar: [
          "شرائح الفلترة الأربع (الكل/قيد الانتظار/مقبول/مكتمل) تُعرض جميعها وقابلة للضغط.",
          "القائمة أسفلها تبقى فارغة لكل فلتر — وهذا متوقع حالياً.",
          "الشاشة تستقر على حالة فارغة واضحة، لا مؤشر تحميل لا ينتهي أو تعطّل.",
        ],
      },
      testScenarios: {
        en: [
          "Tap through all 4 filter pills and confirm each renders the same empty state.",
          "Navigate to company-requests both from the Company Home stats card and from wherever it's reachable in navigation, and confirm behavior is identical from both entry points.",
          "Re-run this check once backend wiring lands and flip the acceptance criteria to expect real data.",
        ],
        ar: [
          "اضغط عبر شرائح الفلترة الأربع جميعها وتأكد أن كل واحدة تعرض نفس الحالة الفارغة.",
          "انتقل إلى company-requests من بطاقة إحصاءات الشركة الرئيسية ومن أي مكان آخر يمكن الوصول منه، وتأكد أن السلوك متطابق من كلا المدخلين.",
          "أعد هذا الاختبار بمجرد ربط الواجهة الخلفية، وعدّل معايير القبول لتتوقع بيانات حقيقية.",
        ],
      },
    },
    {
      id: "mobile-company-add-tab-empty",
      title: {
        en: "Company '+' tab renders a completely blank screen (not even a redirect)",
        ar: "تبويب '+' للشركة يعرض شاشة فارغة تماماً (بلا حتى إعادة توجيه)",
      },
      priority: "P2",
      endUserStory: {
        en: "As a company user, I want a clear '+' action to create a new listing, service, or offer, so that I have an obvious way to add new content to my profile.",
        ar: "بصفتي مستخدم شركة، أريد إجراء '+' واضح لإنشاء إعلان أو خدمة أو عرض جديد، حتى تكون لدي طريقة واضحة لإضافة محتوى جديد إلى ملفي الشخصي.",
      },
      story: {
        en: "Flag that (company)/add.tsx is a literal `return <View />;` — a blank screen with no content, no redirect, and no action sheet — unlike the individual role's '+' button, which opens a real action sheet (Add Ad / Add Alert / Request Quote per docs/flows/guest-flow.md). If a company user ever taps '+' once the gate lifts, don't mistake this genuinely blank screen for a rendering bug — it is the current implementation as written.",
        ar: "لاحظ أن (company)/add.tsx هو حرفياً `return <View />;` — شاشة فارغة بلا محتوى ولا إعادة توجيه ولا شاشة إجراءات — بخلاف زر '+' لدور الفرد الذي يفتح شاشة إجراءات حقيقية (إضافة إعلان / إضافة تنبيه / طلب عرض سعر حسب docs/flows/guest-flow.md). إذا ضغط مستخدم شركة على '+' بمجرد رفع القفل، لا تفترض أن الشاشة الفارغة تماماً خطأ في العرض — فهي التنفيذ الحالي كما هو مكتوب فعلياً.",
      },
      acceptanceCriteria: {
        en: [
          "Tapping the '+' tab as a Company identity renders a blank screen with no visible content or action.",
          "Nothing crashes and no console error is thrown — it's empty, not unstable.",
          "This must be revisited before the gate lifts — shipping a genuinely blank tab to real company users would be a real regression, not just a documentation footnote.",
        ],
        ar: [
          "الضغط على تبويب '+' كهوية شركة يعرض شاشة فارغة دون أي محتوى أو إجراء مرئي.",
          "لا يحدث أي تعطّل ولا خطأ console — الشاشة فارغة فقط، لا غير مستقرة.",
          "يجب مراجعة هذا قبل رفع القفل — نشر تبويب فارغ تماماً لمستخدمي شركات حقيقيين سيكون تراجعاً فعلياً، لا مجرد ملاحظة توثيقية.",
        ],
      },
      testScenarios: {
        en: [
          "Tap the '+' tab as a Company identity and confirm literally nothing renders beyond a blank screen.",
          "Compare directly against the Individual role's '+' action sheet to make the gap concrete for a ticket.",
          "Repeat for Office (see mobile-office-add-tab-empty) since (office)/add.tsx has the identical empty stub.",
        ],
        ar: [
          "اضغط تبويب '+' كهوية شركة وتأكد أنه لا يُعرض حرفياً أي شيء عدا شاشة فارغة.",
          "قارن مباشرة بشاشة إجراءات '+' الخاصة بدور الفرد لتوضيح الفجوة بشكل ملموس عند فتح تذكرة.",
          "كرر الاختبار للمكتب العقاري (راجع mobile-office-add-tab-empty) لأن (office)/add.tsx يحتوي نفس النموذج الفارغ تماماً.",
        ],
      },
    },
  ],
};
