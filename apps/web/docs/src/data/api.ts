import { DocSection } from "./types";

export const api: DocSection = {
  slug: "api",
  title: { en: "API", ar: "واجهة البرمجة (API)" },
  summary: {
    en: "NestJS backend (apps/api/src/features + core): auth and personas, properties/search/map/favorites, chat, notifications, plans/payments/invoices, reviews, the docs portal, and core Twilio/S3/Prisma services. These stories focus on correctness and security that a UI-only pass would miss.",
    ar: "الواجهة الخلفية NestJS (apps/api/src/features + core): المصادقة والهويات، العقارات/البحث/الخريطة/المفضلة، المحادثات، الإشعارات، الباقات/المدفوعات/الفواتير، التقييمات، بوابة التوثيق، والخدمات الأساسية Twilio/S3/Prisma. تركز القصص على الصحة والأمان التي قد يفوتها الاختبار عبر الواجهة فقط.",
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
      id: "api-chat-other-available",
      title: {
        en: "Chat: otherUser.isAvailable, and no messages to a deleted account",
        ar: "المحادثة: otherUser.isAvailable، ولا رسائل إلى حساب محذوف",
      },
      priority: "P1",
      story: {
        en: "GET /chat/conversations and GET /chat/conversations/:id/messages return `otherUser.isAvailable`: true for a live account; false when the other account is suspended (by its owner or an admin), blocked, or deleted. For a deleted account the messages `meta.otherUser` is an object with an empty id and `isAvailable: false` (it used to be null). An unavailable otherUser is always `isOnline: false` with `lastSeenAt: null`. Sending (socket send_message) into a conversation whose other account is deleted is refused with 403 'هذا المستخدم لم يعد متاحاً'; suspended or blocked stays 403 'هذا الحساب غير متاح حالياً'. Additive: clients that ignore the field behave as before.",
        ar: "يعيد GET /chat/conversations و GET /chat/conversations/:id/messages الحقل `otherUser.isAvailable`: true للحساب الفعّال؛ و false حين يكون حساب الطرف الآخر معلّقاً (من صاحبه أو من الإدارة) أو محظوراً أو محذوفاً. وللحساب المحذوف يكون `meta.otherUser` في الرسائل كائناً بمعرّف فارغ و`isAvailable: false` (كان null). والطرف غير المتاح دائماً `isOnline: false` و`lastSeenAt: null`. والإرسال (send_message عبر السوكت) إلى محادثة حُذف حساب طرفها الآخر يُرفض بـ 403 'هذا المستخدم لم يعد متاحاً'؛ والمعلّق أو المحظور يبقى 403 'هذا الحساب غير متاح حالياً'. إضافة فقط: العملاء الذين يتجاهلون الحقل يعملون كما كانوا.",
      },
      acceptanceCriteria: {
        en: [
          "Live other account: isAvailable true in the list and in the messages meta.",
          "Suspended or blocked: isAvailable false, isOnline false, lastSeenAt null.",
          "Deleted: the conversation is still listed, isAvailable false; send_message → message_error with 'هذا المستخدم لم يعد متاحاً' and nothing is stored.",
        ],
        ar: [
          "حساب الطرف الآخر فعّال: isAvailable true في القائمة وفي meta الرسائل.",
          "معلّق أو محظور: isAvailable false و isOnline false و lastSeenAt null.",
          "محذوف: المحادثة ما زالت في القائمة و isAvailable false؛ و send_message ← message_error بـ 'هذا المستخدم لم يعد متاحاً' ولا يُخزَّن شيء.",
        ],
      },
      testScenarios: {
        en: [
          "Block a user, then GET the other side's conversations — that row has isAvailable false.",
          "Delete a user, then send into the conversation from the other side — refused.",
        ],
        ar: [
          "احظر مستخدماً ثم اطلب محادثات الطرف الآخر — ذلك الصف فيه isAvailable false.",
          "احذف مستخدماً ثم أرسل في المحادثة من الطرف الآخر — يُرفض.",
        ],
      },
      updatedIn: "feat/chat-unavailable-user",
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
      id: "api-chat-presence-typing-request-link",
      title: {
        en: "Chat API: online status, typing events and a request link",
        ar: "واجهة المحادثات: حالة الاتصال وأحداث الكتابة وربط الطلب",
      },
      priority: "P1",
      story: {
        en: "Three additions to the chat API. Request link: POST /chat/conversations accepts requestId; it is kept only when one of the two personas is that request's requester, and it takes the place of propertyId (a chat is about one thing). Opening the chat again without it clears it, as already happens for the ad. GET /chat/conversations and the messages response now return requestContext { id, title, location, priceRange, status } next to propertyContext. New column Conversation.requestId (nullable, set null when the request is deleted). Online: otherUser now carries isOnline and lastSeenAt; the socket emits 'presence_changed' { identityId, isOnline, lastSeenAt } to everyone a persona chats with when its first socket connects or its last one closes. Typing: the socket accepts 'typing' { conversationId, isTyping } from a participant and relays 'typing' { conversationId, identityId, isTyping } to the other participants, in the conversation room and their inbox rooms. Nothing about typing is stored.",
        ar: "ثلاث إضافات لواجهة المحادثات. ربط الطلب: POST /chat/conversations يقبل requestId؛ ويُحتفظ به فقط إذا كان أحد الطرفين صاحب ذلك الطلب، ويحل محل propertyId (المحادثة عن موضوع واحد). فتح المحادثة مجدداً بدونه يمسحه كما يحدث للإعلان. GET /chat/conversations واستجابة الرسائل تعيدان الآن requestContext { id, title, location, priceRange, status } بجانب propertyContext. عمود جديد Conversation.requestId (يقبل الفراغ ويُفرَّغ عند حذف الطلب). الاتصال: otherUser يحمل الآن isOnline و lastSeenAt؛ ويرسل المقبس 'presence_changed' { identityId, isOnline, lastSeenAt } لكل من تحادثه الهوية عند اتصال أول مقبس لها أو إغلاق آخر مقبس. الكتابة: يقبل المقبس 'typing' { conversationId, isTyping } من مشارك ويعيد إرسال 'typing' { conversationId, identityId, isTyping } للمشاركين الآخرين في غرفة المحادثة وغرف صناديقهم. لا يُخزَّن شيء عن الكتابة.",
      },
      acceptanceCriteria: {
        en: [
          "Creating a conversation with a requestId the caller or the recipient asked for returns a conversation whose requestContext is set and propertyContext is null.",
          "A requestId that belongs to neither persona is ignored (no error, no link).",
          "'typing' from a socket that is not a participant of that conversation is dropped.",
          "A persona with two sockets open stays online when one closes; 'presence_changed' is sent only when the last one closes.",
          "Existing clients that send neither requestId nor typing keep working unchanged.",
        ],
        ar: [
          "إنشاء محادثة بـ requestId يخص صاحب الطلب (المتصل أو المستلم) يعيد محادثة فيها requestContext و propertyContext فارغ.",
          "requestId لا يخص أياً من الطرفين يُتجاهل (بلا خطأ وبلا ربط).",
          "'typing' من مقبس ليس مشاركاً في تلك المحادثة يُهمل.",
          "الهوية التي لها مقبسان مفتوحان تبقى متصلة عند إغلاق أحدهما؛ ويُرسل 'presence_changed' عند إغلاق الأخير فقط.",
          "العملاء الحاليون الذين لا يرسلون requestId ولا typing يعملون كما هم.",
        ],
      },
      testScenarios: {
        en: [
          "Connect two sockets as two personas that share a conversation; emit typing from one and check the other receives it, then disconnect one and check presence_changed.",
        ],
        ar: [
          "صِل مقبسين بهويتين تتشاركان محادثة؛ أرسل typing من أحدهما وتحقق من وصوله للآخر، ثم افصل أحدهما وتحقق من presence_changed.",
        ],
      },
      updatedIn: "feat/chat-flow-figma",
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
        en: "No mock SMS in production",
        ar: "لا رسائل وهمية في الإنتاج",
      },
      priority: "P0",
      story: {
        en: "Verify twilio.service.ts only uses mock SMS (codes written to the log) outside production. In production without Twilio credentials, sending a code fails with 'خدمة الرسائل النصية غير متاحة حالياً' and no code is accepted — unless ALLOW_MOCK_SMS=true is set on purpose. Startup logs 'Twilio credentials missing in production' in that case.",
        ar: "تحقق من أن twilio.service.ts يستخدم الرسائل الوهمية (رموز تُكتب في السجل) خارج الإنتاج فقط. في الإنتاج دون بيانات Twilio يفشل إرسال الرمز برسالة 'خدمة الرسائل النصية غير متاحة حالياً' ولا يُقبل أي رمز — ما لم يُضبط ALLOW_MOCK_SMS=true عمداً. ويظهر عند التشغيل السجل 'Twilio credentials missing in production' في هذه الحالة.",
      },
      acceptanceCriteria: {
        en: [
          "Production with Twilio configured: codes arrive by real SMS.",
          "Production without it: signup/suspension codes fail clearly; no mock code works.",
          "Development: mock mode still works.",
        ],
        ar: [
          "الإنتاج مع إعداد Twilio: تصل الرموز برسائل SMS حقيقية.",
          "الإنتاج دونه: رموز التسجيل/التعليق تفشل بوضوح؛ ولا يعمل أي رمز وهمي.",
          "التطوير: الوضع الوهمي ما زال يعمل.",
        ],
      },
      testScenarios: {
        en: [
          "After each deploy: docker compose logs api | grep -i twilio — expect 'initialized successfully'.",
        ],
        ar: [
          "بعد كل نشر: docker compose logs api | grep -i twilio — المتوقع 'initialized successfully'.",
        ],
      },
      updatedIn:
        "fix/map-multi-location, fix/android-label-wrap, fix/review-findings",
    },
    {
      id: "api-media-upload",
      title: {
        en: "Media uploads need a signed-in user",
        ar: "رفع الوسائط يتطلب مستخدماً مسجلاً",
      },
      priority: "P0",
      story: {
        en: "Verify POST /media/upload/avatar and /media/upload/listings require a valid token (JwtAuthGuard) — they used to accept anyone, letting strangers store files in S3. File checks: images only (png/jpg/webp/heic), 5 MB for an avatar, 10 MB per listing image, up to 10 images; HEIC is converted to JPEG.",
        ar: "تحقق من أن POST /media/upload/avatar و /media/upload/listings يتطلبان رمزاً صالحاً (JwtAuthGuard) — سابقاً كانا يقبلان أي أحد مما يسمح للغرباء بتخزين ملفات في S3. فحص الملفات: صور فقط (png/jpg/webp/heic)، 5 ميجابايت للصورة الشخصية و10 ميجابايت لكل صورة إعلان وحتى 10 صور؛ وتُحوَّل صور HEIC إلى JPEG.",
      },
      acceptanceCriteria: {
        en: [
          "No token → 401 on both endpoints.",
          "Signed in: profile photo, listing images and project images still upload from the app.",
          "A PDF or an 11 MB image is refused.",
        ],
        ar: [
          "دون رمز ← 401 على النقطتين.",
          "مع تسجيل الدخول: الصورة الشخصية وصور الإعلانات وصور المشاريع ما زالت تُرفع من التطبيق.",
          "ملف PDF أو صورة بحجم 11 ميجابايت تُرفض.",
        ],
      },
      testScenarios: {
        en: [
          "curl -F file=@x.png /media/upload/avatar without a token — 401.",
          "Change the profile photo in the app — works.",
        ],
        ar: [
          "curl -F file=@x.png /media/upload/avatar دون رمز — 401.",
          "غيّر الصورة الشخصية في التطبيق — تعمل.",
        ],
      },
      updatedIn:
        "fix/map-multi-location, fix/android-label-wrap, fix/review-findings",
    },
    {
      id: "api-persona-rules",
      title: {
        en: "Persona rules: one of each type, unique licence, companies live at once, offices after approval",
        ar: "قواعد الهويات: واحدة من كل نوع، ترخيص فريد، والشركة تعمل فوراً والمكتب بعد الاعتماد",
      },
      priority: "P0",
      story: {
        en: "Verify the shared persona creation path used by both direct signup (POST /users/register/company|office) and in-app onboarding (POST /identities/company|office, /identities/individual): an account has at most one individual, one company and one office (409 'لديك حساب شركة بالفعل'); a licence number (spaces removed, Arabic digits made Western) is unique across all companies and offices (409 'رقم الترخيص مسجل مسبقاً'); files are uploaded only after validation and deleted if saving fails; a new company is created APPROVED with its 30-day free trial and no approval request, so it is listed in the directory, search and map and can publish and take requests at once (its verified badge stays off until an admin approves it); a new office still opens an admin approval request and, until approved, can save drafts but can't publish or renew. An admin can still reject a company, which blocks it as before.",
        ar: "تحقق من مسار إنشاء الهويات المشترك بين التسجيل المباشر (POST /users/register/company|office) والإضافة من داخل التطبيق (POST /identities/company|office و /identities/individual): للحساب فرد واحد وشركة واحدة ومكتب واحد كحد أقصى (409 'لديك حساب شركة بالفعل')؛ رقم الترخيص (بعد حذف المسافات وتحويل الأرقام العربية) فريد بين كل الشركات والمكاتب (409 'رقم الترخيص مسجل مسبقاً')؛ لا تُرفع الملفات إلا بعد التحقق وتُحذف إذا فشل الحفظ؛ والشركة الجديدة تُنشأ بحالة APPROVED مع تجربتها المجانية 30 يوماً ودون طلب اعتماد، فتظهر في الدليل والبحث والخريطة وتنشر وتستقبل الطلبات فوراً (وشارة التوثيق تبقى مطفأة حتى يعتمدها مسؤول)؛ والمكتب الجديد ما زال يفتح طلب اعتماد للإدارة، وقبل الاعتماد يمكنه حفظ المسودات ولا يمكنه النشر أو إعادة النشر. ويستطيع المسؤول رفض شركة فتُمنع كما كان.",
      },
      acceptanceCriteria: {
        en: [
          "A second company for the same account → 409, and no file was uploaded.",
          "A licence already used by an office, typed with extra spaces or Arabic digits → 409.",
          "Two simultaneous creations with the same new licence → one 201, one 409.",
          "New company: `status` is APPROVED in the response, GET /users/companies?search=<name> returns it straight away, GET /company-subscriptions/me is TRIAL, and no review request is created. Pending office: POST /properties (non-draft), draft publish and /renew → 403 'حسابك قيد المراجعة…'.",
          "After an admin approves the office, publishing works.",
        ],
        ar: [
          "شركة ثانية لنفس الحساب ← 409، ولم يُرفع أي ملف.",
          "ترخيص مستخدم لمكتب، مكتوب بمسافات إضافية أو أرقام عربية ← 409.",
          "إنشاءان متزامنان بنفس الترخيص الجديد ← 201 واحد و 409 واحد.",
          "شركة جديدة: `status` في الرد APPROVED، و GET /users/companies?search=<الاسم> يعيدها فوراً، و GET /company-subscriptions/me يعيد TRIAL، ولا يُنشأ طلب اعتماد. مكتب قيد المراجعة: POST /properties (غير مسودة) ونشر المسودة و /renew ← 403 'حسابك قيد المراجعة…'.",
          "بعد اعتماد الإدارة للمكتب يعمل النشر.",
        ],
      },
      testScenarios: {
        en: [
          "Register a company with licence 'LIC 123', then an office with '١٢٣' after 'LIC' — refused.",
          "Add a company in-app to an account that already has one — refused.",
          "Register a company and search for it by name at once — it is listed. As a pending office, publish an ad — 403; save it as draft — OK.",
          "Approve it from the admin portal and publish again — 201.",
        ],
        ar: [
          "سجّل شركة بترخيص 'LIC 123' ثم مكتباً بـ 'LIC١٢٣' — يُرفض.",
          "أضف شركة من التطبيق لحساب لديه شركة — يُرفض.",
          "سجّل شركة وابحث عنها بالاسم فوراً — تظهر. وكمكتب قيد المراجعة انشر إعلاناً — 403؛ احفظه كمسودة — ينجح.",
          "اعتمدها من بوابة الإدارة وانشر مجدداً — 201.",
        ],
      },
      updatedIn: "feat/company-auto-approve",
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
    {
      id: "api-company-services",
      title: {
        en: "Company services: POST / GET / DELETE /users/profile/services",
        ar: "خدمات الشركة: POST / GET / DELETE /users/profile/services",
      },
      priority: "P1",
      story: {
        en: "A company's services are now rows of their own (table CompanyService) instead of one text field. POST /users/profile/services takes specialty, types[] (1 to 40, unique), title (required when types contains 'اخرى') and an optional description up to 100 characters, and creates one service per type; a type the company already offers is skipped, and the call fails with 400 when nothing is new. The first service sets the company's specialty; a later call with a different specialty is refused with 400. GET returns { specialty, services }. DELETE /users/profile/services/:id removes one of the caller's own services. The legacy services text on the company is kept in step (names joined with '،') so search, the directory and company cards read it unchanged.",
        ar: "أصبحت خدمات الشركة صفوفاً مستقلة (جدول CompanyService) بدل حقل نصي واحد. POST /users/profile/services يستقبل specialty و types[] (من 1 إلى 40 بلا تكرار) و title (مطلوب إذا احتوت types على 'اخرى') و description اختياري حتى 100 حرف، وينشئ خدمة لكل نوع؛ النوع الموجود مسبقاً يُتجاوز، ويفشل الطلب بـ 400 إن لم يكن هناك جديد. أول خدمة تحدد تخصص الشركة؛ وطلب لاحق بتخصص مختلف يُرفض بـ 400. GET يعيد { specialty, services }. DELETE /users/profile/services/:id يحذف إحدى خدمات صاحب الطلب. يبقى نص الخدمات القديم متوافقاً (الأسماء مفصولة بـ '،') ليقرأه البحث والدليل وبطاقات الشركات كما هو.",
      },
      acceptanceCriteria: {
        en: [
          "POST with two types creates two services and returns created: 2 with the full list.",
          "POST with 'اخرى' and no title returns 400 'عنوان الخدمة مطلوب عند اختيار اخرى'.",
          "POST with a specialty different from the company's returns 400 'لا يمكن تغيير تخصص الشركة'.",
          "POST with only types the company already has returns 400 'هذه الخدمات مضافة مسبقاً'.",
          "DELETE of another company's service returns 404.",
          "A caller without a company profile gets 404 on all three.",
        ],
        ar: [
          "POST بنوعين ينشئ خدمتين ويعيد created: 2 مع القائمة كاملة.",
          "POST بـ 'اخرى' دون عنوان يعيد 400 'عنوان الخدمة مطلوب عند اختيار اخرى'.",
          "POST بتخصص مختلف عن تخصص الشركة يعيد 400 'لا يمكن تغيير تخصص الشركة'.",
          "POST بأنواع موجودة كلها مسبقاً يعيد 400 'هذه الخدمات مضافة مسبقاً'.",
          "DELETE لخدمة شركة أخرى يعيد 404.",
          "صاحب طلب بلا ملف شركة يحصل على 404 في الثلاثة.",
        ],
      },
      testScenarios: {
        en: [
          "Create services for a new company, list them, delete one and check the company's public profile still lists the rest.",
        ],
        ar: [
          "أنشئ خدمات لشركة جديدة واعرضها واحذف واحدة وتحقق أن الملف العام للشركة ما زال يعرض الباقي.",
        ],
      },
      updatedIn: "feat/company-add-flows-figma",
    },
    {
      id: "api-account-state",
      title: {
        en: "Account state: deactivation periods, the reactivation ticket and admin-suspension errors",
        ar: "حالة الحساب: مدد التعطيل وتذكرة إعادة التفعيل وأخطاء إيقاف الإدارة",
      },
      priority: "P0",
      story: {
        en: "Verify the account-state contract. The login response's user carries accountStatus (active | deactivated_by_user | suspended_by_admin | blocked); admin user rows carry accountState and suspendedUntil. POST /users/account/suspend accepts optional durationDays (7, 14 or 30; anything else is 400). A sign-in to a deactivation whose period hasn't ended returns 409 { code: ACCOUNT_SCHEDULED_DEACTIVATION, daysLeft, suspendedUntil, reactivationTicket, message }. POST /auth/reactivate { ticket } (ticket valid 10 minutes) reactivates and returns the normal login response with reactivated: true. An admin-suspended or blocked account gets 403 { code: ACCOUNT_SUSPENDED_BY_ADMIN } at sign-in; its tokens get 401. The hourly job reactivates self-deactivations whose suspendedUntil has passed and never touches admin suspensions.",
        ar: "تحقق من عقد حالة الحساب. مستخدم استجابة الدخول يحمل accountStatus (active | deactivated_by_user | suspended_by_admin | blocked)؛ وصفوف المستخدمين في الإدارة تحمل accountState و suspendedUntil. POST /users/account/suspend يقبل durationDays اختيارياً (7 أو 14 أو 30؛ غير ذلك 400). تسجيل الدخول لتعطيل لم تنتهِ مدته يُرجع 409 { code: ACCOUNT_SCHEDULED_DEACTIVATION, daysLeft, suspendedUntil, reactivationTicket, message }. POST /auth/reactivate { ticket } (التذكرة صالحة 10 دقائق) يعيد التفعيل ويُرجع استجابة الدخول العادية مع reactivated: true. الحساب الموقوف أو المحظور من الإدارة يحصل على 403 { code: ACCOUNT_SUSPENDED_BY_ADMIN } عند الدخول؛ ورموزه تحصل على 401. مهمة كل ساعة تعيد تفعيل التعطيلات الذاتية التي تجاوزت suspendedUntil ولا تمس إيقافات الإدارة.",
      },
      acceptanceCriteria: {
        en: [
          "The reactivation ticket never works as a bearer token (401), and an expired or garbage ticket is refused with 401.",
          "A ticket for an account an admin suspended in the meantime is refused with 403.",
          "Sign-in after suspendedUntil has passed reactivates silently (no 409).",
          "Older app builds that don't send durationDays keep the open-ended behaviour.",
        ],
        ar: [
          "تذكرة إعادة التفعيل لا تعمل أبداً كرمز دخول (401)، والتذكرة المنتهية أو غير الصالحة تُرفض بـ 401.",
          "تذكرة حساب أوقفته الإدارة في الأثناء تُرفض بـ 403.",
          "تسجيل الدخول بعد تجاوز suspendedUntil يعيد التفعيل دون سؤال (بلا 409).",
          "إصدارات التطبيق القديمة التي لا ترسل durationDays تحتفظ بالسلوك المفتوح.",
        ],
      },
      testScenarios: {
        en: [
          "Suspend with durationDays 7; POST /auth/login → 409 with daysLeft 7; use the ticket as Authorization: Bearer on /users/me → 401; POST /auth/reactivate with it → 201 and reactivated: true.",
          "POST /auth/reactivate with 'nope' → 401.",
          "Suspend with durationDays 5 → 400.",
          "Admin-suspend a user, then POST /auth/login with the right password → 403 ACCOUNT_SUSPENDED_BY_ADMIN; with a wrong one → 401.",
        ],
        ar: [
          "علّق مع durationDays 7؛ POST /auth/login → 409 مع daysLeft 7؛ استخدم التذكرة كـ Authorization: Bearer على /users/me → 401؛ و POST /auth/reactivate بها → 201 و reactivated: true.",
          "POST /auth/reactivate بالقيمة 'nope' → 401.",
          "علّق مع durationDays 5 → 400.",
          "أوقف مستخدماً من الإدارة ثم POST /auth/login بكلمة المرور الصحيحة → 403 ACCOUNT_SUSPENDED_BY_ADMIN؛ وبكلمة خاطئة → 401.",
        ],
      },
      updatedIn: "feat/account-state",
    },
    {
      id: "api-login-method",
      title: {
        en: "Login method and SMS phone verification endpoints",
        ar: "نقاط طريقة تسجيل الدخول والتحقق من الهاتف برمز SMS",
      },
      priority: "P1",
      story: {
        en: "Verify GET/PATCH /users/account/login-method ({ method: BOTH | EMAIL | PHONE }; response loginMethod, email, phone, phoneVerified), POST /users/account/phone/request-otp { phone } and POST /users/account/phone/verify { phone, otp }. User.phoneVerifiedAt is set by SMS registration, admin-created accounts and the verify endpoint; the migration marked every phone already on file as verified. PATCH /users/profile refuses a different phone with 400 PHONE_VERIFICATION_REQUIRED (the unchanged number in any form — 8 digits, 965…, +965… — passes). Password login with the identifier that isn't the chosen one returns 403 LOGIN_METHOD_MISMATCH after the password check.",
        ar: "تحقق من GET/PATCH /users/account/login-method ({ method: BOTH | EMAIL | PHONE }؛ والاستجابة loginMethod و email و phone و phoneVerified)، و POST /users/account/phone/request-otp { phone } و POST /users/account/phone/verify { phone, otp }. يُضبط User.phoneVerifiedAt عند التسجيل بـ SMS وفي الحسابات التي ينشئها المشرف ومن نقطة التحقق؛ وقد اعتبر الترحيل كل رقم موجود مسبقاً موثقاً. PATCH /users/profile يرفض رقماً مختلفاً بـ 400 PHONE_VERIFICATION_REQUIRED (الرقم نفسه بأي صيغة — 8 أرقام أو 965… أو +965… — يمر). الدخول بكلمة المرور بالمعرّف غير المختار يُرجع 403 LOGIN_METHOD_MISMATCH بعد التحقق من كلمة المرور.",
      },
      acceptanceCriteria: {
        en: [
          "PATCH PHONE without a verified phone → 400 PHONE_NOT_VERIFIED; EMAIL without an email → 400 NO_EMAIL; any other value → 400.",
          "request-otp refuses an invalid number (400) and another account's number (409) without sending anything.",
          "verify with a wrong code changes nothing; with the right code sets phone and phoneVerified: true.",
          "Rate limits apply to both phone endpoints like other OTP endpoints.",
          "A new account starts on the method it signed up with: a phone sign-up is PHONE, an email (or Google/Apple) sign-up EMAIL; company/office sign-up (both given) and admin-created accounts with both stay BOTH.",
          "Migration login_method_default moves existing accounts that never chose: phone-only → PHONE, email-only → EMAIL; accounts with both, and any method already chosen, are unchanged.",
        ],
        ar: [
          "PATCH PHONE دون هاتف موثق → 400 PHONE_NOT_VERIFIED؛ و EMAIL دون بريد → 400 NO_EMAIL؛ وأي قيمة أخرى → 400.",
          "request-otp يرفض الرقم غير الصالح (400) ورقم حساب آخر (409) دون إرسال شيء.",
          "verify برمز خاطئ لا يغيّر شيئاً؛ وبالرمز الصحيح يضبط الهاتف و phoneVerified: true.",
          "حدود المعدل تنطبق على نقطتي الهاتف كبقية نقاط OTP.",
          "يبدأ الحساب الجديد بطريقة تسجيل الدخول التي سجّل بها: التسجيل بالهاتف PHONE، والتسجيل بالبريد (أو Google/Apple) EMAIL؛ وتسجيل الشركة/المكتب (بالاثنين) والحسابات التي ينشئها المسؤول بالاثنين تبقى BOTH.",
          "الترحيل login_method_default ينقل الحسابات الحالية التي لم تختر: الهاتف فقط ← PHONE، والبريد فقط ← EMAIL؛ والحسابات التي لديها الاثنان أو التي اختارت طريقة من قبل لا تتغير.",
        ],
      },
      testScenarios: {
        en: [
          "With the API in mock SMS mode: request-otp for a fresh number, read the code from the log, verify it, then PATCH method PHONE → 200.",
          "POST /auth/login with the email → 403 LOGIN_METHOD_MISMATCH; with the phone → 201; with the email and a wrong password → 401.",
          "PATCH /users/profile with the same number written as +965… → 200; with a new number → 400 PHONE_VERIFICATION_REQUIRED.",
        ],
        ar: [
          "مع تشغيل الـ API بوضع SMS التجريبي: اطلب رمزاً لرقم جديد واقرأه من السجل وتحقق منه، ثم PATCH method PHONE → 200.",
          "POST /auth/login بالبريد → 403 LOGIN_METHOD_MISMATCH؛ وبالهاتف → 201؛ وبالبريد وكلمة مرور خاطئة → 401.",
          "PATCH /users/profile بالرقم نفسه مكتوباً +965… → 200؛ وبرقم جديد → 400 PHONE_VERIFICATION_REQUIRED.",
        ],
      },
      updatedIn: "fix/individual-bugs",
    },
    {
      id: "api-service-invoices",
      title: {
        en: "Service invoices: client and company endpoints",
        ar: "فواتير الخدمات: نقاط العميل والشركة",
      },
      priority: "P1",
      story: {
        en: "Verify the client routes GET /service-invoices (?search=&sort=newest|oldest), GET /service-invoices/:id and DELETE /service-invoices/:id (hides it from the client only, clientDeletedAt), all scoped to the signed-in persona; and the company routes POST /users/profile/invoices (optional requestId of an ACCEPTED request accepted by this company → clientIdentityId and the client's name; otherwise clientName is required), GET /users/profile/invoices (?search=&sort=), GET /users/profile/invoices/clients (its accepted requests) and PATCH /users/profile/invoices/:id/paid (sets paidAt once, notifies the client with a SERVICE_INVOICE notification and push). Company routes use the active company persona.",
        ar: "تحقق من نقاط العميل GET /service-invoices (?search=&sort=newest|oldest) و GET /service-invoices/:id و DELETE /service-invoices/:id (تخفيها عن العميل فقط، clientDeletedAt)، وكلها مقيدة بالهوية المسجّل بها الدخول؛ ونقاط الشركة POST /users/profile/invoices (requestId اختياري لطلب ACCEPTED قبلته هذه الشركة → clientIdentityId واسم العميل؛ وإلا فـ clientName مطلوب) و GET /users/profile/invoices (?search=&sort=) و GET /users/profile/invoices/clients (طلباتها المقبولة) و PATCH /users/profile/invoices/:id/paid (يضبط paidAt مرة واحدة ويُشعر العميل بإشعار SERVICE_INVOICE ودفع). نقاط الشركة تستخدم هوية الشركة النشطة.",
      },
      acceptanceCriteria: {
        en: [
          "A requestId that is pending or accepted by another company → 400 'يمكن إصدار الفاتورة فقط لطلب قبلته شركتك'.",
          "Totals are computed by the server (items minus discount, discount capped at the subtotal).",
          "Another user's invoice → 404 on detail, delete and mark-paid.",
          "Marking paid twice keeps the first date; a client can't mark paid.",
          "After the client deletes, the company list still has it.",
        ],
        ar: [
          "requestId لطلب معلّق أو قبلته شركة أخرى → 400 'يمكن إصدار الفاتورة فقط لطلب قبلته شركتك'.",
          "يحسب الخادم المجاميع (البنود ناقص الخصم، والخصم لا يتجاوز المجموع).",
          "فاتورة مستخدم آخر → 404 في التفاصيل والحذف وتأكيد الدفع.",
          "تأكيد الدفع مرتين يحتفظ بالتاريخ الأول؛ ولا يمكن للعميل تأكيد الدفع.",
          "بعد حذف العميل تبقى الفاتورة في قائمة الشركة.",
        ],
      },
      testScenarios: {
        en: [
          "Issue with requestId → linkedToClient: true; the client's GET /service-invoices lists it with the company header.",
          "GET /service-invoices?sort=x → 400.",
          "PATCH …/paid as the company → paidAt set; as the client → 404.",
        ],
        ar: [
          "أصدر مع requestId → linkedToClient: true؛ و GET /service-invoices للعميل تعرضها مع ترويسة الشركة.",
          "GET /service-invoices?sort=x → 400.",
          "PATCH …/paid كشركة → يُضبط paidAt؛ وكعميل → 404.",
        ],
      },
      updatedIn: "feat/service-invoices",
    },
    {
      id: "api-location-details",
      title: {
        en: "Address details on ads and requests; saved locations",
        ar: "تفاصيل العنوان في الإعلانات والطلبات؛ المواقع المحفوظة",
      },
      priority: "P2",
      story: {
        en: "Verify POST/PATCH /properties and POST /company-requests accept an optional addressDetails { block, street, avenue, building, landmark } (each trimmed; 60 chars, landmark 200; empty parts dropped; an empty object clears it on update) and return it. /saved-locations: GET lists the account's places (HOME, WORK, then OTHER), POST saves (HOME/WORK replace the existing one; OTHER needs a name; at most 20), PATCH renames/relabels/moves, DELETE removes; another account's place is 404.",
        ar: "تحقق من أن POST/PATCH /properties و POST /company-requests تقبل addressDetails اختيارياً { block, street, avenue, building, landmark } (تُقص المسافات؛ 60 حرفاً و200 للعلامة؛ تُحذف الأجزاء الفارغة؛ والكائن الفارغ يمسحها عند التعديل) وتُرجعها. /saved-locations: GET يعرض أماكن الحساب (المنزل ثم العمل ثم الأخرى)، POST يحفظ (المنزل/العمل يستبدلان الموجود؛ الأخرى تحتاج اسماً؛ 20 كحد أقصى)، PATCH يعيد التسمية أو التصنيف أو النقل، DELETE يحذف؛ ومكان حساب آخر → 404.",
      },
      acceptanceCriteria: {
        en: [
          "A 61-character block → 400.",
          "Saving a second HOME replaces the first (still one HOME).",
          "OTHER without a name → 400 'اكتب اسماً للموقع'; the 21st place → 400.",
        ],
        ar: [
          "قطعة من 61 حرفاً → 400.",
          "حفظ منزل ثانٍ يستبدل الأول (يبقى منزل واحد).",
          "الأخرى دون اسم → 400 'اكتب اسماً للموقع'؛ والمكان رقم 21 → 400.",
        ],
      },
      testScenarios: {
        en: [
          "POST /company-requests with addressDetails { block: '6', street: '' } → stored as { block: '6' }.",
          "POST /saved-locations HOME twice, then GET → one HOME with the second address.",
        ],
        ar: [
          "POST /company-requests مع addressDetails { block: '6', street: '' } → تُحفظ { block: '6' }.",
          "POST /saved-locations للمنزل مرتين ثم GET → منزل واحد بالعنوان الثاني.",
        ],
      },
      updatedIn: "feat/map-picker",
    },
    {
      id: "api-publish-idempotency",
      title: {
        en: "POST /properties never spends a package twice for one publish",
        ar: "POST /properties لا يخصم من الباقة مرتين لعملية نشر واحدة",
      },
      priority: "P0",
      story: {
        en: "POST /properties accepts an optional submissionKey (UUID v4) per publish attempt, stored on the property with a unique (identityId, submissionKey) index. A repeat with the same key returns the ad already created, with the same success message, and spends nothing; two concurrent identical requests produce one ad. Publishing a draft claims it first, so two publishes of one draft spend once. Package refusals return 403 with code PACKAGE_UNUSABLE and a specific message: the package belongs to the account's other persona, it is used up, or the generic message for unknown/other-account ids.",
        ar: "يقبل POST /properties مفتاح submissionKey اختيارياً (UUID v4) لكل محاولة نشر، ويُخزَّن مع العقار بفهرس فريد (identityId, submissionKey). التكرار بنفس المفتاح يعيد الإعلان المُنشأ مسبقاً بنفس رسالة النجاح دون أي خصم؛ وطلبان متطابقان في نفس اللحظة ينتجان إعلاناً واحداً. نشر المسودة يحجزها أولاً، فنشرها مرتين يخصم مرة واحدة. رفض الباقة يعيد 403 مع الرمز PACKAGE_UNUSABLE ورسالة محددة: الباقة تابعة لهوية أخرى في الحساب، أو نفدت، أو الرسالة العامة للمعرّفات غير المعروفة أو التابعة لحساب آخر.",
      },
      acceptanceCriteria: {
        en: [
          "Two POST /properties with the same submissionKey create one property and lower adsRemaining by 1; the second response returns the first property.",
          "A request without submissionKey behaves exactly as before (older app builds).",
          "submissionKey must be a UUID v4, otherwise 400.",
          "A slot of the same account's other persona returns 403 PACKAGE_UNUSABLE 'هذه الباقة تابعة لحساب آخر لديك (فرد/شركة). بدّل الحساب للنشر منها.'",
          "An exhausted slot returns 403 PACKAGE_UNUSABLE 'نفدت إعلانات هذه الباقة.'; another account's slot gets the generic message and isn't confirmed to exist.",
          "A company under review still gets its own 403 without the PACKAGE_UNUSABLE code.",
        ],
        ar: [
          "طلبا POST /properties بنفس submissionKey ينشئان عقاراً واحداً وينقص adsRemaining بواحد؛ والرد الثاني يعيد العقار الأول.",
          "الطلب بدون submissionKey يتصرف كما كان تماماً (إصدارات التطبيق القديمة).",
          "يجب أن يكون submissionKey بصيغة UUID v4، وإلا 400.",
          "باقة تابعة لهوية أخرى في نفس الحساب تعيد 403 PACKAGE_UNUSABLE 'هذه الباقة تابعة لحساب آخر لديك (فرد/شركة). بدّل الحساب للنشر منها.'",
          "الباقة المنتهية تعيد 403 PACKAGE_UNUSABLE 'نفدت إعلانات هذه الباقة.'؛ وباقة حساب آخر تحصل على الرسالة العامة دون تأكيد وجودها.",
          "الشركة قيد المراجعة تحصل على رفض 403 الخاص بها بدون الرمز PACKAGE_UNUSABLE.",
        ],
      },
      testScenarios: {
        en: [
          "Give a persona a slot with 2 ads, POST /properties twice with one submissionKey — one property, adsRemaining 1.",
          "Send the same two requests at the same moment — still one property and one ad spent.",
          "Publish from a company persona's slot while on the individual persona — 403 with code PACKAGE_UNUSABLE and the persona message.",
          "Publish one draft twice at once (PATCH isDraft=false) — one credit spent.",
        ],
        ar: [
          "امنح هوية باقة فيها إعلانان، أرسل POST /properties مرتين بنفس submissionKey — عقار واحد وadsRemaining يساوي 1.",
          "أرسل الطلبين نفسهما في نفس اللحظة — يبقى عقار واحد وخصم إعلان واحد.",
          "انشر من باقة هوية الشركة وأنت على هوية الفرد — 403 مع الرمز PACKAGE_UNUSABLE ورسالة الهوية.",
          "انشر مسودة واحدة مرتين في نفس الوقت (PATCH isDraft=false) — خصم رصيد واحد فقط.",
        ],
      },
      updatedIn: "feat/map-picker",
    },
    {
      id: "api-email-verification",
      title: {
        en: "A new account email is set only through an emailed code",
        ar: "البريد الجديد للحساب يُعيَّن فقط عبر رمز يُرسل إليه",
      },
      priority: "P0",
      story: {
        en: "POST /users/account/email/request-otp {email} emails a 6-digit code to the address (rate limited per user, like the phone route) and refuses an address already on another account (409, any letter case). POST /users/account/email/verify {email, otp} sets it as the account's email only with the right code; a code is single-use, expires, and only confirms that user and that address. PATCH /users/profile now refuses a different email with 400 EMAIL_VERIFICATION_REQUIRED, accepts the unchanged one in any case, and treats an empty email as not sent (it never blanks the address).",
        ar: "POST /users/account/email/request-otp {email} يرسل رمزاً من 6 أرقام إلى العنوان (بحد للطلبات لكل مستخدم مثل مسار الهاتف) ويرفض عنواناً مستخدماً في حساب آخر (409، بأي حالة أحرف). POST /users/account/email/verify {email, otp} يجعله بريد الحساب فقط بالرمز الصحيح؛ الرمز لمرة واحدة وينتهي، ولا يؤكد إلا ذلك المستخدم وذلك العنوان. PATCH /users/profile يرفض الآن بريداً مختلفاً بـ 400 EMAIL_VERIFICATION_REQUIRED، ويقبل البريد نفسه بأي حالة أحرف، ويعامل البريد الفارغ كأنه لم يُرسل (لا يمسح العنوان أبداً).",
      },
      acceptanceCriteria: {
        en: [
          "request-otp with an invalid address → 400 'بريد الكتروني غير صالح'.",
          "request-otp for an address on another account → 409 'البريد الإلكتروني مستخدم في حساب آخر'.",
          "verify with a wrong, expired or reused code → 400 and the email is unchanged.",
          "verify with the right code → the email is set (lowercased) and returned.",
          "PATCH /users/profile with a new email → 400 EMAIL_VERIFICATION_REQUIRED; with '' or the same email → 200.",
        ],
        ar: [
          "request-otp بعنوان غير صالح ← 400 'بريد الكتروني غير صالح'.",
          "request-otp لعنوان في حساب آخر ← 409 'البريد الإلكتروني مستخدم في حساب آخر'.",
          "verify برمز خاطئ أو منتهٍ أو مستخدم ← 400 ولا يتغير البريد.",
          "verify بالرمز الصحيح ← يُعيَّن البريد (بأحرف صغيرة) ويُعاد.",
          "PATCH /users/profile ببريد جديد ← 400 EMAIL_VERIFICATION_REQUIRED؛ وبـ '' أو بنفس البريد ← 200.",
        ],
      },
      testScenarios: {
        en: [
          "With mail in mock mode, request a code for a made-up address, read it from the API log, verify — /users/me shows the new email.",
          "Reuse the same code — 400.",
          "PATCH /users/profile with another email without a code — 400 EMAIL_VERIFICATION_REQUIRED.",
        ],
        ar: [
          "مع البريد في الوضع التجريبي، اطلب رمزاً لعنوان وهمي، اقرأه من سجل الخادم، ثم تحقق — يظهر البريد الجديد في ‎/users/me.",
          "أعد استخدام نفس الرمز — 400.",
          "PATCH /users/profile ببريد آخر بدون رمز — 400 EMAIL_VERIFICATION_REQUIRED.",
        ],
      },
      updatedIn: "fix/individual-bugs",
    },
    {
      id: "api-identity-stats",
      title: {
        en: "Advertiser trust signals come from real data",
        ar: "مؤشرات الثقة للمعلن من بيانات حقيقية",
      },
      priority: "P1",
      story: {
        en: "Ratings, activity and response speed used to be hardcoded (4.5 stars, isActiveNow: true, +85 works). GET /users/:id now adds stats {identityId, rating, reviewsCount, soldCount, presence {isOnline, lastSeenAt}, responseTime {medianSeconds, sampleSize} | null} for the persona the profile shows. /users/company/:id and /users/office/:id return real isActiveNow, lastSeenAt, rating, reviewsCount and responseTime. The ad host card, home and search company cards use real ratings and ads counts. Ratings count the persona's reviews exactly like the reviews summary. Presence: a persona is online while its app holds the chat socket, or was seen within 2 minutes (requests refresh Identity.lastSeenAt at most once a minute). Response speed: median time to answer a chat over 90 days, null under 3 answers. Sold: ads deleted with the تم البيع reason.",
        ar: "كانت التقييمات والنشاط وسرعة الرد ثابتة في الكود (4.5 نجوم، isActiveNow: true، +85 عمل). الآن يضيف GET /users/:id الحقل stats {identityId, rating, reviewsCount, soldCount, presence {isOnline, lastSeenAt}, responseTime {medianSeconds, sampleSize} | null} للهوية المعروضة. ويعيد /users/company/:id و /users/office/:id قيماً حقيقية لـ isActiveNow و lastSeenAt و rating و reviewsCount و responseTime. وبطاقة المعلن وبطاقات الشركات في الرئيسية والبحث تستخدم تقييمات وأعداد إعلانات حقيقية. التقييم يحسب تقييمات الهوية تماماً كملخص التقييمات. النشاط: الهوية نشطة ما دام تطبيقها متصلاً بمقبس المحادثة، أو شوهدت خلال دقيقتين (الطلبات تحدّث Identity.lastSeenAt مرة كل دقيقة على الأكثر). سرعة الرد: وسيط زمن الرد على المحادثات خلال 90 يوماً، و null بأقل من 3 ردود. المباعة: الإعلانات المحذوفة بسبب تم البيع.",
      },
      acceptanceCriteria: {
        en: [
          "No response contains the old constants (rating 4.5, isActiveNow always true, projectsCount +50/+85).",
          "stats.rating and reviewsCount match GET /users/:id/reviews/summary for the same persona.",
          "presence.isOnline is true while that persona's app is open and false a couple of minutes after it is closed; lastSeenAt is kept.",
          "responseTime is null until the persona has answered at least 3 chats in 90 days.",
          "soldCount equals the persona's ads deleted with reason SOLD.",
          "Older app builds keep working (fields only added, none removed).",
        ],
        ar: [
          "لا تحتوي أي استجابة على القيم القديمة الثابتة (تقييم 4.5، isActiveNow دائماً true، projectsCount +50/+85).",
          "stats.rating و reviewsCount يطابقان GET /users/:id/reviews/summary لنفس الهوية.",
          "presence.isOnline يكون true ما دام تطبيق الهوية مفتوحاً و false بعد دقيقتين تقريباً من إغلاقه؛ ويبقى lastSeenAt.",
          "responseTime يبقى null حتى ترد الهوية على 3 محادثات على الأقل خلال 90 يوماً.",
          "soldCount يساوي إعلانات الهوية المحذوفة بسبب SOLD.",
          "إصدارات التطبيق القديمة تعمل كما هي (الحقول أُضيفت فقط ولم يُحذف شيء).",
        ],
      },
      testScenarios: {
        en: [
          "GET /users/<identityId> for a persona with no reviews — rating 0, reviewsCount 0, responseTime null.",
          "Add a 5-star review from another persona — stats shows rating 5, reviewsCount 1, same as the summary.",
          "Open the app as persona A, call GET /users/<A> from elsewhere — isOnline true; close the app, wait 3 minutes — isOnline false with lastSeenAt set.",
          "Delete one of A's ads with تم البيع — soldCount goes up by 1.",
        ],
        ar: [
          "GET /users/<identityId> لهوية بلا تقييمات — rating 0 و reviewsCount 0 و responseTime null.",
          "أضف تقييماً بخمس نجوم من هوية أخرى — يعرض stats التقييم 5 و reviewsCount 1 كما في الملخص.",
          "افتح التطبيق بالهوية A واطلب GET /users/<A> من مكان آخر — isOnline true؛ أغلق التطبيق وانتظر 3 دقائق — isOnline false مع وجود lastSeenAt.",
          "احذف أحد إعلانات A بسبب تم البيع — يزيد soldCount بواحد.",
        ],
      },
      updatedIn: "feat/real-trust-signals",
    },
    {
      id: "api-identity-contact-phone",
      title: {
        en: "Persona contact phone, phone always required, no business WhatsApp",
        ar: "رقم تواصل الهوية، والهاتف مطلوب دائماً، ولا واتساب للأعمال",
      },
      priority: "P1",
      story: {
        en: "Identity gains useAccountPhone (default true), contactPhone and contactPhoneVerifiedAt. GET /identities/current/contact-phone returns the active persona's state; POST .../request-otp {phone} texts a code (Twilio Verify, OTP rate limits); POST .../verify {phone, otp} sets the persona's own number and switches to it; PATCH /identities/current/contact-phone {useAccountPhone} switches back (false needs an already verified own number, else 400 CONTACT_PHONE_NOT_VERIFIED). Company/office details, office cards and the ad host return the resolved number; companies and offices return whatsapp: null and PATCH /users/profile ignores their whatsapp. PATCH /users/profile refuses an account with no phone (400 PHONE_REQUIRED).",
        ar: "تضاف إلى الهوية الحقول useAccountPhone (افتراضياً true) و contactPhone و contactPhoneVerifiedAt. GET /identities/current/contact-phone يعيد حالة الهوية النشطة؛ و POST .../request-otp {phone} يرسل رمزاً (Twilio Verify مع حدود OTP)؛ و POST .../verify {phone, otp} يعيّن رقم الهوية الخاص ويحوّل إليه؛ و PATCH /identities/current/contact-phone {useAccountPhone} يعيدها (false يتطلب رقماً خاصاً موثقاً مسبقاً، وإلا 400 CONTACT_PHONE_NOT_VERIFIED). وتفاصيل الشركة/المكتب وبطاقات المكاتب ومعلن الإعلان تعيد الرقم المحسوم؛ والشركات والمكاتب تعيد whatsapp: null ويتجاهل PATCH /users/profile واتسابها. ويرفض PATCH /users/profile حساباً بلا هاتف (400 PHONE_REQUIRED).",
      },
      acceptanceCriteria: {
        en: [
          "verify with a wrong code changes nothing; with the right one the persona's number is set and used.",
          "Only the signed-in account's active persona can be changed.",
          "Company/office responses have whatsapp: null; an individual's still has one.",
          "Saving a profile with no phone on the account returns PHONE_REQUIRED.",
        ],
        ar: [
          "التحقق برمز خاطئ لا يغيّر شيئاً؛ وبالرمز الصحيح يُعيّن رقم الهوية ويُستخدم.",
          "لا يمكن تغيير إلا الهوية النشطة للحساب المسجّل.",
          "استجابات الشركة/المكتب فيها whatsapp: null؛ واستجابة الفرد ما زال فيها رقم.",
          "حفظ ملف لحساب بلا هاتف يعيد PHONE_REQUIRED.",
        ],
      },
      testScenarios: {
        en: [
          "As a company persona: GET contact-phone → useAccountPhone true; PATCH {useAccountPhone:false} → 400 CONTACT_PHONE_NOT_VERIFIED.",
          "request-otp then verify with the code → GET /users/company/<id> shows the new phone and whatsapp: null.",
        ],
        ar: [
          "بهوية شركة: GET contact-phone ← useAccountPhone true؛ PATCH {useAccountPhone:false} ← 400 CONTACT_PHONE_NOT_VERIFIED.",
          "request-otp ثم verify بالرمز ← GET /users/company/<id> يعرض الرقم الجديد و whatsapp: null.",
        ],
      },
      updatedIn: "feat/identity-contact-phone",
    },
    {
      id: "api-chat-attachments-search",
      title: {
        en: "Chat attachments are private; search respects personas",
        ar: "مرفقات المحادثة خاصة، والبحث يحترم الهويات",
      },
      priority: "P0",
      story: {
        en: "POST /chat/conversations/:id/attachments (multipart files, up to 10) stores files privately under chat/<conversation> in S3 and returns attachment ids; send_message links them with attachmentIds. Messages return attachments with 15-minute signed links; GET /chat/attachments/:id/url renews one. Uploads never sent are deleted after 24 hours. GET /chat/conversations/:id/messages/search?q= and GET /chat/conversations?q= search only what the token persona can see.",
        ar: "POST /chat/conversations/:id/attachments (ملفات multipart حتى 10) يخزن الملفات بشكل خاص تحت chat/<conversation> في S3 ويعيد معرفات المرفقات؛ و send_message يربطها عبر attachmentIds. تعيد الرسائل المرفقات بروابط موقعة لمدة 15 دقيقة، و GET /chat/attachments/:id/url يجدد الرابط. والمرفوعات التي لم تُرسل تُحذف بعد 24 ساعة. و GET /chat/conversations/:id/messages/search?q= و GET /chat/conversations?q= يبحثان فقط فيما تراه هوية الرمز.",
      },
      acceptanceCriteria: {
        en: [
          "Upload, link renewal and in-chat search are 403 for a persona outside the conversation.",
          "Types: jpeg/png/webp/heic (HEIC converted to JPEG, 10 MB), pdf/doc/docx/xls/xlsx (20 MB), video mp4/mov (100 MB, with an optional `thumbnails` still and `durations`), voice m4a/aac/mp3 (10 MB, sent alone); others 400. nginx allows 110 MB bodies on the API host.",
          "attachmentIds must be the sender's own, in the same conversation and not sent yet; otherwise 400 and no message is created.",
          "Responses never include the storage key; the S3 bucket policy doesn't allow public reads of chat/*.",
          "Search skips messages hidden for the persona (حذف لدي).",
        ],
        ar: [
          "الرفع وتجديد الرابط والبحث داخل المحادثة تعيد 403 لهوية خارج المحادثة.",
          "الأنواع: jpeg/png/webp/heic (يُحوّل HEIC إلى JPEG، 10 ميجابايت)، و pdf/doc/docx/xls/xlsx (20 ميجابايت)، وفيديو mp4/mov (100 ميجابايت مع صورة مصغرة `thumbnails` ومدة `durations` اختياريتين)، وصوت m4a/aac/mp3 (10 ميجابايت ويُرسل وحده)؛ وغيرها 400. ويسمح nginx بطلبات حتى 110 ميجابايت على خادم الـ API.",
          "يجب أن تكون attachmentIds للمرسل نفسه وفي المحادثة نفسها ولم تُرسل بعد؛ وإلا 400 ولا تُنشأ رسالة.",
          "الاستجابات لا تتضمن مفتاح التخزين أبداً، وسياسة حاوية S3 لا تسمح بالقراءة العامة لـ chat/*.",
          "البحث يتجاهل الرسائل المخفية لدى الهوية (حذف لدي).",
        ],
      },
      testScenarios: {
        en: [
          "curl the upload with another account's token — 403; with no token — 401.",
          "Send with an attachment id from another chat or one already sent — 400.",
          "Open https://<bucket>.s3.<region>.amazonaws.com/chat/... directly — AccessDenied; the signed link works and stops after 15 minutes.",
        ],
        ar: [
          "نفّذ curl للرفع برمز حساب آخر — 403، وبدون رمز — 401.",
          "أرسل بمعرف مرفق من محادثة أخرى أو أُرسل مسبقاً — 400.",
          "افتح https://<bucket>.s3.<region>.amazonaws.com/chat/... مباشرة — AccessDenied؛ والرابط الموقّع يعمل ويتوقف بعد 15 دقيقة.",
        ],
      },
      updatedIn: "feat/native-1.5.0-video-voice",
    },
    {
      id: "api-chat-proposals",
      title: {
        en: "Chat proposals, locations and shared ads are validated server-side",
        ar: "التحقق من عروض المحادثة والمواقع والإعلانات المشاركة في الخادم",
      },
      priority: "P1",
      story: {
        en: "send_message accepts LOCATION (latitude, longitude, locationLabel), PROPERTY with any live propertyId, and APPOINTMENT / OFFER with a proposal (scheduledAt, or amount + period, note, counterOfId). The socket path isn't covered by the validation pipe, so ChatProposalsService.parse and the message service check everything. POST /chat/proposals/:id/respond { action: accept | decline | cancel } answers a proposal and emits message_updated to the room. A cron every 10 minutes pushes a reminder within the hour before each accepted appointment, once (remindedAt).",
        ar: "يقبل send_message الموقع LOCATION (latitude و longitude و locationLabel)، والإعلان PROPERTY بأي propertyId نشط، والموعد والعرض APPOINTMENT / OFFER مع proposal (scheduledAt، أو amount و period، و note و counterOfId). مسار الـ socket لا يمر بالتحقق العام، لذا يتحقق ChatProposalsService.parse وخدمة الرسائل من كل شيء. و POST /chat/proposals/:id/respond { action: accept | decline | cancel } يرد على العرض ويرسل message_updated للغرفة. ومهمة مجدولة كل 10 دقائق ترسل تذكيراً خلال الساعة التي تسبق كل موعد مقبول، مرة واحدة (remindedAt).",
      },
      acceptanceCriteria: {
        en: [
          "Appointments: at least 5 minutes ahead, at most 90 days; offers: amount > 0; otherwise 400.",
          "accept / decline only by the other participant, cancel only by the sender (403); only PENDING (400); a past appointment can't be accepted (400); outsiders get 404.",
          "Two simultaneous answers: one wins, the other gets 400.",
          "A counter must answer a PENDING proposal of the same kind, in the same conversation, from the other side.",
          "Sharing an ad that doesn't exist or isn't ACTIVE is refused (the chat's own ad is always allowed).",
        ],
        ar: [
          "المواعيد: بعد 5 دقائق على الأقل وخلال 90 يوماً كحد أقصى، والعروض: مبلغ أكبر من صفر، وإلا 400.",
          "القبول والرفض للطرف الآخر فقط والإلغاء للمرسل فقط (403)، ولحالة PENDING فقط (400)، ولا يُقبل موعد فات وقته (400)، ومن هو خارج المحادثة يحصل على 404.",
          "ردان في اللحظة نفسها: ينجح واحد ويحصل الآخر على 400.",
          "العرض المقابل يجب أن يرد على عرض PENDING من النوع نفسه وفي المحادثة نفسها ومن الطرف الآخر.",
          "مشاركة إعلان غير موجود أو غير ACTIVE مرفوضة (إعلان المحادثة نفسه مسموح دائماً).",
        ],
      },
      testScenarios: {
        en: [
          "POST /chat/proposals/<id>/respond as the sender with accept — 403; as the other side twice — second 400.",
          "Send an APPOINTMENT with scheduledAt in the past over the socket — message_error, nothing saved.",
          "Set an accepted appointment 30 minutes ahead and wait for the cron — one push per device, remindedAt set.",
        ],
        ar: [
          "نفّذ POST /chat/proposals/<id>/respond كمرسل بـ accept — 403، وكطرف آخر مرتين — الثانية 400.",
          "أرسل APPOINTMENT بموعد في الماضي عبر الـ socket — message_error ولا يُحفظ شيء.",
          "اضبط موعداً مقبولاً بعد 30 دقيقة وانتظر المهمة المجدولة — إشعار واحد لكل جهاز ويُضبط remindedAt.",
        ],
      },
      updatedIn: "feat/chat-share-location-proposals",
    },
    {
      id: "api-request-offers",
      title: {
        en: "Requests: companies answer with offers; the requester accepts, rejects or deletes",
        ar: "الطلبات: الشركات تردّ بعروض، وصاحب الطلب يقبل أو يرفض أو يحذف",
      },
      priority: "P1",
      story: {
        en: "A company answers a request it can see with POST /company-requests/:id/offers {message, notes?, price?} (one offer per company; answering again updates it; a pending request becomes responded; a request sent to another company is 404, a closed one 409). GET /company-requests/me?scope=mine and GET /company-requests/:id return `offers` (company, price, status, reply {message, notes}) and `offersCount`: the requester sees every company's offer, a company only its own. The requester decides with PATCH /company-requests/:id/accept-offer or /reject-offer (body `offerId`, required only when several offers are waiting): accepting makes the request accepted, carried out by that company, and rejects the other offers; rejecting rejects that offer, and the request once none is waiting. The requester can also DELETE /company-requests/:id and DELETE /company-requests/me. All requester routes are 404 for anyone else.",
        ar: "ترد الشركة على طلب تراه عبر POST /company-requests/:id/offers {message, notes?, price?} (عرض واحد لكل شركة؛ والرد مجدداً يحدّثه؛ والطلب قيد الانتظار يصبح تم الرد؛ والطلب الموجه لشركة أخرى 404 والمغلق 409). ويعيد GET /company-requests/me?scope=mine وGET /company-requests/:id الحقلين `offers` (الشركة والسعر والحالة والرد {message, notes}) و`offersCount`: صاحب الطلب يرى عروض كل الشركات، والشركة ترى عرضها فقط. ويقرر صاحب الطلب عبر PATCH /company-requests/:id/accept-offer أو /reject-offer (الحقل `offerId` مطلوب فقط عند وجود عدة عروض منتظرة): القبول يجعل الطلب مقبولاً بتنفيذ تلك الشركة ويرفض بقية العروض؛ والرفض يرفض ذلك العرض، ثم الطلب عندما لا يبقى عرض منتظر. ويستطيع صاحب الطلب أيضاً DELETE /company-requests/:id وDELETE /company-requests/me. وكل مسارات صاحب الطلب ترجع 404 لغيره.",
      },
      acceptanceCriteria: {
        en: [
          "A company's POST creates its offer and moves a pending request to responded; a second POST updates the same offer.",
          "The requester's request shows every offer; each company only sees its own.",
          "accept-offer with two offers waiting and no offerId is 400; with offerId it accepts that company and rejects the other offer.",
          "reject-offer keeps the request responded while another offer is waiting, and rejects it when none is.",
          "Delete / accept / reject by anyone but the requester is 404; accept or reject on a request that is not responded is 409.",
        ],
        ar: [
          "POST من الشركة ينشئ عرضها ويحوّل الطلب قيد الانتظار إلى تم الرد؛ وPOST ثانٍ يحدّث العرض نفسه.",
          "طلب صاحبه يعرض كل العروض؛ وكل شركة ترى عرضها فقط.",
          "accept-offer مع عرضين منتظرين وبدون offerId يعطي 400؛ ومع offerId يقبل تلك الشركة ويرفض العرض الآخر.",
          "reject-offer يُبقي الطلب تم الرد ما دام عرض آخر منتظراً، ويرفضه عندما لا يبقى أي عرض.",
          "الحذف/القبول/الرفض من غير صاحب الطلب 404؛ والقبول أو الرفض على طلب لم يتم الرد عليه 409.",
        ],
      },
      testScenarios: {
        en: [
          "As company A POST an offer to a public request, then as company B; as the requester GET it — two offers; as A GET it — only A's.",
          "As the requester accept-offer without offerId — 400; with B's offerId — request accepted by B, A's offer rejected.",
          "As another account DELETE the request — 404.",
        ],
        ar: [
          "كشركة A أرسل عرضاً إلى طلب عام ثم كشركة B؛ كصاحب الطلب اجلبه — عرضان؛ وكـ A — عرض A فقط.",
          "كصاحب الطلب accept-offer بدون offerId — 400؛ ومع offerId للشركة B — الطلب مقبول من B ويُرفض عرض A.",
          "من حساب آخر DELETE للطلب — 404.",
        ],
      },
      updatedIn: "feat/activity-offers-status-tabs",
    },
    {
      id: "api-property-category-fields",
      title: {
        en: "Properties: counts follow the category; FARM, WhatsApp number and allocation status",
        ar: "العقارات: العدّادات تتبع الفئة؛ فئة مزرعة ورقم الواتساب وحالة التخصيص",
      },
      priority: "P1",
      story: {
        en: "POST /properties and PATCH /properties/:id accept the new category `FARM`, an optional `whatsappNumber`, and `allocationStatus` (free text, exchange ads). `beds` and `baths` are now optional. The category decides which counts are stored: LAND and FARM store `beds`, `baths`, `floors` and `propertyAge` as null; HOUSE, CHALET, OFFICE, COMMERCIAL and the older categories store `floors` as null; APARTMENT and BUILDING keep all of them. This applies whatever the client sends, on create, draft and edit. Property responses include `whatsappNumber` and `allocationStatus`.",
        ar: "يقبل POST /properties وPATCH /properties/:id الفئة الجديدة `FARM`، والحقل الاختياري `whatsappNumber`، و`allocationStatus` (نص حر لإعلانات البدل). والحقلان `beds` و`baths` أصبحا اختياريين. الفئة تحدد العدّادات المخزّنة: LAND وFARM تُخزَّن فيهما `beds` و`baths` و`floors` و`propertyAge` بقيمة null؛ وHOUSE وCHALET وOFFICE وCOMMERCIAL والفئات الأقدم يُخزَّن فيها `floors` بقيمة null؛ وAPARTMENT وBUILDING تحتفظان بالجميع. يُطبَّق ذلك مهما أرسل العميل، عند الإنشاء والمسودة والتعديل. وردود العقار تتضمن `whatsappNumber` و`allocationStatus`.",
      },
      acceptanceCriteria: {
        en: [
          "Creating LAND with beds/baths/floors/propertyAge in the body stores all four as null.",
          "Creating a property without beds and baths is accepted; a non-numeric beds is still 400.",
          "category FARM is accepted; an unknown category is 400.",
          "whatsappNumber and allocationStatus are saved and returned; PATCH with null clears a number.",
          "Requests from app versions that still send beds/baths and older categories keep working.",
        ],
        ar: [
          "إنشاء LAND مع beds/baths/floors/propertyAge في الطلب يخزّن الأربعة null.",
          "إنشاء عقار بدون beds وbaths مقبول؛ وbeds غير الرقمي ما زال 400.",
          "الفئة FARM مقبولة؛ والفئة غير المعروفة 400.",
          "whatsappNumber وallocationStatus يُحفظان ويُعادان؛ وPATCH بقيمة null يمسح الرقم.",
          "طلبات إصدارات التطبيق التي ما زالت ترسل beds/baths والفئات الأقدم تعمل كما هي.",
        ],
      },
      testScenarios: {
        en: [
          "POST a LAND draft with beds: 3, then GET it: beds, baths, floors, propertyAge are null.",
          "POST an EXCHANGE draft with allocationStatus and whatsappNumber, then GET it: both returned.",
          "PATCH a FARM ad with beds: 4: beds stays null.",
        ],
        ar: [
          "أنشئ مسودة LAND مع beds: 3 ثم اجلبها: beds وbaths وfloors وpropertyAge بقيمة null.",
          "أنشئ مسودة EXCHANGE مع allocationStatus وwhatsappNumber ثم اجلبها: يُعاد الحقلان.",
          "عدّل إعلان FARM مع beds: 4: يبقى beds بقيمة null.",
        ],
      },
      updatedIn: "feat/add-ad-flow-figma",
    },
    {
      id: "api-company-subscriptions",
      title: {
        en: "Company subscriptions: plans, status, checkout, trial and gated actions",
        ar: "اشتراكات الشركات: الباقات والحالة والدفع والفترة التجريبية والإجراءات المقيّدة",
      },
      priority: "P1",
      story: {
        en: "GET /company-plans lists the active plans (name, durationMonths, price, features, badge); public. GET /company-subscriptions/me returns the active company persona's `{status: TRIAL|ACTIVE|EXPIRED|NONE, currentPlanId, plan, endsAt, daysLeft}`, where `plan` is the plan last paid for (running or expired, null if only the trial ran); GET /company-subscriptions/history lists its paid periods newest first as `{id, displayId, planName, startsAt, endsAt, status: ACTIVE|EXPIRED}` (both 403 for other personas). POST /payments/subscription-charge `{companyPlanId, appRedirectUrl}` creates a Tap charge priced from the plan row and returns `{checkoutUrl, invoiceId, status}`; company personas only. When Tap confirms the charge (redirect or webhook, whichever arrives first) a paid period is added, starting where the company's cover currently ends. A company gets a 30-day trial once, when an admin approves it. Without a running period these return 403 with `code: SUBSCRIPTION_REQUIRED`: POST /users/profile/services, /users/profile/projects, /users/profile/invoices, POST /company-requests/:id/offers and marking a request responded. POST /company-requests aimed at an unsubscribed company is 400, and GET /users/companies/:id returns `acceptsRequests`. The dashboard's `billing` gains `subscriptionStatus` and `trialDaysLeft`. A notification is created 7 days and 1 day before a company's cover ends.",
        ar: "يعيد GET /company-plans الباقات النشطة (الاسم، durationMonths، السعر، المزايا، الشارة) وهو عام. ويعيد GET /company-subscriptions/me لحساب الشركة النشط `{status: TRIAL|ACTIVE|EXPIRED|NONE, currentPlanId, plan, endsAt, daysLeft}` حيث `plan` هي آخر باقة مدفوعة (سارية أو منتهية، وnull إن لم تكن سوى الفترة التجريبية)؛ ويعيد GET /company-subscriptions/history الفترات المدفوعة من الأحدث بصيغة `{id, displayId, planName, startsAt, endsAt, status: ACTIVE|EXPIRED}` (كلاهما 403 لغير الشركات). وينشئ POST /payments/subscription-charge `{companyPlanId, appRedirectUrl}` عملية دفع Tap بسعر الباقة من قاعدة البيانات ويعيد `{checkoutUrl, invoiceId, status}`؛ لحسابات الشركات فقط. وعند تأكيد Tap للعملية (إعادة التوجيه أو الويب هوك، أيهما يصل أولاً) تُضاف فترة مدفوعة تبدأ من نهاية التغطية الحالية للشركة. وتحصل الشركة على فترة تجريبية 30 يوماً مرة واحدة عند اعتمادها من الإدارة. وبدون فترة سارية تعيد هذه المسارات 403 مع `code: SUBSCRIPTION_REQUIRED`: POST /users/profile/services و/users/profile/projects و/users/profile/invoices وPOST /company-requests/:id/offers وتعليم الطلب بأنه تم الرد. وPOST /company-requests الموجّه لشركة غير مشتركة يعيد 400، وGET /users/companies/:id يعيد `acceptsRequests`. ويضاف إلى `billing` في لوحة الشركة `subscriptionStatus` و`trialDaysLeft`. ويُنشأ إشعار قبل انتهاء تغطية الشركة بـ7 أيام وبيوم واحد.",
      },
      acceptanceCriteria: {
        en: [
          "GET /company-plans returns the three seeded plans in order without a token.",
          "subscription-charge ignores any client price: the Tap amount equals the plan's price; a non-company persona is 403; an unknown plan is 404.",
          "Redirect and webhook for the same charge add exactly one period.",
          "A second purchase starts at the previous endsAt, not today.",
          "An expired company gets 403 SUBSCRIPTION_REQUIRED on each gated action; an office or individual is never gated.",
          "Approving a company twice does not grant a second trial.",
          "An abandoned subscription checkout never shows as an overdue invoice on the dashboard.",
        ],
        ar: [
          "GET /company-plans يعيد الباقات الثلاث بالترتيب بدون توكن.",
          "subscription-charge يتجاهل أي سعر من العميل: مبلغ Tap يساوي سعر الباقة؛ وغير الشركة 403؛ والباقة غير المعروفة 404.",
          "إعادة التوجيه والويب هوك للعملية نفسها يضيفان فترة واحدة فقط.",
          "الشراء الثاني يبدأ من endsAt السابق لا من اليوم.",
          "الشركة منتهية الاشتراك تحصل على 403 SUBSCRIPTION_REQUIRED في كل إجراء مقيّد؛ والمكتب والفرد لا يُقيَّدان أبداً.",
          "اعتماد الشركة مرتين لا يمنح فترة تجريبية ثانية.",
          "عملية اشتراك لم تكتمل لا تظهر كفاتورة متأخرة في لوحة الشركة.",
        ],
      },
      testScenarios: {
        en: [
          "As a company on trial GET /company-subscriptions/me: TRIAL with daysLeft; POST a service: 201.",
          "Set the company's periods to the past: /me is EXPIRED and POST /users/profile/services is 403 SUBSCRIPTION_REQUIRED.",
          "Pay a 3-month plan in Tap test mode, then replay the webhook: one PAID period; /me is ACTIVE with that plan.",
          "Send a private request to the expired company: 400.",
        ],
        ar: [
          "كشركة في الفترة التجريبية اجلب /company-subscriptions/me: TRIAL مع daysLeft؛ وأضف خدمة: 201.",
          "اجعل فترات الشركة في الماضي: /me يعيد EXPIRED وإضافة خدمة تعيد 403 SUBSCRIPTION_REQUIRED.",
          "ادفع باقة 3 شهور في وضع اختبار Tap ثم أعد إرسال الويب هوك: فترة PAID واحدة؛ و/me يعيد ACTIVE بتلك الباقة.",
          "أرسل طلباً خاصاً للشركة المنتهية: 400.",
        ],
      },
      updatedIn: "feat/company-subscriptions",
    },
    {
      id: "api-properties-search-filters",
      title: {
        en: "Search filters: properties by governorate, area, category and price; companies and offices by location",
        ar: "فلاتر البحث: العقارات بالمحافظة والمنطقة والفئة والسعر؛ والشركات والمكاتب بالموقع",
      },
      priority: "P1",
      story: {
        en: "GET /properties accepts five more optional query parameters, combined with AND alongside `type`: `governorateId`, `areaId`, `category` (a PropertyCategory value), `minPrice` and `maxPrice`. The first three each take one value or several separated by commas (`governorateId=capital,hawally`), matching any of them. An ad with no price shown never matches a price range. `requestYear` and `requiredYear` (whole years, 1900 to 2100) match exchange ads' سنة الطلب and السنة المطلوبة exactly. Each item of the list also carries `listingType` (SALE, RENT or EXCHANGE; the older `type` field is a category group) and its `requestYear` and `requiredYear` (null unless set). `meta.total` counts the filtered set. GET /map/discover takes the same narrowing for property pins: `category` (one or several), `minPrice`, `maxPrice`, `requestYear` and `requiredYear`, alongside its bounds, `type`, `governorateIds` and `areaIds`; company pins ignore them. GET /users/companies gains `specialty` (one or several التخصص names, exact match) and `location` (one or several governorate or area names, matched as text inside the company's address or service areas); GET /users/offices gains `location` (matched inside the office's address). A company that lists its service area only as all of Kuwait is not matched by a specific governorate. Requests without them behave as before.",
        ar: "يقبل GET /properties خمسة معاملات اختيارية إضافية تُجمع بـ AND مع `type`: `governorateId` و`areaId` و`category` (قيمة من PropertyCategory) و`minPrice` و`maxPrice`. والثلاثة الأولى تقبل قيمة واحدة أو عدة قيم مفصولة بفواصل (`governorateId=capital,hawally`) وتطابق أياً منها. الإعلان بلا سعر معلن لا يطابق أي نطاق سعري. و`requestYear` و`requiredYear` (سنة صحيحة بين 1900 و2100) يطابقان سنة الطلب والسنة المطلوبة في إعلانات البدل مطابقة تامة. وكل عنصر في القائمة يحمل أيضاً `listingType` (SALE أو RENT أو EXCHANGE؛ والحقل الأقدم `type` هو مجموعة الفئة) و`requestYear` و`requiredYear` (null إن لم تُحدَّدا). و`meta.total` يحصي النتائج بعد التصفية. ويقبل GET /map/discover التضييق نفسه لدبابيس العقارات: `category` (واحدة أو أكثر) و`minPrice` و`maxPrice` و`requestYear` و`requiredYear`، بجانب الحدود و`type` و`governorateIds` و`areaIds`؛ ودبابيس الشركات تتجاهلها. ويضاف إلى GET /users/companies المعاملان `specialty` (اسم تخصص أو أكثر، مطابقة تامة) و`location` (اسم محافظة أو منطقة أو أكثر، يُطابق كنص ضمن عنوان الشركة أو مناطق خدمتها)؛ وإلى GET /users/offices المعامل `location` (يُطابق ضمن عنوان المكتب). والشركة التي تذكر منطقة خدمتها كجميع مناطق الكويت فقط لا تطابق محافظة محددة. والطلبات بدونها تعمل كما كانت.",
      },
      acceptanceCriteria: {
        en: [
          "?type=SALE&category=APARTMENT&maxPrice=100000 returns only sale apartments priced up to 100,000, and meta.total matches.",
          "?governorateId=capital&areaId=<id> returns only ads in that area.",
          "?governorateId=capital,hawally returns ads from both, and its total is the sum of the two single-governorate totals; ?category=APARTMENT,HOUSE likewise.",
          "GET /users/companies?location=<name> and ?specialty=<name> return only matching companies, combined with AND with each other and with category and search; GET /users/offices?location=<name> likewise.",
          "An unknown category is 400; a non-numeric or negative price is 400.",
          "?type=EXCHANGE&requestYear=2020 returns only exchange ads whose request year is 2020; a year that is not a whole number between 1900 and 2100 is 400.",
          "Every item has listingType; an exchange ad with years returns them, other ads return null.",
          "GET /map/discover?<bounds>&type=sell&category=APARTMENT&maxPrice=100000 returns only pins for sale flats up to 100,000; an unknown category is 400; without these parameters the pins are as before.",
          "minPrice alone and maxPrice alone each work.",
        ],
        ar: [
          "?type=SALE&category=APARTMENT&maxPrice=100000 يعيد شقق البيع حتى 100,000 فقط، وmeta.total مطابق.",
          "?governorateId=capital&areaId=<id> يعيد إعلانات تلك المنطقة فقط.",
          "?governorateId=capital,hawally يعيد إعلانات المحافظتين ومجموعه يساوي مجموع كل محافظة منفردة؛ وكذلك ?category=APARTMENT,HOUSE.",
          "GET /users/companies?location=<اسم> و?specialty=<اسم> يعيدان الشركات المطابقة فقط، مجموعين بـ AND مع بعضهما ومع category وsearch؛ وكذلك GET /users/offices?location=<اسم>.",
          "الفئة غير المعروفة 400؛ والسعر غير الرقمي أو السالب 400.",
          "?type=EXCHANGE&requestYear=2020 يعيد إعلانات البدل التي سنة طلبها 2020 فقط؛ والسنة التي ليست عدداً صحيحاً بين 1900 و2100 تعيد 400.",
          "كل عنصر فيه listingType؛ وإعلان البدل الذي له سنتان يعيدهما، وبقية الإعلانات تعيد null.",
          "GET /map/discover?<الحدود>&type=sell&category=APARTMENT&maxPrice=100000 يعيد دبابيس شقق البيع حتى 100,000 فقط؛ والفئة غير المعروفة 400؛ ودون هذه المعاملات تبقى الدبابيس كما كانت.",
          "minPrice وحده وmaxPrice وحده يعملان.",
        ],
      },
      testScenarios: {
        en: [
          "GET /properties?type=SALE&category=APARTMENT&maxPrice=100000 and check every item.",
          "GET /properties?category=NOPE: 400.",
          "GET /properties?governorateId=capital, then hawally, then capital,hawally: the third total is the sum.",
          "GET /users/offices?location=العاصمة and ?location=حولي against known offices.",
        ],
        ar: [
          "اطلب /properties?type=SALE&category=APARTMENT&maxPrice=100000 وتحقق من كل عنصر.",
          "اطلب /properties?category=NOPE: الرد 400.",
          "اطلب /properties?governorateId=capital ثم hawally ثم capital,hawally: المجموع الثالث يساوي مجموعهما.",
          "اطلب /users/offices?location=العاصمة و?location=حولي مقابل مكاتب معروفة.",
        ],
      },
      updatedIn: "feat/landing-home-figma",
    },
  ],
};
