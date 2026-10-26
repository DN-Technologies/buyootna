import { DocSection } from "./types";

export const testing: DocSection = {
  slug: "web-testing",
  title: { en: "Testing Portal", ar: "بوابة الاختبار" },
  summary: {
    en: "testing.buyootna.cloud / .com (apps/web/testing, port 3007): the testers' and QA team's mobile-first portal, installable as an app. Health of every part of the platform, API metrics, live logs, the builds in use, and an audit log, behind its own password. It runs on the production server, against production data.",
    ar: "testing.buyootna.cloud / .com (apps/web/testing، المنفذ 3007): بوابة فريق الاختبار وضمان الجودة، مصممة للجوال أولاً وقابلة للتثبيت كتطبيق. حالة كل أجزاء المنصة، ومقاييس الـ API، والسجلات المباشرة، والنسخ المستخدمة، وسجل البوابة، خلف كلمة مرور خاصة بها. تعمل على خادم الإنتاج وبياناته.",
  },
  stories: [
    {
      id: "testing-sign-in",
      title: {
        en: "Testers sign in with the portal's own password and their name",
        ar: "يدخل المختبرون بكلمة مرور البوابة وأسمائهم",
      },
      priority: "P0",
      story: {
        en: "The portal has its own password (TestingCredential LOGIN, set with testing:set-password), separate from the app and the docs portal, and its own token secret (TESTING_JWT_SECRET). The tester also gives their name, which is recorded with every action. 5 wrong passwords from one IP lock sign-in for 15 minutes. Setting a new password signs everyone out. Without TESTING_JWT_SECRET the portal stays locked.",
        ar: "للبوابة كلمة مرور خاصة (TestingCredential LOGIN، تُضبط بـ testing:set-password) منفصلة عن التطبيق وبوابة التوثيق، وسر توقيع خاص (TESTING_JWT_SECRET). يدخل المختبر اسمه أيضاً ويُسجَّل مع كل إجراء. 5 محاولات خاطئة من نفس العنوان تقفل الدخول 15 دقيقة. ضبط كلمة مرور جديدة يُخرج الجميع. بدون TESTING_JWT_SECRET تبقى البوابة مقفلة.",
      },
      acceptanceCriteria: {
        en: [
          "Every page except /login, the manifest, the service worker and the offline page redirects to /login when signed out; every /testing-portal API route returns 401 without the token.",
          "A docs-portal or app token is refused by the testing API.",
          "Each sign-in appears in المزيد › سجل البوابة with the name.",
        ],
        ar: [
          "كل صفحة عدا /login والـ manifest وعامل الخدمة وصفحة عدم الاتصال تحوّل إلى /login بدون دخول؛ وكل مسارات /testing-portal في الـ API تُرجع 401 بدون رمز.",
          "رمز بوابة التوثيق أو التطبيق مرفوض في الـ API الخاص بالاختبار.",
          "كل دخول يظهر في المزيد › سجل البوابة بالاسم.",
        ],
      },
      testScenarios: {
        en: [
          "Sign in with a wrong password 5 times: the 6th attempt (even correct) says to try again in 15 minutes.",
          "Run testing:set-password LOGIN on the server: a tester already signed in is sent to /login on the next refresh.",
        ],
        ar: [
          "أدخل كلمة مرور خاطئة 5 مرات: المحاولة السادسة (حتى الصحيحة) تطلب الانتظار 15 دقيقة.",
          "شغّل testing:set-password LOGIN على الخادم: المختبر المسجّل يُعاد إلى /login عند التحديث التالي.",
        ],
      },
      updatedIn: "feat/testing-portal",
    },
    {
      id: "testing-health",
      title: {
        en: "الحالة shows whether each part of the platform is up",
        ar: "شاشة الحالة توضح هل يعمل كل جزء من المنصة",
      },
      priority: "P0",
      story: {
        en: "GET /testing-portal/health, refreshed every 15 s: database (and its latency), migrations (applied / pending / failed), S3, Resend (configured or mock mode), Twilio (configured or mock mode), the API process (uptime, memory, event-loop lag) and, on production, each web app over the docker network. Each row is green (يعمل), amber (تنبيه) or red (متوقف); the banner shows the worst one, the environment and the deployed commit.",
        ar: "GET /testing-portal/health، يتحدث كل 15 ثانية: قاعدة البيانات (وزمن استجابتها)، الترحيلات (المطبّقة / المعلّقة / الفاشلة)، S3، Resend (مُعدّ أو وضع تجريبي)، Twilio (مُعدّ أو وضع تجريبي)، عملية الـ API (مدة التشغيل، الذاكرة، تأخر الحلقة)، وعلى الإنتاج كل موقع ويب عبر شبكة docker. كل صف أخضر (يعمل) أو أصفر (تنبيه) أو أحمر (متوقف)؛ والشريط العلوي يعرض الأسوأ والبيئة والـ commit المنشور.",
      },
      acceptanceCriteria: {
        en: [
          "A check that hangs is reported after 4 s instead of blocking the page.",
          "A migration file not applied yet shows as amber with the count.",
          "The commit matches the deployed one (CD sets GIT_SHA / BUILD_TIME).",
        ],
        ar: [
          "الفحص المعلّق يُعرض بعد 4 ثوانٍ بدل أن يوقف الصفحة.",
          "ملف ترحيل لم يُطبَّق بعد يظهر أصفر مع العدد.",
          "الـ commit يطابق المنشور (يضبط CD قيمتي GIT_SHA / BUILD_TIME).",
        ],
      },
      testScenarios: {
        en: [
          "Locally, unset RESEND_API_KEY: البريد turns amber (mock mode).",
          "Break the S3 credentials: تخزين الملفات turns red with the error.",
        ],
        ar: [
          "محلياً، احذف RESEND_API_KEY: يصبح البريد أصفر (وضع تجريبي).",
          "أفسد بيانات S3: يصبح تخزين الملفات أحمر مع الخطأ.",
        ],
      },
      updatedIn: "feat/testing-portal",
    },
    {
      id: "testing-otp-feed",
      title: {
        en: "الرموز lists every OTP sent; a code shows only when tapped, and each reveal is logged",
        ar: "الرموز تعرض كل رموز التحقق المرسلة؛ الرمز يظهر بالضغط فقط وكل إظهار يُسجَّل",
      },
      priority: "P0",
      story: {
        en: "By the owner's decision (docs/ai/security-policy.md) the portal shows the OTPs of every user. Every code the platform sends — email (sign-up, password reset, account suspension, email change) and SMS (sign-up, password change, recovery, phone change, contact phone, account suspension) — is listed for 30 minutes with its recipient, purpose, time left and status (صالح / استُخدم / استُبدل برمز أحدث / انتهت صلاحيته). GET /testing-portal/otps never returns a code; «إظهار الرمز» calls POST /testing-portal/otps/:id/reveal, which returns it while it's still valid and writes OTP_REVEALED (tester, recipient, purpose) to the audit log. Codes live only in memory and are dropped when used, replaced or expired. Phone codes sent by real Twilio Verify are listed without a code (Twilio makes it). Mock-mode log lines show codes as •••••• on السجلات.",
        ar: "بقرار المالك (docs/ai/security-policy.md) تعرض البوابة رموز التحقق لكل المستخدمين. كل رمز ترسله المنصة — بالبريد (إنشاء حساب، استعادة كلمة المرور، تعطيل الحساب، تغيير البريد) وبالرسائل (إنشاء حساب، تغيير كلمة المرور، استعادة الحساب، تغيير الرقم، رقم التواصل، تعطيل الحساب) — يُعرض 30 دقيقة مع المستلم والغرض والوقت المتبقي والحالة (صالح / استُخدم / استُبدل برمز أحدث / انتهت صلاحيته). GET /testing-portal/otps لا يُرجع الرمز أبداً؛ «إظهار الرمز» يستدعي POST /testing-portal/otps/:id/reveal الذي يُرجعه ما دام صالحاً ويكتب OTP_REVEALED (المختبر، المستلم، الغرض) في سجل البوابة. الرموز في الذاكرة فقط وتُحذف عند استخدامها أو استبدالها أو انتهائها. رموز الهاتف المرسلة عبر Twilio Verify الحقيقي تظهر بلا رمز (Twilio يصنعه). وأسطر الوضع التجريبي تظهر الرموز فيها •••••• في السجلات.",
      },
      acceptanceCriteria: {
        en: [
          "Signing up with an email (or a phone in mock SMS mode) shows a صالح entry within 5 s; «إظهار الرمز» shows the code, which completes the sign-up.",
          "After it's used the entry turns استُخدم and no code can be shown; asking for a new code marks the old one استُبدل برمز أحدث.",
          "Each reveal appears in المزيد › سجل البوابة as «إظهار رمز تحقق» with the recipient.",
          "The code is never in the list response, the database, the logs screen or the service worker cache.",
        ],
        ar: [
          "إنشاء حساب ببريد (أو برقم في الوضع التجريبي للرسائل) يظهر كرمز «صالح» خلال 5 ثوانٍ؛ «إظهار الرمز» يعرض الرمز الذي يكمل التسجيل.",
          "بعد استخدامه يصبح «استُخدم» ولا يمكن إظهاره؛ وطلب رمز جديد يجعل القديم «استُبدل برمز أحدث».",
          "كل إظهار يظهر في المزيد › سجل البوابة كـ«إظهار رمز تحقق» مع المستلم.",
          "الرمز لا يوجد أبداً في استجابة القائمة ولا قاعدة البيانات ولا شاشة السجلات ولا ذاكرة عامل الخدمة.",
        ],
      },
      testScenarios: {
        en: [
          "Forgot password on an email account: copy the code from الرموز into the app; the entry turns استُخدم.",
          "Search by part of the phone number: only that phone's codes remain.",
          "Leave a revealed code on screen: it hides itself after a minute.",
        ],
        ar: [
          "نسيت كلمة المرور لحساب بريد: انسخ الرمز من الرموز إلى التطبيق؛ يصبح «استُخدم».",
          "ابحث بجزء من رقم الهاتف: تبقى رموز ذلك الرقم فقط.",
          "اترك رمزاً ظاهراً: يختفي وحده بعد دقيقة.",
        ],
      },
      updatedIn: "feat/testing-otp-feed",
    },
    {
      id: "testing-account-tools",
      title: {
        en: "الأدوات: find or add an account, unlock OTP cooldowns, give plans, fill demo data",
        ar: "الأدوات: البحث عن حساب أو إضافته، فك قفل الرموز، منح الباقات، البيانات التجريبية",
      },
      priority: "P1",
      story: {
        en: "الأدوات searches accounts by email, phone or name (company and office names too) and opens one: its identities (status, licence), each identity's free ads (− / +), plan slots (تعديل the ads left, إنهاء) and «منح» a plan, the demo-data buttons (the «النبض» cases, the company, the office, the studio; «حذف كل البيانات التجريبية» removes every demo row on the platform), and its OTP cooldowns. «إضافة حساب» creates an individual with email and/or phone and a password, optionally with a company (approved at once, with its trial, as in the app) or an office (approved at once if «اعتماد المكتب مباشرة» is ticked); a taken licence number refuses it without leaving a half account. «قفل رموز التحقق» lists who's waiting before a new code, has hit the daily limit or is blocked after wrong codes, with «فك القفل». Every change is in سجل البوابة. API: GET/POST /testing-portal/accounts, GET /testing-portal/accounts/:userId, POST .../accounts/:userId/demo, GET /testing-portal/cooldowns, POST .../cooldowns/unlock, GET /testing-portal/plans, POST /testing-portal/identities/:id/plans, PATCH /testing-portal/slots/:id, PUT /testing-portal/identities/:id/free-ads. المقاييس now opens from الحالة.",
        ar: "الأدوات تبحث عن الحسابات بالبريد أو الهاتف أو الاسم (وأسماء الشركات والمكاتب) وتفتح الحساب: هوياته (الحالة، الرخصة)، والإعلانات المجانية لكل هوية (− / +)، وحصص الباقات (تعديل الإعلانات المتبقية، إنهاء) و«منح» باقة، وأزرار البيانات التجريبية (حالات «النبض»، الشركة، المكتب، الاستوديو؛ و«حذف كل البيانات التجريبية» يحذف كل الصفوف التجريبية في المنصة)، وقفل رموز التحقق للحساب. «إضافة حساب» ينشئ فرداً ببريد و/أو هاتف وكلمة مرور، ومعه شركة إن أردت (تُعتمد مباشرة مع فترتها التجريبية كما في التطبيق) أو مكتب (يُعتمد مباشرة إن فُعّل «اعتماد المكتب مباشرة»)؛ ورقم رخصة مستخدم يُرفض دون ترك حساب ناقص. «قفل رموز التحقق» يعرض من ينتظر قبل رمز جديد أو بلغ الحد اليومي أو أُقفل بعد رموز خاطئة، مع «فك القفل». كل تغيير يظهر في سجل البوابة. المقاييس أصبحت تُفتح من الحالة.",
      },
      acceptanceCriteria: {
        en: [
          "Searching 2+ characters lists matching accounts with their identities; tapping one opens it.",
          "Granting a plan adds an active slot with the plan's ads (or the number typed); إنهاء ends it; − / + changes free ads; each shows at once and in سجل البوابة.",
          "A demo case shows what it added; on the app (switching to the profile) the pulse / studio shows it.",
          "After «فك القفل», the same email or phone can ask for a code right away.",
        ],
        ar: [
          "البحث بحرفين أو أكثر يعرض الحسابات المطابقة وهوياتها؛ والضغط على حساب يفتحه.",
          "منح باقة يضيف حصة نشطة بإعلانات الباقة (أو العدد المكتوب)؛ و«إنهاء» ينهيها؛ و− / + يغيّر الإعلانات المجانية؛ وكل ذلك يظهر فوراً وفي سجل البوابة.",
          "حالة البيانات التجريبية تعرض ما أضافته؛ وفي التطبيق (بعد التبديل للهوية) يظهر في النبض / الاستوديو.",
          "بعد «فك القفل» يمكن لنفس البريد أو الرقم طلب رمز فوراً.",
        ],
      },
      testScenarios: {
        en: [
          "Ask for a sign-up code 3 times quickly in the app: the third says to wait; unlock it in الأدوات and ask again.",
          "إضافة حساب with an office and «اعتماد المكتب مباشرة»: sign in with it in the app and switch to the office — it's approved.",
          "Give an office 0 free ads and no plan: posting an ad asks to buy a package.",
        ],
        ar: [
          "اطلب رمز تسجيل 3 مرات بسرعة في التطبيق: الثالثة تطلب الانتظار؛ فك القفل من الأدوات واطلب مجدداً.",
          "إضافة حساب مع مكتب و«اعتماد المكتب مباشرة»: ادخل به في التطبيق وبدّل للمكتب — يكون معتمداً.",
          "اجعل الإعلانات المجانية لمكتب 0 بلا باقة: نشر إعلان يطلب شراء باقة.",
        ],
      },
      updatedIn: "feat/testing-account-tools",
    },
    {
      id: "testing-metrics",
      title: {
        en: "المقاييس shows API traffic, errors, latency and platform activity",
        ar: "المقاييس تعرض حركة الـ API والأخطاء وزمن الاستجابة ونشاط المنصة",
      },
      priority: "P1",
      story: {
        en: "GET /testing-portal/metrics?minutes=15|60|360|1440: requests, 5xx and 4xx, p50/p95 latency, requests per minute (red: 5xx), the slowest and the failing route templates (GET /users/:id, never raw URLs), plus platform activity: apps open now (live sockets), active sessions (15 min), new users today / 7 days / total, new identities by type, active ads, live stories, pending reports, payments today. Traffic is counted in memory (24 h) and starts from zero when the API restarts; the portal's own calls aren't counted.",
        ar: "GET /testing-portal/metrics?minutes=15|60|360|1440: الطلبات، أخطاء 5xx و4xx، زمن الاستجابة p50/p95، الطلبات بالدقيقة (الأحمر 5xx)، المسارات الأبطأ والتي فيها أخطاء (بصيغة GET /users/:id، لا الروابط الفعلية)، ونشاط المنصة: التطبيقات المفتوحة الآن، الجلسات النشطة (15 دقيقة)، المستخدمون الجدد اليوم / 7 أيام / الإجمالي، الهويات الجديدة حسب النوع، الإعلانات النشطة، القصص الحية، البلاغات المعلّقة، مدفوعات اليوم. الحركة تُعدّ في الذاكرة (24 ساعة) وتبدأ من الصفر عند إعادة تشغيل الـ API؛ وطلبات البوابة نفسها لا تُعدّ.",
      },
      acceptanceCriteria: {
        en: [
          "Opening a few app screens raises الطلبات within 10 s.",
          "A request to a route that throws shows in المسارات ذات الأخطاء.",
        ],
        ar: [
          "فتح بعض شاشات التطبيق يزيد الطلبات خلال 10 ثوانٍ.",
          "طلب لمسار يرمي خطأ يظهر في المسارات ذات الأخطاء.",
        ],
      },
      testScenarios: {
        en: ["Switch between 15 د / ساعة / 6 س / 24 س: totals change with the window."],
        ar: ["بدّل بين 15 د / ساعة / 6 س / 24 س: تتغير المجاميع مع الفترة."],
      },
      updatedIn: "feat/testing-portal",
    },
    {
      id: "testing-logs",
      title: {
        en: "السجلات shows the API's live log lines, with the request each belongs to",
        ar: "السجلات تعرض سطور سجل الـ API مباشرة مع الطلب الذي ينتمي إليه كل سطر",
      },
      priority: "P1",
      story: {
        en: "The API keeps its last 3 000 log lines in memory (BufferedLogger; stdout unchanged). Every response carries X-Request-Id and every line written while handling it has that id. GET /testing-portal/logs filters by level (أخطاء / تنبيهات / معلومات), text or request id; the screen refreshes every 5 s while مباشر is on. Tapping a line shows its stack; tapping its #id shows every line of that request.",
        ar: "يحتفظ الـ API بآخر 3000 سطر في الذاكرة (BufferedLogger؛ الطباعة كما هي). كل استجابة تحمل X-Request-Id وكل سطر كُتب أثناءها يحمل نفس الرقم. GET /testing-portal/logs يرشّح حسب المستوى (أخطاء / تنبيهات / معلومات) أو النص أو رقم الطلب؛ والشاشة تتحدث كل 5 ثوانٍ ما دام «مباشر» مفعّلاً. الضغط على سطر يعرض الـ stack، والضغط على #الرقم يعرض كل سطور ذلك الطلب.",
      },
      acceptanceCriteria: {
        en: [
          "A failing request in the app shows as an error line with its stack, and its #id finds the request's other lines.",
          "A bug report can quote the X-Request-Id from the response to point at the exact lines.",
        ],
        ar: [
          "طلب فاشل في التطبيق يظهر كسطر خطأ مع الـ stack، ورقمه يجد بقية سطور الطلب.",
          "يمكن ذكر X-Request-Id من الاستجابة في بلاغ الخطأ للإشارة للسطور بالضبط.",
        ],
      },
      testScenarios: {
        en: ["Filter أخطاء, then pause مباشر: the list stops refreshing."],
        ar: ["رشّح «أخطاء» ثم أوقف «مباشر»: تتوقف القائمة عن التحديث."],
      },
      updatedIn: "feat/testing-portal",
    },
    {
      id: "testing-versions-audit",
      title: {
        en: "المزيد shows the API build, the app builds in use, install links and the audit log",
        ar: "المزيد يعرض نسخة الخادم ونسخ التطبيق المستخدمة وروابط التثبيت وسجل البوابة",
      },
      priority: "P1",
      story: {
        en: "The app sends X-App-Version, X-App-Runtime and X-App-Update (the OTA id, or embedded) with X-Device-Platform on every request (ships by OTA); the API counts requests per build and saves them once a minute (AppVersionSeen). المزيد lists them with the last time seen, the API's environment, commit, build time and start time, TestFlight / Android links with QR codes when TESTFLIGHT_URL / ANDROID_BUILD_URL are set, and سجل البوابة (who did what, newest first).",
        ar: "يرسل التطبيق X-App-Version و X-App-Runtime و X-App-Update (رقم تحديث OTA، أو embedded) مع X-Device-Platform في كل طلب (يصل بتحديث OTA)؛ ويعدّ الـ API الطلبات لكل نسخة ويحفظها كل دقيقة (AppVersionSeen). يعرض «المزيد» النسخ وآخر ظهور، وبيئة الخادم والـ commit ووقت البناء والتشغيل، وروابط TestFlight / Android مع رموز QR عند ضبط TESTFLIGHT_URL / ANDROID_BUILD_URL، وسجل البوابة (من فعل ماذا، الأحدث أولاً).",
      },
      acceptanceCriteria: {
        en: [
          "After an OTA, the new update id appears within a minute of opening the app.",
          "Header values are cleaned (letters, digits, . - +) before saving.",
        ],
        ar: [
          "بعد تحديث OTA يظهر رقم التحديث الجديد خلال دقيقة من فتح التطبيق.",
          "قيم الترويسات تُنظَّف (حروف، أرقام، . - +) قبل الحفظ.",
        ],
      },
      testScenarios: {
        en: ["Open the app on an iPhone and an Android phone: both appear with their version and update."],
        ar: ["افتح التطبيق على آيفون وأندرويد: يظهر كلاهما بنسخته وتحديثه."],
      },
      updatedIn: "feat/testing-portal",
    },
    {
      id: "testing-pwa",
      title: {
        en: "The portal installs like an app and shows an offline page",
        ar: "تُثبَّت البوابة كتطبيق وتعرض صفحة عند انقطاع الاتصال",
      },
      priority: "P2",
      story: {
        en: "A web app manifest (icons, maskable icon, standalone, RTL), a service worker (/sw.js, never cached) and an offline page. Android/Chrome show «تثبيت» in المزيد (the browser's install prompt); iPhone shows the Share → «إضافة إلى الشاشة الرئيسية» steps. The worker caches only the offline page and its logo: pages and API data are always fetched live (nothing with OTPs or logs is ever cached). With no connection, opening a page shows «لا يوجد اتصال» with إعادة المحاولة.",
        ar: "ملف manifest (أيقونات، أيقونة maskable، ملء الشاشة، من اليمين لليسار)، وعامل خدمة (/sw.js، لا يُخزَّن مؤقتاً) وصفحة عدم اتصال. أندرويد/كروم يعرض «تثبيت» في المزيد (نافذة التثبيت من المتصفح)؛ والآيفون يعرض خطوات مشاركة ← «إضافة إلى الشاشة الرئيسية». عامل الخدمة يخزّن صفحة عدم الاتصال وشعارها فقط: الصفحات وبيانات الـ API تُجلب مباشرة دائماً (لا يُخزَّن أي شيء فيه رموز أو سجلات). بدون اتصال، فتح أي صفحة يعرض «لا يوجد اتصال» مع إعادة المحاولة.",
      },
      acceptanceCriteria: {
        en: [
          "Installed, it opens full screen without the browser bar, with the Buyootna icon.",
          "Offline, a page load shows the offline page (with its logo), not a broken or stale page.",
        ],
        ar: [
          "بعد التثبيت تُفتح بملء الشاشة بدون شريط المتصفح وبأيقونة بيوتنا.",
          "بدون اتصال، فتح الصفحة يعرض صفحة عدم الاتصال (بشعارها)، لا صفحة معطوبة أو قديمة.",
        ],
      },
      testScenarios: {
        en: [
          "Android Chrome: المزيد › تثبيت, then open from the home screen.",
          "iPhone Safari: Share › Add to Home Screen; turn on airplane mode and open it: «لا يوجد اتصال».",
        ],
        ar: [
          "كروم أندرويد: المزيد › تثبيت، ثم افتحها من الشاشة الرئيسية.",
          "سفاري آيفون: مشاركة › إضافة إلى الشاشة الرئيسية؛ فعّل وضع الطيران وافتحها: «لا يوجد اتصال».",
        ],
      },
      updatedIn: "feat/testing-portal",
    },
  ],
};
