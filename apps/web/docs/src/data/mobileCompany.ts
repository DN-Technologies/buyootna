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
        en: "Company More: profile card shows real data with a single edit button (Figma 4410:159562)",
        ar: "المزيد للشركة: بطاقة الملف تعرض بيانات حقيقية مع زر تعديل واحد (فيجما 4410:159562)",
      },
      priority: "P2",
      story: {
        en: "Implements Figma node 4410:159562: CompanyProfileCard shows the company's real name, verified badge, persona pill, bio and HQ location only when the data exists, with a single full-width 'تعديل' button (preview/share buttons were removed per the design); the chats badge shows the real unread count and is hidden when it's zero; 'تعديل' opens /company-edit-profile.",
        ar: "تطبيق تصميم فيجما 4410:159562: بطاقة CompanyProfileCard تعرض اسم الشركة الحقيقي وشارة التحقق ومحدد الصفة والنبذة والمقر الرئيسي فقط عند توفر البيانات، مع زر 'تعديل' واحد بعرض كامل (أُزيل زرا المعاينة والمشاركة وفق التصميم)؛ وتُظهر شارة المحادثات عدد غير المقروء الحقيقي وتختفي عند صفر؛ و'تعديل' يفتح /company-edit-profile.",
      },
      acceptanceCriteria: {
        en: [
          "The card renders only the rows that have data — no design-sample fallback text (name/bio/location come from the active identity).",
          "A single full-width 'تعديل' button opens /company-edit-profile; 'معاينة' and 'مشاركة' no longer appear.",
          "The chats badge shows the real unread count and disappears when it's zero.",
          "Unit tests in CompanyProfileCard.spec.tsx and company-more.spec.tsx pass.",
        ],
        ar: [
          "تُعرض البطاقة بصفوفها التي لها بيانات فقط — دون نصوص نموذجية بديلة (الاسم والنبذة والموقع من هوية الشركة النشطة).",
          "زر 'تعديل' واحد بعرض كامل يفتح /company-edit-profile؛ ولا يظهر 'معاينة' أو 'مشاركة'.",
          "شارة المحادثات تعرض عدد غير المقروء الحقيقي وتختفي عند صفر.",
          "نجاح اختبارات الوحدة في CompanyProfileCard.spec.tsx و company-more.spec.tsx.",
        ],
      },
      testScenarios: {
        en: [
          "Open the company More tab: only 'تعديل' shows on the card; tapping it opens the edit form.",
          "Clear the company's bio/HQ location in the API and reopen the tab — those rows are hidden, not sample text.",
          "Read all chats, reopen the tab — the red badge is gone.",
        ],
        ar: [
          "افتح تبويب المزيد للشركة: يظهر 'تعديل' فقط على البطاقة؛ وضغطه يفتح نموذج التعديل.",
          "احذف نبذة الشركة/مقرها من الواجهة البرمجية وأعد فتح التبويب — تختفي تلك الصفوف ولا يظهر نص نموذجي.",
          "اقرأ كل المحادثات وأعد فتح التبويب — تختفي الشارة الحمراء.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
    {
      id: "mobile-company-edit-profile-figma",
      title: {
        en: "Company Edit Profile screen matches Figma 4410:159865 & 4410:162275 with real data and neutral placeholders",
        ar: "شاشة تعديل الملف الشخصي للشركة تطابق فيجما 4410:159865 و 4410:162275 ببيانات حقيقية وم placeholders محايدة",
      },
      priority: "P1",
      endUserStory: {
        en: "As a company user, I want a dedicated edit profile screen with sections for company info and commercial licence upload, so that I can keep my company details accurate and verify my account.",
        ar: "بصفتي مستخدم شركة، أريد شاشة تعديل ملف شخصي مخصصة مع أقسام لمعلومات الشركة ورفع السجل التجاري، حتى أُبقي بيانات شركتي دقيقة وأوثق حسابي.",
      },
      story: {
        en: "Implements Figma nodes 4410:159865 (disabled save) and 4410:162275 (active save): header with back button and title ('تعديل الملف الشخصي'); logo upload with camera button; section 'عن الشركة' (name, email, phone with +965, whatsapp with +965, HQ location with pin, service areas selector, about textarea, working hours with calendar icon); section 'الرخصة' (activity selector, licence number, expiry date with date picker, licence image dropzone with 'صورة الرخصة تؤهلك لتوثيق حسابك'); and sticky bottom 'حفظ التغييرات' button. Fields initialize from real identity data only — design-sample values (fake licence number/expiry, sample bio) were removed and replaced with neutral placeholders. The save is fully wired: a changed phone is proven with an SMS code and a new email with an emailed code BEFORE anything saves (the same rule as the individual edit-profile); user fields then go to PATCH /users/profile and company/licence fields (with any picked logo/licence files) go to PATCH /identities/:id as multipart — the profile endpoint rejects unknown properties with a 400, so licence fields must never go there.",
        ar: "تطبيق تصميمي فيجما 4410:159865 (حفظ معطل) و 4410:162275 (حفظ نشط): الترويسة مع زر الرجوع والعنوان ('تعديل الملف الشخصي')؛ رفع الشعار مع زر الكاميرا؛ قسم 'عن الشركة' (الاسم، البريد، الهاتف مع +965، الواتساب مع +965، المقر الرئيسي مع أيقونة الموقع، محدد مناطق الخدمة، نبذة، ومواعيد العمل بأيقونة التقويم)؛ قسم 'الرخصة' (محدد النشاط، رقم الرخصة، تاريخ الانتهاء مع محدد التاريخ، منطقة رفع صورة الرخصة مع عبارة 'صورة الرخصة تؤهلك لتوثيق حسابك')؛ وزر 'حفظ التغييرات' الثابت في الأسفل. تُهيأ الحقول من بيانات الهوية الحقيقية فقط — أُزيلت القيم النموذجية (رقم/تاريخ رخصة وهمي، نبذة تجريبية) واستُبدلت بم placeholders محايدة. الحفظ موصول بالكامل: رقم الهاتف الجديد يُثبت برمز SMS والبريد الجديد برمز مُرسل قبل حفظ أي شيء (نفس قاعدة شاشة تعديل الفرد)؛ ثم تُرسل حقول المستخدم إلى PATCH /users/profile وتُرسل حقول الشركة/الرخصة (مع ملفات الشعار/الرخصة المختارة) إلى PATCH /identities/:id كـ multipart — نقطة الملف الشخصي ترفض الخصائص غير المعروفة بخطأ 400، فلا يجوز إرسال حقول الرخصة إليها أبداً.",
      },
      acceptanceCriteria: {
        en: [
          "Empty fields show neutral Arabic placeholders (#979797) — never the design's sample data.",
          "'حفظ التغييرات' is disabled (grey #A6A6A6) when pristine and active (#15304D) once anything changes.",
          "A changed phone opens the SMS code sheet (request to /users/account/phone/request-otp with the +965 number) and nothing saves until the code verifies; a new email surfaces 'ارسال رمز التحقق' and saving is blocked with an alert until its code verifies.",
          "Saving calls PATCH /users/profile with user fields only (no licence fields) and PATCH /identities/:id as multipart with the changed company/licence fields and any picked logo/licence files.",
          "PATCH /identities/:id accepts multipart (logo, license) like POST /identities/company; uploaded files land in company-logos/company-licenses and a failed write deletes them.",
          "Unit tests in CompanyEditProfile.spec.tsx and identities.service.spec.tsx pass.",
        ],
        ar: [
          "الحقول الفارغة تعرض placeholders عربية محايدة (#979797) — وليس بيانات التصميم النموذجية أبداً.",
          "'حفظ التغييرات' معطل (رمادي #A6A6A6) عند عدم التغيير ونشط (#15304D) عند تعديل أي حقل.",
          "تغيير رقم الهاتف يفتح نافذة رمز SMS (طلب إلى /users/account/phone/request-otp بالرقم +965) ولا يُحفظ شيء حتى التحقق؛ والبريد الجديد يظهر رابط 'ارسال رمز التحقق' ويُمنع الحفظ بتنبيه حتى التحقق برمزه.",
          "الحفظ يستدعي PATCH /users/profile بحقول المستخدم فقط (بدون حقول الرخصة) و PATCH /identities/:id كـ multipart بحقول الشركة/الرخصة المتغيرة وملفات الشعار/الرخصة المختارة.",
          "نقطة PATCH /identities/:id تقبل multipart (logo، license) مثل POST /identities/company؛ وتُرفع الملفات إلى company-logos/company-licenses وتُحذف إذا فشل الحفظ.",
          "نجاح اختبارات الوحدة في CompanyEditProfile.spec.tsx و identities.service.spec.tsx.",
        ],
      },
      testScenarios: {
        en: [
          "Open /company-edit-profile for a company with empty licence fields — placeholders show and save is disabled.",
          "Change the licence number and save — the profile PATCH carries no licence fields and /identities/:id receives the change.",
          "Change the phone number and save — the SMS sheet opens first; enter the code and the save completes.",
          "Change the email and save — blocked with an alert until 'ارسال رمز التحقق' + code.",
          "Attach a new logo/licence image and save — the files land on the identity; a forced write failure removes them from storage.",
        ],
        ar: [
          "افتح /company-edit-profile لشركة بحقول رخصة فارغة — تظهر placeholders ويكون الحفظ معطلاً.",
          "غيّر رقم الرخصة واحفظ — لا تحمل استدعاء الملف الشخصي حقول الرخصة، وتستقبلها نقطة /identities/:id.",
          "غيّر رقم الهاتف واحفظ — تُفتح نافذة رمز SMS أولاً؛ أدخل الرمز فيكتمل الحفظ.",
          "غيّر البريد الإلكتروني واحفظ — يُمنع الحفظ بتنبيه حتى 'ارسال رمز التحقق' + الرمز.",
          "أرفق شعاراً/صورة رخصة جديدة واحفظ — تصل الملفات إلى الهوية؛ وعند إخفاق الكتابة يُحذفان من التخزين.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
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
        en: "Verify company More → فواتير الخدمات opens the list of invoices the company issued (same list, search, sort and details as the client) with '+ فاتورة جديدة'. In اصدار فاتورة the العميل pill ('ابحث عن عميل...') opens a bottom sheet listing the company's accepted requests (client name and request title): picking one sends the invoice to that client's account; typing a name instead is allowed but warns 'لن تصل الفاتورة لحساب العميل في التطبيق'. The receipt review shows the optional كفالة الخدمة (ضمان) months row when set. After sending, the success sheet's 'عرض الفواتير' opens the invoices list. In the details sheet the company has تحميل / مشاركة and 'تم الدفع' (until paid), which records the payment date and notifies the client.",
        ar: "تحقق من أن المزيد للشركة ← فواتير الخدمات يفتح قائمة الفواتير التي أصدرتها (نفس القائمة والبحث والترتيب والتفاصيل كالعميل) مع '+ فاتورة جديدة'. في اصدار فاتورة يفتح حقل العميل ('ابحث عن عميل...') نافذة سفلية تعرض الطلبات المقبولة للشركة (اسم العميل وعنوان الطلب): اختيار أحدها يرسل الفاتورة لحساب ذلك العميل؛ ويمكن كتابة اسم بدلاً من ذلك مع تنبيه 'لن تصل الفاتورة لحساب العميل في التطبيق'. تعرض شاشة المراجعة سطر كفالة الخدمة (ضمان) بالشهور عند إدخاله. بعد الإرسال يفتح زر 'عرض الفواتير' في نافذة النجاح قائمة الفواتير. في نافذة التفاصيل لدى الشركة تحميل / مشاركة و'تم الدفع' (حتى الدفع)، الذي يسجّل تاريخ الدفع ويُشعر العميل.",
      },
      acceptanceCriteria: {
        en: [
          "The العميل pill opens a bottom sheet listing only the company's accepted requests; with none, a hint explains it.",
          "An invoice from a picked request appears in that client's فواتير الخدمات; a typed-name one doesn't.",
          "The review receipt shows the كفالة الخدمة (ضمان) months row only when it was filled in.",
          "'عرض الفواتير' on the success sheet opens the company's فواتير الخدمات list.",
          "The card shows who it was billed to (service • client).",
          "'تم الدفع' disappears after use and the card shows 'تم الدفع في'.",
          "The company can't delete issued invoices (no حذف).",
        ],
        ar: [
          "يفتح حقل العميل نافذة سفلية تعرض فقط الطلبات المقبولة للشركة؛ وإن لم توجد يظهر تلميح يشرح ذلك.",
          "الفاتورة من طلب مختار تظهر في فواتير الخدمات لذلك العميل؛ والمكتوبة باسم لا تظهر.",
          "تعرض شاشة المراجعة سطر كفالة الخدمة (ضمان) بالشهور فقط عند إدخاله.",
          "'عرض الفواتير' في نافذة النجاح تفتح قائمة فواتير الخدمات للشركة.",
          "البطاقة تعرض لمن صدرت (الخدمة • العميل).",
          "'تم الدفع' يختفي بعد استخدامه وتعرض البطاقة 'تم الدفع في'.",
          "لا يمكن للشركة حذف الفواتير الصادرة (لا يوجد حذف).",
        ],
      },
      testScenarios: {
        en: [
          "Accept a request, then + فاتورة جديدة: tap the العميل pill, pick the client from the sheet, add items, review (warranty row shows if months were entered) and send.",
          "Issue one more with a typed name — the warning shows; it's listed for the company only.",
          "After sending, tap عرض الفواتير — the invoices list opens.",
          "Open the first invoice and tap تم الدفع — the button goes away and the client is notified.",
        ],
        ar: [
          "اقبل طلباً ثم + فاتورة جديدة: اضغط حقل العميل واختر العميل من النافذة، أضف البنود، راجع (يظهر سطر الكفالة إذا أُدخلت الشهور) وأرسل.",
          "أصدر فاتورة أخرى باسم مكتوب — يظهر التنبيه؛ وتظهر للشركة فقط.",
          "بعد الإرسال اضغط عرض الفواتير — تُفتح قائمة الفواتير.",
          "افتح الفاتورة الأولى واضغط تم الدفع — يختفي الزر ويُشعَر العميل.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
  ],
};
