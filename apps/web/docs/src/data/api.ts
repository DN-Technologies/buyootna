import { DocSection } from "./types";

export const api: DocSection = {
  slug: "api",
  title: { en: "API", ar: "واجهة البرمجة (API)" },
  summary: {
    en: "NestJS backend (apps/api/src/features + core): auth/identities, properties/search/map/favorites, chat, notifications, plans/payments/invoices, reviews, and core Twilio/S3/Prisma services. These stories focus on cross-cutting correctness that a UI-only pass would miss.",
    ar: "الواجهة الخلفية المبنية بـ NestJS (apps/api/src/features + core): المصادقة/الهويات، العقارات/البحث/الخريطة/المفضلة، المحادثات، الإشعارات، الباقات/المدفوعات/الفواتير، التقييمات، وخدمات core الأساسية Twilio/S3/Prisma. تركّز هذه القصص على صحة السلوك الشاملة التي قد يفوّتها اختبار يقتصر على الواجهة فقط.",
  },
  stories: [
    {
      id: "api-auth-guards",
      title: {
        en: "JWT and Admin guards correctly gate every protected endpoint",
        ar: "حراس JWT وAdmin يحميان بشكل صحيح كل نقطة نهاية محمية",
      },
      priority: "P0",
      story: {
        en: "Verify that every non-public endpoint is actually protected by AuthGuard('jwt') (and admin/* endpoints additionally by AdminGuard), so that no authenticated-only or admin-only data (users, favorites, chat, admin/users) is reachable with a missing, expired, or non-admin token.",
        ar: "تحقق من أن كل نقطة نهاية غير عامة محمية فعلياً بواسطة AuthGuard('jwt') (ونقاط admin/* محمية إضافياً بواسطة AdminGuard)، حتى لا يمكن الوصول إلى أي بيانات مخصصة للمستخدمين المسجّلين أو للمشرفين فقط (users، favorites، chat، admin/users) برمز مصادقة مفقود أو منتهي الصلاحية أو غير خاص بمشرف.",
      },
      acceptanceCriteria: {
        en: [
          "Calling any protected endpoint with no Authorization header returns 401, not a 200 with empty/default data.",
          "Calling any protected endpoint with an expired or tampered JWT returns 401.",
          "Calling any admin/* endpoint with a valid JWT for a non-admin user returns 403, not 200.",
          "Public endpoints (GET companies, GET offices, GET company/:id, GET office/:id) remain accessible without a token, as intended.",
        ],
        ar: [
          "استدعاء أي نقطة نهاية محمية دون رأس Authorization يعيد 401، لا 200 ببيانات فارغة/افتراضية.",
          "استدعاء أي نقطة نهاية محمية برمز JWT منتهي الصلاحية أو مُعبَث به يعيد 401.",
          "استدعاء أي نقطة نهاية admin/* برمز JWT صالح لمستخدم غير مشرف يعيد 403، لا 200.",
          "نقاط النهاية العامة (GET companies، GET offices، GET company/:id، GET office/:id) تبقى قابلة للوصول دون رمز، كما هو مقصود.",
        ],
      },
      testScenarios: {
        en: [
          "Script a pass over the known protected endpoint list with no token and confirm 401 across the board (favorites, chat, notifications, devices, plans, wallet, invoices, settings).",
          "Take a valid non-admin JWT and hit every admin/* endpoint (users, users/:id, PATCH status, DELETE, PATCH identities/:id/status) — confirm 403 on all.",
          "Tamper one character of a valid JWT's signature and confirm 401, not a crash or 500.",
          "Confirm the public company/office listing endpoints still return data with zero auth headers sent.",
        ],
        ar: [
          "اكتب سكريبتاً يمر على قائمة نقاط النهاية المحمية المعروفة دون رمز، وتأكد من 401 في جميعها (favorites، chat، notifications، devices، plans، wallet، invoices، settings).",
          "خذ رمز JWT صالحاً لمستخدم غير مشرف، واستدعِ كل نقطة نهاية admin/* (users، users/:id، PATCH status، DELETE، PATCH identities/:id/status) — تأكد من 403 في جميعها.",
          "عبَث بحرف واحد في توقيع رمز JWT صالح وتأكد من 401، لا تعطّل أو خطأ 500.",
          "تأكد أن نقاط نهاية عرض الشركات/المكاتب العامة لا تزال تعيد بيانات دون إرسال أي رأس مصادقة.",
        ],
      },
    },
    {
      id: "api-identity-scoping",
      title: {
        en: "Everything a persona owns is scoped to that persona",
        ar: "كل ما تملكه الهوية محصور بتلك الهوية",
      },
      priority: "P0",
      story: {
        en: "Verify the persona in the token (JWT 'ident') scopes every owned resource: properties, credits (UserPlanSlot), the free ad (Identity.freeAdsRemaining), invoices, favorites, provider favorites, chat participants and messages, and review reactions. Since the persona_ownership migration, identityId is required on these tables; the old userId columns are kept only until a later cleanup release.",
        ar: "تحقق من أن الهوية الموجودة في الرمز (JWT 'ident') تحصر كل مورد مملوك: العقارات، والأرصدة (UserPlanSlot)، والإعلان المجاني (Identity.freeAdsRemaining)، والفواتير، والمفضلة، ومفضلة الشركات/المكاتب، والمشاركين في المحادثات والرسائل، وتفاعلات التقييمات. منذ ترحيل persona_ownership أصبح identityId إلزامياً في هذه الجداول، وتبقى أعمدة userId القديمة فقط حتى إصدار تنظيف لاحق.",
      },
      acceptanceCriteria: {
        en: [
          "GET /plans/wallet, /plans/wallet/publish-options, /invoices, /favorites and /chat/conversations return only the token persona's data.",
          "POST /properties with another persona's planSlotId is refused (403) and spends nothing.",
          "A plan purchase (POST /payments/charge) creates the invoice and, once paid, the credit for the buying persona.",
          "Admin views of a user (wallet, invoices) show all the account's personas together.",
        ],
        ar: [
          "GET /plans/wallet و /plans/wallet/publish-options و /invoices و /favorites و /chat/conversations تعيد بيانات هوية الرمز فقط.",
          "POST /properties مع planSlotId لهوية أخرى يُرفض (403) ولا يستهلك شيئاً.",
          "شراء باقة (POST /payments/charge) ينشئ الفاتورة، وبعد الدفع الرصيد، للهوية المشترية.",
          "عروض الإدارة للمستخدم (المحفظة والفواتير) تُظهر كل هويات الحساب معاً.",
        ],
      },
      testScenarios: {
        en: [
          "With tokens for two personas of one account, call GET /plans/wallet with each — different results.",
          "POST /properties as persona A with persona B's slot id — 403.",
          "GET /chat/conversations/:id/messages for a conversation of the other persona — 403.",
        ],
        ar: [
          "برمزين لهويتين في نفس الحساب، استدعِ GET /plans/wallet بكل منهما — نتائج مختلفة.",
          "POST /properties كهوية A مع معرّف رصيد الهوية B — 403.",
          "GET /chat/conversations/:id/messages لمحادثة الهوية الأخرى — 403.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "api-favorites-endpoints",
      title: {
        en: "Favorites endpoints stay internally consistent",
        ar: "نقاط نهاية المفضلة تبقى متسقة داخلياً",
      },
      priority: "P1",
      story: {
        en: "Verify that POST /favorites/:propertyId (toggle), GET /favorites, GET /favorites/ids, and GET /favorites/check/:propertyId always agree with each other for the same user/property, so that the mobile app (mobile-favorites) never renders a heart icon that contradicts the favorites list.",
        ar: "تحقق من أن POST /favorites/:propertyId (تبديل الحالة) وGET /favorites وGET /favorites/ids وGET /favorites/check/:propertyId تتفق دائماً فيما بينها لنفس المستخدم/العقار، حتى لا يعرض تطبيق الجوال (mobile-favorites) أيقونة قلب تتناقض مع قائمة المفضلة.",
      },
      acceptanceCriteria: {
        en: [
          "After toggling favorite on, GET /favorites/check/:propertyId returns true, the property's ID is present in GET /favorites/ids, and the full property appears in GET /favorites.",
          "After toggling it off, all three reflect false/absent consistently.",
          "Toggling a property that doesn't exist (deleted) returns a sane error, not a 500 or a silently 'successful' favorite of nothing.",
        ],
        ar: [
          "بعد تفعيل المفضلة، GET /favorites/check/:propertyId يعيد true، ومعرّف العقار موجود في GET /favorites/ids، والعقار كاملاً يظهر في GET /favorites.",
          "بعد إلغاء التفعيل، الثلاثة جميعها تعكس false/غياب العقار باتساق.",
          "تبديل حالة عقار غير موجود (محذوف) يعيد خطأً منطقياً، لا خطأ 500 ولا نجاحاً صامتاً لإضافة لا شيء إلى المفضلة.",
        ],
      },
      testScenarios: {
        en: [
          "Toggle favorite on a property, then call all three GET endpoints and confirm they agree.",
          "Toggle it off and repeat the check.",
          "Call POST /favorites/:propertyId with a non-existent or already-deleted property ID and confirm a clean error response.",
          "Favorite the same property twice in a row (toggle on, toggle on again — i.e. two calls) and confirm the second call toggles it off rather than erroring or double-favoriting.",
        ],
        ar: [
          "فعّل المفضلة على عقار، ثم استدعِ نقاط النهاية الثلاث GET وتأكد من اتفاقها.",
          "ألغِ التفعيل وكرر الفحص.",
          "استدعِ POST /favorites/:propertyId بمعرّف عقار غير موجود أو محذوف مسبقاً وتأكد من استجابة خطأ نظيفة.",
          "أضف نفس العقار إلى المفضلة مرتين متتاليتين (تفعيل، ثم تفعيل مرة أخرى — أي استدعاءان)، وتأكد أن الاستدعاء الثاني يلغي التفعيل بدلاً من إعادة خطأ أو إضافة مزدوجة.",
        ],
      },
    },
    {
      id: "api-chat-gateway",
      title: {
        en: "ChatGateway events stay in sync with the REST chat endpoints",
        ar: "أحداث ChatGateway تبقى متزامنة مع نقاط نهاية المحادثة REST",
      },
      priority: "P0",
      story: {
        en: "Verify that the WebSocket events (join_conversation, leave_conversation, send_message → new_message/conversation_updated/error) and the REST endpoints (POST conversations, GET conversations, GET conversations/:id/messages, POST conversations/:id/read) never disagree about a conversation's message history or read state, so mobile chat (mobile-chat-realtime) is provably correct at the transport layer, not just in manual UI testing.",
        ar: "تحقق من أن أحداث WebSocket (join_conversation وleave_conversation وsend_message ← new_message/conversation_updated/error) ونقاط نهاية REST (POST conversations وGET conversations وGET conversations/:id/messages وPOST conversations/:id/read) لا تتعارضان أبداً حول سجل رسائل محادثة أو حالة القراءة، حتى تكون محادثة الجوال (mobile-chat-realtime) صحيحة قابلة للإثبات على مستوى طبقة النقل، لا فقط عبر اختبار يدوي للواجهة.",
      },
      acceptanceCriteria: {
        en: [
          "A message sent via the send_message socket event is retrievable immediately after via GET conversations/:id/messages.",
          "join_conversation/leave_conversation correctly scope which sockets receive new_message for a given conversation — a socket that left shouldn't receive further events for it.",
          "Sending a message to a conversation the sender isn't a participant in emits error, not new_message.",
          "POST conversations/:id/read correctly zeroes unread count returned by whatever endpoint mobile uses to badge the chat list.",
        ],
        ar: [
          "رسالة مُرسلة عبر حدث send_message الخاص بالـ socket تكون قابلة للاسترجاع فوراً بعد ذلك عبر GET conversations/:id/messages.",
          "join_conversation/leave_conversation يحددان بشكل صحيح أي اتصالات socket تستلم new_message لمحادثة معينة — اتصال غادر المحادثة يجب ألا يستلم أحداثاً أخرى لها.",
          "إرسال رسالة إلى محادثة ليس المرسل عضواً فيها يُصدر حدث error، لا new_message.",
          "POST conversations/:id/read يصفّر بشكل صحيح عدد غير المقروء المُعاد من أي نقطة نهاية يستخدمها الجوال لشارة قائمة المحادثات.",
        ],
      },
      testScenarios: {
        en: [
          "Open two socket connections as two different accounts in the same conversation; send from one, confirm the other receives new_message and conversation_updated.",
          "Have one connection call leave_conversation, then send a message from the other — confirm the departed socket receives nothing further for that conversation.",
          "Attempt send_message from an account with no membership in that conversation and confirm an error event, not a silently-accepted message.",
          "Send several messages, call POST conversations/:id/read, then re-fetch unread state and confirm it's zero.",
        ],
        ar: [
          "افتح اتصالَي socket لحسابَين مختلفين في نفس المحادثة؛ أرسل من أحدهما، وتأكد أن الآخر يستلم new_message وconversation_updated.",
          "اجعل أحد الاتصالين يستدعي leave_conversation، ثم أرسل رسالة من الآخر — تأكد أن الاتصال المغادر لا يستلم أي أحداث أخرى لتلك المحادثة.",
          "حاول send_message من حساب ليس عضواً في تلك المحادثة وتأكد من حدث error، لا قبول صامت للرسالة.",
          "أرسل عدة رسائل، استدعِ POST conversations/:id/read، ثم أعد جلب حالة غير المقروء وتأكد أنها صفر.",
        ],
      },
    },
    {
      id: "api-payments-webhook",
      title: {
        en: "Tap payment webhook is idempotent and can't be spoofed",
        ar: "webhook الدفع عبر Tap مُحصَّن ضد التكرار ولا يمكن انتحاله",
      },
      priority: "P0",
      story: {
        en: "Verify that POST payments/webhook correctly validates the Tap webhook signature/source and is idempotent under retries, so that a replayed or forged webhook call can't mark an invoice paid without a real payment, and a legitimate retry (Tap's own retry behavior) doesn't double-credit an account.",
        ar: "تحقق من أن POST payments/webhook يتحقق بشكل صحيح من توقيع/مصدر webhook الخاص بـ Tap وأنه مُحصَّن ضد إعادة المحاولة (idempotent)، حتى لا يتمكن استدعاء webhook مُعاد تشغيله أو مزوَّر من وضع فاتورة كمدفوعة دون دفع حقيقي، ولا تؤدي إعادة محاولة شرعية (سلوك إعادة المحاولة الخاص بـ Tap نفسه) إلى إضافة رصيد مضاعف لحساب.",
      },
      acceptanceCriteria: {
        en: [
          "A webhook call missing valid Tap signing/auth is rejected, not processed as a real payment event.",
          "Replaying the exact same legitimate webhook payload twice results in the invoice being marked paid once, not double-processed (e.g. double wallet credit).",
          "GET payments/status/:invoiceId reflects the correct final state after webhook processing, matching what POST payments/charge + the redirect flow shows the user (mobile-payments).",
        ],
        ar: [
          "استدعاء webhook بلا توقيع/مصادقة Tap صالحة يُرفض، ولا يُعامَل كحدث دفع حقيقي.",
          "إعادة إرسال نفس حمولة webhook الشرعية مرتين ينتج عنه وضع الفاتورة كمدفوعة مرة واحدة فقط، لا معالجة مضاعفة (مثل رصيد محفظة مضاعف).",
          "GET payments/status/:invoiceId يعكس الحالة النهائية الصحيحة بعد معالجة webhook، بما يطابق ما يعرضه للمستخدم POST payments/charge وتدفق إعادة التوجيه (mobile-payments).",
        ],
      },
      testScenarios: {
        en: [
          "Send a webhook payload with an invalid/missing signature and confirm it's rejected, and no invoice status changes.",
          "Send a valid webhook payload twice in a row (simulating Tap's retry behavior) and confirm the invoice/wallet only reflects the payment once.",
          "Run a full charge → redirect → webhook cycle and cross-check GET payments/status/:invoiceId matches the invoice list shown in mobile more/invoices.",
        ],
        ar: [
          "أرسل حمولة webhook بتوقيع غير صالح/مفقود وتأكد من رفضها، وعدم تغيّر حالة أي فاتورة.",
          "أرسل حمولة webhook صالحة مرتين متتاليتين (محاكاةً لسلوك إعادة المحاولة الخاص بـ Tap) وتأكد أن الفاتورة/المحفظة تعكس الدفعة مرة واحدة فقط.",
          "نفّذ دورة كاملة من charge ← إعادة توجيه ← webhook وقارن أن GET payments/status/:invoiceId يطابق قائمة الفواتير المعروضة في more/invoices بالجوال.",
        ],
      },
    },
    {
      id: "api-search-strategies",
      title: {
        en: "Each search strategy (standard/exchange/auction/deal/company) returns correctly-scoped results",
        ar: "كل استراتيجية بحث (standard/exchange/auction/deal/company) تعيد نتائج مقيَّدة بشكل صحيح",
      },
      priority: "P1",
      story: {
        en: "Verify that POST search/advanced correctly dispatches to the right strategy (standard/exchange/auction/deal/company) and that each strategy's results only include listings actually matching that category, so that, e.g., an exchange search never returns a plain sale listing just because it matched on keyword/location.",
        ar: "تحقق من أن POST search/advanced يوجّه بشكل صحيح إلى الاستراتيجية المناسبة (standard/exchange/auction/deal/company) وأن نتائج كل استراتيجية تقتصر فعلياً على إعلانات تطابق تلك الفئة، حتى لا يعيد بحث exchange مثلاً إعلان بيع عادي لمجرد تطابقه في الكلمة المفتاحية/الموقع.",
      },
      acceptanceCriteria: {
        en: [
          "Each of the 5 strategies returns only listings of its own category, correctly filtered by any additional params (location, price range, etc.) passed for that strategy.",
          "GET search (the quick/simple search) returns results consistent with what an equivalent POST search/advanced standard-strategy call would return for the same query.",
          "An invalid/unrecognized strategy value returns a clear validation error, not a silent fallback to a different strategy.",
        ],
        ar: [
          "كل استراتيجية من الاستراتيجيات الخمس تعيد فقط إعلانات فئتها، مُصفّاة بشكل صحيح حسب أي معاملات إضافية (الموقع، نطاق السعر، إلخ) مُمرَّرة لتلك الاستراتيجية.",
          "GET search (البحث السريع/البسيط) يعيد نتائج متسقة مع ما يعيده استدعاء POST search/advanced المكافئ باستراتيجية standard لنفس الاستعلام.",
          "قيمة استراتيجية غير صالحة/غير معروفة تعيد خطأ تحقق واضحاً، لا رجوعاً صامتاً إلى استراتيجية أخرى.",
        ],
      },
      testScenarios: {
        en: [
          "Run the same location/keyword query through each of the 5 strategies and confirm result categories never mix (no sale listings in exchange results, etc.).",
          'Compare GET search\'s quick results against POST search/advanced with strategy: "standard" for an identical query string.',
          "Send an unrecognized strategy string and confirm a validation error rather than results from an unintended default strategy.",
        ],
        ar: [
          "شغّل نفس استعلام الموقع/الكلمة المفتاحية عبر الاستراتيجيات الخمس جميعها وتأكد أن فئات النتائج لا تختلط أبداً (لا إعلانات بيع ضمن نتائج exchange، إلخ).",
          'قارن نتائج GET search السريعة مع POST search/advanced باستراتيجية "standard" لنفس نص الاستعلام.',
          "أرسل نص استراتيجية غير معروف وتأكد من ظهور خطأ تحقق بدلاً من نتائج من استراتيجية افتراضية غير مقصودة.",
        ],
      },
    },
    {
      id: "api-otp-fallback",
      title: {
        en: "Twilio OTP mock-fallback is safely dev-only",
        ar: "البديل الوهمي لرمز OTP عبر Twilio مقتصر بأمان على بيئة التطوير فقط",
      },
      priority: "P0",
      story: {
        en: "Verify that twilio.service.ts's mock-SMS fallback (used when Twilio credentials aren't configured) is only ever active in development/test environments and never silently active in production, so that production OTP delivery can never fall back to a logged-but-not-sent 'mock' code that would let anyone log the OTP and take over an account.",
        ar: "تحقق من أن البديل الوهمي لإرسال الرسائل النصية في twilio.service.ts (المُستخدم عند عدم ضبط بيانات اعتماد Twilio) مفعّل فقط في بيئات التطوير/الاختبار، ولا يُفعَّل أبداً بصمت في الإنتاج، حتى لا يتحول تسليم رمز OTP في الإنتاج إلى رمز 'وهمي' يُسجَّل في السجلات دون إرسال فعلي، وهو ما قد يسمح لأي شخص برؤية الرمز والاستيلاء على حساب.",
      },
      acceptanceCriteria: {
        en: [
          "In an environment with valid Twilio credentials configured, OTPs are actually sent via Twilio, and the mock fallback path is never taken.",
          "If Twilio credentials are missing, the mock fallback logs clearly and obviously (so it's caught in review/monitoring) rather than failing silently.",
          "Production deployment configuration is verified to always have valid Twilio credentials present — this should be an explicit deploy-checklist/monitoring item, not just a code-review assumption.",
        ],
        ar: [
          "في بيئة مضبوطة ببيانات اعتماد Twilio صالحة، تُرسَل رموز OTP فعلياً عبر Twilio، ولا يُسلَك مسار البديل الوهمي إطلاقاً.",
          "إذا كانت بيانات اعتماد Twilio مفقودة، يسجّل البديل الوهمي ذلك بوضوح وبشكل ملحوظ (بحيث يُكتشف في المراجعة/المراقبة) بدلاً من الفشل الصامت.",
          "التحقق من أن إعدادات نشر الإنتاج تحتوي دائماً بيانات اعتماد Twilio صالحة — يجب أن يكون هذا بنداً صريحاً في قائمة تحقق النشر/المراقبة، لا افتراضاً في مراجعة الكود فقط.",
        ],
      },
      testScenarios: {
        en: [
          "In a local/dev environment with Twilio env vars unset, trigger an OTP request and confirm the mock fallback logs the code clearly to the console/logs.",
          "In staging/production-like config with real Twilio credentials, trigger an OTP request and confirm it's delivered via actual SMS, not logged as a mock.",
          "Add or confirm existence of a startup check/alert that fires if the production environment ever boots without valid Twilio credentials configured.",
        ],
        ar: [
          "في بيئة محلية/تطوير بمتغيرات بيئة Twilio غير مضبوطة، اطلب رمز OTP وتأكد أن البديل الوهمي يسجّل الرمز بوضوح في الـ console/السجلات.",
          "في إعداد شبيه بالتجربة/الإنتاج ببيانات اعتماد Twilio حقيقية، اطلب رمز OTP وتأكد من تسليمه عبر رسالة نصية فعلية، لا تسجيله كوهمي.",
          "أضف أو تأكد من وجود فحص/تنبيه عند بدء التشغيل يُطلق إنذاراً إذا أُقلعت بيئة الإنتاج دون بيانات اعتماد Twilio صالحة.",
        ],
      },
    },
    {
      id: "api-media-upload",
      title: {
        en: "Media upload endpoints have no auth guard — verify intentional or escalate as a security bug",
        ar: "نقاط نهاية رفع الوسائط بلا أي حارس مصادقة — تحقق من كون هذا مقصوداً أو صعّده كثغرة أمنية",
      },
      priority: "P0",
      story: {
        en: "Flag that POST media/upload/avatar and POST media/upload/listings (apps/api/src/media/media.controller.ts) currently have NO @UseGuards(AuthGuard('jwt')) at all — unlike almost every other feature controller in the API — so that this is either confirmed as an intentional public-upload design or escalated as a security bug before it's assumed to require a token like everything else tested in this section.",
        ar: "أشر إلى أن POST media/upload/avatar وPOST media/upload/listings (في apps/api/src/media/media.controller.ts) لا يحملان حالياً أي @UseGuards(AuthGuard('jwt')) إطلاقاً — خلافاً لكل متحكم ميزة آخر تقريباً في الواجهة البرمجية — حتى يُؤكَّد إما أن هذا تصميم رفع عام مقصود، أو يُصعَّد كثغرة أمنية، قبل افتراض أنه يتطلب رمز مصادقة مثل كل ما تم اختباره في هذا القسم.",
      },
      acceptanceCriteria: {
        en: [
          "Confirm with backend/security whether these two endpoints are meant to be callable with zero authentication.",
          "If unintentional: file as a P0 security bug — anyone with the URL could currently upload arbitrary files to S3 via these endpoints without ever logging in.",
          "If intentional (e.g. rate-limited, or gated some other way not visible in the controller itself): document the actual protection mechanism here so this story stops flagging it every pass.",
          "Once resolved either way, the standard file-type/size validation below still needs to hold regardless of auth state.",
        ],
        ar: [
          "تأكد مع فريقَي الواجهة الخلفية والأمن ما إذا كان من المفترض استدعاء نقطتَي النهاية هاتين دون أي مصادقة إطلاقاً.",
          "إذا كان غير مقصود: أبلغ عنه كثغرة أمنية بأولوية P0 — أي شخص يملك الرابط يستطيع حالياً رفع ملفات عشوائية إلى S3 عبر نقطتَي النهاية هاتين دون تسجيل دخول إطلاقاً.",
          "إذا كان مقصوداً (مثلاً محمي بتحديد معدل الطلبات، أو مقيَّد بطريقة أخرى غير ظاهرة في المتحكم نفسه): وثّق آلية الحماية الفعلية هنا حتى لا تستمر هذه القصة في الإبلاغ عن الأمر في كل جولة اختبار.",
          "بمجرد حل الأمر بأي اتجاه، يبقى التحقق المعتاد من نوع/حجم الملف أدناه واجباً بغض النظر عن حالة المصادقة.",
        ],
      },
      testScenarios: {
        en: [
          "Send a POST to /media/upload/avatar and /media/upload/listings with NO Authorization header at all and confirm whether the request succeeds — if it does, this is the headline finding to report, not a footnote.",
          "If publicly callable, check for any other protection (rate limiting, CORS, IP allowlisting) before concluding it's fully open.",
          "Upload a valid small JPEG/PNG as an avatar and confirm it appears correctly on the profile (functional check, independent of the auth question).",
          "Upload a non-image file (e.g. a .txt or .pdf) to both endpoints and confirm rejection with a clear error, not a generic 500.",
          "Upload an oversized image (beyond the 5MB avatar limit seen in the validator) and confirm a clean rejection rather than a hung request.",
          "Upload multiple listing images in one add-listing flow and confirm all are correctly associated with that listing, none dropped or mismatched.",
        ],
        ar: [
          "أرسل POST إلى /media/upload/avatar و/media/upload/listings دون أي رأس Authorization إطلاقاً وتأكد ما إذا كان الطلب ينجح — إن نجح، فهذه هي النتيجة الرئيسية الواجب الإبلاغ عنها، لا ملاحظة هامشية.",
          "إذا كان قابلاً للاستدعاء علناً، تحقق من وجود أي حماية أخرى (تحديد معدل الطلبات، CORS، قائمة IP مسموح بها) قبل الجزم بأنه مفتوح بالكامل.",
          "ارفع صورة JPEG/PNG صغيرة وصالحة كصورة شخصية وتأكد من ظهورها بشكل صحيح في الملف الشخصي (فحص وظيفي، مستقل عن مسألة المصادقة).",
          "ارفع ملفاً ليس صورة (مثل .txt أو .pdf) إلى نقطتَي النهاية وتأكد من الرفض مع رسالة خطأ واضحة، لا خطأ 500 عام.",
          "ارفع صورة كبيرة الحجم (تتجاوز حد 5 ميجابايت للصورة الشخصية الظاهر في أداة التحقق) وتأكد من رفض نظيف، لا طلب معلَّق.",
          "ارفع عدة صور إعلان ضمن تدفق إضافة إعلان واحد وتأكد أن جميعها مرتبطة بشكل صحيح بذلك الإعلان، دون فقدان أو خلط أي منها.",
        ],
      },
    },
    {
      id: "api-persona-rules",
      title: {
        en: "Persona rules: one of each type, unique licence, approval before going live",
        ar: "قواعد الهويات: واحدة من كل نوع، ترخيص فريد، واعتماد قبل النشر",
      },
      priority: "P0",
      story: {
        en: "Verify the shared persona creation path used by both direct signup (POST /users/register/company|office) and in-app onboarding (POST /identities/company|office, /identities/individual): an account has at most one individual, one company and one office (409 'لديك حساب شركة بالفعل'); a licence number (spaces removed, Arabic digits made Western) is unique across all companies and offices (409 'رقم الترخيص مسجل مسبقاً'); files are uploaded only after validation and deleted if saving fails; every new company/office opens an admin approval request. Until approved, it can save drafts but can't publish, renew, receive, list or accept requests.",
        ar: "تحقق من مسار إنشاء الهويات المشترك بين التسجيل المباشر (POST /users/register/company|office) والإضافة من داخل التطبيق (POST /identities/company|office و /identities/individual): للحساب فرد واحد وشركة واحدة ومكتب واحد كحد أقصى (409 'لديك حساب شركة بالفعل')؛ رقم الترخيص (بعد حذف المسافات وتحويل الأرقام العربية) فريد بين كل الشركات والمكاتب (409 'رقم الترخيص مسجل مسبقاً')؛ لا تُرفع الملفات إلا بعد التحقق وتُحذف إذا فشل الحفظ؛ وكل شركة/مكتب جديد يفتح طلب اعتماد للإدارة. قبل الاعتماد يمكنه حفظ المسودات ولا يمكنه النشر أو إعادة النشر أو استقبال الطلبات أو عرضها أو قبولها.",
      },
      acceptanceCriteria: {
        en: [
          "A second company for the same account → 409, and no file was uploaded.",
          "A licence already used by an office, typed with extra spaces or Arabic digits → 409.",
          "Two simultaneous creations with the same new licence → one 201, one 409.",
          "Pending company: POST /properties (non-draft), draft publish and /renew → 403 'حسابك قيد المراجعة…'; GET /company-requests/me (company/public) → []; accept → 403; a request aimed at it → 400.",
          "After an admin approves it, publishing and leads work.",
        ],
        ar: [
          "شركة ثانية لنفس الحساب ← 409، ولم يُرفع أي ملف.",
          "ترخيص مستخدم لمكتب، مكتوب بمسافات إضافية أو أرقام عربية ← 409.",
          "إنشاءان متزامنان بنفس الترخيص الجديد ← 201 واحد و 409 واحد.",
          "شركة قيد المراجعة: POST /properties (غير مسودة) ونشر المسودة و /renew ← 403 'حسابك قيد المراجعة…'؛ GET /company-requests/me (company/public) ← []؛ القبول ← 403؛ طلب موجّه إليها ← 400.",
          "بعد اعتماد الإدارة يعمل النشر والطلبات.",
        ],
      },
      testScenarios: {
        en: [
          "Register a company with licence 'LIC 123', then an office with '١٢٣' after 'LIC' — refused.",
          "Add a company in-app to an account that already has one — refused.",
          "As a pending company, publish an ad — 403; save it as draft — OK.",
          "Approve it from the admin portal and publish again — 201.",
        ],
        ar: [
          "سجّل شركة بترخيص 'LIC 123' ثم مكتباً بـ 'LIC١٢٣' — يُرفض.",
          "أضف شركة من التطبيق لحساب لديه شركة — يُرفض.",
          "كشركة قيد المراجعة انشر إعلاناً — 403؛ احفظه كمسودة — ينجح.",
          "اعتمدها من بوابة الإدارة وانشر مجدداً — 201.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "api-docs-portal-access",
      title: {
        en: "Docs portal access: a password per role, isolated from app accounts",
        ar: "الوصول إلى بوابة التوثيق: كلمة مرور لكل دور، منفصلة عن حسابات التطبيق",
      },
      priority: "P1",
      story: {
        en: "Verify the QA docs portal's own access (POST /qa-portal/auth/login with role, password and name): roles QA, DEVELOPER, UIUX, CLIENT, ADMIN; passwords stored only as bcrypt hashes; tokens signed with DOCS_JWT_SECRET, so they never work on the app API and app tokens never work here. Changing a role's password (PUT /qa-portal/roles/:role/password, ADMIN only) signs everyone on that role out. Five wrong passwords from one IP for a role → 429 for 15 minutes.",
        ar: "تحقق من الوصول الخاص ببوابة توثيق ضمان الجودة (POST /qa-portal/auth/login مع الدور وكلمة المرور والاسم): الأدوار QA و DEVELOPER و UIUX و CLIENT و ADMIN؛ كلمات المرور مخزنة كتجزئة bcrypt فقط؛ الرموز موقعة بـ DOCS_JWT_SECRET فلا تعمل على واجهة التطبيق ولا تعمل رموز التطبيق هنا. تغيير كلمة مرور دور (PUT /qa-portal/roles/:role/password للمسؤول فقط) يسجّل خروج كل من يستخدم ذلك الدور. خمس كلمات مرور خاطئة من نفس العنوان لدور واحد ← 429 لمدة 15 دقيقة.",
      },
      acceptanceCriteria: {
        en: [
          "CLIENT sees no API section or Postman page (404), and can't change passwords (403).",
          "The session cookie is httpOnly; the browser never sees the token.",
          "After a password change, the old password and existing sessions of that role stop working.",
          "A docs token sent to the app API (e.g. GET /users/me) → 401.",
        ],
        ar: [
          "العميل لا يرى قسم الواجهة البرمجية ولا صفحة Postman (404) ولا يمكنه تغيير كلمات المرور (403).",
          "ملف تعريف الجلسة httpOnly؛ ولا يرى المتصفح الرمز أبداً.",
          "بعد تغيير كلمة المرور تتوقف كلمة المرور القديمة والجلسات الحالية لذلك الدور.",
          "إرسال رمز التوثيق إلى واجهة التطبيق (مثل GET /users/me) ← 401.",
        ],
      },
      testScenarios: {
        en: [
          "Sign in as CLIENT and open /api and /postman — both 404.",
          "As ADMIN change the CLIENT password — a CLIENT tab already open is sent to the login page on its next navigation.",
          "Enter a wrong password 6 times — the 6th gets 'محاولات كثيرة…'.",
        ],
        ar: [
          "سجّل الدخول كعميل وافتح /api و /postman — كلاهما 404.",
          "كمسؤول غيّر كلمة مرور العميل — تبويب العميل المفتوح يُحوَّل لصفحة الدخول عند التنقل التالي.",
          "أدخل كلمة مرور خاطئة 6 مرات — المرة السادسة تحصل على 'محاولات كثيرة…'.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
  ],
};
