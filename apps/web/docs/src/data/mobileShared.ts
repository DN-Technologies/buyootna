import { DocSection } from "./types";

export const mobileShared: DocSection = {
  slug: "mobile-shared",
  title: { en: "Mobile — Shared", ar: "الجوال — مشترك" },
  summary: {
    en: "Cross-role mobile features (apps/mobile) that apply regardless of which identity is active — guest gating, chat, search, listings, identity switching, payments, layout, and the App Store demo account. Includes the confirmed reason Company/Office roles are currently unreachable.",
    ar: "ميزات التطبيق (apps/mobile) المشتركة بين جميع الأدوار، بغض النظر عن الهوية النشطة — تقييد الزوار، المحادثات، البحث، الإعلانات، تبديل الهويات، المدفوعات، التخطيط، وحساب العرض التجريبي لمتجر التطبيقات. يتضمن السبب المؤكد وراء تعذّر الوصول حالياً إلى دوري الشركة والمكتب العقاري.",
  },
  stories: [
    {
      id: "mobile-company-office-gate",
      title: {
        en: "Company/Office accounts are entirely gated behind a 'Coming Soon' screen — confirmed intentional",
        ar: "حسابات الشركات والمكاتب العقارية مقفلة بالكامل خلف شاشة 'قريباً' — مؤكَّد أنه مقصود",
      },
      priority: "P0",
      figmaFrameUrls: [
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=271-20996&m=dev",
          label: {
            en: "Initial account-type selection sheet",
            ar: "شاشة اختيار نوع الحساب الأولية",
          },
        },
        {
          url: "https://www.figma.com/design/UKbISBqMsuU82l0FGIev5L/Byoutna-App---Dashboard?node-id=354-19799&m=dev",
          label: {
            en: "Mid-signup 'change account type' sheet",
            ar: "شاشة 'تغيير نوع الحساب' أثناء التسجيل",
          },
        },
      ],
      story: {
        en: "Confirm that Company and Office account types are deliberately locked app-wide — apps/mobile/src/app/(auth)/business-auth.tsx checks `const COMPANY_OFFICE_LOCKED = true;` and renders <ComingSoonGate /> instead of the real signup/login form, and both (company)/_layout.tsx and (office)/_layout.tsx short-circuit their entire tab navigators to that same gate — so that this documented, intentional kill-switch is treated as a release-readiness checkpoint to re-verify every release, not something QA needs to rediscover or escalate as a bug each pass.",
        ar: "تأكد من أن نوعَي حساب الشركة والمكتب العقاري مقفلان عمداً على مستوى التطبيق بأكمله — الملف apps/mobile/src/app/(auth)/business-auth.tsx يفحص `const COMPANY_OFFICE_LOCKED = true;` ويعرض <ComingSoonGate /> بدلاً من نموذج التسجيل/الدخول الحقيقي، وكل من (company)/_layout.tsx و(office)/_layout.tsx يحوّلان كامل شجرة التبويبات الخاصة بهما إلى نفس هذه البوابة — وذلك حتى يُعامَل هذا القفل الموثَّق والمقصود كنقطة تحقق أساسية قبل كل إصدار، لا كأمر يُكتشف من جديد أو يُبلَّغ عنه كخطأ في كل جولة اختبار.",
      },
      acceptanceCriteria: {
        en: [
          "COMPANY_OFFICE_LOCKED is true in the current build, and every entry point into company/office (the business-auth screen, the (company) tab group, the (office) tab group) shows the same 'قريباً' ComingSoonGate bottom sheet — non-dismissible, with only a 'العودة للرئيسية' way out.",
          "'العودة للرئيسية' correctly returns the user to an individual identity if one exists on the account, or logs out to individual-auth if not — it never leaves the user stuck on a dead screen.",
          "This flag's state is an explicit, called-out line item in every release QA sign-off — before shipping, confirm whether it's intentionally still true or whether product has asked for it to flip to false.",
          "If/when this flips to false, every story in the Mobile — Company and Mobile — Office sections needs a full re-pass, since none of that functionality has been exercised by real users while the gate has been up.",
        ],
        ar: [
          "قيمة COMPANY_OFFICE_LOCKED تساوي true في النسخة الحالية، وكل نقطة دخول إلى دوري الشركة/المكتب العقاري (شاشة business-auth، مجموعة تبويبات (company)، مجموعة تبويبات (office)) تعرض نفس شاشة ComingSoonGate السفلية 'قريباً' — غير قابلة للإغلاق، وطريق الخروج الوحيد منها هو 'العودة للرئيسية'.",
          "زر 'العودة للرئيسية' يعيد المستخدم بشكل صحيح إلى هوية فردية إن وُجدت في الحساب، أو يسجّل الخروج إلى شاشة individual-auth إن لم توجد — ولا يترك المستخدم عالقاً في شاشة ميتة أبداً.",
          "حالة هذا القفل بند صريح ومذكور في كل موافقة إصدار من فريق الجودة — قبل النشر، تأكد ما إذا كان لا يزال مفعّلاً عمداً أم أن المنتج طلب إلغاءه.",
          "إذا/عندما يُلغى هذا القفل، تحتاج كل قصة في قسمي 'الجوال — الشركة' و'الجوال — المكتب العقاري' إلى إعادة اختبار كاملة، لأن أياً من تلك الوظائف لم يُختبر من قبل مستخدمين حقيقيين طوال فترة تفعيل القفل.",
        ],
      },
      testScenarios: {
        en: [
          "Attempt to reach Office or Company signup from every entry point you can find (the selection screen doesn't offer them at all — see the Mobile — Individual section; also try deep-linking directly to /(auth)/business-auth?type=office) and confirm ComingSoonGate always appears, with no path reaching a real form.",
          "Log in as an existing company/office test account (if one exists in the DB from before the lock) and confirm the (company)/(office) tab navigator is also gated — not just the auth screens.",
          "Tap 'العودة للرئيسية' from the gate as a user with an individual identity available, and confirm it switches to that identity correctly; repeat as a user with no individual identity and confirm it logs out cleanly to individual-auth.",
          "Before each release, explicitly re-check this flag's value in the shipped build (not just in the repo) since a build/env mismatch here would silently ship two completely unqualified onboarding paths to real users.",
        ],
        ar: [
          "حاول الوصول إلى تسجيل حساب مكتب عقاري أو شركة من كل نقطة دخول ممكنة (شاشة الاختيار لا تعرضهما إطلاقاً — راجع قسم 'الجوال — الفرد'؛ جرّب أيضاً الرابط المباشر /(auth)/business-auth?type=office) وتأكد من ظهور ComingSoonGate دائماً، دون أي مسار يصل إلى نموذج حقيقي.",
          "سجّل الدخول بحساب اختبار شركة/مكتب عقاري موجود مسبقاً (إن وُجد في قاعدة البيانات من قبل تفعيل القفل) وتأكد أن مجموعة تبويبات (company)/(office) مقفلة أيضاً، لا شاشات المصادقة فقط.",
          "اضغط 'العودة للرئيسية' من الشاشة كمستخدم لديه هوية فردية متاحة، وتأكد من التبديل إليها بشكل صحيح؛ كرر الاختبار كمستخدم بلا هوية فردية وتأكد من تسجيل الخروج بسلاسة إلى individual-auth.",
          "قبل كل إصدار، تحقق صراحةً من قيمة هذا القفل في النسخة المنشورة فعلياً (لا في المستودع فقط)، لأن أي تعارض بين بيئة البناء والمستودع هنا قد يوصل مسارَي تسجيل غير مكتملين إلى مستخدمين حقيقيين دون علم أحد.",
        ],
      },
    },
    {
      id: "mobile-guest-guard",
      title: {
        en: "Guest action-gating shows the auth sheet, never a dead end",
        ar: "تقييد إجراءات الزوار يعرض دائماً شاشة المصادقة، ولا يصل أبداً إلى طريق مسدود",
      },
      priority: "P0",
      story: {
        en: "Verify that every guarded action (Chat, Favorites, Notifications, Add Ad, Add Alert, Ask for Offer, Write Review) opens the Authentication Bottom Sheet for guest users, so that guests are always offered a clear path to sign up or log in instead of hitting a silent failure or crash.",
        ar: "تحقق من أن كل إجراء مقيَّد (المحادثة، المفضلة، الإشعارات، إضافة إعلان، إضافة تنبيه، طلب عرض سعر، كتابة تقييم) يفتح شاشة المصادقة السفلية للزوار، حتى يُعرض على الزائر دائماً مسار واضح لإنشاء حساب أو تسجيل الدخول بدلاً من فشل صامت أو تعطّل.",
      },
      acceptanceCriteria: {
        en: [
          "guardAction() intercepts all 7 listed actions when no session exists.",
          "The bottom sheet offers 'إنشاء حساب' (sign up), 'تسجيل دخول' (log in), and 'لاحقاً' (later/dismiss).",
          "Dismissing via 'لاحقاً' returns the guest to the exact screen/state they were on.",
          "The same actions work immediately (no sheet) once a real session exists.",
        ],
        ar: [
          "الدالة guardAction() تعترض جميع الإجراءات السبعة المذكورة عند عدم وجود جلسة دخول.",
          "الشاشة السفلية تعرض 'إنشاء حساب' و'تسجيل دخول' و'لاحقاً' (تجاهل الشاشة).",
          "إغلاق الشاشة عبر 'لاحقاً' يعيد الزائر إلى نفس الشاشة/الحالة التي كان فيها بالضبط.",
          "نفس الإجراءات تعمل فوراً (دون ظهور الشاشة) بمجرد وجود جلسة دخول حقيقية.",
        ],
      },
      testScenarios: {
        en: [
          "As a guest, tap the heart icon on a property card in Search results, Property Detail, and Home feed — confirm the sheet appears in all three places, not just one.",
          "As a guest, tap the '+' add-listing button and the 'Ask for Offer' button on a property — confirm both are gated.",
          "Complete login from the sheet mid-flow (e.g. from Favorites) and confirm the originally-attempted action completes automatically or the user lands back where they intended.",
          "Kill and relaunch the app as a guest — confirm gating still triggers after a cold start (not just first-session state).",
        ],
        ar: [
          "بصفتك زائراً، اضغط أيقونة القلب على بطاقة عقار في نتائج البحث، وفي تفاصيل العقار، وفي الصفحة الرئيسية — تأكد من ظهور الشاشة في المواضع الثلاثة، لا في موضع واحد فقط.",
          "بصفتك زائراً، اضغط زر '+' لإضافة إعلان وزر 'طلب عرض سعر' على عقار — تأكد أن كليهما مقيَّد.",
          "أكمل تسجيل الدخول من داخل الشاشة أثناء التدفق (مثلاً من المفضلة) وتأكد أن الإجراء الأصلي يُنفَّذ تلقائياً أو أن المستخدم يعود إلى ما كان ينوي فعله.",
          "أغلق التطبيق تماماً وأعد تشغيله كزائر — تأكد أن التقييد لا يزال يعمل بعد بدء تشغيل بارد (لا في حالة الجلسة الأولى فقط).",
        ],
      },
    },
    {
      id: "mobile-chat-realtime",
      title: {
        en: "Real-time chat delivers and syncs across devices",
        ar: "المحادثة الفورية توصل الرسائل وتتزامن بين الأجهزة",
      },
      priority: "P0",
      story: {
        en: "Verify the Socket.IO-backed chat (join_conversation/leave_conversation/send_message events, new_message/conversation_updated broadcasts) delivers messages reliably, so that buyers and sellers can trust conversations aren't dropped or duplicated. This applies identically to Individual chat and to company-chats/office-chats once the account-type gate lifts (mobile-company-office-gate) — all three screens share the same useChatStore.",
        ar: "تحقق من أن المحادثة المبنية على Socket.IO (أحداث join_conversation وleave_conversation وsend_message، وبثّ new_message وconversation_updated) توصل الرسائل بشكل موثوق، حتى يثق المشتري والبائع بأن المحادثات لا تُفقد أو تتكرر. ينطبق هذا بنفس القدر على محادثة الفرد وعلى company-chats/office-chats بمجرد رفع قفل نوع الحساب (mobile-company-office-gate) — الشاشات الثلاث تشترك في نفس useChatStore.",
      },
      acceptanceCriteria: {
        en: [
          "Sending a message from device A appears on device B (same account, two sessions) within a few seconds without manual refresh.",
          "conversation_updated correctly reorders/updates the chat list's last-message preview and unread badge.",
          "Reopening the app after being offline reconnects the socket and catches up on missed messages via GET conversations/:id/messages.",
          "POST conversations/:id/read clears the unread badge for that conversation only.",
        ],
        ar: [
          "إرسال رسالة من الجهاز A يظهر على الجهاز B (نفس الحساب، جلستان) خلال ثوانٍ معدودة دون تحديث يدوي.",
          "الحدث conversation_updated يعيد ترتيب/تحديث معاينة آخر رسالة وشارة عدد الرسائل غير المقروءة في قائمة المحادثات بشكل صحيح.",
          "إعادة فتح التطبيق بعد انقطاع الاتصال يعيد ربط الـ socket ويستكمل الرسائل الفائتة عبر GET conversations/:id/messages.",
          "الطلب POST conversations/:id/read يمسح شارة غير المقروء لتلك المحادثة فقط.",
        ],
      },
      testScenarios: {
        en: [
          "Two test accounts message each other; confirm delivery order matches send order on both ends.",
          "Put device A in airplane mode mid-conversation, send messages from B, then bring A back online — confirm A receives the backlog.",
          "Start a conversation from a Property Detail 'Chat' button as a guest — confirm this is gated by the auth sheet (see mobile-guest-guard), not a broken chat screen.",
          "KNOWN STUB: attempt 'Attach image' and image download in a chat thread — these currently only console.log and do nothing visible. Confirm the buttons at least fail silently/gracefully rather than crashing, and file this as a known gap rather than a new bug.",
        ],
        ar: [
          "أرسل رسائل متبادلة بين حسابَي اختبار؛ تأكد أن ترتيب وصول الرسائل يطابق ترتيب إرسالها على الطرفين.",
          "ضع الجهاز A في وضع الطيران أثناء محادثة جارية، أرسل رسائل من B، ثم أعد A للاتصال — تأكد أن A يستلم الرسائل المتراكمة.",
          "ابدأ محادثة من زر 'محادثة' في شاشة تفاصيل العقار وأنت زائر — تأكد أن هذا مقيَّد بشاشة المصادقة (راجع mobile-guest-guard)، لا شاشة محادثة معطوبة.",
          "نقص معروف: جرّب زر 'إرفاق صورة' وتنزيل الصور داخل محادثة — هذان حالياً ينفذان console.log فقط دون أي تأثير مرئي. تأكد أن الزرّين على الأقل يفشلان بصمت دون تعطّل التطبيق، ووثّق هذا كنقص معروف لا كخطأ جديد.",
        ],
      },
    },
    {
      id: "mobile-search",
      title: {
        en: "Search suggestions are live; recent-search history is mock-only",
        ar: "اقتراحات البحث حيّة فعلياً؛ أما سجل عمليات البحث الأخيرة فوهمي فقط",
      },
      priority: "P1",
      story: {
        en: "Verify that Search's live suggestions (real searchService calls) work correctly while confirming the 'recent searches' list is currently a mock/local array — so the mock history doesn't get misreported as a persistence bug, and gets tracked instead as a known gap (no Zustand/AsyncStorage persistence yet).",
        ar: "تحقق من أن اقتراحات البحث الحيّة (عبر طلبات searchService الحقيقية) تعمل بشكل صحيح، مع تأكيد أن قائمة 'عمليات البحث الأخيرة' حالياً مجرد مصفوفة وهمية/محلية — حتى لا يُبلَّغ خطأً عن هذا السجل الوهمي كخطأ في الحفظ الدائم، بل يُوثَّق كنقص معروف (لا يوجد حفظ عبر Zustand/AsyncStorage بعد).",
      },
      acceptanceCriteria: {
        en: [
          "Typing a query in Search shows live suggestions sourced from the backend, updating as the user types (debounced, no stale results flashing in).",
          "The GlobalFilterSheet filters (opened from Search) correctly narrow /search/results by tab and filters params.",
          "'Recent searches' shown on the Search screen do NOT persist across app restarts (expected today) — confirm this matches the known mock behavior rather than treating it as a regression.",
          "Search Results screen correctly reflects the tab/filters passed in via navigation params.",
        ],
        ar: [
          "كتابة استعلام في شاشة البحث تعرض اقتراحات حيّة مصدرها الواجهة الخلفية، وتتحدث أثناء الكتابة (بتأخير مناسب، دون وميض نتائج قديمة).",
          "فلاتر GlobalFilterSheet (تُفتح من شاشة البحث) تُضيّق نتائج /search/results بشكل صحيح حسب التبويب والمعاملات المختارة.",
          "قائمة 'عمليات البحث الأخيرة' في شاشة البحث لا تُحفظ عبر إعادة تشغيل التطبيق (وهذا متوقع حالياً) — تأكد أن هذا يطابق السلوك الوهمي المعروف، لا أن تُعامله كخلل جديد.",
          "شاشة نتائج البحث تعكس بشكل صحيح التبويب والفلاتر الممرَّرة عبر معاملات التنقل.",
        ],
      },
      testScenarios: {
        en: [
          "Type a partial property title/location and confirm suggestions load, then clear the field and confirm suggestions clear too.",
          "Apply 2-3 filters in GlobalFilterSheet, submit, and confirm the results screen URL/params and rendered results match the selected filters.",
          "Perform a search, force-quit the app, relaunch, and confirm 'recent searches' resets — document as expected (mock-only) rather than filing as a bug.",
          "Search with no matching results and confirm a proper empty state renders (not a blank screen or infinite spinner).",
        ],
        ar: [
          "اكتب جزءاً من عنوان عقار/موقع وتأكد من ظهور الاقتراحات، ثم امسح الحقل وتأكد من اختفائها أيضاً.",
          "طبّق 2-3 فلاتر في GlobalFilterSheet، أرسل الطلب، وتأكد أن معاملات شاشة النتائج والنتائج المعروضة تطابق الفلاتر المختارة.",
          "نفّذ عملية بحث، أغلق التطبيق بالكامل، أعد تشغيله، وتأكد من تصفير 'عمليات البحث الأخيرة' — وثّق هذا كسلوك متوقع (وهمي فقط) لا كخطأ.",
          "ابحث عن استعلام بلا نتائج مطابقة وتأكد من ظهور حالة فارغة مناسبة (لا شاشة بيضاء أو تحميل لا ينتهي).",
        ],
      },
    },
    {
      id: "mobile-add-listing",
      title: {
        en: "Multi-tab listing creation (Sell/Rent/Exchange) saves consistent data",
        ar: "إنشاء الإعلان متعدد التبويبات (بيع/إيجار/بدل) يحفظ بيانات متسقة",
      },
      priority: "P0",
      story: {
        en: "Verify the add-listing flow (SharedPropertyInfo + SellPropertyTab/RentPropertyTab/ExchangePropertyTab, driven by useListingStore, with a Preview step) produces a correctly-typed property regardless of which tab the user starts from, so that listings don't get created with the wrong type or missing required fields.",
        ar: "تحقق من أن تدفق إضافة الإعلان (SharedPropertyInfo مع SellPropertyTab/RentPropertyTab/ExchangePropertyTab، المُدار عبر useListingStore، مع خطوة معاينة) ينتج عقاراً بنوع صحيح بغض النظر عن التبويب الذي بدأ منه المستخدم، حتى لا تُنشأ الإعلانات بنوع خاطئ أو بحقول مطلوبة ناقصة.",
      },
      acceptanceCriteria: {
        en: [
          "Fields entered in SharedPropertyInfo persist correctly when switching between Sell/Rent/Exchange tabs before submission.",
          "Preview screen accurately reflects every field entered, including images, before final submission.",
          "Required-field validation blocks submission with clear inline errors rather than a silent failure.",
          "Successfully created listings appear immediately in the user's own listings/'My Ads' and in relevant search feeds.",
        ],
        ar: [
          "الحقول المُدخلة في SharedPropertyInfo تبقى محفوظة بشكل صحيح عند التبديل بين تبويبات بيع/إيجار/بدل قبل الإرسال.",
          "شاشة المعاينة تعكس بدقة كل حقل تم إدخاله، بما في ذلك الصور، قبل الإرسال النهائي.",
          "التحقق من الحقول المطلوبة يمنع الإرسال مع رسائل خطأ واضحة داخل الشاشة، لا فشلاً صامتاً.",
          "الإعلانات المُنشأة بنجاح تظهر فوراً في إعلانات المستخدم الخاصة ('إعلاناتي') وفي واجهات البحث ذات الصلة.",
        ],
      },
      testScenarios: {
        en: [
          "Create a Sell listing with all fields, submit, and verify it appears with correct type/price/fields on Property Detail.",
          "Start a Rent listing, switch to Exchange mid-flow, and confirm shared fields (location, images) aren't lost and type-specific fields (rent price vs. exchange terms) reset/validate appropriately.",
          "Attempt to submit with a required field missing (e.g. no images, no price) and confirm the app blocks submission with a visible error rather than sending an incomplete request.",
          "Edit an existing listing via /edit-listing/[id] and confirm changes save without duplicating the listing or resetting untouched fields.",
        ],
        ar: [
          "أنشئ إعلان بيع بجميع الحقول، أرسله، وتحقق من ظهوره بالنوع/السعر/الحقول الصحيحة في شاشة تفاصيل العقار.",
          "ابدأ إعلان إيجار، ثم بدّل إلى بدل أثناء التدفق، وتأكد أن الحقول المشتركة (الموقع، الصور) لم تُفقد وأن الحقول الخاصة بكل نوع (سعر الإيجار مقابل شروط البدل) تُعاد تهيئتها/تُتحقق منها بشكل مناسب.",
          "حاول الإرسال مع غياب حقل مطلوب (مثلاً بلا صور أو بلا سعر) وتأكد أن التطبيق يمنع الإرسال مع خطأ واضح، لا أن يرسل طلباً ناقصاً.",
          "عدّل إعلاناً موجوداً عبر /edit-listing/[id] وتأكد أن التعديلات تُحفظ دون تكرار الإعلان أو إعادة تعيين الحقول التي لم تُلمس.",
        ],
      },
    },
    {
      id: "mobile-identity-switch",
      title: {
        en: "Switching identities changes context everywhere, with no data bleed",
        ar: "تبديل الهوية يغيّر السياق في كل مكان، دون أي تسرّب للبيانات",
      },
      priority: "P0",
      story: {
        en: "Verify that POST auth/identity/switch correctly changes the active identity across the whole app, so that a user managing multiple identities never sees another identity's listings, chats, or favorites mixed into the current one. Note: switching TO a company/office identity currently lands on the ComingSoonGate (see mobile-company-office-gate) rather than a real home screen — verify that transition is clean, not broken.",
        ar: "تحقق من أن الطلب POST auth/identity/switch يغيّر الهوية النشطة بشكل صحيح في كامل التطبيق، حتى لا يرى المستخدم الذي يدير هويات متعددة إعلانات أو محادثات أو مفضلة هوية أخرى مختلطة بالهوية الحالية. ملاحظة: التبديل إلى هوية شركة/مكتب عقاري يصل حالياً إلى ComingSoonGate (راجع mobile-company-office-gate) بدلاً من شاشة رئيسية حقيقية — تحقق أن هذا الانتقال نظيف وليس معطوباً.",
      },
      acceptanceCriteria: {
        en: [
          "After switching identity, Home/tabs immediately reflect the new role's UI (individual tabs, or the ComingSoonGate for company/office while the lock is active).",
          "Listings, chats, and favorites shown are scoped strictly to the active identity.",
          "Switching back to a previous identity restores its exact prior state (scroll position not required, but data must match).",
          "Push notifications/chat sockets reconnect under the new identity's context rather than continuing to stream the old identity's events.",
        ],
        ar: [
          "بعد تبديل الهوية، تعكس الصفحة الرئيسية/التبويبات فوراً واجهة الدور الجديد (تبويبات الفرد، أو ComingSoonGate للشركة/المكتب العقاري أثناء تفعيل القفل).",
          "الإعلانات والمحادثات والمفضلة المعروضة مقتصرة تماماً على الهوية النشطة.",
          "التبديل إلى هوية سابقة يستعيد حالتها بالضبط (لا يُشترط موضع التمرير، لكن البيانات يجب أن تطابق).",
          "إشعارات الدفع/اتصالات المحادثة تُعاد ربطها ضمن سياق الهوية الجديدة، لا أن تستمر ببث أحداث الهوية القديمة.",
        ],
      },
      testScenarios: {
        en: [
          "With an active chat open under identity A, switch to identity B and confirm identity A's conversation is no longer visible/reachable as B.",
          "Switch identities repeatedly (A→B→A) and confirm no duplicated tabs, stale cached screens, or crash.",
          "If a test account has a pre-existing company/office identity, switch to it and confirm landing cleanly on ComingSoonGate rather than a half-rendered tab bar underneath it.",
        ],
        ar: [
          "مع فتح محادثة نشطة تحت الهوية A، بدّل إلى الهوية B وتأكد أن محادثة A لم تعد مرئية أو قابلة للوصول من B.",
          "بدّل الهويات بشكل متكرر (A←B←A) وتأكد من عدم ظهور تبويبات مكررة أو شاشات مخزَّنة قديمة أو تعطّل.",
          "إذا كان لحساب الاختبار هوية شركة/مكتب عقاري موجودة مسبقاً، بدّل إليها وتأكد من الوصول بسلاسة إلى ComingSoonGate، لا شريط تبويبات معروض جزئياً تحتها.",
        ],
      },
    },
    {
      id: "mobile-payments",
      title: {
        en: "Tap payment checkout completes and reconciles invoices correctly",
        ar: "عملية الدفع عبر Tap تكتمل وتُطابق الفواتير بشكل صحيح",
      },
      priority: "P0",
      story: {
        en: "Verify the Tap payment gateway flow (POST payments/charge → redirect → /payment-callback → webhook → GET payments/status/:invoiceId) correctly reflects success and failure states, so that users are never charged without an invoice being marked paid, or shown 'success' when payment actually failed.",
        ar: "تحقق من أن تدفق بوابة دفع Tap (POST payments/charge ← إعادة توجيه ← /payment-callback ← webhook ← GET payments/status/:invoiceId) يعكس حالتَي النجاح والفشل بشكل صحيح، حتى لا يُخصم من المستخدم دون تحديث حالة الفاتورة إلى مدفوعة، ولا تُعرض رسالة 'نجاح' بينما فشلت العملية فعلياً.",
      },
      acceptanceCriteria: {
        en: [
          "A successful Tap payment redirects to /payment-callback showing a success state, and the related invoice's status updates (visible in more/invoices).",
          "A declined/cancelled Tap payment redirects to a failure state and does not mark the invoice as paid.",
          "Webhook-driven status updates are reflected even if the user closes the app before the redirect completes (poll GET status/:invoiceId on next launch).",
          "Account balance (more/account-balance) reflects completed payments accurately.",
        ],
        ar: [
          "عملية دفع ناجحة عبر Tap تعيد التوجيه إلى /payment-callback مع عرض حالة نجاح، وتحديث حالة الفاتورة المرتبطة (مرئية في more/invoices).",
          "عملية دفع مرفوضة/ملغاة عبر Tap تعيد التوجيه إلى حالة فشل ولا تضع الفاتورة كمدفوعة.",
          "تحديثات الحالة القادمة عبر الـ webhook تنعكس حتى لو أغلق المستخدم التطبيق قبل اكتمال إعادة التوجيه (عبر استعلام GET status/:invoiceId عند التشغيل التالي).",
          "رصيد الحساب (more/account-balance) يعكس المدفوعات المكتملة بدقة.",
        ],
      },
      testScenarios: {
        en: [
          "Complete a full checkout with Tap test card success credentials and confirm invoice + balance update.",
          "Trigger a decline (Tap test card failure credentials) and confirm no invoice is falsely marked paid, and the user sees a clear failure message.",
          "Start a payment, force-close the app before the in-app redirect fires, reopen, and confirm the invoice status still resolves correctly (webhook already landed server-side).",
          "Double-submit a charge (rapid double-tap 'Pay') and confirm no duplicate charge/invoice is created.",
        ],
        ar: [
          "أكمل عملية دفع كاملة ببيانات بطاقة اختبار ناجحة من Tap وتأكد من تحديث الفاتورة والرصيد.",
          "نفّذ عملية دفع مرفوضة (ببيانات بطاقة اختبار فاشلة من Tap) وتأكد أن الفاتورة لا تُوضع كمدفوعة زوراً، وأن المستخدم يرى رسالة فشل واضحة.",
          "ابدأ عملية دفع، أغلق التطبيق قسراً قبل إطلاق إعادة التوجيه داخل التطبيق، أعد فتحه، وتأكد أن حالة الفاتورة تُحل بشكل صحيح رغم ذلك (لأن الـ webhook وصل مسبقاً من جهة الخادم).",
          "اضغط زر 'دفع' مرتين بسرعة (إرسال مزدوج) وتأكد من عدم إنشاء عملية دفع/فاتورة مكررة.",
        ],
      },
    },
    {
      id: "mobile-ipad-layout",
      title: {
        en: "Responsive layout holds up on iPad breakpoints",
        ar: "التخطيط المتجاوب يعمل بشكل صحيح على أحجام شاشات iPad",
      },
      priority: "P2",
      story: {
        en: "Verify the ContentContainer responsive breakpoints (md:/lg: Tailwind classes per docs/plans/07-ipad-layout.md) render correctly on iPad form factors, so that the App Store review team (and real iPad users) don't see a stretched/broken phone layout.",
        ar: "تحقق من أن نقاط الكسر المتجاوبة في ContentContainer (فئات Tailwind من نوع md:/lg: حسب docs/plans/07-ipad-layout.md) تُعرض بشكل صحيح على أحجام أجهزة iPad، حتى لا يرى فريق مراجعة App Store (والمستخدمون الفعليون لأجهزة iPad) تخطيطاً ممدوداً أو معطوباً مصمماً أصلاً للهاتف.",
      },
      acceptanceCriteria: {
        en: [
          "Key screens (Home, Search, Property Detail, Chat) use constrained/centered content width on iPad rather than full-bleed phone layout.",
          "Rotating an iPad between portrait and landscape doesn't break layout or clip content.",
          "Modals and bottom sheets (auth sheet, filter sheet, action sheet) remain usable and centered on iPad, not pinned oddly to a phone-sized area.",
        ],
        ar: [
          "الشاشات الأساسية (الرئيسية، البحث، تفاصيل العقار، المحادثة) تستخدم عرض محتوى محدوداً/مُمركزاً على iPad بدلاً من تخطيط هاتف ممتد لكامل الشاشة.",
          "تدوير iPad بين الوضع الرأسي والأفقي لا يكسر التخطيط أو يقصّ المحتوى.",
          "النوافذ المنبثقة والشاشات السفلية (شاشة المصادقة، شاشة الفلاتر، شاشة الإجراءات) تبقى قابلة للاستخدام ومُمركزة على iPad، لا محصورة بشكل غريب في منطقة بحجم هاتف.",
        ],
      },
      testScenarios: {
        en: [
          "Run through Home → Search → Property Detail → Chat on an iPad simulator (or device) in both orientations.",
          "Open the Authentication Bottom Sheet and GlobalFilterSheet on iPad and confirm they aren't stretched edge-to-edge in a way that looks broken.",
          "Compare against the demo account (see mobile-demo-account) screens specifically, since those are what App Store reviewers will see.",
        ],
        ar: [
          "تنقّل عبر الرئيسية ← البحث ← تفاصيل العقار ← المحادثة على محاكي (أو جهاز) iPad في كلا الوضعين.",
          "افتح شاشة المصادقة السفلية وGlobalFilterSheet على iPad وتأكد أنهما لا تمتدان من حافة إلى حافة بشكل يبدو معطوباً.",
          "قارن تحديداً بشاشات الحساب التجريبي (راجع mobile-demo-account)، لأنها ما سيراه مراجعو App Store فعلياً.",
        ],
      },
    },
    {
      id: "mobile-demo-account",
      title: {
        en: "App Store demo account has believable, working seeded data",
        ar: "الحساب التجريبي لمتجر التطبيقات يحتوي بيانات أولية واقعية وفعّالة",
      },
      priority: "P0",
      story: {
        en: "Verify the demo account (demo@buyootna.cloud, per docs/plans/08-demo-account.md) has working seeded properties, a draft listing, favorites, chats, and an active subscription, so that App Store reviewers logging in with this account see a fully functional app rather than empty screens that could trigger another 4.2.2-style rejection.",
        ar: "تحقق من أن الحساب التجريبي (demo@buyootna.cloud، حسب docs/plans/08-demo-account.md) يحتوي عقارات أولية فعّالة، وإعلان مسودة، ومفضلة، ومحادثات، واشتراكاً نشطاً، حتى يرى مراجعو App Store عند تسجيل الدخول بهذا الحساب تطبيقاً يعمل بشكل كامل بدلاً من شاشات فارغة قد تتسبب في رفض مشابه لرفض البند 4.2.2 السابق.",
      },
      acceptanceCriteria: {
        en: [
          "Logging in as the demo account succeeds without OTP friction (or with clearly documented reviewer-facing OTP steps).",
          "Home/Search show seeded, real-looking properties — not empty states.",
          "The seeded draft listing is editable and viewable in add-listing/edit-listing flows.",
          "Seeded favorites and chats are visible and navigable (chat thread has readable seeded messages).",
          "The seeded subscription/plan shows correctly under more/plans and more/invoices.",
        ],
        ar: [
          "تسجيل الدخول بالحساب التجريبي ينجح دون عوائق رمز التحقق OTP (أو مع خطوات OTP موثَّقة بوضوح للمراجع).",
          "الصفحة الرئيسية/البحث تعرض عقارات أولية تبدو واقعية، لا حالات فارغة.",
          "إعلان المسودة الأولي قابل للتعديل والعرض ضمن تدفقات إضافة/تعديل الإعلان.",
          "المفضلة والمحادثات الأولية مرئية وقابلة للتصفح (محادثة تحتوي رسائل أولية قابلة للقراءة).",
          "الاشتراك/الباقة الأولية تظهر بشكل صحيح ضمن more/plans وmore/invoices.",
        ],
      },
      testScenarios: {
        en: [
          "Fresh install → log in as demo account → walk every guarded action (Chat, Favorites, Add Ad, etc.) end to end with no auth-sheet interruptions.",
          "Confirm the seeded data survives a backend restart/reseed cycle (i.e. the seed script is idempotent and reviewer access doesn't silently break).",
          "Verify no seeded content contains placeholder/lorem text visible to a reviewer.",
          "Confirm the demo account is an Individual identity (not company/office), since those are gated — see mobile-company-office-gate.",
        ],
        ar: [
          "تثبيت جديد ← تسجيل الدخول بالحساب التجريبي ← جرّب كل إجراء مقيَّد (محادثة، مفضلة، إضافة إعلان، إلخ) من البداية للنهاية دون أي مقاطعة من شاشة المصادقة.",
          "تأكد أن البيانات الأولية تصمد أمام إعادة تشغيل/إعادة تهيئة الواجهة الخلفية (أي أن نص الإعداد الأولي idempotent ولا يتعطل وصول المراجع بصمت).",
          "تحقق أن المحتوى الأولي لا يحتوي أي نص عنصر نائب (placeholder/lorem) مرئي للمراجع.",
          "تأكد أن الحساب التجريبي هوية فردية (لا شركة/مكتب عقاري)، لأن هذين الدورين مقفلان — راجع mobile-company-office-gate.",
        ],
      },
    },
  ],
};
