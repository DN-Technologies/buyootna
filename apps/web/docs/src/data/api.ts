import { DocSection } from "./types";

export const api: DocSection = {
  slug: "api",
  title: { en: "API", ar: "واجهة البرمجة (API)" },
  summary: {
    en: "NestJS backend (apps/api/src/features + core): auth and personas, properties/search/map/favorites, chat, notifications, plans/payments/invoices, reviews, the docs portal, and core Twilio/S3/Prisma services. These stories focus on correctness and security that a UI-only pass would miss — including two open security items (unauthenticated media upload, Twilio mock fallback).",
    ar: "الواجهة الخلفية NestJS (apps/api/src/features + core): المصادقة والهويات، العقارات/البحث/الخريطة/المفضلة، المحادثات، الإشعارات، الباقات/المدفوعات/الفواتير، التقييمات، بوابة التوثيق، والخدمات الأساسية Twilio/S3/Prisma. تركز القصص على الصحة والأمان التي قد يفوتها الاختبار عبر الواجهة فقط — ومنها بندان أمنيان مفتوحان (رفع الوسائط دون مصادقة، وبديل Twilio الوهمي).",
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
      updatedIn: "feat/docs-platform",
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
      updatedIn: "feat/docs-platform",
    },
    {
      id: "api-chat-gateway",
      title: {
        en: "Chat socket and REST agree, per persona",
        ar: "مقبس المحادثة وواجهة REST متفقان، لكل هوية",
      },
      priority: "P0",
      story: {
        en: "Verify the /chat socket and REST endpoints agree: the socket identifies the sender by the persona in its token and joins that persona's room; join_conversation only works for the conversation's personas; send_message stores the message under the sending persona and emits new_message to the conversation and conversation_updated to the other persona's room; a failure emits message_error with the client's tempId. REST: POST /chat/conversations, GET /chat/conversations, GET /chat/conversations/:id/messages, POST /chat/conversations/:id/read.",
        ar: "تحقق من اتفاق مقبس /chat وواجهات REST: يحدد المقبس المرسل بالهوية الموجودة في رمزه وينضم لغرفة تلك الهوية؛ join_conversation يعمل فقط لهويات المحادثة؛ send_message يحفظ الرسالة باسم الهوية المرسلة ويبث new_message للمحادثة و conversation_updated لغرفة الهوية الأخرى؛ وعند الفشل يبث message_error مع tempId الخاص بالعميل. REST: POST /chat/conversations و GET /chat/conversations و GET /chat/conversations/:id/messages و POST /chat/conversations/:id/read.",
      },
      acceptanceCriteria: {
        en: [
          "A message sent over the socket is returned by GET /chat/conversations/:id/messages right after.",
          "A socket whose persona isn't in the conversation can't join its room or send to it (message_error).",
          "After POST /chat/conversations/:id/read, the conversation's unreadCount in GET /chat/conversations is 0.",
          "Switching persona (new token) moves the socket to the new persona's room.",
        ],
        ar: [
          "الرسالة المرسلة عبر المقبس يعيدها GET /chat/conversations/:id/messages مباشرة.",
          "المقبس الذي لا تنتمي هويته للمحادثة لا يمكنه الانضمام لغرفتها أو الإرسال إليها (message_error).",
          "بعد POST /chat/conversations/:id/read يصبح unreadCount للمحادثة في GET /chat/conversations صفراً.",
          "تبديل الهوية (رمز جديد) ينقل المقبس لغرفة الهوية الجديدة.",
        ],
      },
      testScenarios: {
        en: [
          "With a socket client, join someone else's conversation id and send — expect no new_message and a message_error.",
        ],
        ar: [
          "بعميل مقبس انضم لمعرّف محادثة شخص آخر وأرسل — المتوقع عدم وصول new_message وظهور message_error.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "api-payments-webhook",
      title: {
        en: "Tap webhook can't be forged and fulfils each invoice once",
        ar: "إشعار Tap لا يمكن تزويره ويُنفِّذ كل فاتورة مرة واحدة",
      },
      priority: "P0",
      story: {
        en: "Verify POST /payments/webhook never trusts its body: it re-fetches the charge from Tap and fulfils only when Tap reports it CAPTURED for that invoice. Fulfilment claims the invoice atomically (only if it isn't PAID yet), so Tap's retries or the redirect and webhook arriving together credit the account once. There's no signature check — the re-fetch is the protection, so it depends on TAP_SECRET_KEY being set.",
        ar: "تحقق من أن POST /payments/webhook لا يثق بمحتواه أبداً: يعيد جلب العملية من Tap ولا يُنفّذ إلا إذا أفاد Tap بأنها CAPTURED لتلك الفاتورة. التنفيذ يحجز الفاتورة ذرياً (فقط إن لم تكن مدفوعة بعد)، فتكرارات Tap أو وصول إعادة التوجيه والإشعار معاً تضيف الرصيد مرة واحدة. لا يوجد تحقق من التوقيع — إعادة الجلب هي الحماية، لذا تعتمد على ضبط TAP_SECRET_KEY.",
      },
      acceptanceCriteria: {
        en: [
          "A webhook body saying CAPTURED for an unpaid invoice with a made-up charge id changes nothing.",
          "Sending the same real webhook twice marks the invoice paid and adds credits once.",
          "GET /payments/status/:invoiceId shows PAID after either the redirect or the webhook.",
        ],
        ar: [
          "محتوى إشعار يقول CAPTURED لفاتورة غير مدفوعة بمعرّف عملية مختلق لا يغيّر شيئاً.",
          "إرسال نفس الإشعار الحقيقي مرتين يعلّم الفاتورة كمدفوعة ويضيف الرصيد مرة واحدة.",
          "GET /payments/status/:invoiceId يعرض PAID بعد إعادة التوجيه أو الإشعار.",
        ],
      },
      testScenarios: {
        en: [
          "Sandbox: pay, then replay the webhook payload with curl — the wallet doesn't grow twice.",
        ],
        ar: [
          "في وضع الاختبار: ادفع ثم أعد إرسال محتوى الإشعار عبر curl — لا يتضاعف رصيد المحفظة.",
        ],
      },
      updatedIn: "feat/docs-platform",
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
      updatedIn: "feat/docs-platform",
    },
    {
      id: "api-otp-fallback",
      title: {
        en: "Twilio mock-SMS fallback can turn on in production",
        ar: "بديل الرسائل الوهمي لـ Twilio قد يعمل في الإنتاج",
      },
      priority: "P0",
      story: {
        en: "Still open and security-relevant: twilio.service.ts switches to mock SMS mode whenever the Twilio credentials are missing — it doesn't check the environment, so a production deploy without them would silently stop sending real codes and accept mock ones. Until the code refuses mock mode in production, the production env must always have the Twilio variables, and a startup log 'Falling back to mock SMS mode' on production is an incident.",
        ar: "ما زال قائماً ومتعلقاً بالأمان: twilio.service.ts ينتقل لوضع الرسائل الوهمية كلما غابت بيانات Twilio — دون فحص البيئة، فالنشر في الإنتاج دونها يوقف إرسال الرموز الحقيقية بصمت ويقبل الوهمية. حتى يرفض الكود الوضع الوهمي في الإنتاج، يجب أن تحتوي بيئة الإنتاج دائماً على متغيرات Twilio، وظهور سجل 'Falling back to mock SMS mode' عند التشغيل في الإنتاج حادثة أمنية.",
      },
      acceptanceCriteria: {
        en: [
          "Production startup logs show 'Twilio Verify client initialized successfully', never the mock-mode warning.",
          "Phone OTPs on production arrive by real SMS.",
          "A fix makes the API refuse to start (or refuse OTP) in production without Twilio credentials.",
        ],
        ar: [
          "سجلات تشغيل الإنتاج تعرض 'Twilio Verify client initialized successfully' وليس تحذير الوضع الوهمي أبداً.",
          "رموز الهاتف في الإنتاج تصل برسائل SMS حقيقية.",
          "الإصلاح يجعل الواجهة ترفض التشغيل (أو ترفض الرموز) في الإنتاج دون بيانات Twilio.",
        ],
      },
      testScenarios: {
        en: [
          "After each deploy: docker compose logs api | grep -i twilio.",
        ],
        ar: [
          "بعد كل نشر: docker compose logs api | grep -i twilio.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "api-media-upload",
      title: {
        en: "Media upload endpoints have no auth guard — verify intentional or escalate as a security bug",
        ar: "نقاط نهاية رفع الوسائط بلا أي حارس مصادقة — تحقق من كون هذا مقصوداً أو صعّده كثغرة أمنية",
      },
      priority: "P0",
      story: {
        en: "Flag that POST media/upload/avatar and POST media/upload/listings (apps/api/src/media/media.controller.ts) currently have NO @UseGuards(AuthGuard('jwt')) at all — unlike almost every other feature controller in the API — and no file-type or size limits either — so that this is either confirmed as an intentional public-upload design or escalated as a security bug before it's assumed to require a token like everything else tested in this section. Still true as of this review; the mobile app calls both with a token, so adding the guard wouldn't break it.",
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
      updatedIn: "feat/docs-platform",
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
    {
      id: "api-docs-test-tracking",
      title: {
        en: "Docs portal test tracking: releases, results, comments",
        ar: "تتبع الاختبار في بوابة التوثيق: الإصدارات والنتائج والتعليقات",
      },
      priority: "P1",
      story: {
        en: "Verify test tracking on the docs portal: an admin creates a release (POST /qa-portal/releases) and can close/reopen it; QA records pass/fail/blocked/not run per story (POST /qa-portal/releases/:id/stories/:storyId/results — a failure needs a note); a developer can only mark a failed or blocked story 'ready to retest'; UI/UX adds design-mismatch notes (POST /qa-portal/stories/:storyId/comments); screenshots are images up to 5 MB (POST /qa-portal/attachments). Results are append-only: the newest per story is its status, older ones are its history. A client sees statuses and progress only, never notes, bug links or screenshots.",
        ar: "تحقق من تتبع الاختبار في بوابة التوثيق: ينشئ المسؤول إصداراً (POST /qa-portal/releases) ويمكنه إغلاقه/إعادة فتحه؛ يسجّل فريق الجودة نجح/فشل/متعثر/لم يُنفَّذ لكل قصة (POST /qa-portal/releases/:id/stories/:storyId/results — الفشل يحتاج ملاحظة)؛ المطور يمكنه فقط تعليم قصة فاشلة أو متعثرة 'جاهزة لإعادة الاختبار'؛ مصمم الواجهات يضيف ملاحظات عدم تطابق التصميم (POST /qa-portal/stories/:storyId/comments)؛ لقطات الشاشة صور حتى 5 ميجابايت (POST /qa-portal/attachments). النتائج تُضاف ولا تُعدّل: الأحدث لكل قصة هو حالتها والأقدم سجلها. العميل يرى الحالات والتقدم فقط، دون الملاحظات أو روابط البلاغات أو اللقطات.",
      },
      acceptanceCriteria: {
        en: [
          "Only ADMIN creates, closes and reopens releases; results on a closed release are refused (409).",
          "QA 'Failed' without a note is refused; with a note it becomes the story's status, attributed to the tester's name.",
          "A developer's 'ready to retest' works only after a fail/blocked result; developers can't record pass/fail.",
          "Design notes are for UI/UX (and admin); everyone on the team can comment.",
          "The Releases page shows each release's pass percentage over the stories that role can see, and links failing/blocked stories.",
          "A client can't open a story's history or record anything, and sees no notes.",
        ],
        ar: [
          "المسؤول فقط ينشئ الإصدارات ويغلقها ويعيد فتحها؛ والنتائج على إصدار مغلق تُرفض (409).",
          "'فشل' من الجودة دون ملاحظة يُرفض؛ ومع الملاحظة يصبح حالة القصة منسوباً لاسم المختبر.",
          "'جاهز لإعادة الاختبار' من المطور يعمل فقط بعد نتيجة فشل/تعثر؛ ولا يسجّل المطورون نجح/فشل.",
          "ملاحظات التصميم لمصمم الواجهات (والمسؤول)؛ وكل الفريق يمكنه التعليق.",
          "صفحة الإصدارات تعرض نسبة النجاح لكل إصدار من القصص التي يراها الدور، وتربط القصص الفاشلة/المتعثرة.",
          "العميل لا يمكنه فتح سجل القصة أو تسجيل أي شيء، ولا يرى الملاحظات.",
        ],
      },
      testScenarios: {
        en: [
          "As Admin create '1.4.0 OTA', as QA fail one story with a note and a screenshot — the story page and the Releases page show it.",
          "As Developer mark it ready to retest; as QA retest and pass it — history shows FAIL → READY_FOR_RETEST → PASS.",
          "As Client open the Releases page — progress visible, notes absent.",
          "Close the release, try recording as QA — refused; pick the closed release in the sidebar — results are read-only.",
        ],
        ar: [
          "كمسؤول أنشئ '1.4.0 OTA'، وكجودة أفشل قصة مع ملاحظة ولقطة — تظهر في صفحة القصة وصفحة الإصدارات.",
          "كمطور علّمها جاهزة لإعادة الاختبار؛ وكجودة أعد اختبارها وأنجحها — السجل يعرض فشل ← جاهز لإعادة الاختبار ← نجح.",
          "كعميل افتح صفحة الإصدارات — التقدم ظاهر والملاحظات غائبة.",
          "أغلق الإصدار وحاول التسجيل كجودة — يُرفض؛ اختر الإصدار المغلق من الشريط الجانبي — النتائج للقراءة فقط.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
  ],
};
