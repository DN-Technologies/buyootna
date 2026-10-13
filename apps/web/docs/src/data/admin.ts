import { DocSection } from "./types";

export const admin: DocSection = {
  slug: "web-admin",
  title: { en: "Web Admin", ar: "لوحة تحكم المشرف (ويب)" },
  summary: {
    en: "Next.js system administrator dashboard (apps/web/admin, port 3005). Covers the dashboard, user management, verifications (approving companies/offices), reports, the Plans page (edits the real plans), Subscriptions & Billing (mock data), and unbuilt placeholders (Deals, Notifications, Content, Roles, Settings, Logs). Feature packages are managed through the admin API only.",
    ar: "لوحة تحكم مدير النظام (apps/web/admin، المنفذ 3005). تغطي لوحة المعلومات، إدارة المستخدمين، طلبات الاعتماد (قبول الشركات/المكاتب)، البلاغات، صفحة الباقات (تعدّل الباقات الحقيقية)، الاشتراكات والفوترة (بيانات وهمية)، والصفحات غير المبنية (الصفقات، الإشعارات، المحتوى، الأدوار، الإعدادات، السجلات). باقات التمييز تُدار عبر واجهة الإدارة البرمجية فقط.",
  },
  stories: [
    {
      id: "admin-auth-guard",
      title: {
        en: "Only verified admins reach the dashboard",
        ar: "المشرفون الموثَّقون فقط يصلون إلى لوحة التحكم",
      },
      priority: "P0",
      story: {
        en: "Verify that the admin dashboard layout guards every route via GET /users/me + isAdmin, redirecting unauthorized users to /auth/login, so that a non-admin account (or an expired session) can never view admin data even by deep-linking a URL.",
        ar: "تحقق من أن تخطيط لوحة تحكم المشرف يحمي كل مسار عبر GET /users/me + isAdmin، ويعيد توجيه المستخدمين غير المخوَّلين إلى /auth/login، حتى لا يتمكن حساب غير مشرف (أو جلسة منتهية الصلاحية) من رؤية بيانات لوحة التحكم حتى عبر رابط مباشر.",
      },
      acceptanceCriteria: {
        en: [
          "Deep-linking any admin route (e.g. /users, /plans, /billing) while logged out redirects to /auth/login.",
          "Deep-linking as a logged-in but non-admin user also redirects to /auth/login (not just a blank/error page).",
          "A valid admin session loads the dashboard layout and SideNav without a flash of unauthorized content.",
          "Session expiry mid-session (token expires while dashboard is open) redirects to login on the next guarded request, not a silent broken state.",
        ],
        ar: [
          "الدخول برابط مباشر إلى أي مسار في لوحة التحكم (مثل /users أو /plans أو /billing) وأنت غير مسجَّل الدخول يعيد التوجيه إلى /auth/login.",
          "الدخول برابط مباشر كمستخدم مسجَّل دخول لكنه غير مشرف يعيد التوجيه أيضاً إلى /auth/login (لا مجرد صفحة فارغة أو خطأ).",
          "جلسة مشرف صالحة تُحمّل تخطيط لوحة التحكم وSideNav دون ظهور خاطف لمحتوى غير مخوَّل.",
          "انتهاء صلاحية الجلسة أثناء الاستخدام (انتهاء الرمز أثناء فتح لوحة التحكم) يعيد التوجيه لتسجيل الدخول عند أول طلب محمي تالٍ، لا حالة تعطّل صامتة.",
        ],
      },
      testScenarios: {
        en: [
          "Log out, then directly navigate to /users/123 by URL — confirm redirect to login, no data flash.",
          "Log in as a regular (non-admin) app user, then hit an admin URL directly — confirm redirect.",
          "Log in as admin, let the session token expire (or revoke it server-side), then click a nav link — confirm graceful redirect rather than a broken fetch/500.",
        ],
        ar: [
          "سجّل الخروج، ثم انتقل مباشرة إلى /users/123 عبر الرابط — تأكد من إعادة التوجيه لتسجيل الدخول دون أي ظهور خاطف للبيانات.",
          "سجّل الدخول كمستخدم عادي (غير مشرف)، ثم افتح رابط لوحة تحكم مباشرة — تأكد من إعادة التوجيه.",
          "سجّل الدخول كمشرف، اترك رمز الجلسة ينتهي (أو ألغِه من جهة الخادم)، ثم اضغط رابط تنقّل — تأكد من إعادة توجيه سلسة، لا طلب فاشل/خطأ 500.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "admin-password-recovery",
      title: {
        en: "Admin password recovery (OTP) flow completes correctly",
        ar: "تدفق استعادة كلمة مرور المشرف (عبر رمز OTP) يكتمل بشكل صحيح",
      },
      priority: "P0",
      story: {
        en: "Verify the 3-step admin recovery flow (POST auth/recovery/request-otp → /auth/verify-otp → POST auth/recovery/verify-otp → /auth/reset-password) works end to end, so that an admin who is locked out can regain access without support intervention, and so that OTPs can't be reused or guessed.",
        ar: "تحقق من أن تدفق استعادة الحساب للمشرف المكوَّن من 3 خطوات (POST auth/recovery/request-otp ← /auth/verify-otp ← POST auth/recovery/verify-otp ← /auth/reset-password) يعمل من البداية للنهاية، حتى يستطيع المشرف المحظور من الدخول استعادة وصوله دون تدخل الدعم الفني، وحتى لا يمكن إعادة استخدام أو تخمين رموز OTP.",
      },
      acceptanceCriteria: {
        en: [
          "Requesting an OTP from /auth/forgot-password sends it to the correct channel (email/SMS) and navigates to /auth/verify-otp.",
          "An incorrect OTP is rejected with a clear error and does not advance to reset-password.",
          "A correct OTP advances to /auth/reset-password, and the new password takes effect immediately for the next login.",
          "An OTP cannot be reused after a successful reset, and expires after its documented window.",
        ],
        ar: [
          "طلب رمز OTP من /auth/forgot-password يرسله عبر القناة الصحيحة (بريد إلكتروني/رسالة نصية) وينتقل إلى /auth/verify-otp.",
          "رمز OTP خاطئ يُرفض مع رسالة خطأ واضحة ولا ينتقل إلى شاشة reset-password.",
          "رمز OTP صحيح ينتقل إلى /auth/reset-password، وكلمة المرور الجديدة تصبح فعّالة فوراً لتسجيل الدخول التالي.",
          "لا يمكن إعادة استخدام رمز OTP بعد استعادة ناجحة، وينتهي بعد المدة الموثَّقة له.",
        ],
      },
      testScenarios: {
        en: [
          "Full happy path: request OTP → enter correct code → set new password → log in with new password.",
          "Enter an expired OTP (wait past the expiry window) and confirm rejection with a resend option.",
          "Attempt to reuse an already-consumed OTP on a second reset attempt — confirm rejection.",
          "Navigate directly to /auth/reset-password without completing OTP verification — confirm it's not reachable/usable without a valid verified session.",
        ],
        ar: [
          "المسار الطبيعي الكامل: طلب رمز OTP ← إدخال الرمز الصحيح ← تعيين كلمة مرور جديدة ← تسجيل الدخول بكلمة المرور الجديدة.",
          "أدخل رمز OTP منتهي الصلاحية (انتظر بعد مدة الانتهاء) وتأكد من الرفض مع خيار إعادة الإرسال.",
          "حاول إعادة استخدام رمز OTP مستهلَك مسبقاً في محاولة استعادة ثانية — تأكد من الرفض.",
          "انتقل مباشرة إلى /auth/reset-password دون إكمال التحقق عبر OTP — تأكد أنها غير قابلة للوصول/الاستخدام دون جلسة موثَّقة صالحة.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "admin-dashboard-metrics",
      title: {
        en: "Dashboard metrics and charts reflect real data",
        ar: "مؤشرات ورسوم لوحة القيادة تعكس بيانات حقيقية",
      },
      priority: "P1",
      story: {
        en: "Verify the dashboard home (MetricsGrid, RevenueChart, UsersDonutChart, RecentRegistrationsTable, RecentActivitiesCard, ReportsCard, VerificationRequestsCard) renders numbers/charts consistent with the underlying user and revenue data, so that admins aren't making decisions off of stale or mismatched figures.",
        ar: "تحقق من أن الصفحة الرئيسية للوحة القيادة (MetricsGrid وRevenueChart وUsersDonutChart وRecentRegistrationsTable وRecentActivitiesCard وReportsCard وVerificationRequestsCard) تعرض أرقاماً/رسوماً متسقة مع بيانات المستخدمين والإيرادات الفعلية، حتى لا يتخذ المشرفون قرارات بناءً على أرقام قديمة أو غير متطابقة.",
      },
      acceptanceCriteria: {
        en: [
          "MetricsGrid totals (e.g. user counts) match what's independently visible in the /users table for the same period.",
          "RevenueChart and UsersDonutChart update when the underlying data changes (new registration, new payment) within an expected refresh window.",
          "RecentRegistrationsTable shows the most recent signups in correct order, matching /users sorted by creation date.",
          "VerificationRequestsCard counts match the actual number of pending verification requests.",
          "أحدث التسجيلات lists the newest profiles, not only new accounts: a company or office added from the app to an existing individual account appears there at once, named as the company or office and typed شركة / مكتب عقاري, with the time it was added.",
        ],
        ar: [
          "مجاميع MetricsGrid (مثل عدد المستخدمين) تطابق ما يظهر بشكل مستقل في جدول /users لنفس الفترة.",
          "RevenueChart وUsersDonutChart يتحدثان عند تغيّر البيانات الأساسية (تسجيل جديد، دفعة جديدة) ضمن نافذة تحديث معقولة.",
          "RecentRegistrationsTable يعرض أحدث التسجيلات بالترتيب الصحيح، مطابقاً لـ /users مرتبة حسب تاريخ الإنشاء.",
          "أعداد VerificationRequestsCard تطابق العدد الفعلي لطلبات التوثيق المعلَّقة.",
          "قائمة أحدث التسجيلات تعرض أحدث الملفات لا الحسابات الجديدة فقط: الشركة أو المكتب المضاف من التطبيق إلى حساب فرد قائم يظهر فيها فوراً، باسم الشركة أو المكتب ونوع شركة / مكتب عقاري، وبوقت إضافته.",
        ],
      },
      testScenarios: {
        en: [
          "Register a new test user, then confirm they appear in RecentRegistrationsTable and the relevant MetricsGrid count increments.",
          "Cross-check a date range on RevenueChart against invoice data for the same range.",
          "With zero data (fresh/empty environment), confirm every chart/card shows a sane empty/zero state rather than an error or NaN.",
          "From an individual account created earlier, add a company in the app, then open the admin home — the company is the first row of أحدث التسجيلات.",
        ],
        ar: [
          "سجّل مستخدم اختبار جديداً، ثم تأكد من ظهوره في RecentRegistrationsTable وزيادة العدّاد المرتبط في MetricsGrid.",
          "قارن نطاق تاريخ في RevenueChart ببيانات الفواتير لنفس النطاق.",
          "في بيئة فارغة تماماً (بلا بيانات)، تأكد أن كل رسم/بطاقة تعرض حالة فارغة/صفرية منطقية، لا خطأ أو قيمة NaN.",
          "من حساب فرد أُنشئ سابقاً أضف شركة من التطبيق ثم افتح رئيسية الإدارة — الشركة هي أول صف في أحدث التسجيلات.",
        ],
      },
      updatedIn: "fix/added-company-admin-and-switch",
    },
    {
      id: "admin-users-table",
      title: {
        en: "User management table: search, filter, status changes, and delete are all correct",
        ar: "جدول إدارة المستخدمين: البحث والفلترة وتغيير الحالة والحذف كلها تعمل بشكل صحيح",
      },
      priority: "P0",
      story: {
        en: "Verify /users (fetchAdminUsers, tabs all/individual/office/company, updateUserStatus, deleteUser) correctly searches, filters, paginates, and mutates user records, so that admins can safely manage accounts without affecting the wrong user or losing data silently.",
        ar: "تحقق من أن /users (fetchAdminUsers، تبويبات الكل/فرد/مكتب عقاري/شركة، updateUserStatus، deleteUser) يبحث ويفلتر ويقسّم الصفحات ويعدّل سجلات المستخدمين بشكل صحيح، حتى يستطيع المشرفون إدارة الحسابات بأمان دون التأثير على مستخدم خاطئ أو فقدان بيانات بصمت.",
      },
      acceptanceCriteria: {
        en: [
          "Switching between all/individual/office/company tabs filters the table to accounts that are, or have added, that persona (an individual who later added a company also appears under شركة, typed شركة, with its approval status), with correct total counts.",
          "Search narrows results by name/email/phone as expected, combined correctly with the active role tab.",
          "Pagination controls move through the full result set without skipping or duplicating rows across pages.",
          "updateUserStatus reflects immediately in the table (and ideally on that user's own next login/session), and deleteUser removes the user everywhere (their listings, chats, etc. handled per business rule, not left dangling).",
          "With the default order (newest first) the list is ordered by each account's newest profile, so an account that just added a company or office moves to the top of its tab; sorting by name is unchanged.",
        ],
        ar: [
          "التبديل بين تبويبات الكل/فرد/مكتب عقاري/شركة يفلتر الجدول للحسابات التي هي، أو أضافت، تلك الهوية (الفرد الذي أضاف شركة لاحقاً يظهر أيضاً تحت شركة بنوع شركة وحالة الاعتماد)، مع مجاميع إجمالية صحيحة.",
          "البحث يُضيّق النتائج بالاسم/البريد الإلكتروني/الهاتف كما هو متوقع، ويُدمج بشكل صحيح مع تبويب الدور النشط.",
          "عناصر التحكم في ترقيم الصفحات تتنقل عبر كامل مجموعة النتائج دون تخطي أو تكرار صفوف بين الصفحات.",
          "updateUserStatus ينعكس فوراً في الجدول (ومن الناحية المثالية في جلسة/دخول ذلك المستخدم التالي)، وdeleteUser يحذف المستخدم من كل مكان (إعلاناته، محادثاته، إلخ تُعالَج حسب قاعدة العمل المحددة، لا أن تُترك معلَّقة).",
          "بالترتيب الافتراضي (الأحدث أولاً) تُرتَّب القائمة حسب أحدث ملف في كل حساب، فالحساب الذي أضاف شركة أو مكتباً للتو ينتقل إلى أعلى تبويبه؛ والترتيب بالاسم لم يتغير.",
        ],
      },
      testScenarios: {
        en: [
          "Search for a known user by partial name and by full email, confirm both find the same record.",
          "Apply the 'company' tab filter, then search — confirm results are the intersection, not the search ignoring the tab.",
          "Change a user's status (e.g. disable) and confirm that user is immediately blocked from logging in via mobile/web.",
          "Delete a test user who has active listings/favorites/chats and verify the app doesn't crash for the other party in those relationships (e.g. a chat partner).",
          "From an individual account in the app add a company (إضافة هوية شركة), then in admin open the 'company' tab — the account is listed as شركة with status قيد الانتظار, and it is also in verifications.",
          "Page through a list of 50+ users and confirm no row appears twice or is skipped across page boundaries.",
          "Add a company to an older individual account, open المستخدمون → شركات — that account is the first row, shown under the company's name.",
        ],
        ar: [
          "ابحث عن مستخدم معروف بجزء من الاسم وبالبريد الإلكتروني الكامل، وتأكد أن كلا البحثين يجد نفس السجل.",
          "طبّق فلتر تبويب 'شركة'، ثم ابحث — تأكد أن النتائج هي تقاطع الفلترين معاً، لا أن البحث يتجاهل التبويب.",
          "غيّر حالة مستخدم (مثل التعطيل) وتأكد أن ذلك المستخدم يُمنع فوراً من تسجيل الدخول عبر الجوال/الويب.",
          "احذف مستخدم اختبار لديه إعلانات/مفضلة/محادثات نشطة وتحقق أن التطبيق لا يتعطل للطرف الآخر في تلك العلاقات (مثل شريك المحادثة).",
          "من حساب فردي في التطبيق أضف شركة (إضافة هوية شركة)، ثم افتح تبويب 'شركة' في لوحة المشرف — يظهر الحساب كـ شركة بحالة قيد الانتظار، ويظهر أيضاً في طلبات الاعتماد.",
          "تصفّح قائمة تضم أكثر من 50 مستخدماً وتأكد أن أي صف لا يظهر مرتين أو يُتخطى بين الصفحات.",
          "أضف شركة إلى حساب فرد قديم وافتح المستخدمون ← شركات — ذلك الحساب أول صف، باسم الشركة.",
        ],
      },
      updatedIn: "fix/added-company-admin-and-switch",
    },
    {
      id: "admin-user-detail-tabs",
      title: {
        en: "User detail page's 11 tabs each show correct, role-appropriate data",
        ar: "تبويبات صفحة تفاصيل المستخدم الـ11 تعرض كل منها بيانات صحيحة تناسب الدور",
      },
      priority: "P1",
      story: {
        en: "Verify /users/[id]'s tabs (overview, ads, requests, services, exhibition, packages, invoices, reports, ratings, logs, notes) each load correct data for the specific user, and that the Overview tab correctly switches between IndividualProfileOverview / OfficeProfileOverview / CompanyProfileOverview based on that user's role, so that admins never see one user's data rendered under another user's ID, or the wrong overview component for a role.",
        ar: "تحقق من أن تبويبات /users/[id] (نظرة عامة، الإعلانات، الطلبات، الخدمات، المعرض، الباقة، الفواتير، البلاغات، التقييمات، السجل، ملاحظات) يحمّل كل منها بيانات صحيحة خاصة بذلك المستخدم تحديداً، وأن تبويب النظرة العامة يبدّل بشكل صحيح بين IndividualProfileOverview / OfficeProfileOverview / CompanyProfileOverview حسب دور ذلك المستخدم، حتى لا يرى المشرفون بيانات مستخدم معروضة تحت معرّف مستخدم آخر، أو مكوّن نظرة عامة خاطئاً لدور معيّن.",
      },
      acceptanceCriteria: {
        en: [
          "Opening an individual, office, and company user's detail page each renders the correct overview component variant.",
          "Every tab's data (ads, invoices, ratings, etc.) belongs strictly to the user in the URL — switching users updates every tab, not just Overview.",
          "The Packages tab correctly opens ChangePackageDrawer and AddExceptionalFeatureDrawer, and changes made there are reflected in the Packages tab afterward.",
          "Tabs with no data (e.g. a user with zero reports) show an empty state, not an error.",
        ],
        ar: [
          "فتح صفحة تفاصيل مستخدم فردي، ومكتب عقاري، وشركة يعرض في كل حالة مكوّن النظرة العامة الصحيح المناسب.",
          "بيانات كل تبويب (الإعلانات، الفواتير، التقييمات، إلخ) تخص حصرياً المستخدم الموجود في الرابط — تبديل المستخدم يحدّث كل تبويب، لا النظرة العامة فقط.",
          "تبويب الباقة يفتح بشكل صحيح ChangePackageDrawer وAddExceptionalFeatureDrawer، والتغييرات التي تُجرى هناك تنعكس بعد ذلك في تبويب الباقة.",
          "التبويبات بلا بيانات (مثل مستخدم بلا أي بلاغات) تعرض حالة فارغة، لا خطأ.",
        ],
      },
      testScenarios: {
        en: [
          "Open three different users (one of each role) by ID and confirm each renders its role-specific Overview.",
          "On a single user, click through all 11 tabs and confirm the URL/tab state updates correctly and back/forward browser navigation lands on the right tab.",
          "From the Packages tab, use Change Package and Add Exceptional Feature, confirm the success toast appears, then reload the tab and confirm the change persisted.",
          "Open two different user IDs in two browser tabs and confirm no cross-contamination of tab state (e.g. via shared client cache).",
        ],
        ar: [
          "افتح ثلاثة مستخدمين مختلفين (واحد من كل دور) عبر المعرّف وتأكد أن كلاً منهم يعرض النظرة العامة الخاصة بدوره.",
          "على مستخدم واحد، اضغط عبر جميع التبويبات الـ11 وتأكد أن حالة الرابط/التبويب تتحدث بشكل صحيح وأن التنقل بالرجوع/التقدم في المتصفح يصل إلى التبويب الصحيح.",
          "من تبويب الباقة، استخدم تغيير الباقة وإضافة ميزة استثنائية، تأكد من ظهور إشعار النجاح، ثم أعد تحميل التبويب وتأكد من بقاء التغيير محفوظاً.",
          "افتح معرّفَي مستخدمين مختلفين في تبويبَي متصفح وتأكد من عدم تداخل حالة التبويبات بينهما (مثلاً عبر ذاكرة تخزين مؤقت مشتركة في العميل).",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "admin-plans-pricing",
      title: {
        en: "Admin Plans page edits the real plans the app sells",
        ar: "صفحة الباقات في لوحة الإدارة تعدّل الباقات الحقيقية التي يبيعها التطبيق",
      },
      priority: "P0",
      story: {
        en: "Verify /plans loads the real plans (GET /admin/plans — the same Normal/Silver/Gold set in each account-type tab, since the app sells one set) and that saving the edit drawer changes them (PATCH /admin/plans/:id): name, price, hidden/active, ads per credit, publish days, images, featured/pinned, priority search. The app's feature lines are rebuilt from the numbers on save, each edit is logged as 'تعديل باقة', and the summary cards show real totals, active/hidden counts and the most-bought plan.",
        ar: "تحقق من أن /plans تحمّل الباقات الحقيقية (GET /admin/plans — نفس مجموعة العادية/الفضية/الذهبية في كل تبويب لأن التطبيق يبيع مجموعة واحدة) وأن حفظ نافذة التعديل يغيّرها (PATCH /admin/plans/:id): الاسم، السعر، مخفية/نشطة، الإعلانات لكل رصيد، أيام النشر، الصور، التمييز/التثبيت، أولوية البحث. تُعاد كتابة أسطر المزايا في التطبيق من الأرقام عند الحفظ، ويُسجَّل كل تعديل كـ'تعديل باقة'، وتعرض بطاقات الملخص الإجماليات الحقيقية وعدد النشطة/المخفية والباقة الأكثر شراءً.",
      },
      acceptanceCriteria: {
        en: [
          "Changing Silver's price and saving shows the new price after reload and in the app's plan screen and checkout.",
          "Setting a plan to hidden marks it 'مخفية' here and removes it from the app's plans list; existing credits from it keep working.",
          "Closing the drawer with unsaved changes asks to discard; discarding changes nothing.",
          "Invalid values (negative price, 0 days) are refused.",
        ],
        ar: [
          "تغيير سعر الفضية وحفظه يعرض السعر الجديد بعد إعادة التحميل وفي شاشة الباقات والدفع في التطبيق.",
          "جعل الباقة مخفية يعلّمها 'مخفية' هنا ويزيلها من قائمة الباقات في التطبيق؛ والأرصدة الحالية منها تستمر بالعمل.",
          "إغلاق النافذة بتعديلات غير محفوظة يطلب التأكيد؛ والتجاهل لا يغيّر شيئاً.",
          "القيم غير الصالحة (سعر سالب، 0 أيام) تُرفض.",
        ],
      },
      testScenarios: {
        en: [
          "Edit Gold's duration to 90 days, save, open the app's plans — '90 يوم' shows.",
          "Hide Silver, check the app — gone; unhide — back.",
          "Check the Logs tab — the edit appears as 'تعديل باقة'.",
        ],
        ar: [
          "عدّل مدة الذهبية إلى 90 يوماً واحفظ ثم افتح باقات التطبيق — يظهر '90 يوم'.",
          "أخفِ الفضية وتحقق من التطبيق — اختفت؛ أظهرها — عادت.",
          "افحص تبويب السجلات — يظهر التعديل كـ'تعديل باقة'.",
        ],
      },
      updatedIn: "fix/review-findings",
    },
    {
      id: "admin-billing-subscriptions",
      title: {
        en: "Subscriptions table currently renders from mock data (known gap)",
        ar: "جدول الاشتراكات يُعرض حالياً من بيانات وهمية (نقص معروف)",
      },
      priority: "P1",
      story: {
        en: "Verify the /billing Subscriptions tab (BillingMetrics, BillingFilters, SubscriptionsTable, BillingPagination) renders and paginates correctly against MOCK_SUBSCRIPTIONS, so that UI behavior (filtering, sorting, pagination) is validated now while flagging that a live-data regression pass is required once this is wired to the real billing/invoices API.",
        ar: "تحقق من أن تبويب الاشتراكات في /billing (BillingMetrics وBillingFilters وSubscriptionsTable وBillingPagination) يُعرض ويُقسَّم على صفحات بشكل صحيح اعتماداً على MOCK_SUBSCRIPTIONS، حتى يُتحقق من سلوك الواجهة (الفلترة، الترتيب، ترقيم الصفحات) الآن، مع التنويه بأن جولة اختبار انحدار على بيانات حقيقية مطلوبة بمجرد ربط هذا التبويب بواجهة برمجة الفوترة/الفواتير الفعلية.",
      },
      acceptanceCriteria: {
        en: [
          "BillingFilters correctly narrow the mock dataset (status, date range, plan tier as applicable) and BillingMetrics recalculates to match the filtered set.",
          "BillingPagination correctly pages through the full mock dataset with no duplicate/missing rows.",
          "This story must be re-verified against live data once MOCK_SUBSCRIPTIONS is replaced — track as a follow-up rather than a one-time pass.",
        ],
        ar: [
          "BillingFilters يُضيّق بشكل صحيح مجموعة البيانات الوهمية (الحالة، النطاق الزمني، فئة الباقة إن أمكن) وBillingMetrics يعيد الحساب ليطابق المجموعة المفلترة.",
          "BillingPagination يتنقل بشكل صحيح عبر كامل مجموعة البيانات الوهمية دون صفوف مكررة أو مفقودة.",
          "يجب إعادة اختبار هذه القصة على بيانات حقيقية بمجرد استبدال MOCK_SUBSCRIPTIONS — تابعها كمهمة لاحقة، لا كفحص لمرة واحدة.",
        ],
      },
      testScenarios: {
        en: [
          "Apply each available filter individually and in combination, confirming BillingMetrics totals always match the currently-filtered table rows.",
          "Page through the mock dataset fully and count total rows shown vs. the known mock dataset size to confirm no rows are lost.",
          "Flag explicitly in test reports that this is exercising mock data, so a future live-data pass isn't skipped once the backend is connected.",
        ],
        ar: [
          "طبّق كل فلتر متاح منفرداً ومجتمعاً مع غيره، وتأكد أن مجاميع BillingMetrics تطابق دائماً صفوف الجدول المفلترة حالياً.",
          "تصفّح كامل مجموعة البيانات الوهمية واحسب إجمالي الصفوف المعروضة مقارنة بحجم المجموعة الوهمية المعروف للتأكد من عدم فقدان أي صف.",
          "وثّق صراحةً في تقارير الاختبار أن هذا الفحص يعتمد على بيانات وهمية، حتى لا تُتخطى جولة اختبار البيانات الحقيقية لاحقاً بمجرد ربط الواجهة الخلفية.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "admin-billing-invoices-empty",
      title: {
        en: "Invoices tab currently shows a fixed empty state (known gap)",
        ar: "تبويب الفواتير يعرض حالياً حالة فارغة ثابتة (نقص معروف)",
      },
      priority: "P1",
      story: {
        en: "Verify the /billing Invoices tab renders its documented empty state consistently, so that this intentionally-not-yet-built area doesn't get flagged as 'broken' rather than 'not yet implemented', and so regressions in that empty-state UI are still caught.",
        ar: "تحقق من أن تبويب الفواتير في /billing يعرض حالته الفارغة الموثَّقة بثبات، حتى لا يُصنَّف هذا القسم غير المبني عمداً بعد كـ'معطوب' بدلاً من 'لم يُبنَ بعد'، ومع ذلك تُلتقط أي انحدارات في واجهة تلك الحالة الفارغة نفسها.",
      },
      acceptanceCriteria: {
        en: [
          "The Invoices tab always shows the empty state regardless of filters/search applied — expected today.",
          "The empty state renders correctly (no layout break, no console errors) across all supported browsers/breakpoints.",
          "This story's acceptance criteria must be replaced once real invoice data/listing is implemented.",
        ],
        ar: [
          "تبويب الفواتير يعرض دائماً الحالة الفارغة بغض النظر عن الفلاتر/البحث المطبَّق — وهذا متوقع حالياً.",
          "الحالة الفارغة تُعرض بشكل صحيح (بلا كسر في التخطيط، وبلا أخطاء في وحدة التحكم) عبر كل المتصفحات/أحجام الشاشة المدعومة.",
          "يجب استبدال معايير القبول لهذه القصة بمجرد تطبيق عرض بيانات فواتير حقيقية.",
        ],
      },
      testScenarios: {
        en: [
          "Open the Invoices tab and confirm the empty state matches the same visual language as other empty states in the app (see admin-placeholder-pages).",
          "Resize the browser window / test on mobile-width viewport and confirm the empty state doesn't break layout.",
        ],
        ar: [
          "افتح تبويب الفواتير وتأكد أن الحالة الفارغة تطابق نفس اللغة البصرية للحالات الفارغة الأخرى في التطبيق (راجع admin-placeholder-pages).",
          "غيّر حجم نافذة المتصفح / اختبر بعرض شاشة جوال وتأكد أن الحالة الفارغة لا تكسر التخطيط.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "admin-placeholder-pages",
      title: {
        en: "Deals, Notifications, Content, Roles, Settings and Logs are unbuilt scaffolds",
        ar: "الصفقات والإشعارات والمحتوى والأدوار والإعدادات والسجلات هياكل غير مبنية",
      },
      priority: "P2",
      story: {
        en: "Confirm these six admin pages render their 'no data' placeholder rather than an error: /deals ('لا توجد صفقات أو مزادات نشطة لعرضها حالياً'), /notifications, /content, /roles, /settings and /logs. Track them as known scaffolds, not six separate bugs.",
        ar: "تأكد من أن صفحات الإدارة الست هذه تعرض حالة 'لا توجد بيانات' وليس خطأ: /deals ('لا توجد صفقات أو مزادات نشطة لعرضها حالياً') و /notifications و /content و /roles و /settings و /logs. تُتابَع كهياكل معروفة وليست ستة أخطاء منفصلة.",
      },
      acceptanceCriteria: {
        en: [
          "Each page loads without errors and shows its placeholder text.",
          "Their buttons don't throw errors.",
          "Each has a working link in the side menu.",
        ],
        ar: [
          "كل صفحة تُحمَّل دون أخطاء وتعرض نص الحالة الفارغة.",
          "أزرارها لا تسبب أخطاء.",
          "لكل منها رابط يعمل في القائمة الجانبية.",
        ],
      },
      testScenarios: {
        en: [
          "Open each of the six from the side menu.",
        ],
        ar: [
          "افتح كل صفحة من الست من القائمة الجانبية.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "admin-verifications",
      title: {
        en: "Verifications: approving or rejecting new companies and offices",
        ar: "طلبات الاعتماد: قبول أو رفض الشركات والمكاتب الجديدة",
      },
      priority: "P0",
      story: {
        en: "New companies are approved automatically when created, so only offices (and companies an admin set back) wait here. Verify /verifications lists companies and offices waiting for approval (GET /admin/verifications) — from both direct signup and in-app onboarding — and that approving or rejecting (PATCH /admin/identities/:id/status) takes effect in the app: an approved company can publish and receive requests; a rejected one sees 'تم رفض طلب اعتماد حسابك…' when it tries.",
        ar: "الشركات الجديدة تُعتمد تلقائياً عند إنشائها، فلا ينتظر هنا إلا المكاتب (والشركات التي أعادها مسؤول). تحقق من أن /verifications تعرض الشركات والمكاتب المنتظرة للاعتماد (GET /admin/verifications) — من التسجيل المباشر والإضافة من داخل التطبيق — وأن القبول أو الرفض (PATCH /admin/identities/:id/status) ينعكس في التطبيق: الشركة المقبولة تستطيع النشر واستقبال الطلبات؛ والمرفوضة ترى 'تم رفض طلب اعتماد حسابك…' عند المحاولة.",
      },
      acceptanceCriteria: {
        en: [
          "An office added from the app appears in the list as pending; a new company does not, and is already listed in the directory.",
          "Approving it lets it publish; its listing on the directory and map appears.",
          "Rejecting it with a reason blocks publishing with the rejection message.",
        ],
        ar: [
          "المكتب المضاف من التطبيق يظهر في القائمة كقيد المراجعة؛ والشركة الجديدة لا تظهر فيها وهي معروضة في الدليل مباشرة.",
          "قبولها يسمح لها بالنشر؛ ويظهر في الدليل والخريطة.",
          "رفضها مع سبب يمنع النشر مع رسالة الرفض.",
        ],
      },
      testScenarios: {
        en: [
          "Add an office in-app, approve it in /verifications, publish an ad from it.",
        ],
        ar: [
          "أضف مكتباً من التطبيق واعتمده في /verifications ثم انشر إعلاناً منه.",
        ],
      },
      updatedIn: "feat/company-auto-approve",
    },
    {
      id: "admin-feature-packages-api-only",
      title: {
        en: "Feature packages are editable through the admin API only",
        ar: "باقات التمييز قابلة للتعديل عبر واجهة الإدارة البرمجية فقط",
      },
      priority: "P2",
      story: {
        en: "The packages the app sells for featuring an ad are managed by GET/POST /admin/feature-packages and PATCH /admin/feature-packages/:id, but the admin portal has no screen for them yet. Changes are made with an admin token (e.g. from Postman) until one exists.",
        ar: "الباقات التي يبيعها التطبيق لتمييز الإعلان تُدار عبر GET/POST /admin/feature-packages و PATCH /admin/feature-packages/:id، لكن لوحة الإدارة لا تحتوي شاشة لها بعد. تُجرى التعديلات برمز مسؤول (مثلاً من Postman) حتى تتوفر الشاشة.",
      },
      acceptanceCriteria: {
        en: [
          "A package deactivated through the API disappears from the app's 'تمييز الإعلان' sheet.",
          "A price change is what the next Tap charge uses.",
        ],
        ar: [
          "الباقة المعطّلة عبر الواجهة البرمجية تختفي من نافذة 'تمييز الإعلان' في التطبيق.",
          "تغيير السعر هو ما تستخدمه عملية الدفع التالية في Tap.",
        ],
      },
      testScenarios: {
        en: [
          "PATCH a package's price as admin, open the feature sheet in the app — the new price shows.",
        ],
        ar: [
          "عدّل سعر باقة كمسؤول ثم افتح نافذة التمييز في التطبيق — يظهر السعر الجديد.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "admin-account-suspension",
      title: {
        en: "Suspending or blocking a user signs them out and keeps them out until an admin reactivates",
        ar: "إيقاف أو حظر مستخدم يسجّل خروجه ويمنعه من الدخول حتى تعيد الإدارة تفعيله",
      },
      priority: "P0",
      endUserStory: {
        en: "As an admin, I want to suspend or ban violating accounts, so that they can't use the app until their status is reviewed and can't reactivate themselves.",
        ar: "بصفتي مشرفاً، أريد إيقاف أو حظر الحسابات المخالفة، حتى لا تستخدم التطبيق حتى مراجعة حالتها ولا تستطيع إعادة تفعيل نفسها.",
      },
      story: {
        en: "Verify Users → Suspend (موقوف) / Block (محظور) (PATCH /admin/users/:id/status with suspended/blocked): the account becomes suspended_by_admin / blocked, every session is deleted so an online user is signed out on their next request, and any self-deactivation (suspendedAt/suspendedUntil) is cleared so neither signing in nor the timed-reactivation job can undo it. Signing in with the right password then returns 403 ACCOUNT_SUSPENDED_BY_ADMIN with 'تم إيقاف حسابك من قبل الإدارة. يرجى التواصل مع الدعم.' and changes nothing. Setting the status back to active lets them in.",
        ar: "تحقق من المستخدمين ← إيقاف (موقوف) / حظر (محظور) (PATCH /admin/users/:id/status بالقيمة suspended/blocked): يصبح الحساب suspended_by_admin / blocked، وتُحذف كل جلساته فيُسجَّل خروج المستخدم المتصل عند طلبه التالي، ويُمسح أي تعطيل ذاتي (suspendedAt/suspendedUntil) حتى لا يلغيه تسجيل الدخول ولا مهمة إعادة التفعيل التلقائي. بعدها تسجيل الدخول بكلمة المرور الصحيحة يُرجع 403 ACCOUNT_SUSPENDED_BY_ADMIN مع 'تم إيقاف حسابك من قبل الإدارة. يرجى التواصل مع الدعم.' ولا يغيّر شيئاً. إعادة الحالة إلى نشط تسمح له بالدخول.",
      },
      acceptanceCriteria: {
        en: [
          "After Suspend/Block, the user's open app is signed out on its next request (401).",
          "Login with the right password shows 'تم إيقاف حسابك من قبل الإدارة. يرجى التواصل مع الدعم.' (403); a wrong password still shows the generic invalid-credentials message.",
          "The status stays suspended/blocked after any number of login attempts.",
          "A user who had deactivated their own account and is then suspended by an admin can't get back in by signing in.",
          "Reactivating from the dashboard lets the user sign in again and their ads reappear.",
        ],
        ar: [
          "بعد الإيقاف/الحظر يُسجَّل خروج تطبيق المستخدم المفتوح عند طلبه التالي (401).",
          "تسجيل الدخول بكلمة المرور الصحيحة يعرض 'تم إيقاف حسابك من قبل الإدارة. يرجى التواصل مع الدعم.' (403)؛ وكلمة المرور الخاطئة تعرض رسالة بيانات الدخول العامة.",
          "تبقى الحالة موقوف/محظور مهما تكررت محاولات الدخول.",
          "المستخدم الذي عطّل حسابه بنفسه ثم أوقفته الإدارة لا يستطيع العودة بتسجيل الدخول.",
          "إعادة التفعيل من لوحة التحكم تسمح للمستخدم بالدخول مجدداً وتعود إعلاناته.",
        ],
      },
      testScenarios: {
        en: [
          "Sign a test user in on the app, suspend them from the dashboard, then pull to refresh in the app — signed out to the login screen.",
          "Try to log in as that user — the suspension message appears; check the dashboard still shows موقوف.",
          "Block another test user and try to log in — same message.",
          "Deactivate a test account from the app (حتى أعود), suspend it from the dashboard, then sign in — refused with the suspension message.",
          "Reactivate from the dashboard and sign in — works.",
        ],
        ar: [
          "سجّل دخول مستخدم اختبار في التطبيق، وأوقفه من لوحة التحكم، ثم حدّث الشاشة في التطبيق — يُسجَّل خروجه إلى شاشة الدخول.",
          "حاول الدخول بذلك المستخدم — تظهر رسالة الإيقاف؛ وتأكد أن لوحة التحكم ما زالت تعرض موقوف.",
          "احظر مستخدم اختبار آخر وحاول الدخول — نفس الرسالة.",
          "عطّل حساب اختبار من التطبيق (حتى أعود)، ثم أوقفه من لوحة التحكم، ثم سجّل الدخول — يُرفض برسالة الإيقاف.",
          "أعد التفعيل من لوحة التحكم وسجّل الدخول — يعمل.",
        ],
      },
      updatedIn: "feat/account-state",
    },
  ],
};
