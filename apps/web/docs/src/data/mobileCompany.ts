import { DocSection } from "./types";

export const mobileCompany: DocSection = {
  slug: "mobile-company",
  title: { en: "Mobile — Company", ar: "الجوال — الشركة" },
  summary: {
    en: "The (company) route group (company-home, company-more, company-chats, company-requests) — live in every build (see mobile-company-office-gate). Some parts still show mock data (tracked in the stories below); the server-side company rules (one per account, unique licence, approval before publishing) are in API → api-persona-rules.",
    ar: "مجموعة مسارات (company) (company-home و company-more و company-chats و company-requests) — مفعّلة في كل النسخ (راجع mobile-company-office-gate). بعض الأجزاء ما زالت تعرض بيانات وهمية (موثّقة في القصص أدناه)؛ وقواعد الشركة في الخادم (واحدة لكل حساب، ترخيص فريد، اعتماد قبل النشر) في الواجهة البرمجية ← api-persona-rules.",
  },
  stories: [
    {
      id: "mobile-company-dashboard-mock-data",
      title: {
        en: "Company Home: views, billing and messages are live; requests are still mock data",
        ar: "رئيسية الشركة: المشاهدات والفوترة والرسائل حقيقية؛ والطلبات ما زالت بيانات وهمية",
      },
      priority: "P1",
      story: {
        en: "On (company)/home.tsx the stats grid's views come from GET /companies dashboard data, the billing banner from the company's plan, and new messages from the chat store — but the requests count and both request sections (company requests, public requests) still render COMPANY_REQUESTS_MOCK / PUBLIC_REQUESTS_MOCK. Verify the live parts and track the mock parts until they're wired to /company-requests/me.",
        ar: "في (company)/home.tsx تأتي مشاهدات شبكة الإحصاءات من بيانات لوحة الشركة، وشريط الفوترة من باقة الشركة، والرسائل الجديدة من مخزن المحادثات — لكن عدد الطلبات وقسمي الطلبات (طلبات الشركة والطلبات العامة) ما زالت تعرض COMPANY_REQUESTS_MOCK / PUBLIC_REQUESTS_MOCK. تحقق من الأجزاء الحقيقية وتابع الأجزاء الوهمية حتى تُربط بـ /company-requests/me.",
      },
      acceptanceCriteria: {
        en: [
          "Views and the billing banner match the company's real data.",
          "Unread messages match the Chats tab.",
          "The requests count and request sections are known mock data — not reported as wrong numbers until wired.",
        ],
        ar: [
          "المشاهدات وشريط الفوترة يطابقان بيانات الشركة الحقيقية.",
          "الرسائل غير المقروءة تطابق تبويب المحادثات.",
          "عدد الطلبات وأقسامها بيانات وهمية معروفة — لا تُبلَّغ كأرقام خاطئة حتى تُربط.",
        ],
      },
      testScenarios: {
        en: [
          "With the flag on, compare Home's views with the company's ads, and send the company a message — the unread count goes up.",
        ],
        ar: [
          "مع تفعيل المفتاح قارن مشاهدات الرئيسية بإعلانات الشركة، وأرسل رسالة للشركة — يزداد عدد غير المقروءة.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-company-more-actions",
      title: {
        en: "Company profile: Preview and Share work",
        ar: "ملف الشركة: المعاينة والمشاركة تعملان",
      },
      priority: "P2",
      story: {
        en: "Regression check for a fixed gap: on company-more.tsx, 'معاينة' opens the company's public profile (/company/:id) and 'مشاركة' opens the native share sheet; 'تعديل' opens /company-edit-profile.",
        ar: "فحص تراجع لفجوة تم إصلاحها: في company-more.tsx يفتح 'معاينة' الملف العام للشركة (/company/:id) ويفتح 'مشاركة' نافذة المشاركة في الجهاز، ويفتح 'تعديل' /company-edit-profile.",
      },
      acceptanceCriteria: {
        en: [
          "Preview shows the same profile other users see.",
          "Share opens the share sheet with the company's link.",
          "Edit opens the edit form.",
        ],
        ar: [
          "المعاينة تعرض نفس الملف الذي يراه الآخرون.",
          "المشاركة تفتح نافذة المشاركة برابط الشركة.",
          "التعديل يفتح نموذج التعديل.",
        ],
      },
      testScenarios: {
        en: [
          "Tap each of the three buttons on the company More tab.",
        ],
        ar: [
          "اضغط كل زر من الأزرار الثلاثة في تبويب المزيد للشركة.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-company-requests",
      title: {
        en: "Company Requests list real requests, and nothing while under review",
        ar: "طلبات الشركة تعرض طلبات حقيقية، ولا شيء أثناء المراجعة",
      },
      priority: "P0",
      story: {
        en: "Verify company-requests.tsx loads GET /company-requests/me (directed and public requests) with its filters, lets the company open a request, accept it and mark it responded. A company still under review gets an empty list (see api-persona-rules).",
        ar: "تحقق من أن company-requests.tsx يحمّل GET /company-requests/me (الطلبات الموجهة والعامة) مع الفلاتر، ويسمح للشركة بفتح الطلب وقبوله وتعليمه كتم الرد. الشركة قيد المراجعة تحصل على قائمة فارغة (راجع api-persona-rules).",
      },
      acceptanceCriteria: {
        en: [
          "A request sent to the company appears under its filter; accepting it moves it to accepted.",
          "Accepting a public request another company already took is refused.",
          "A pending company sees no requests at all.",
        ],
        ar: [
          "الطلب المرسل للشركة يظهر تحت الفلتر المناسب؛ وقبوله ينقله إلى المقبولة.",
          "قبول طلب عام أخذته شركة أخرى يُرفض.",
          "الشركة قيد المراجعة لا ترى أي طلبات.",
        ],
      },
      testScenarios: {
        en: [
          "From an individual account send a quote request to an approved company; accept it from the company.",
        ],
        ar: [
          "من حساب فرد أرسل طلب عرض سعر لشركة معتمدة؛ ثم اقبله من الشركة.",
        ],
      },
      updatedIn: "feat/docs-platform",
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
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-company-service-invoices",
      title: {
        en: "Company فواتير الخدمات: issue to a client from an accepted request, track and mark paid",
        ar: "فواتير الخدمات للشركة: الإصدار لعميل من طلب مقبول والمتابعة وتأكيد الدفع",
      },
      priority: "P1",
      story: {
        en: "Verify company More → فواتير الخدمات opens the list of invoices the company issued (same list, search, sort and details as the client) with '+ فاتورة جديدة'. In اصدار فاتورة the العميل field lists the company's accepted requests (client name and request title): picking one sends the invoice to that client's account; typing a name instead is allowed but warns 'لن تصل الفاتورة لحساب العميل في التطبيق'. In the details sheet the company has تحميل / مشاركة and 'تم الدفع' (until paid), which records the payment date and notifies the client.",
        ar: "تحقق من أن المزيد للشركة ← فواتير الخدمات يفتح قائمة الفواتير التي أصدرتها (نفس القائمة والبحث والترتيب والتفاصيل كالعميل) مع '+ فاتورة جديدة'. في اصدار فاتورة يعرض حقل العميل الطلبات المقبولة للشركة (اسم العميل وعنوان الطلب): اختيار أحدها يرسل الفاتورة لحساب ذلك العميل؛ ويمكن كتابة اسم بدلاً من ذلك مع تنبيه 'لن تصل الفاتورة لحساب العميل في التطبيق'. في نافذة التفاصيل لدى الشركة تحميل / مشاركة و'تم الدفع' (حتى الدفع)، الذي يسجّل تاريخ الدفع ويُشعر العميل.",
      },
      acceptanceCriteria: {
        en: [
          "Only the company's accepted requests are offered as clients; with none, a hint explains it.",
          "An invoice from a picked request appears in that client's فواتير الخدمات; a typed-name one doesn't.",
          "The card shows who it was billed to (service • client).",
          "'تم الدفع' disappears after use and the card shows 'تم الدفع في'.",
          "The company can't delete issued invoices (no حذف).",
        ],
        ar: [
          "تُعرض فقط الطلبات المقبولة للشركة كعملاء؛ وإن لم توجد يظهر تلميح يشرح ذلك.",
          "الفاتورة من طلب مختار تظهر في فواتير الخدمات لذلك العميل؛ والمكتوبة باسم لا تظهر.",
          "البطاقة تعرض لمن صدرت (الخدمة • العميل).",
          "'تم الدفع' يختفي بعد استخدامه وتعرض البطاقة 'تم الدفع في'.",
          "لا يمكن للشركة حذف الفواتير الصادرة (لا يوجد حذف).",
        ],
      },
      testScenarios: {
        en: [
          "Accept a request, then + فاتورة جديدة: the client appears under العميل; pick it, add items, send.",
          "Issue one more with a typed name — the warning shows; it's listed for the company only.",
          "Open the first invoice and tap تم الدفع — the button goes away and the client is notified.",
        ],
        ar: [
          "اقبل طلباً ثم + فاتورة جديدة: يظهر العميل تحت العميل؛ اختره وأضف البنود وأرسل.",
          "أصدر فاتورة أخرى باسم مكتوب — يظهر التنبيه؛ وتظهر للشركة فقط.",
          "افتح الفاتورة الأولى واضغط تم الدفع — يختفي الزر ويُشعَر العميل.",
        ],
      },
      updatedIn: "feat/service-invoices",
    },
  ],
};
