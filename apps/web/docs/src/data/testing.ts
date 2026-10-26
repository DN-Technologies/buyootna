import { DocSection } from "./types";

export const testing: DocSection = {
  slug: "web-testing",
  title: { en: "Testing Portal", ar: "بوابة الاختبار" },
  summary: {
    en: "testing.buyootna.cloud / .com (apps/web/testing, port 3007): the testers' and QA team's mobile-first portal, installable as an app. Health of every part of the platform, API metrics, live logs, the builds in use, bug reports from the phone, seeding or wiping the database (backup first), and an audit log, behind its own password. It runs on the production server, against production data.",
    ar: "testing.buyootna.cloud / .com (apps/web/testing، المنفذ 3007): بوابة فريق الاختبار وضمان الجودة، مصممة للجوال أولاً وقابلة للتثبيت كتطبيق. حالة كل أجزاء المنصة، ومقاييس الـ API، والسجلات المباشرة، والنسخ المستخدمة، وبلاغات الأخطاء من الجوال، وتعبئة قاعدة البيانات أو مسحها (بعد نسخة احتياطية)، وسجل البوابة، خلف كلمة مرور خاصة بها. تعمل على خادم الإنتاج وبياناته.",
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
        en: "The API keeps its last 3 000 log lines in memory (BufferedLogger; stdout unchanged). Every response carries X-Request-Id and every line written while handling it has that id. GET /testing-portal/logs filters by level (أخطاء / تنبيهات / معلومات), text or request id; the screen (opened from الحالة) refreshes every 5 s while مباشر is on. Tapping a line shows its stack; tapping its #id shows every line of that request.",
        ar: "يحتفظ الـ API بآخر 3000 سطر في الذاكرة (BufferedLogger؛ الطباعة كما هي). كل استجابة تحمل X-Request-Id وكل سطر كُتب أثناءها يحمل نفس الرقم. GET /testing-portal/logs يرشّح حسب المستوى (أخطاء / تنبيهات / معلومات) أو النص أو رقم الطلب؛ والشاشة (تُفتح من «الحالة») تتحدث كل 5 ثوانٍ ما دام «مباشر» مفعّلاً. الضغط على سطر يعرض الـ stack، والضغط على #الرقم يعرض كل سطور ذلك الطلب.",
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
    {
      id: "testing-bug-reports",
      title: {
        en: "الأخطاء: testers report a bug from the phone, with screenshots, and follow it to a fix",
        ar: "الأخطاء: يبلّغ المختبر عن خطأ من جواله مع صور الشاشة ويتابعه حتى الحل",
      },
      priority: "P1",
      story: {
        en: "The الأخطاء tab lists every report, newest first, with filters by status (جديد / قيد العمل / تم الحل / ليس خطأ, each with its count) and a search over the title, steps and reporter. «إبلاغ» opens a form: title, where (the app, admin, companies, offices, management, the site, the API, other), severity (منخفضة / متوسطة / عالية / حرجة), steps, expected and actual, and up to 8 screenshots from the camera or gallery (images only, 8 MB each, uploaded to S3 under testing-bugs/ as soon as they're picked). The phone and iOS/Android version are filled in from the browser and can be edited, with the app version. A report's page shows everything, opens each screenshot full size, changes its status and takes comments. The reporter and commenters are the names they signed in with; reporting and status changes go to سجل البوابة.",
        ar: "تبويب «الأخطاء» يعرض كل البلاغات، الأحدث أولاً، مع تصفية حسب الحالة (جديد / قيد العمل / تم الحل / ليس خطأ، ولكل منها عدده) وبحث في العنوان والخطوات واسم المُبلغ. «إبلاغ» يفتح نموذجاً: العنوان، وأين (التطبيق، لوحة الإدارة، الشركات، المكاتب، الإدارة العقارية، الموقع، الـ API، أخرى)، والخطورة (منخفضة / متوسطة / عالية / حرجة)، والخطوات، والمتوقع وما حدث فعلاً، وحتى 8 صور شاشة من الكاميرا أو المعرض (صور فقط، 8 ميجابايت لكل صورة، تُرفع إلى S3 تحت testing-bugs/ فور اختيارها). الجهاز ونسخة iOS/Android تُملأ من المتصفح ويمكن تعديلها مع نسخة التطبيق. صفحة البلاغ تعرض كل شيء، وتفتح كل صورة بحجمها الكامل، وتغيّر الحالة وتقبل التعليقات. المُبلغ والمعلّقون بالأسماء التي دخلوا بها؛ والإبلاغ وتغيير الحالة يُسجَّلان في سجل البوابة.",
      },
      acceptanceCriteria: {
        en: [
          "A report with 2 screenshots shows both on its page and «2» with the image icon in the list.",
          "A non-image file, or an image over 8 MB, is refused with a message; the form keeps what was typed.",
          "Changing the status moves the report between the filters and updates their counts.",
          "سجل البوابة shows «إبلاغ عن خطأ» and «تحديث حالة خطأ» with the tester's name.",
        ],
        ar: [
          "بلاغ بصورتين يعرضهما في صفحته و«2» بجانب أيقونة الصورة في القائمة.",
          "ملف ليس صورة، أو صورة أكبر من 8 ميجابايت، يُرفض برسالة ويبقى ما كُتب في النموذج.",
          "تغيير الحالة ينقل البلاغ بين التصفيات ويحدّث أعدادها.",
          "سجل البوابة يعرض «إبلاغ عن خطأ» و«تحديث حالة خطأ» باسم المختبر.",
        ],
      },
      testScenarios: {
        en: [
          "On an iPhone: إبلاغ, take a photo with the camera and pick one from the gallery, send: the device reads iPhone, iOS <version>.",
          "Mark it قيد العمل, add a comment, then تم الحل: the list shows it under تم الحل with 1 comment.",
        ],
        ar: [
          "على آيفون: إبلاغ، التقط صورة بالكاميرا واختر أخرى من المعرض، أرسل: الجهاز يظهر iPhone, iOS <النسخة>.",
          "اجعله «قيد العمل» وأضف تعليقاً ثم «تم الحل»: يظهر في القائمة تحت «تم الحل» بتعليق واحد.",
        ],
      },
      updatedIn: "feat/testing-bug-reports",
    },
    {
      id: "testing-database",
      title: {
        en: "قاعدة البيانات: seed an empty database, or wipe all data after a private backup",
        ar: "قاعدة البيانات: تعبئة قاعدة فارغة، أو مسح كل البيانات بعد نسخة احتياطية خاصة",
      },
      priority: "P0",
      story: {
        en: "الأدوات › قاعدة البيانات shows the users, approximate rows and tables, and the current or last job line by line. تعبئة بيانات التطوير fills an empty database with the dev fixtures (governorates and areas, 500 companies with their listings, the App Store reviewer accounts, plans, FAQs, invoices) with a password the tester chooses, without the admin account; it refuses while any user exists. مسح كل البيانات asks for «buyootna-production» typed exactly and the DANGER password, then counts down 10 seconds (إلغاء stops it). The API then runs pg_dump, uploads it to S3 under backups/, checks S3 has every byte and that the backup can't be read anonymously, and only then empties every table except _prisma_migrations and the Testing* tables. One job runs at a time. Wrong DANGER passwords, the start, the wipe (with the backup key) and the seed go to سجل البوابة.",
        ar: "الأدوات › قاعدة البيانات تعرض عدد المستخدمين والصفوف التقريبي والجداول، والعملية الحالية أو الأخيرة سطراً بسطر. «تعبئة بيانات التطوير» تملأ قاعدة فارغة ببيانات التطوير (المحافظات والمناطق، 500 شركة بإعلاناتها، حسابات مراجعي آبل، الباقات، الأسئلة الشائعة، الفواتير) بكلمة مرور يختارها المختبر، بدون حساب المدير؛ وترفض ما دام هناك أي مستخدم. «مسح كل البيانات» يطلب كتابة «buyootna-production» كما هي وكلمة مرور الخطر، ثم عداً تنازلياً 10 ثوانٍ («إلغاء» يوقفه). بعدها يشغّل الـ API أداة pg_dump ويرفع النسخة إلى S3 تحت backups/، ويتحقق أن S3 استلمها كاملة وأنها لا تُقرأ بدون صلاحية، وعندها فقط يفرغ كل الجداول عدا _prisma_migrations وجداول Testing*. عملية واحدة في كل مرة. كلمات مرور الخطر الخاطئة وبدء المسح والمسح (مع مفتاح النسخة) والتعبئة تُسجَّل في سجل البوابة.",
      },
      acceptanceCriteria: {
        en: [
          "The wipe button stays disabled until the phrase matches exactly and a DANGER password is entered.",
          "A wrong DANGER password shows «كلمة مرور الخطر غير صحيحة» after the countdown, keeps the tester signed in, and deletes nothing.",
          "If pg_dump or the upload fails, or the backup would be public, the job shows فشل with the reason and every row is still there.",
          "After a wipe, the portal still signs in, سجل البوابة and الأخطاء keep their history, and the backup key is on the screen.",
          "Seeding refuses on a database with users; on an empty one it finishes and its accounts sign in with the chosen password; admin@buyootna.com doesn't exist.",
          "The backup restores with pg_restore --clean --if-exists --single-transaction (DEVELOPMENT_AND_DEPLOYMENT.md).",
        ],
        ar: [
          "زر المسح معطّل حتى تطابق العبارة تماماً وتُدخل كلمة مرور الخطر.",
          "كلمة مرور خطر خاطئة تعرض «كلمة مرور الخطر غير صحيحة» بعد العد، ويبقى المختبر مسجلاً، ولا يُحذف شيء.",
          "إن فشل pg_dump أو الرفع، أو كانت النسخة ستكون عامة، تظهر العملية «فشل» مع السبب وتبقى كل الصفوف.",
          "بعد المسح، الدخول للبوابة يعمل، وسجل البوابة والأخطاء يحتفظان بتاريخهما، ومفتاح النسخة ظاهر على الشاشة.",
          "التعبئة ترفض قاعدة فيها مستخدمون؛ وعلى قاعدة فارغة تكتمل وتدخل حساباتها بكلمة المرور المختارة؛ ولا يوجد admin@buyootna.com.",
          "النسخة تُستعاد بـ pg_restore --clean --if-exists --single-transaction (DEVELOPMENT_AND_DEPLOYMENT.md).",
        ],
      },
      testScenarios: {
        en: [
          "Start a wipe, tap إلغاء during the countdown: nothing happens and the counts stay.",
          "Before backups/ is private in the bucket policy: a wipe fails with «The backup would be public» and the data stays.",
          "On a staging copy: wipe, then تعبئة with a new password, then sign in to the app as reviewer@buyootna.com with it.",
        ],
        ar: [
          "ابدأ المسح واضغط «إلغاء» أثناء العد: لا يحدث شيء وتبقى الأعداد.",
          "قبل جعل backups/ خاصاً في سياسة الحاوية: يفشل المسح بـ «The backup would be public» وتبقى البيانات.",
          "على نسخة للتجربة: امسح، ثم «تعبئة» بكلمة مرور جديدة، ثم ادخل التطبيق بـ reviewer@buyootna.com بها.",
        ],
      },
      updatedIn: "feat/testing-database",
    },
  ],
};
