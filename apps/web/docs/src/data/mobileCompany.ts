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
      id: "mobile-company-add-service-specialty-types",
      title: {
        en: "إضافة خدمة: specialty, service types and saved services",
        ar: "إضافة خدمة: التخصص وأنواع الخدمة وحفظ الخدمات",
      },
      priority: "P1",
      story: {
        en: "The company's إضافة خدمة form now follows the design. التخصص is one choice from 32 specialties. نوع الخدمة is a checklist that depends on the specialty: مكتب هندسي has 13 listed types plus الكل and اخرى; every other specialty offers الكل and اخرى. الكل ticks all listed types. Ticking اخرى reveals عنوان الخدمة, which is then required. الوصف is optional, up to 100 characters. Each chosen type is saved as its own service (before, saving replaced the company's whole services text). The company's first service fixes its specialty: from then on التخصص is shown greyed and cannot be changed. The home's خدمات نشطة figure counts the saved services.",
        ar: "أصبح نموذج إضافة خدمة للشركة مطابقاً للتصميم. التخصص اختيار واحد من 32 تخصصاً. نوع الخدمة قائمة اختيار تعتمد على التخصص: لمكتب هندسي 13 نوعاً مع الكل واخرى؛ ولكل تخصص آخر الكل واخرى فقط. الكل يحدد كل الأنواع المدرجة. تحديد اخرى يُظهر عنوان الخدمة ويصبح مطلوباً. الوصف اختياري حتى 100 حرف. يُحفظ كل نوع مختار كخدمة مستقلة (كان الحفظ سابقاً يستبدل نص خدمات الشركة كله). أول خدمة للشركة تثبّت تخصصها: بعدها يظهر التخصص باهتاً ولا يمكن تغييره. رقم خدمات نشطة في الرئيسية يعدّ الخدمات المحفوظة.",
      },
      acceptanceCriteria: {
        en: [
          "التخصص opens a list of 32 options; choosing one closes it and clears any chosen types.",
          "For مكتب هندسي, نوع الخدمة lists الكل, 13 types and اخرى with a checkbox on the right of each row; ticked rows turn navy.",
          "الكل ticks and unticks all listed types; the closed field then reads الكل.",
          "With اخرى ticked, عنوان الخدمة appears and إضافة الخدمة stays disabled until it is filled.",
          "إضافة الخدمة is disabled until a specialty and at least one type are chosen.",
          "After a successful save the sheet 'تمت إضافة الخدمة بنجاح!' offers عرض الخدمة and إضافة خدمة أخرى.",
          "A company that already has a service sees its التخصص greyed, without a chevron, and cannot open the list.",
          "Adding a type the company already offers does not duplicate it.",
        ],
        ar: [
          "التخصص يفتح قائمة من 32 خياراً؛ اختيار أحدها يغلقها ويمسح الأنواع المختارة.",
          "لمكتب هندسي تعرض نوع الخدمة الكل و13 نوعاً واخرى مع مربع اختيار على يمين كل صف؛ والصف المحدد يصبح كحلياً.",
          "الكل يحدد ويلغي كل الأنواع المدرجة؛ ويقرأ الحقل المغلق عندها الكل.",
          "عند تحديد اخرى يظهر عنوان الخدمة ويبقى إضافة الخدمة معطلاً حتى يُملأ.",
          "إضافة الخدمة معطل حتى يُختار تخصص ونوع واحد على الأقل.",
          "بعد الحفظ تعرض نافذة 'تمت إضافة الخدمة بنجاح!' زرّي عرض الخدمة وإضافة خدمة أخرى.",
          "الشركة التي لديها خدمة ترى التخصص باهتاً بلا سهم ولا تستطيع فتح القائمة.",
          "إضافة نوع موجود مسبقاً لدى الشركة لا تكرره.",
        ],
      },
      testScenarios: {
        en: [
          "As a new company: + → اضافة خدمة → مكتب هندسي → tick two types → إضافة الخدمة; reopen the form and check التخصص is locked.",
          "Tick اخرى, leave عنوان الخدمة empty (button disabled), then fill it and save.",
          "Pick a specialty other than مكتب هندسي and check only الكل and اخرى are offered.",
        ],
        ar: [
          "كشركة جديدة: + ← اضافة خدمة ← مكتب هندسي ← حدد نوعين ← إضافة الخدمة؛ أعد فتح النموذج وتحقق أن التخصص مقفل.",
          "حدد اخرى واترك عنوان الخدمة فارغاً (الزر معطل) ثم املأه واحفظ.",
          "اختر تخصصاً غير مكتب هندسي وتحقق أن المعروض الكل واخرى فقط.",
        ],
      },
      updatedIn: "feat/company-add-flows-figma",
    },
    {
      id: "mobile-company-add-flows-figma",
      title: {
        en: "Company + sheet, add project and invoice wizard match the design",
        ar: "نافذة + للشركة وإضافة مشروع ومعالج الفاتورة مطابقة للتصميم",
      },
      priority: "P2",
      story: {
        en: "Visual pass on the company's three + flows. The إضافة جديد sheet, the اضافة بند and اضافة خصم sheets share one header (title on the right, close on the left) and the design's icons. The form screens share a centred header with the back arrow on the right. اصدار فاتورة: the 'ابحث عن عميل...' pill now sits under the header on step 1 and العميل is a plain field (typing over a picked client unlinks it); the progress label reads خطوة 2/1 then 2/2; on step 2 the columns are right-aligned, the totals box has labels on the right and amounts on the left; the review receipt lists label on the right and value on the left, with the company's specialty under its name and the warranty line only when months were entered. The three success sheets use the same green-rosette sheet sized to its content.",
        ar: "تحسين بصري لمسارات + الثلاثة للشركة. نافذة إضافة جديد ونافذتا اضافة بند واضافة خصم تشترك في رأس واحد (العنوان يميناً والإغلاق يساراً) وأيقونات التصميم. شاشات النماذج تشترك في رأس متوسط العنوان وسهم الرجوع يميناً. اصدار فاتورة: حقل 'ابحث عن عميل...' أصبح تحت الرأس في الخطوة 1 والعميل حقل عادي (الكتابة فوق عميل مختار تفك ارتباطه)؛ نص التقدم خطوة 2/1 ثم 2/2؛ في الخطوة 2 الأعمدة محاذاة يميناً وصندوق الإجمالي تسمياته يميناً ومبالغه يساراً؛ إيصال المراجعة يعرض التسمية يميناً والقيمة يساراً مع تخصص الشركة تحت اسمها وسطر الكفالة فقط عند إدخال الشهور. نوافذ النجاح الثلاث تستخدم النافذة نفسها بحجم محتواها.",
      },
      acceptanceCriteria: {
        en: [
          "+ opens إضافة جديد with اضافة خدمة (navy), اصدار فاتورة and اضافة مشروع لمعرض الأعمال; each opens its screen.",
          "Step 1 of اصدار فاتورة shows the search pill above the progress bar; picking a client fills العميل.",
          "On step 2 the delete icon is on the left of each row and 'اضافة بند' has its + on the right.",
          "In اضافة بند the quantity + is on the right and − on the left; الاجمالي follows price × quantity.",
          "The review shows كفالة الخدمة (ضمان) only when a warranty was entered.",
          "Add project still requires a title, a description and 1 to 3 photos before نشر المشروع enables.",
        ],
        ar: [
          "+ يفتح إضافة جديد وفيها اضافة خدمة (كحلي) واصدار فاتورة واضافة مشروع لمعرض الأعمال؛ وكل منها يفتح شاشته.",
          "الخطوة 1 من اصدار فاتورة تعرض حقل البحث فوق شريط التقدم؛ واختيار عميل يملأ العميل.",
          "في الخطوة 2 أيقونة الحذف يسار كل صف و'اضافة بند' علامة + فيه يميناً.",
          "في اضافة بند زر + يميناً و− يساراً؛ والاجمالي يتبع السعر × الكمية.",
          "المراجعة تعرض كفالة الخدمة (ضمان) فقط عند إدخال كفالة.",
          "إضافة مشروع ما زالت تتطلب عنواناً ووصفاً ومن 1 إلى 3 صور قبل تفعيل نشر المشروع.",
        ],
      },
      testScenarios: {
        en: [
          "Issue an invoice end to end with two items, a discount and a 3-month warranty; check each step against the design.",
          "Publish a portfolio project with three photos.",
        ],
        ar: [
          "أصدر فاتورة كاملة ببندين وخصم وكفالة 3 شهور؛ وقارن كل خطوة بالتصميم.",
          "انشر مشروعاً في معرض الأعمال بثلاث صور.",
        ],
      },
      updatedIn: "feat/company-add-flows-figma",
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
      id: "mobile-company-home-figma-layout",
      title: {
        en: "Company home: layout, figures and cards as in the design",
        ar: "رئيسية الشركة: التخطيط والأرقام والبطاقات كما في التصميم",
      },
      priority: "P1",
      story: {
        en: "The company home now follows its Figma frames. Header: logo, 'مرحبا بك!' and the company name with its verified mark on the right, the bell on the left (the search button is gone). Four figures: خدمات نشطة, طلبات خاصة (requests sent to the company in the last 7 days), طلبات مقبولة and الرسائل الجديدة (unread messages). Under them at most one card: an overdue invoice notice, the trial countdown, 'استعرض الباقات' for a company without a plan, or 'اضافة خدمة' for a subscribed company without services; a company with a plan and services sees none. Then طلبات خاصة بالشركة and طلبات عامة as sideways lists of real requests (they were sample data before), up to five each; a list with no requests is not shown. The الخدمات, ads and latest conversations sections are no longer on the home.",
        ar: "أصبحت رئيسية الشركة مطابقة لتصميم Figma. الرأس: الشعار و'مرحبا بك!' واسم الشركة مع علامة التوثيق على اليمين والجرس على اليسار (أزيل زر البحث). أربعة أرقام: خدمات نشطة، طلبات خاصة (الطلبات المرسلة للشركة خلال آخر 7 أيام)، طلبات مقبولة، الرسائل الجديدة (الرسائل غير المقروءة). تحتها بطاقة واحدة على الأكثر: تنبيه فاتورة متأخرة، أو عدّاد النسخة التجريبية، أو 'استعرض الباقات' لشركة بلا باقة، أو 'اضافة خدمة' لشركة مشتركة بلا خدمات؛ والشركة التي لديها باقة وخدمات لا ترى أي بطاقة. ثم طلبات خاصة بالشركة وطلبات عامة كقائمتين أفقيتين من طلبات حقيقية (كانت بيانات تجريبية)، حتى خمسة في كل قائمة؛ والقائمة بلا طلبات لا تظهر. لم تعد أقسام الخدمات والإعلانات وآخر المحادثات في الرئيسية.",
      },
      acceptanceCriteria: {
        en: [
          "The header shows the logo and name on the right and only the bell on the left, with a red dot when there are unread notifications.",
          "طلبات خاصة shows 'N هذا الأسبوع' for requests received in the last 7 days, or 0.",
          "A company without a plan sees the grey card with the 'استعرض الباقات' button; one with a plan but no services sees 'اضافة خدمة', which opens the add-service screen.",
          "A company with a plan and services sees no card between the figures and the requests.",
          "طلبات خاصة بالشركة is hidden when the company has received no direct requests.",
          "Each card shows title, client, area, budget ('لم يحدد' when none), two lines of description and the attachments count; the dark button is on the right and التفاصيل on the left.",
          "Private cards carry their status tag and 'الرد'; public cards carry 'مناسبة لك' and 'ارسال عرض'. Both open a chat with the client; التفاصيل opens the request.",
        ],
        ar: [
          "يعرض الرأس الشعار والاسم على اليمين والجرس فقط على اليسار، مع نقطة حمراء عند وجود إشعارات غير مقروءة.",
          "طلبات خاصة تعرض 'N هذا الأسبوع' للطلبات الواردة خلال آخر 7 أيام، أو 0.",
          "الشركة بلا باقة ترى البطاقة الرمادية بزر 'استعرض الباقات'؛ والتي لديها باقة بلا خدمات ترى 'اضافة خدمة' ويفتح شاشة إضافة خدمة.",
          "الشركة التي لديها باقة وخدمات لا ترى بطاقة بين الأرقام والطلبات.",
          "يختفي قسم طلبات خاصة بالشركة إذا لم تستقبل الشركة طلبات مباشرة.",
          "تعرض كل بطاقة العنوان والعميل والمنطقة والميزانية ('لم يحدد' عند غيابها) وسطرين من الوصف وعدد المرفقات؛ الزر الداكن على اليمين والتفاصيل على اليسار.",
          "بطاقات الطلبات الخاصة تحمل وسم الحالة و'الرد'؛ والعامة تحمل 'مناسبة لك' و'ارسال عرض'. كلاهما يفتح محادثة مع العميل؛ والتفاصيل تفتح الطلب.",
        ],
      },
      testScenarios: {
        en: [
          "Sign in as a company with a plan, services and requests: no card, both lists shown.",
          "Sign in as a new company with no plan: the 'استعرض الباقات' card and only طلبات عامة.",
          "Send the company a quote request from an individual account, then pull to refresh the home: it appears under طلبات خاصة بالشركة and the طلبات خاصة figure goes up.",
        ],
        ar: [
          "سجّل الدخول كشركة لديها باقة وخدمات وطلبات: لا بطاقة وتظهر القائمتان.",
          "سجّل الدخول كشركة جديدة بلا باقة: بطاقة 'استعرض الباقات' وطلبات عامة فقط.",
          "أرسل للشركة طلب عرض سعر من حساب فرد ثم اسحب لتحديث الرئيسية: يظهر تحت طلبات خاصة بالشركة ويزيد رقم طلبات خاصة.",
        ],
      },
      updatedIn: "feat/company-home-figma",
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
    {
      id: "mobile-company-subscription-plans",
      title: {
        en: "Company plans: subscription periods, bought in the app on Android only",
        ar: "باقات الشركات: فترات اشتراك تُشترى من التطبيق في أندرويد فقط",
      },
      priority: "P1",
      story: {
        en: "الباقات in a company's More menu opens the company plans, not the individual ad packages. Three plans come from the API (ثلاث شهور 35, 6 شهور 60, السنوية 100 دينار كويتي), each listing what a subscription includes; a plan with a badge (الأكثر طلبا) has the orange border and tag, and the plan the company is on shows 'باقتك الحالية' with a grey disabled button. Tapping اشترك الان on Android opens the payment gateway and returns to this screen. On iOS the plans are shown without prices or a subscribe button, with one line saying that subscribing or renewing isn't possible in the app and, while covered, the date the subscription runs until; the app never says where else to subscribe (App Store rules). A company starts on a 30-day free trial. Without a running subscription or trial, adding a service or project, answering a request and issuing an invoice show 'اشترك للمتابعة' with a button to the plans.",
        ar: "خيار الباقات في قائمة المزيد للشركة يفتح باقات الشركات لا باقات إعلانات الأفراد. تأتي ثلاث باقات من الخادم (ثلاث شهور 35، 6 شهور 60، السنوية 100 دينار كويتي) وكل منها يعرض ما يشمله الاشتراك؛ الباقة التي لها شارة (الأكثر طلبا) لها إطار وشارة برتقاليان، والباقة الحالية للشركة تعرض 'باقتك الحالية' مع زر رمادي معطل. الضغط على اشترك الان في أندرويد يفتح بوابة الدفع ثم يعود إلى هذه الشاشة. في iOS تُعرض الباقات بلا أسعار ولا زر اشتراك، مع سطر واحد يفيد بأنه لا يمكن الاشتراك أو التجديد من داخل التطبيق، وتاريخ انتهاء الاشتراك ما دام سارياً؛ ولا يذكر التطبيق أين يمكن الاشتراك (قواعد متجر التطبيقات). تبدأ الشركة بفترة تجريبية مجانية 30 يوماً. وبدون اشتراك أو فترة تجريبية سارية، إضافة خدمة أو مشروع والرد على طلب وإصدار فاتورة تُظهر 'اشترك للمتابعة' مع زر يفتح الباقات.",
      },
      acceptanceCriteria: {
        en: [
          "More > الباقات for a company opens the company plans screen with the three plans, prices and feature lists from GET /company-plans.",
          "السنوية has the orange border and the 'الأكثر طلبا' tag.",
          "On a trial no plan carries 'باقتك الحالية'; after paying, the paid plan carries it and its button is grey and disabled.",
          "Android: اشترك الان opens the payment page; after a successful payment the app shows the success message and returns to the plans with the plan marked current.",
          "iOS: no prices and no اشترك الان button; the line 'لا يمكن الاشتراك أو تجديد الباقة من داخل التطبيق.' shows, with 'اشتراكك الحالي سارٍ حتى <date>' while covered. No text mentions a website or browser, and no payment request is made.",
          "Buying another plan while subscribed adds its period after the current end date.",
          "With an expired subscription, adding a service, adding a project, answering a request and creating an invoice show 'اشترك للمتابعة'; 'عرض الباقات' opens the plans.",
          "The company home shows the trial countdown during the trial and the 'استعرض الباقات' card with no subscription; both open the company plans.",
        ],
        ar: [
          "المزيد > الباقات للشركة يفتح شاشة باقات الشركات بالباقات الثلاث وأسعارها ومزاياها من GET /company-plans.",
          "باقة السنوية لها الإطار البرتقالي وشارة 'الأكثر طلبا'.",
          "في الفترة التجريبية لا تحمل أي باقة 'باقتك الحالية'؛ وبعد الدفع تحملها الباقة المدفوعة وزرها رمادي معطل.",
          "أندرويد: اشترك الان يفتح صفحة الدفع؛ وبعد نجاح الدفع تظهر رسالة النجاح ويعود التطبيق إلى الباقات مع تمييز الباقة الحالية.",
          "iOS: بلا أسعار وبلا زر اشترك الان؛ يظهر السطر 'لا يمكن الاشتراك أو تجديد الباقة من داخل التطبيق.' مع 'اشتراكك الحالي سارٍ حتى <التاريخ>' ما دام الاشتراك سارياً. ولا يذكر أي نص موقعاً أو متصفحاً، ولا يُرسل أي طلب دفع.",
          "شراء باقة أخرى أثناء الاشتراك يضيف مدتها بعد تاريخ الانتهاء الحالي.",
          "مع اشتراك منتهٍ، إضافة خدمة وإضافة مشروع والرد على طلب وإنشاء فاتورة تعرض 'اشترك للمتابعة'؛ و'عرض الباقات' يفتح الباقات.",
          "رئيسية الشركة تعرض عدّاد الفترة التجريبية خلالها وبطاقة 'استعرض الباقات' بلا اشتراك؛ وكلاهما يفتح باقات الشركات.",
        ],
      },
      testScenarios: {
        en: [
          "As a company on Android, subscribe to ثلاث شهور with a test card: back on the plans, ثلاث شهور shows 'باقتك الحالية'.",
          "As the same company, subscribe to السنوية: the tag moves to السنوية and the end date is the old end date plus 12 months.",
          "On an iPhone open الباقات: plan names and features only, the cannot-subscribe-in-app line, and the current plan tag for a subscribed company.",
          "With an expired company, try إضافة خدمة: 'اشترك للمتابعة' shows; 'عرض الباقات' opens the plans.",
        ],
        ar: [
          "كشركة على أندرويد، اشترك في ثلاث شهور ببطاقة اختبار: عند العودة تحمل ثلاث شهور 'باقتك الحالية'.",
          "بالشركة نفسها اشترك في السنوية: تنتقل الشارة إلى السنوية وتاريخ الانتهاء هو القديم زائد 12 شهراً.",
          "على آيفون افتح الباقات: أسماء الباقات ومزاياها فقط، وسطر تعذر الاشتراك من التطبيق، وشارة الباقة الحالية للشركة المشتركة.",
          "بشركة منتهية الاشتراك جرّب إضافة خدمة: تظهر 'اشترك للمتابعة'؛ و'عرض الباقات' يفتح الباقات.",
        ],
      },
      figmaFrameUrls: [
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=4410-170162", label: { en: "Plans", ar: "الباقات" } },
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=8601-131497", label: { en: "Current plan", ar: "الباقة الحالية" } },
      ],
      updatedIn: "feat/company-subscriptions",
    },
  ],
};
