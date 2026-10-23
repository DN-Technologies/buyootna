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
      id: "mobile-company-portfolio",
      title: {
        en: "More › معرض الأعمال from Figma: search, sort, hide or delete all, and editing a project",
        ar: "المزيد › معرض الأعمال من التصميم: البحث والترتيب وإخفاء الكل أو حذفه وتعديل المشروع",
      },
      priority: "P2",
      story: {
        en: "More › معرض الأعمال (Figma 4410:169500) lists the company's projects as cards: a photo carousel with dots, «مخفي» on a hidden one, the title, how long ago it was added, the description and «تعديل». The search field filters by title and description and shows «N نتائج بحث»; the sort button opens «الترتيب حسب» (الكل, الأحدث أولاً, الأقدم أولاً). No projects shows «لا توجد مشاريع في معرضك حاليا» with «إضافة مشروع»; no matches shows «لا توجد أي مشاريع مطابقة للبحث». ⋮ offers «اخفاء جميع المشاريع» (after a confirmation; «اظهار جميع المشاريع» once all are hidden) and «حذف الكل» (after a confirmation). «تعديل» opens the project (Figma 8464:26503): the «حالة ظهور المشروع» switch, title, description (100 characters at most), up to 3 photos (each can be removed or replaced, plus «اضافة صورة»), «تاريخ الانشاء», and «حذف المشروع نهائيا» after a confirmation. «حفظ التغييرات» is greyed out until something changes. Saving a change of visibility goes back to the list with «تم اخفاء المشروع بنجاح.» or «أصبح المشروع ظاهر للعملاء.» and «تراجع», which undoes it; hiding all shows the same kind of message.",
        ar: "يعرض المزيد › معرض الأعمال (التصميم 4410:169500) مشاريع الشركة كبطاقات: صور تُقلَّب مع نقاط، و«مخفي» على المشروع المخفي، والعنوان، ومنذ متى أُضيف، والوصف، و«تعديل». ويصفّي حقل البحث بالعنوان والوصف ويعرض «N نتائج بحث»؛ ويفتح زر الترتيب «الترتيب حسب» (الكل، الأحدث أولاً، الأقدم أولاً). ومن دون مشاريع تظهر «لا توجد مشاريع في معرضك حاليا» مع «إضافة مشروع»؛ ومن دون نتائج تظهر «لا توجد أي مشاريع مطابقة للبحث». وتعرض ⋮ «اخفاء جميع المشاريع» (بعد التأكيد؛ و«اظهار جميع المشاريع» إن كانت كلها مخفية) و«حذف الكل» (بعد التأكيد). ويفتح «تعديل» المشروع (التصميم 8464:26503): مفتاح «حالة ظهور المشروع»، والعنوان، والوصف (100 حرف على الأكثر)، وحتى 3 صور (لكل صورة حذف أو تبديل، مع «اضافة صورة»)، و«تاريخ الانشاء»، و«حذف المشروع نهائيا» بعد التأكيد. ويبقى «حفظ التغييرات» رمادياً حتى يتغير شيء. وحفظ تغيير الظهور يعود إلى القائمة مع «تم اخفاء المشروع بنجاح.» أو «أصبح المشروع ظاهر للعملاء.» و«تراجع» الذي يلغيه؛ وإخفاء الكل يعرض رسالة مماثلة.",
      },
      acceptanceCriteria: {
        en: [
          "The list matches Figma; a hidden project shows «مخفي».",
          "Search and the three sort options work, with the count and both empty states.",
          "Hide all / show all and delete all ask first and update the list.",
          "Edit: save is disabled until a change; photos can be removed, replaced and added up to 3; delete asks first.",
          "Hiding or showing a project shows the toast, and «تراجع» undoes it.",
        ],
        ar: [
          "تطابق القائمة التصميم؛ ويظهر «مخفي» على المشروع المخفي.",
          "يعمل البحث وخيارات الترتيب الثلاثة، مع العدد وحالتي القائمة الفارغة.",
          "إخفاء الكل وإظهاره وحذف الكل تسأل أولاً وتحدّث القائمة.",
          "التعديل: الحفظ معطل حتى يتغير شيء؛ والصور تُحذف وتُبدّل ويُضاف حتى 3؛ والحذف يسأل أولاً.",
          "إخفاء المشروع أو إظهاره يعرض الرسالة، و«تراجع» يلغيه.",
        ],
      },
      testScenarios: {
        en: [
          "As a subscribed company with two projects: search one; sort oldest first; edit one (title and a photo) and save; switch it off and save → «تم اخفاء المشروع بنجاح.» → «تراجع»; ⋮ › اخفاء جميع المشاريع › confirm; ⋮ › حذف الكل › confirm → the empty state.",
        ],
        ar: [
          "كشركة مشتركة لديها مشروعان: ابحث عن أحدهما؛ ورتّب الأقدم أولاً؛ وعدّل أحدهما (العنوان وصورة) واحفظ؛ وأطفئ ظهوره واحفظ ← «تم اخفاء المشروع بنجاح.» ← «تراجع»؛ و⋮ › اخفاء جميع المشاريع › التأكيد؛ و⋮ › حذف الكل › التأكيد ← القائمة الفارغة.",
        ],
      },
      updatedIn: "feat/company-portfolio-figma",
    },
    {
      id: "mobile-company-request-card-tag-clipped",
      title: {
        en: "Home request cards: the «مناسبة لك» tag shows in full",
        ar: "بطاقات الطلبات في الرئيسية: وسم «مناسبة لك» يظهر كاملاً",
      },
      priority: "P2",
      story: {
        en: "QA (iOS): on the company home, the «مناسبة لك» tag on public request cards was cut off at its right edge (the first letter clipped). The tag's text had a negative letter spacing, which iOS applies when measuring the Arabic word but not when drawing it, so the tag came out narrower than its text. The tag now sizes to its full text with its padding on both sides, stays on one line, and doesn't shrink next to a long title. The same applies to the status tags on the company's own request cards.",
        ar: "QA (iOS): في رئيسية الشركة كان وسم «مناسبة لك» على بطاقات الطلبات العامة مقطوعاً من طرفه الأيمن (الحرف الأول مقصوص). كان لنص الوسم تباعد أحرف سالب يطبقه iOS عند قياس الكلمة العربية لا عند رسمها، فيخرج الوسم أضيق من نصه. الآن يأخذ الوسم عرض نصه كاملاً مع الهوامش الداخلية على الجانبين، ويبقى في سطر واحد، ولا ينكمش بجانب عنوان طويل. وينطبق ذلك على وسوم الحالة في بطاقات طلبات الشركة الخاصة.",
      },
      acceptanceCriteria: {
        en: [
          "«مناسبة لك» shows in full, with even padding on the right and left.",
          "With a long request title, the tag keeps its full width and the title is cut with an ellipsis instead.",
          "The status tags (قيد الانتظار, تم الرد, مقبولة, مرفوضة) on private request cards show in full too.",
        ],
        ar: [
          "يظهر «مناسبة لك» كاملاً بهوامش متساوية يميناً ويساراً.",
          "مع عنوان طلب طويل يحتفظ الوسم بعرضه الكامل ويُختصر العنوان بنقاط بدلاً منه.",
          "وسوم الحالة (قيد الانتظار، تم الرد، مقبولة، مرفوضة) على بطاقات الطلبات الخاصة تظهر كاملة أيضاً.",
        ],
      },
      testScenarios: {
        en: [
          "On iOS, sign in as a company and scroll طلبات عامة on the home: every card's «مناسبة لك» is whole.",
          "Create a public request with a long title and check its card: the tag is whole, the title ends in «…».",
        ],
        ar: [
          "على iOS سجّل الدخول كشركة ومرّر طلبات عامة في الرئيسية: «مناسبة لك» كامل في كل بطاقة.",
          "أنشئ طلباً عاماً بعنوان طويل وافحص بطاقته: الوسم كامل والعنوان ينتهي بـ«…».",
        ],
      },
      updatedIn: "fix/suitable-badge-truncated",
    },
    {
      id: "mobile-company-replied-badge-own-reply",
      title: {
        en: "«تم الرد» only after this company sends its reply",
        ar: "«تم الرد» فقط بعد أن ترسل الشركة ردها",
      },
      priority: "P1",
      story: {
        en: "QA: a company saw «تم الرد» on requests it had only opened. Two causes: opening a chat from a request (الرد / ارسال عرض / the details chat button) marked it answered before anything was sent, and the status was shared, so on a public request every company saw «تم الرد» once any one of them answered or opened a chat. Now «تم الرد» is each company's own: a request shows it, and is under the تم الرد tab, only once that company sent its reply or offer from the reply sheet (ارسال الرد). Opening the details or a chat changes nothing; another company's reply doesn't either. The requester still sees their request as answered once any company replies. Accepted and rejected are unchanged.",
        ar: "QA: كانت الشركة ترى «تم الرد» على طلبات فتحتها فقط. سببان: فتح محادثة من الطلب (الرد / ارسال عرض / زر المحادثة في التفاصيل) كان يعلّمه كمردود عليه قبل إرسال أي شيء، والحالة كانت مشتركة، فعلى الطلب العام كانت كل الشركات ترى «تم الرد» بمجرد أن ترد أي شركة أو تفتح محادثة. الآن «تم الرد» خاص بكل شركة: يظهر على الطلب، ويكون تحت تبويب تم الرد، فقط بعد أن ترسل تلك الشركة ردها أو عرضها من نافذة الرد (ارسال الرد). فتح التفاصيل أو المحادثة لا يغيّر شيئاً، ولا رد شركة أخرى. وصاحب الطلب ما زال يرى طلبه مردوداً عليه بمجرد أن ترد أي شركة. والمقبول والمرفوض بلا تغيير.",
      },
      acceptanceCriteria: {
        en: [
          "Opening a pending request's details leaves it قيد الانتظار, in the details and the lists.",
          "Opening a chat from the request leaves it قيد الانتظار.",
          "Sending a reply from the reply sheet shows تم الرد and moves it to the تم الرد tab.",
          "Company A replies to a public request: company B still sees it قيد الانتظار.",
          "The requester sees their request answered once any company replied.",
        ],
        ar: [
          "فتح تفاصيل طلب قيد الانتظار يتركه قيد الانتظار في التفاصيل والقوائم.",
          "فتح محادثة من الطلب يتركه قيد الانتظار.",
          "إرسال رد من نافذة الرد يعرض تم الرد وينقله إلى تبويب تم الرد.",
          "الشركة أ ترد على طلب عام: الشركة ب ما زالت تراه قيد الانتظار.",
          "صاحب الطلب يرى طلبه مردوداً عليه بمجرد أن ترد أي شركة.",
        ],
      },
      testScenarios: {
        en: [
          "As a company, open a pending request's details, go back — still قيد الانتظار.",
          "Tap الرد on the home card or the details chat button, go back without writing — still قيد الانتظار.",
          "Open the reply sheet, send a reply — تم الرد, and it is under the تم الرد tab.",
          "With two companies: A replies to a public request; B opens the list and the details — قيد الانتظار.",
        ],
        ar: [
          "كشركة افتح تفاصيل طلب قيد الانتظار ثم ارجع — ما زال قيد الانتظار.",
          "اضغط الرد في بطاقة الرئيسية أو زر المحادثة في التفاصيل، ثم ارجع بدون كتابة — ما زال قيد الانتظار.",
          "افتح نافذة الرد وأرسل رداً — يظهر تم الرد ويكون تحت تبويب تم الرد.",
          "بشركتين: أ ترد على طلب عام، وب تفتح القائمة والتفاصيل — قيد الانتظار.",
        ],
      },
      updatedIn: "fix/replied-badge-own-reply",
    },
    {
      id: "mobile-company-request-chat-opens-fast",
      title: {
        en: "Opening a chat from a request: immediate feedback, one wait instead of two",
        ar: "فتح محادثة من طلب: استجابة فورية وانتظار واحد بدلاً من اثنين",
      },
      priority: "P1",
      story: {
        en: "QA: tapping الرد / ارسال عرض on a home request card, the chat button on a request's details, or ابدأ المحادثة on an accepted request seemed frozen for a second or two before the chat opened. The app waited for two server calls in a row (create the chat, then mark the request answered) with no sign anything was happening, and a second tap started it again. Now the button shows a spinner straight away and ignores more taps; the chat opens as soon as the conversation exists. Opening a chat no longer marks the request answered (see mobile-company-replied-badge-own-reply). If the chat can't be created, an alert says why and the button works again. On the details screen, a company without a plan now goes to the plans like elsewhere.",
        ar: "QA: الضغط على الرد / ارسال عرض في بطاقة طلب في الرئيسية، أو زر المحادثة في تفاصيل الطلب، أو ابدأ المحادثة في طلب مقبول كان يبدو متجمداً لثانية أو اثنتين قبل فتح المحادثة. كان التطبيق ينتظر طلبين للخادم متتاليين (إنشاء المحادثة ثم تعليم الطلب كمردود عليه) دون أي إشارة، والضغطة الثانية كانت تعيد العملية. الآن يعرض الزر مؤشر تحميل فوراً ويتجاهل الضغطات الإضافية، وتفتح المحادثة بمجرد إنشائها. ولم يعد فتح المحادثة يعلّم الطلب كمردود عليه (راجع mobile-company-replied-badge-own-reply). وإن تعذر إنشاء المحادثة يظهر تنبيه بالسبب ويعود الزر للعمل. وفي شاشة التفاصيل تنتقل الشركة بلا باقة إلى الباقات كما في بقية الشاشات.",
      },
      acceptanceCriteria: {
        en: [
          "Each of the three buttons shows a spinner as soon as it is tapped; tapping again does nothing.",
          "The chat opens after a single server call; it does not wait for the request status.",
          "Opening the chat leaves the request's status as it was.",
          "If the chat can't be created: an alert, no chat, the button works again.",
        ],
        ar: [
          "كل زر من الثلاثة يعرض مؤشر تحميل فور الضغط، والضغط مرة أخرى لا يفعل شيئاً.",
          "تفتح المحادثة بعد طلب واحد للخادم ولا تنتظر حالة الطلب.",
          "فتح المحادثة يترك حالة الطلب كما هي.",
          "إن تعذر إنشاء المحادثة: تنبيه، ولا محادثة، ويعود الزر للعمل.",
        ],
      },
      testScenarios: {
        en: [
          "As a company, tap الرد on a request on the home — a spinner shows at once, then the chat opens; back on the home the request is still قيد الانتظار.",
          "Tap the button several times quickly — only one chat opens.",
          "Repeat from a request's details (chat button) and from an accepted request (ابدأ المحادثة).",
        ],
        ar: [
          "كشركة اضغط الرد على طلب في الرئيسية — يظهر مؤشر التحميل فوراً ثم تفتح المحادثة؛ وعند الرجوع يبقى الطلب قيد الانتظار.",
          "اضغط الزر عدة مرات بسرعة — تفتح محادثة واحدة فقط.",
          "كرر من تفاصيل طلب (زر المحادثة) ومن طلب مقبول (ابدأ المحادثة).",
        ],
      },
      updatedIn: "fix/replied-badge-own-reply",
    },
    {
      id: "mobile-company-manage-services-projects",
      title: {
        en: "More › الخدمات and معرض الأعمال list what the company has",
        ar: "المزيد › الخدمات ومعرض الأعمال تعرضان ما لدى الشركة",
      },
      priority: "P1",
      story: {
        en: "QA: More › الخدمات opened the إضافة خدمة form directly, so a company could never see or remove the services it had added; معرض الأعمال did the same with اضافة مشروع. Both now open a list: الخدمات shows the specialty and one row per service (its type, or its own title for 'اخرى', with the description), معرض الأعمال one row per project with its first photo. Each row has a delete button that asks first. With nothing added, the list says so. The «إضافة خدمة» / «إضافة مشروع» button at the bottom opens the form, and back from the form returns to the list, which shows the new item. Editing a service or project is not available yet. The + sheet and the home banner still open the forms directly.",
        ar: "QA: كان المزيد › الخدمات يفتح نموذج إضافة خدمة مباشرة، فلا تستطيع الشركة رؤية خدماتها أو حذفها؛ ومعرض الأعمال كان يفعل الشيء نفسه مع اضافة مشروع. الآن يفتح كل منهما قائمة: الخدمات تعرض التخصص وصفاً لكل خدمة (نوعها، أو عنوانها الخاص لـ'اخرى'، مع الوصف)، ومعرض الأعمال صفاً لكل مشروع مع أول صورة. لكل صف زر حذف يطلب التأكيد أولاً. وإن لم يُضف شيء تقول القائمة ذلك. زر «إضافة خدمة» / «إضافة مشروع» في الأسفل يفتح النموذج، والرجوع من النموذج يعيد إلى القائمة وفيها العنصر الجديد. تعديل خدمة أو مشروع غير متاح بعد. وزر + وبطاقة الرئيسية ما زالا يفتحان النموذجين مباشرة.",
      },
      acceptanceCriteria: {
        en: [
          "More › الخدمات opens the services list, not the form; the specialty shows above the rows.",
          "More › معرض الأعمال opens the projects list, each with its first photo.",
          "Delete asks «حذف هذه الخدمة؟» / «حذف هذا المشروع؟»; تراجع keeps it, حذف removes it from the list and from the public company profile.",
          "A failed delete shows an alert and keeps the row.",
          "With nothing added: an empty message and the add button.",
          "Adding from the list, then back: the list shows the new item.",
        ],
        ar: [
          "المزيد › الخدمات يفتح قائمة الخدمات لا النموذج، والتخصص يظهر فوق الصفوف.",
          "المزيد › معرض الأعمال يفتح قائمة المشاريع، كل مشروع مع أول صورة له.",
          "الحذف يسأل «حذف هذه الخدمة؟» / «حذف هذا المشروع؟»؛ تراجع يبقيه، وحذف يزيله من القائمة ومن ملف الشركة العام.",
          "فشل الحذف يعرض تنبيهاً ويبقى الصف.",
          "بلا عناصر: رسالة فارغة وزر الإضافة.",
          "الإضافة من القائمة ثم الرجوع: تظهر القائمة وفيها العنصر الجديد.",
        ],
      },
      testScenarios: {
        en: [
          "As a company with services: More › الخدمات — the services list shows; tap «إضافة خدمة», add one, go back — it is in the list.",
          "Delete a service, confirm — it disappears here and from the company's public profile.",
          "Repeat with معرض الأعمال and a project.",
          "As a new company with nothing added — both lists show the empty message.",
        ],
        ar: [
          "كشركة لديها خدمات: المزيد › الخدمات — تظهر قائمة الخدمات؛ اضغط «إضافة خدمة» وأضف واحدة ثم ارجع — تظهر في القائمة.",
          "احذف خدمة وأكّد — تختفي هنا ومن ملف الشركة العام.",
          "كرر مع معرض الأعمال ومشروع.",
          "كشركة جديدة بلا إضافات — تعرض القائمتان الرسالة الفارغة.",
        ],
      },
      updatedIn: "fix/company-services-list",
    },
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
        en: "The company's إضافة خدمة form now follows the design. التخصص is one choice from the 33 specialties of the services catalogue (see mobile-services-catalogue). نوع الخدمة is a checklist of that specialty's types plus الكل and اخرى. الكل ticks all listed types. Ticking اخرى reveals عنوان الخدمة, which is then required. الوصف is optional, up to 100 characters. Each chosen type is saved as its own service (before, saving replaced the company's whole services text). The company's first service fixes its specialty: from then on التخصص is shown greyed and cannot be changed. The home's خدمات نشطة figure counts the saved services.",
        ar: "أصبح نموذج إضافة خدمة للشركة مطابقاً للتصميم. التخصص اختيار واحد من 33 تخصصاً في قائمة الخدمات (انظر mobile-services-catalogue). نوع الخدمة قائمة اختيار بأنواع ذلك التخصص مع الكل واخرى. الكل يحدد كل الأنواع المدرجة. تحديد اخرى يُظهر عنوان الخدمة ويصبح مطلوباً. الوصف اختياري حتى 100 حرف. يُحفظ كل نوع مختار كخدمة مستقلة (كان الحفظ سابقاً يستبدل نص خدمات الشركة كله). أول خدمة للشركة تثبّت تخصصها: بعدها يظهر التخصص باهتاً ولا يمكن تغييره. رقم خدمات نشطة في الرئيسية يعدّ الخدمات المحفوظة.",
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
      id: "mobile-company-add-service-second-time",
      title: {
        en: "إضافة خدمة the second time: types already added are greyed and locked",
        ar: "إضافة خدمة للمرة الثانية: الأنواع المضافة مسبقاً باهتة ومقفلة",
      },
      priority: "P1",
      story: {
        en: "After a company's first service, opening إضافة خدمة again offered every service type as new: ticking one already added did nothing on save or failed with «هذه الخدمات مضافة مسبقاً», and the التخصص lock read the profile in the auth store, which could still be empty right after the first service. The form now loads the company's services (GET /users/profile/services through useMyCompanyServices). التخصص is locked from the specialty the server returns. In نوع الخدمة the types already added show ticked and greyed (#A0A0A0) and can't be pressed (Figma 8453:24047). الكل picks only the types still free, and turns greyed once none are left (for a specialty without a list, once the specialty itself was added). اخرى stays available, since each اخرى service has its own title. The checklist waits for the services to load before it opens. After a success, إضافة خدمة أخرى shows the types just added as taken. The rows of both lists have a minimum height and a 24pt line height, so Cairo's lower strokes are no longer cut.",
        ar: "بعد أول خدمة للشركة كان فتح إضافة خدمة مرة أخرى يعرض كل أنواع الخدمة كأنها جديدة: تحديد نوع مضاف سابقاً لا يفعل شيئاً عند الحفظ أو يفشل برسالة «هذه الخدمات مضافة مسبقاً»، وكان قفل التخصص يقرأ الملف من مخزن الجلسة الذي قد يكون فارغاً بعد أول خدمة مباشرة. الآن يحمّل النموذج خدمات الشركة (GET /users/profile/services عبر useMyCompanyServices). يُقفل التخصص حسب التخصص الذي يعيده الخادم. وفي نوع الخدمة تظهر الأنواع المضافة مسبقاً محددة وباهتة (#A0A0A0) ولا يمكن الضغط عليها (Figma 8453:24047). الكل يحدد الأنواع المتبقية فقط، ويصبح باهتاً عندما لا يتبقى شيء (وللتخصص الذي لا قائمة له، بعد إضافة التخصص نفسه). وتبقى اخرى متاحة لأن لكل خدمة اخرى عنواناً خاصاً بها. ولا تُفتح القائمة قبل تحميل الخدمات. وبعد النجاح يعرض إضافة خدمة أخرى الأنواع المضافة للتو كمأخوذة. وصار لصفوف القائمتين ارتفاع أدنى وارتفاع سطر 24 نقطة، فلا تُقص أطراف حروف خط Cairo السفلية.",
      },
      acceptanceCriteria: {
        en: [
          "Second time: التخصص shows the company's specialty, greyed, with no list.",
          "The types added before are ticked, greyed and do nothing when pressed.",
          "الكل sends only the types not added yet.",
          "With every listed type added, الكل is greyed; اخرى with a title still adds a service.",
          "After «إضافة خدمة أخرى», the types just added show as taken.",
        ],
        ar: [
          "في المرة الثانية: يعرض التخصص تخصص الشركة باهتاً ودون قائمة.",
          "الأنواع المضافة سابقاً محددة وباهتة ولا تفعل شيئاً عند الضغط.",
          "الكل يرسل الأنواع غير المضافة فقط.",
          "عند إضافة كل الأنواع المدرجة يكون الكل باهتاً، وتبقى اخرى مع عنوان تضيف خدمة.",
          "بعد «إضافة خدمة أخرى» تظهر الأنواع المضافة للتو كمأخوذة.",
        ],
      },
      testScenarios: {
        en: [
          "As a company with an active subscription, add مكتب هندسي with three types. Tap «إضافة خدمة أخرى»: التخصص is locked and those three are greyed and ticked.",
          "Pick اخرى, write a title and add it; open the company page: the new service is listed.",
        ],
        ar: [
          "كشركة باشتراك نشط أضف مكتب هندسي بثلاثة أنواع. اضغط «إضافة خدمة أخرى»: التخصص مقفل والأنواع الثلاثة باهتة ومحددة.",
          "اختر اخرى واكتب عنواناً وأضفها، ثم افتح صفحة الشركة: تظهر الخدمة الجديدة.",
        ],
      },
      updatedIn: "feat/add-service-second-time",
    },
    {
      id: "mobile-company-requests-status-views",
      title: {
        en: "Company الطلبات by status (Figma): card actions, تفاصيل الرد, اصدار فاتورة, انهاء الطلب",
        ar: "طلبات الشركة حسب الحالة (فيجما): أزرار البطاقة، وتفاصيل الرد، واصدار فاتورة، وانهاء الطلب",
      },
      priority: "P1",
      story: {
        en: "Each request card's buttons now follow its status: قيد الانتظار keeps الرد and التفاصيل; تم الرد and مرفوضة show only التفاصيل; مقبولة shows «ابدأ المحادثة» (opens the chat pinned to the request) and a red trash that, after «إزالة الطلب من قائمتك؟», takes the request off the company's lists. A request the company ended shows a «منتهي» chip. Under مرفوضة the list says «الطلبات المرفوضة تختفي بعد 30يوم». The reply sheet has three optional fields, «العرض يشمل», «العرض لا يشمل» and «ملاحظات», shown on تفاصيل الطلب as «تفاصيل الرد» (and to the client in the company's reply). On تفاصيل الطلب, قبول / رفض show only while pending; an accepted request shows «اصدار فاتورة» (opens the invoice with this client and request already picked) and «انهاء الطلب»; a rejected one has no ⋮. انهاء الطلب asks «هل انتهى التعامل مع العميل؟» (نعم، انتهى / لا، مازال مستمرًا), then the انهاء الطلب screen asks whether the service is done and, if so, where the final agreement was made (من خلال التطبيق / خارج التطبيق); تحديث الحالة stays off until answered. «لا» changes nothing; «نعم» ends the request, returns to the list and shows «تم إنهاء الطلب بنجاح. شكراً لمساعدتك في تحسين جودة المنصة.»",
        ar: "أصبحت أزرار بطاقة الطلب تتبع حالته: قيد الانتظار يبقى فيها الرد والتفاصيل؛ وتم الرد والمرفوضة تعرض التفاصيل فقط؛ والمقبولة تعرض «ابدأ المحادثة» (تفتح المحادثة المرتبطة بالطلب) وسلة حمراء تزيل الطلب من قوائم الشركة بعد «إزالة الطلب من قائمتك؟». والطلب الذي أنهته الشركة يظهر بشارة «منتهي». وتحت «مرفوضة» تقول القائمة «الطلبات المرفوضة تختفي بعد 30يوم». ونافذة الرد فيها ثلاثة حقول اختيارية: «العرض يشمل» و«العرض لا يشمل» و«ملاحظات»، تظهر في تفاصيل الطلب كـ«تفاصيل الرد» (وللعميل في رد الشركة). وفي تفاصيل الطلب يظهر قبول / رفض أثناء الانتظار فقط؛ والطلب المقبول يعرض «اصدار فاتورة» (تفتح الفاتورة مع اختيار هذا العميل والطلب) و«انهاء الطلب»؛ والمرفوض بلا ⋮. ويسأل «انهاء الطلب»: «هل انتهى التعامل مع العميل؟» (نعم، انتهى / لا، مازال مستمرًا)، ثم تسأل شاشة انهاء الطلب إن انتهت الخدمة، وإن انتهت فأين تم الاتفاق النهائي (من خلال التطبيق / خارج التطبيق)؛ ويبقى «تحديث الحالة» معطلاً حتى الإجابة. و«لا» لا يغيّر شيئاً؛ و«نعم» يُنهي الطلب ويعود للقائمة ويعرض «تم إنهاء الطلب بنجاح. شكراً لمساعدتك في تحسين جودة المنصة.»",
      },
      acceptanceCriteria: {
        en: [
          "Card buttons match the status; the trash asks first and removes the request.",
          "مرفوضة shows the 30-day note.",
          "تفاصيل الرد shows only the parts the reply has.",
          "اصدار فاتورة opens the invoice with the client filled in.",
          "انهاء الطلب › نعم › a place › تحديث الحالة: the request leaves مقبولة and the toast shows.",
        ],
        ar: [
          "أزرار البطاقة تطابق الحالة؛ والسلة تسأل أولاً ثم تزيل الطلب.",
          "«مرفوضة» تعرض ملاحظة الثلاثين يوماً.",
          "«تفاصيل الرد» تعرض الأجزاء الموجودة في الرد فقط.",
          "«اصدار فاتورة» تفتح الفاتورة مع تعبئة العميل.",
          "انهاء الطلب › نعم › مكان › تحديث الحالة: يخرج الطلب من «مقبولة» ويظهر الإشعار.",
        ],
      },
      testScenarios: {
        en: ["As a company, open an accepted request › انهاء الطلب › نعم، انتهى › نعم › خارج التطبيق › تحديث الحالة: back on the list with the toast; مقبولة no longer lists it, الكل shows it as منتهي."],
        ar: ["كشركة: افتح طلباً مقبولاً › انهاء الطلب › نعم، انتهى › نعم › خارج التطبيق › تحديث الحالة: العودة للقائمة مع الإشعار؛ ولم تعد «مقبولة» تعرضه، و«الكل» تعرضه كمنتهي."],
      },
      updatedIn: "feat/company-requests-status-views",
    },
    {
      id: "mobile-company-requests-figma",
      title: {
        en: "Company الطلبات (Figma): reply sheet, reject confirmation, ⋮ save / report, تصفية البحث, مرفوضة and المفضلة",
        ar: "طلبات الشركة (فيجما): نافذة الرد، وتأكيد الرفض، وقائمة ⋮ للحفظ والإبلاغ، وتصفية البحث، والمرفوضة والمفضلة",
      },
      priority: "P1",
      story: {
        en: "The company's requests tab follows its Figma frames. The chips are الكل, قيد الانتظار, مقبولة, تم الرد, مرفوضة and المفضلة (requests the company saved). «الرد» on a card opens الرد على العميل instead of a chat: the request in short with its status, then رسالة الى العميل and ملاحظات, both optional; ارسال الرد turns on once either has text, sends the company's offer, and shows «تم إرسال ردك بنجاح!» with حسنًا; the client is notified. A company without a running plan gets the usual subscribe prompt. The filter button opens تصفية البحث: التخصص, نوع الخدمة (of that specialty), نطاق السعر من / الى, and المحافظة + المنطقة; عرض النتائج stays off until something changes, إعادة التعيين clears it, and a dot shows on the button while filters apply. On تفاصيل الطلب, قبول and رفض ask in a sheet instead of a system alert («هل أنت متأكد من رفض هذا الطلب؟ لن يظهر مرة أخرى ضمن طلباتك.»); رفض is offered on public requests too and hides the request for this company only, then goes back; neither button shows once the request is accepted or rejected. ⋮ opens اضافة الى المفضلة (إزالة من المفضلة once saved) and الإبلاغ عن المستخدم, which reports the client with the usual reasons. العروض shows how many offers there are instead of the offer type, the client card no longer falls back to a made-up client, and a client with no rating or photo shows no stars and their initial. Tapping a REQUEST_REPLY notification opens the request.",
        ar: "تتبع تبويبة طلبات الشركة إطارات فيجما. الشرائح: الكل وقيد الانتظار ومقبولة وتم الرد ومرفوضة والمفضلة (الطلبات التي حفظتها الشركة). «الرد» على البطاقة يفتح «الرد على العميل» بدلاً من المحادثة: ملخص الطلب وحالته، ثم «رسالة الى العميل» و«ملاحظات» وكلاهما اختياري؛ ويتفعل «ارسال الرد» عند كتابة أي منهما، فيرسل عرض الشركة ويعرض «تم إرسال ردك بنجاح!» مع «حسنًا»، ويُشعر العميل. والشركة بلا باقة سارية ترى رسالة الاشتراك المعتادة. وزر التصفية يفتح «تصفية البحث»: التخصص، ونوع الخدمة (لذلك التخصص)، ونطاق السعر من / الى، والمحافظة + المنطقة؛ ويبقى «عرض النتائج» معطلاً حتى يتغير شيء، و«إعادة التعيين» تمسحها، وتظهر نقطة على الزر أثناء التصفية. وفي «تفاصيل الطلب» يسأل «قبول» و«رفض» في نافذة سفلية بدل تنبيه النظام («هل أنت متأكد من رفض هذا الطلب؟ لن يظهر مرة أخرى ضمن طلباتك.»)؛ و«رفض» متاح للطلبات العامة أيضاً ويخفي الطلب عن هذه الشركة فقط ثم يعود؛ ولا يظهر الزران بعد قبول الطلب أو رفضه. و⋮ تفتح «اضافة الى المفضلة» («إزالة من المفضلة» بعد الحفظ) و«الإبلاغ عن المستخدم» الذي يبلّغ عن العميل بالأسباب المعتادة. و«العروض» تعرض عدد العروض بدل نوع العرض، ولم تعد بطاقة العميل تعرض عميلاً مختلقاً، والعميل بلا تقييم أو صورة يظهر بلا نجوم وبالحرف الأول من اسمه. والضغط على إشعار REQUEST_REPLY يفتح الطلب.",
      },
      acceptanceCriteria: {
        en: [
          "الرد opens the sheet; ارسال الرد is off until a field has text; sending shows تم إرسال ردك بنجاح!.",
          "رفض on a public request → confirm → back; the request is gone from عامة and listed under مرفوضة.",
          "⋮ › اضافة الى المفضلة, then المفضلة lists the request; ⋮ now says إزالة من المفضلة.",
          "⋮ › الإبلاغ عن المستخدم sends a report on the client.",
          "تصفية البحث narrows the list; نوع الخدمة waits for التخصص; إعادة التعيين clears it.",
        ],
        ar: [
          "«الرد» يفتح النافذة؛ و«ارسال الرد» معطل حتى يُكتب في حقل؛ والإرسال يعرض «تم إرسال ردك بنجاح!».",
          "«رفض» على طلب عام ← تأكيد ← رجوع؛ ويختفي الطلب من «عامة» ويظهر تحت «مرفوضة».",
          "⋮ › «اضافة الى المفضلة» ثم «المفضلة» تعرض الطلب؛ وتصبح ⋮ «إزالة من المفضلة».",
          "⋮ › «الإبلاغ عن المستخدم» يرسل بلاغاً عن العميل.",
          "«تصفية البحث» تضيّق القائمة؛ و«نوع الخدمة» ينتظر «التخصص»؛ و«إعادة التعيين» تمسحها.",
        ],
      },
      testScenarios: {
        en: [
          "As a company: الطلبات › الرد › write only ملاحظات › ارسال الرد: success sheet; as the client, the bell shows the reply and opens the request.",
          "عامة › التفاصيل › رفض › تأكيد الرفض: back on the list without it; مرفوضة shows it.",
        ],
        ar: [
          "كشركة: الطلبات › الرد › اكتب الملاحظات فقط › ارسال الرد: نافذة النجاح؛ وكعميل يظهر الرد في الإشعارات ويفتح الطلب.",
          "عامة › التفاصيل › رفض › تأكيد الرفض: العودة للقائمة بدونه؛ و«مرفوضة» تعرضه.",
        ],
      },
      updatedIn: "feat/company-requests-figma",
    },
    {
      id: "mobile-edit-profile-hq-map",
      title: {
        en: "Edit profile: المقر الرئيسي picked on the map; مناطق تقديم الخدمة aligned right",
        ar: "تعديل الملف: المقر الرئيسي يُحدد على الخريطة؛ ومناطق تقديم الخدمة لليمين",
      },
      priority: "P2",
      story: {
        en: "المقر الرئيسي on company and office edit profile was a free text box. It now opens the map picker (MapPickerModal, as in sign-up): the picked address name is what's shown and saved in hqLocation, and for a company the point too (latitude / longitude, sent as text in the multipart body and turned into numbers by the API). The office field no longer starts on a made-up «السالمية». The مناطق تقديم الخدمة value sat on the left: its Text had textAlign 'right', which the app's forced RTL swaps to the left; it now uses the rtl writing direction only and starts on the right.",
        ar: "كان المقر الرئيسي في تعديل ملف الشركة والمكتب حقل نص حر. الآن يفتح منتقي الخريطة (MapPickerModal كما في التسجيل): اسم العنوان المختار هو ما يُعرض ويُحفظ في hqLocation، وللشركة النقطة أيضاً (latitude / longitude، تُرسل كنص في جسم multipart ويحولها الخادم إلى أرقام). ولم يعد حقل المكتب يبدأ بـ«السالمية» مختلقة. وكانت قيمة مناطق تقديم الخدمة على اليسار: كان للنص textAlign 'right' الذي يقلبه اتجاه التطبيق المفروض (RTL) إلى اليسار؛ الآن يستخدم اتجاه الكتابة rtl فقط ويبدأ من اليمين.",
      },
      acceptanceCriteria: {
        en: [
          "Tapping المقر الرئيسي opens the map; confirming a place shows its address name in the field.",
          "After saving, the company/office page and المزيد card show that address.",
          "مناطق تقديم الخدمة shows its value on the right.",
        ],
        ar: [
          "الضغط على المقر الرئيسي يفتح الخريطة، وتأكيد مكان يعرض اسم عنوانه في الحقل.",
          "بعد الحفظ تعرض صفحة الشركة/المكتب وبطاقة المزيد ذلك العنوان.",
          "مناطق تقديم الخدمة تعرض قيمتها على اليمين.",
        ],
      },
      testScenarios: {
        en: ["As a company: edit profile › المقر الرئيسي › pick a place › save: المزيد shows the address."],
        ar: ["كشركة: تعديل الملف › المقر الرئيسي › اختر مكاناً › احفظ: تعرض المزيد العنوان."],
      },
      updatedIn: "fix/edit-profile-hq-map",
    },
    {
      id: "mobile-company-location-about",
      title: {
        en: "Company location shows an address, not coordinates; نبذة is capped at 300 characters",
        ar: "موقع الشركة يظهر كعنوان لا كإحداثيات؛ والنبذة بحد أقصى 300 حرف",
      },
      priority: "P1",
      story: {
        en: "Company sign-up saved the map pin as \"lat,lng\" in hqLocation, so the المزيد card, edit profile (المقر الرئيسي) and public cards showed raw coordinates, and location search (which matches governorate and area names) couldn't find the company. Sign-up now saves the picked address name. Coordinates already saved are hidden: the card leaves the row out, edit profile opens المقر الرئيسي empty to be written, and the API's public company/office cards fall back to the service areas (readableLocation in the app and in common/utils/location.util on the API). نبذة عن الشركة / المكتب is capped at 300 characters in sign-up, both edit-profile screens (company edit shows a «x/300» counter) and every API DTO that takes it (400 above that). The المزيد card shows at most four lines of the bio, so older long ones stay a summary.",
        ar: "كان تسجيل الشركة يحفظ دبوس الخريطة كـ\"lat,lng\" في hqLocation، فتظهر الإحداثيات الخام في بطاقة المزيد وتعديل الملف (المقر الرئيسي) والبطاقات العامة، ولا يجد البحث بالموقع (الذي يطابق أسماء المحافظات والمناطق) الشركة. الآن يحفظ التسجيل اسم العنوان المختار. والإحداثيات المحفوظة سابقاً تُخفى: البطاقة تحذف السطر، وتعديل الملف يفتح المقر الرئيسي فارغاً ليُكتب، والبطاقات العامة في الواجهة الخلفية تعرض مناطق الخدمة بدلاً منها (readableLocation في التطبيق وcommon/utils/location.util في الخادم). ونبذة عن الشركة / المكتب بحد أقصى 300 حرف في التسجيل وشاشتي تعديل الملف (تعديل الشركة يعرض عدّاد «x/300») وكل DTO في الخادم يقبلها (400 إذا زادت). وبطاقة المزيد تعرض أربعة أسطر على الأكثر من النبذة، فتبقى النبذ الطويلة القديمة ملخصاً.",
      },
      acceptanceCriteria: {
        en: [
          "A company that signed up with a map pin shows its address name, never numbers.",
          "A company with coordinates already saved shows no location row on المزيد; edit profile's المقر الرئيسي opens empty.",
          "نبذة can't be typed past 300 characters in sign-up or edit profile; the company edit shows the count.",
          "The API refuses a bio longer than 300 characters.",
        ],
        ar: [
          "الشركة التي سجلت بدبوس خريطة تعرض اسم العنوان لا أرقاماً.",
          "الشركة المحفوظ لها إحداثيات لا يظهر لها سطر موقع في المزيد، والمقر الرئيسي في تعديل الملف يفتح فارغاً.",
          "لا يمكن كتابة أكثر من 300 حرف في النبذة عند التسجيل أو التعديل، وتعديل الشركة يعرض العدد.",
          "الخادم يرفض نبذة أطول من 300 حرف.",
        ],
      },
      testScenarios: {
        en: ["Sign up a company and pick its HQ on the map: المزيد shows the address. Edit profile › نبذة: typing stops at 300 and the counter reads 300/300."],
        ar: ["سجّل شركة واختر مقرها على الخريطة: تعرض المزيد العنوان. تعديل الملف › النبذة: تتوقف الكتابة عند 300 ويعرض العداد 300/300."],
      },
      updatedIn: "fix/company-card-location-about",
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
        en: "الباقات in a company's More menu opens the company plans, not the individual ad packages. Three plans come from the API (ثلاث شهور 35, 6 شهور 60, السنوية 100 دينار كويتي), each listing what a subscription includes; a plan with a badge (الأكثر طلبا) has the orange border and tag, and the plan the company is on shows 'باقتك الحالية' with a grey disabled button. Tapping اشترك الان on Android opens the payment gateway and returns to this screen. On iOS the plans are shown without prices or a subscribe button, with one line saying that subscribing or renewing isn't possible in the app and, while covered, the date the subscription runs until; the app never says where else to subscribe (App Store rules). A company starts on a 30-day free trial. Without a running subscription or trial, adding a service or project, answering a request and issuing an invoice show 'اشترك للمتابعة' with a button to the plans (on iOS the prompt reads 'انتهت باقة شركتك' and the home banner drops its subscribe wording).",
        ar: "خيار الباقات في قائمة المزيد للشركة يفتح باقات الشركات لا باقات إعلانات الأفراد. تأتي ثلاث باقات من الخادم (ثلاث شهور 35، 6 شهور 60، السنوية 100 دينار كويتي) وكل منها يعرض ما يشمله الاشتراك؛ الباقة التي لها شارة (الأكثر طلبا) لها إطار وشارة برتقاليان، والباقة الحالية للشركة تعرض 'باقتك الحالية' مع زر رمادي معطل. الضغط على اشترك الان في أندرويد يفتح بوابة الدفع ثم يعود إلى هذه الشاشة. في iOS تُعرض الباقات بلا أسعار ولا زر اشتراك، مع سطر واحد يفيد بأنه لا يمكن الاشتراك أو التجديد من داخل التطبيق، وتاريخ انتهاء الاشتراك ما دام سارياً؛ ولا يذكر التطبيق أين يمكن الاشتراك (قواعد متجر التطبيقات). تبدأ الشركة بفترة تجريبية مجانية 30 يوماً. وبدون اشتراك أو فترة تجريبية سارية، إضافة خدمة أو مشروع والرد على طلب وإصدار فاتورة تُظهر 'اشترك للمتابعة' مع زر يفتح الباقات (وفي iOS نص التنبيه 'انتهت باقة شركتك' ولا تذكر لافتة الرئيسية الاشتراك).",
      },
      acceptanceCriteria: {
        en: [
          "More > الباقات for a company opens the company plans screen with the three plans, prices and feature lists from GET /company-plans.",
          "السنوية has the orange border and the 'الأكثر طلبا' tag.",
          "On a trial no plan carries 'باقتك الحالية'; after paying, the paid plan carries it and its button is grey and disabled.",
          "Android: اشترك الان opens the payment page; after a successful payment the app shows the success message and returns to the plans with the plan marked current.",
          "iOS: no prices and no اشترك الان button; the line 'لا يمكن الاشتراك أو تجديد الباقة من داخل التطبيق.' shows, with 'اشتراكك الحالي سارٍ حتى <date>' while covered. No text mentions a website or browser, and no payment request is made.",
          "Buying another plan while subscribed adds its period after the current end date.",
          "With an expired subscription, adding a service, adding a project, answering a request and creating an invoice show 'اشترك للمتابعة' on Android and 'انتهت باقة شركتك' on iOS, where neither the prompt nor the home banner asks the company to subscribe; 'عرض الباقات' opens the plans.",
          "The company home shows the trial countdown during the trial and the 'استعرض الباقات' card with no subscription; both open the company plans.",
        ],
        ar: [
          "المزيد > الباقات للشركة يفتح شاشة باقات الشركات بالباقات الثلاث وأسعارها ومزاياها من GET /company-plans.",
          "باقة السنوية لها الإطار البرتقالي وشارة 'الأكثر طلبا'.",
          "في الفترة التجريبية لا تحمل أي باقة 'باقتك الحالية'؛ وبعد الدفع تحملها الباقة المدفوعة وزرها رمادي معطل.",
          "أندرويد: اشترك الان يفتح صفحة الدفع؛ وبعد نجاح الدفع تظهر رسالة النجاح ويعود التطبيق إلى الباقات مع تمييز الباقة الحالية.",
          "iOS: بلا أسعار وبلا زر اشترك الان؛ يظهر السطر 'لا يمكن الاشتراك أو تجديد الباقة من داخل التطبيق.' مع 'اشتراكك الحالي سارٍ حتى <التاريخ>' ما دام الاشتراك سارياً. ولا يذكر أي نص موقعاً أو متصفحاً، ولا يُرسل أي طلب دفع.",
          "شراء باقة أخرى أثناء الاشتراك يضيف مدتها بعد تاريخ الانتهاء الحالي.",
          "مع اشتراك منتهٍ، إضافة خدمة وإضافة مشروع والرد على طلب وإنشاء فاتورة تعرض 'اشترك للمتابعة' في أندرويد و'انتهت باقة شركتك' في iOS حيث لا يطلب التنبيه ولا لافتة الرئيسية من الشركة الاشتراك؛ و'عرض الباقات' يفتح الباقات.",
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
      updatedIn: "feat/company-subscriptions, feat/landing-home-figma",
    },
    {
      id: "mobile-company-account-balance",
      title: {
        en: "Company account balance: trial, current plan, expired plan and plan history",
        ar: "رصيد حساب الشركة: الفترة التجريبية والباقة الحالية والباقة المنتهية وسجل الباقات",
      },
      priority: "P1",
      story: {
        en: "رصيد الحساب in a company's More menu opens the company's own balance screen, not the individual ad-credits one. It shows one of four states from the company's subscription. Trial: a notice with the days left and the end date, and the 'حافظ على نمو شركتك' card with استعرض الباقات. Trial ended with no plan ever bought: a red-outlined 'انتهت الفترة التجريبية.' notice and the same card. Running plan: the 'الباقة الحالية' card with the plan name, price and end date, a تفاصيل toggle that expands the plan's features, and سجل الباقات with عرض الكل; a subscribed company with no services also sees the green 'لديك رصيد متاح ابدأ باضافة أول خدماتك.' line. Expired plan: an amber line, the card tagged منتهية with استعرض الباقات and تجديد الباقة, and the history. On iOS there is no تجديد الباقة button and the purchase wording is left out.",
        ar: "خيار رصيد الحساب في قائمة المزيد للشركة يفتح شاشة رصيد الشركة لا شاشة رصيد إعلانات الأفراد. تعرض إحدى أربع حالات حسب اشتراك الشركة. الفترة التجريبية: تنبيه بالأيام المتبقية وتاريخ الانتهاء، وبطاقة 'حافظ على نمو شركتك' مع زر استعرض الباقات. انتهاء التجربة دون شراء أي باقة: تنبيه بإطار أحمر 'انتهت الفترة التجريبية.' والبطاقة نفسها. باقة سارية: بطاقة 'الباقة الحالية' باسم الباقة وسعرها وتاريخ انتهائها، وزر تفاصيل يوسّع مزايا الباقة، وسجل الباقات مع عرض الكل؛ والشركة المشتركة بلا خدمات ترى أيضاً السطر الأخضر 'لديك رصيد متاح ابدأ باضافة أول خدماتك.'. باقة منتهية: سطر كهرماني، والبطاقة بشارة منتهية مع استعرض الباقات وتجديد الباقة، والسجل. وفي iOS لا يظهر زر تجديد الباقة وتُحذف عبارات الشراء.",
      },
      acceptanceCriteria: {
        en: [
          "More > رصيد الحساب for a company opens the company balance screen.",
          "Trial: 'أنت تستخدم النسخة التجريبية', 'يتبقى N يومًا...' and 'تنتهي في: <date>' match the subscription; استعرض الباقات opens the company plans.",
          "Trial ended, no plan bought: the red-outlined notice shows; no plan card and no history.",
          "Running plan: name, price and 'تاريخ الانتهاء: <date>' match; تفاصيل expands and collapses the feature list.",
          "سجل الباقات lists the latest paid periods with a green dot while running and a red one once ended; عرض الكل opens the full list.",
          "A subscribed company with no services sees the green add-first-service line; with at least one service it does not.",
          "Expired plan: the amber line and the منتهية tag show; تجديد الباقة starts the checkout for the same plan (Android).",
          "iOS: no تجديد الباقة button, the amber line reads 'نفذت الباقة لديك.' and the trial-ended notice has no subscribe sentence.",
          "If the balance can't be loaded, an error with إعادة المحاولة shows instead of a blank screen.",
        ],
        ar: [
          "المزيد > رصيد الحساب للشركة يفتح شاشة رصيد الشركة.",
          "الفترة التجريبية: 'أنت تستخدم النسخة التجريبية' و'يتبقى N يومًا...' و'تنتهي في: <التاريخ>' تطابق الاشتراك؛ واستعرض الباقات يفتح باقات الشركات.",
          "انتهاء التجربة بلا شراء: يظهر التنبيه بالإطار الأحمر؛ ولا بطاقة باقة ولا سجل.",
          "باقة سارية: الاسم والسعر و'تاريخ الانتهاء: <التاريخ>' مطابقة؛ وزر تفاصيل يوسّع قائمة المزايا ويطويها.",
          "سجل الباقات يعرض أحدث الفترات المدفوعة بنقطة خضراء ما دامت سارية وحمراء بعد انتهائها؛ وعرض الكل يفتح القائمة الكاملة.",
          "الشركة المشتركة بلا خدمات ترى السطر الأخضر لإضافة أول خدمة؛ ومع خدمة واحدة على الأقل لا تراه.",
          "باقة منتهية: يظهر السطر الكهرماني وشارة منتهية؛ وتجديد الباقة يبدأ الدفع للباقة نفسها (أندرويد).",
          "iOS: لا زر تجديد الباقة، والسطر الكهرماني نصه 'نفذت الباقة لديك.' وتنبيه انتهاء التجربة بلا جملة الاشتراك.",
          "عند تعذر تحميل الرصيد يظهر خطأ مع إعادة المحاولة بدل شاشة فارغة.",
        ],
      },
      testScenarios: {
        en: [
          "As a company on trial open رصيد الحساب: the trial notice shows the right days and date.",
          "Subscribe to ثلاث شهور, reopen: the current plan card shows 35 د.ك; tap تفاصيل: five features; the history has one row.",
          "With an expired plan on Android tap تجديد الباقة: the payment page for the same plan opens.",
          "With an expired plan on an iPhone: only استعرض الباقات shows.",
        ],
        ar: [
          "كشركة في الفترة التجريبية افتح رصيد الحساب: التنبيه يعرض الأيام والتاريخ الصحيحين.",
          "اشترك في ثلاث شهور وأعد فتح الشاشة: بطاقة الباقة الحالية تعرض 35 د.ك؛ اضغط تفاصيل: خمس مزايا؛ والسجل فيه صف واحد.",
          "بباقة منتهية على أندرويد اضغط تجديد الباقة: تُفتح صفحة الدفع للباقة نفسها.",
          "بباقة منتهية على آيفون: يظهر استعرض الباقات فقط.",
        ],
      },
      figmaFrameUrls: [
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=4410-160208", label: { en: "Trial", ar: "الفترة التجريبية" } },
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=4410-160266", label: { en: "Trial ended", ar: "انتهاء التجربة" } },
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=4410-160555", label: { en: "Current plan", ar: "الباقة الحالية" } },
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=4410-160743", label: { en: "Plan details open", ar: "تفاصيل الباقة" } },
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=4410-160606", label: { en: "Add first service", ar: "أضف أول خدمة" } },
        { url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=4410-160662", label: { en: "Expired plan", ar: "باقة منتهية" } },
      ],
      updatedIn: "feat/company-subscriptions",
    },
  ],
};
