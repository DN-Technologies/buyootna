import { DocSection } from "./types";

export const mobileShared: DocSection = {
  slug: "mobile-shared",
  title: { en: "Mobile — Shared", ar: "الجوال — مشترك" },
  summary: {
    en: "Cross-role mobile features (apps/mobile) that apply regardless of which persona is active — guest gating, chat, search, listings, persona switching, per-persona ownership, payments, layout, and the App Store demo account. Company/Office screens stay behind the EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS flag in store builds (see mobile-company-office-gate).",
    ar: "ميزات التطبيق (apps/mobile) المشتركة بين جميع الأدوار بغض النظر عن الهوية النشطة — تقييد الزوار، المحادثات، البحث، الإعلانات، تبديل الهويات، ملكية البيانات لكل هوية، المدفوعات، التخطيط، وحساب العرض التجريبي لمتجر التطبيقات. تبقى شاشات الشركة والمكتب خلف مفتاح EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS في نسخ المتاجر (راجع mobile-company-office-gate).",
  },
  stories: [
    {
      id: "mobile-company-office-gate",
      title: {
        en: "Company/Office screens are gated in store builds by a feature flag",
        ar: "شاشات الشركة والمكتب مقفلة في نسخ المتاجر عبر مفتاح تفعيل",
      },
      priority: "P0",
      story: {
        en: "Confirm the Company/Office gate is controlled by EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS: when it isn't 'true' (every store build and every OTA — eas.json doesn't set it and scripts/release-ota.js blanks it), business-auth.tsx and the (company)/(office) layouts render <ComingSoonGate /> and the account-type selection hides Company/Office. With the flag on (local dev only), the real company/office screens appear. Re-verify this on every release so a dev-only flag never leaks to production.",
        ar: "تأكد من أن قفل الشركة/المكتب يتحكم به المفتاح EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS: إذا لم تكن قيمته 'true' (كل نسخ المتاجر وكل تحديثات OTA — لا يضبطه eas.json ويفرّغه scripts/release-ota.js) فإن business-auth.tsx وتخطيطات (company)/(office) تعرض <ComingSoonGate /> وتُخفى خيارات الشركة/المكتب في شاشة اختيار نوع الحساب. عند تفعيله (في التطوير المحلي فقط) تظهر شاشات الشركة/المكتب الحقيقية. أعد التحقق في كل إصدار حتى لا يتسرب مفتاح التطوير إلى الإنتاج.",
      },
      acceptanceCriteria: {
        en: [
          "A store/TestFlight/Play build shows 'Coming soon' for Company and Office in both the initial selection and the mid-signup 'change account type' sheet.",
          "Opening any (company) or (office) route in a store build lands on ComingSoonGate, never a half-rendered tab.",
          "An OTA published with scripts/release-ota.js prints 'Neutralized … EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS' in its checklist.",
          "With the flag set to 'true' locally, the company/office signup and tabs render normally.",
        ],
        ar: [
          "نسخة المتجر/TestFlight/Play تعرض 'قريباً' للشركة والمكتب في شاشة الاختيار الأولى وفي نافذة 'تغيير نوع الحساب' أثناء التسجيل.",
          "فتح أي مسار (company) أو (office) في نسخة المتجر يعرض ComingSoonGate وليس تبويباً ناقصاً.",
          "تحديث OTA المنشور عبر scripts/release-ota.js يطبع في قائمة التحقق 'Neutralized … EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS'.",
          "عند ضبط المفتاح على 'true' محلياً تظهر شاشات تسجيل وتبويبات الشركة/المكتب بشكل طبيعي.",
        ],
      },
      testScenarios: {
        en: [
          "On a production build, tap Company then Office on the selection screen — both show the coming-soon state.",
          "Deep-link to a company route on a production build — the gate appears.",
          "Run the OTA checklist (without confirming) and read the neutralized-keys line.",
        ],
        ar: [
          "في نسخة الإنتاج اضغط الشركة ثم المكتب في شاشة الاختيار — كلاهما يعرض حالة 'قريباً'.",
          "افتح رابطاً عميقاً لمسار شركة في نسخة الإنتاج — تظهر شاشة القفل.",
          "شغّل قائمة تحقق OTA (دون التأكيد) واقرأ سطر المفاتيح المحيَّدة.",
        ],
      },
      updatedIn: "feat/docs-platform",
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
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-chat-realtime",
      title: {
        en: "Chat is per persona and delivers in real time",
        ar: "المحادثة خاصة بكل هوية وتصل فورياً",
      },
      priority: "P0",
      story: {
        en: "Verify chat between personas: POST /chat/conversations opens (or reuses) the conversation between the active persona and the recipient persona; messages are sent over the /chat socket (send_message) and stored under the sending persona; the other side gets new_message in the room and conversation_updated in its persona room. Only the conversation's personas can join its room or read it.",
        ar: "تحقق من المحادثة بين الهويات: POST /chat/conversations يفتح (أو يعيد استخدام) المحادثة بين الهوية النشطة وهوية المستلم؛ تُرسل الرسائل عبر مقبس /chat (send_message) وتُحفظ باسم الهوية المرسِلة؛ يستقبل الطرف الآخر new_message في الغرفة و conversation_updated في غرفة هويته. فقط هويات المحادثة يمكنها الانضمام إلى غرفتها أو قراءتها.",
      },
      acceptanceCriteria: {
        en: [
          "A sent message appears for the recipient without refreshing, and is still there after reopening the chat.",
          "Two personas of the same account can't message each other ('لا يمكنك بدء محادثة مع نفسك').",
          "The inbox after switching persona lists only that persona's conversations.",
          "Messaging a suspended or blocked account is refused ('هذا الحساب غير متاح حالياً').",
        ],
        ar: [
          "الرسالة المرسلة تظهر للمستلم دون تحديث وتبقى بعد إعادة فتح المحادثة.",
          "لا يمكن لهويتين في نفس الحساب مراسلة بعضهما ('لا يمكنك بدء محادثة مع نفسك').",
          "صندوق الوارد بعد تبديل الهوية يعرض محادثات تلك الهوية فقط.",
          "مراسلة حساب معلّق أو محظور تُرفض ('هذا الحساب غير متاح حالياً').",
        ],
      },
      testScenarios: {
        en: [
          "Two devices, two accounts: send 5 messages quickly — all arrive in order on the other device.",
          "Double-tap 'Chat' on an ad — only one conversation is created.",
          "As Individual open a chat with a company; switch to your own Company persona — that chat isn't in the inbox.",
        ],
        ar: [
          "جهازان وحسابان: أرسل 5 رسائل بسرعة — تصل جميعها بالترتيب على الجهاز الآخر.",
          "اضغط 'محادثة' مرتين على إعلان — تُنشأ محادثة واحدة فقط.",
          "كفرد افتح محادثة مع شركة ثم بدّل إلى هوية شركتك — لا تظهر تلك المحادثة في صندوق الوارد.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-search",
      title: {
        en: "Search suggestions are live; recent-search history is mock-only",
        ar: "اقتراحات البحث حيّة فعلياً؛ أما سجل عمليات البحث الأخيرة فوهمي فقط",
      },
      priority: "P1",
      story: {
        en: "Verify (guests don't see recent searches at all) that Search's live suggestions (real searchService calls) work correctly while confirming the 'recent searches' list is currently a mock/local array — so the mock history doesn't get misreported as a persistence bug, and gets tracked instead as a known gap (no Zustand/AsyncStorage persistence yet).",
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
      updatedIn: "feat/docs-platform",
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
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-identity-switch",
      title: {
        en: "Switching persona is per device, with no data bleed",
        ar: "تبديل الهوية خاص بكل جهاز، دون تسرب للبيانات",
      },
      priority: "P0",
      endUserStory: {
        en: "As someone with both an individual and a company persona, I want each phone to stay on the persona I chose there, so that switching on my tablet doesn't change what my phone shows.",
        ar: "بصفتي أملك هوية فرد وهوية شركة، أريد أن يبقى كل جهاز على الهوية التي اخترتها عليه، حتى لا يغيّر التبديل على الجهاز اللوحي ما يعرضه هاتفي.",
      },
      story: {
        en: "Verify POST /auth/identity/switch changes the persona only on the current device (stored on that device's session), and that logging in again on the same device resumes that device's persona. A brand-new device opens with the account's last used persona. Every request follows the persona in the device's token, so listings, chats, favorites, wallet and invoices never mix between personas.",
        ar: "تحقق من أن POST /auth/identity/switch يغيّر الهوية على الجهاز الحالي فقط (تُحفظ في جلسة ذلك الجهاز)، وأن تسجيل الدخول مجدداً على نفس الجهاز يعيد هوية ذلك الجهاز. الجهاز الجديد يفتح بآخر هوية استُخدمت في الحساب. كل طلب يتبع الهوية الموجودة في رمز الجهاز، فلا تختلط الإعلانات والمحادثات والمفضلة والمحفظة والفواتير بين الهويات.",
      },
      acceptanceCriteria: {
        en: [
          "Switching on device A does not change the persona device B is using.",
          "Logging out and back in on device A reopens the persona device A last used.",
          "A device that has never signed in opens with the account's last used persona.",
          "After switching, the chat socket reconnects and the inbox shows only the new persona's conversations.",
          "Home, My Activity, Favorites, wallet and invoices all reflect only the active persona.",
        ],
        ar: [
          "التبديل على الجهاز A لا يغيّر الهوية التي يستخدمها الجهاز B.",
          "تسجيل الخروج ثم الدخول على الجهاز A يعيد آخر هوية استخدمها الجهاز A.",
          "الجهاز الذي لم يسجّل الدخول من قبل يفتح بآخر هوية مستخدمة في الحساب.",
          "بعد التبديل يُعاد اتصال مقبس المحادثة ويعرض صندوق الوارد محادثات الهوية الجديدة فقط.",
          "الرئيسية ونشاطي والمفضلة والمحفظة والفواتير تعكس الهوية النشطة فقط.",
        ],
      },
      testScenarios: {
        en: [
          "Two phones on one account: switch phone A to Company; phone B stays Individual after a pull-to-refresh.",
          "On phone A: switch to Company, log out, log in — lands on Company.",
          "Install on a third device and log in — opens with the persona most recently used.",
          "Favorite a property as Individual, switch to Company — the Favorites list doesn't show it.",
        ],
        ar: [
          "هاتفان على نفس الحساب: بدّل الهاتف A إلى الشركة؛ يبقى الهاتف B على الفرد بعد السحب للتحديث.",
          "على الهاتف A: بدّل إلى الشركة، سجّل الخروج ثم الدخول — يفتح على الشركة.",
          "ثبّت على جهاز ثالث وسجّل الدخول — يفتح بآخر هوية استُخدمت.",
          "فضّل عقاراً كفرد ثم بدّل إلى الشركة — لا يظهر في قائمة المفضلة.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-payments",
      title: {
        en: "Tap payments: plan packages and featuring an ad complete and reconcile",
        ar: "مدفوعات Tap: باقات الإعلانات وتمييز الإعلان تكتمل وتُسوّى بشكل صحيح",
      },
      priority: "P0",
      story: {
        en: "Verify both Tap flows: buying a plan package (POST /payments/charge with planSlug + adsCount) and featuring an ad (GET /payments/feature-packages → POST /payments/feature-charge). After Tap redirects back (/payments/redirect → buyootna://payment-callback) the app polls GET /payments/status/:invoiceId. The server only fulfils after re-fetching the charge from Tap, so a forged webhook can't mark an invoice paid. Credits go to the persona that paid.",
        ar: "تحقق من مساري Tap: شراء باقة إعلانات (POST /payments/charge مع planSlug و adsCount) وتمييز إعلان (GET /payments/feature-packages ثم POST /payments/feature-charge). بعد عودة Tap (/payments/redirect ← buyootna://payment-callback) يستعلم التطبيق GET /payments/status/:invoiceId. لا يُنفَّذ الطلب إلا بعد إعادة جلب العملية من Tap، فلا يمكن لإشعار مزوّر تعليم الفاتورة كمدفوعة. يُضاف الرصيد للهوية التي دفعت.",
      },
      acceptanceCriteria: {
        en: [
          "A successful payment marks the invoice PAID and adds the package's ads to the paying persona's wallet exactly once.",
          "A cancelled or failed payment leaves the invoice unpaid and shows the failure screen.",
          "Featuring an ad sets it featured until now + package days; buying again while featured extends from the current end date.",
          "A free (0 KWD) package is granted without opening Tap.",
        ],
        ar: [
          "الدفع الناجح يعلّم الفاتورة كمدفوعة ويضيف إعلانات الباقة لمحفظة الهوية الدافعة مرة واحدة فقط.",
          "الدفع الملغى أو الفاشل يترك الفاتورة غير مدفوعة ويعرض شاشة الفشل.",
          "تمييز الإعلان يجعله مميزاً حتى الآن + أيام الباقة؛ والشراء مجدداً أثناء التمييز يمدد من تاريخ الانتهاء الحالي.",
          "الباقة المجانية (0 د.ك) تُمنح دون فتح Tap.",
        ],
      },
      testScenarios: {
        en: [
          "Sandbox: buy the Silver 5-ads package — wallet shows +5 under Silver for the buying persona.",
          "Cancel on the Tap page — failure screen, invoice still PENDING.",
          "Feature an ad for the shortest package, then again — featured-until moves forward, not reset.",
          "Replay a webhook body for an unpaid invoice with status CAPTURED — the invoice stays unpaid.",
        ],
        ar: [
          "في وضع الاختبار: اشترِ باقة الفضية 5 إعلانات — تظهر +5 تحت الفضية في محفظة الهوية المشترية.",
          "ألغِ في صفحة Tap — تظهر شاشة الفشل وتبقى الفاتورة PENDING.",
          "ميّز إعلاناً بأقصر باقة ثم مرة أخرى — يتقدم تاريخ انتهاء التمييز ولا يُعاد ضبطه.",
          "أعد إرسال محتوى إشعار لفاتورة غير مدفوعة بحالة CAPTURED — تبقى الفاتورة غير مدفوعة.",
        ],
      },
      updatedIn: "feat/docs-platform",
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
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-demo-account",
      title: {
        en: "App Store demo account works and matches the credentials given to Apple",
        ar: "حساب العرض لمتجر التطبيقات يعمل ويطابق البيانات المقدمة لـ Apple",
      },
      priority: "P0",
      story: {
        en: "Verify the reviewer account App Review signs in with has real-looking data (ads, a draft, favorites, chats, a plan). Note a mismatch to resolve first: the seed (apps/api/prisma/seeds/seed.ts) creates reviewer@buyootna.com (plus office.reviewer@buyootna.com), while docs/plans/08-demo-account.md lists demo@buyootna.cloud — confirm which account is entered in App Store Connect and that it exists on production.",
        ar: "تحقق من أن حساب المراجع الذي يدخل به فريق مراجعة Apple يحتوي بيانات واقعية (إعلانات، مسودة، مفضلة، محادثات، باقة). لاحظ تعارضاً يجب حله أولاً: البذرة (apps/api/prisma/seeds/seed.ts) تنشئ reviewer@buyootna.com (إضافة إلى office.reviewer@buyootna.com)، بينما يذكر docs/plans/08-demo-account.md الحساب demo@buyootna.cloud — تأكد أي حساب مُدخل في App Store Connect وأنه موجود في الإنتاج.",
      },
      acceptanceCriteria: {
        en: [
          "The account listed in App Store Connect signs in on a production build without an OTP step.",
          "Home, My Activity, Favorites, Chats and the wallet all show seeded content, not empty states.",
          "The seeded draft opens in the edit form, and the seeded chat has readable messages.",
        ],
        ar: [
          "الحساب المذكور في App Store Connect يسجّل الدخول في نسخة الإنتاج دون خطوة رمز تحقق.",
          "الرئيسية ونشاطي والمفضلة والمحادثات والمحفظة تعرض محتوى مبذوراً وليس حالات فارغة.",
          "المسودة المبذورة تفتح في نموذج التعديل، والمحادثة المبذورة تحتوي رسائل مقروءة.",
        ],
      },
      testScenarios: {
        en: [
          "Sign in on a TestFlight build with the App Store Connect reviewer credentials and walk each tab.",
        ],
        ar: [
          "سجّل الدخول في نسخة TestFlight ببيانات المراجع في App Store Connect وتنقّل في كل تبويب.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-persona-ownership",
      title: {
        en: "Credits, the free ad, invoices, favorites and chats belong to one persona",
        ar: "الرصيد والإعلان المجاني والفواتير والمفضلة والمحادثات تخص هوية واحدة",
      },
      priority: "P0",
      endUserStory: {
        en: "As a company owner who also posts as an individual, I want my company's purchased credits kept separate from my personal ads, so that each side of my account is billed and tracked on its own.",
        ar: "بصفتي صاحب شركة أنشر أيضاً كفرد، أريد أن تبقى أرصدة شركتي منفصلة عن إعلاناتي الشخصية، حتى تُحاسب وتُتابع كل جهة على حدة.",
      },
      story: {
        en: "Verify per-persona ownership end to end: GET /plans/wallet and /plans/wallet/publish-options list only the active persona's credits and its own free ad; a purchase credits the persona that bought it; GET /invoices lists that persona's invoices; favorites and chat inboxes are per persona. Each persona has its own welcome free ad (existing accounts: the first persona kept what the account had left).",
        ar: "تحقق من ملكية الهوية من البداية للنهاية: GET /plans/wallet و /plans/wallet/publish-options يعرضان رصيد الهوية النشطة وإعلانها المجاني فقط؛ الشراء يُضاف للهوية التي اشترت؛ GET /invoices يعرض فواتير تلك الهوية؛ المفضلة وصناديق المحادثات لكل هوية على حدة. لكل هوية إعلان ترحيبي مجاني خاص بها (في الحسابات القديمة احتفظت الهوية الأولى بما تبقى للحساب).",
      },
      acceptanceCriteria: {
        en: [
          "A persona can't publish with another persona's credit: choosing it returns 'الباقة المحددة غير صالحة أو غير متبقي فيها إعلانات.'",
          "Publishing without choosing a credit uses the persona's own free ad first; the other persona's free ad is untouched.",
          "The free-ad count shown in My Activity and on Property Detail is the active persona's.",
          "Invoices, favorites and chats listed after switching belong only to the new persona.",
        ],
        ar: [
          "لا يمكن للهوية النشر برصيد هوية أخرى: اختياره يعيد 'الباقة المحددة غير صالحة أو غير متبقي فيها إعلانات.'",
          "النشر دون اختيار رصيد يستخدم الإعلان المجاني للهوية أولاً؛ ولا يتأثر الإعلان المجاني للهوية الأخرى.",
          "عدد الإعلانات المجانية المعروض في نشاطي وتفاصيل العقار هو عدد الهوية النشطة.",
          "الفواتير والمفضلة والمحادثات بعد التبديل تخص الهوية الجديدة فقط.",
        ],
      },
      testScenarios: {
        en: [
          "Buy a package as Company; switch to Individual — the wallet doesn't show it.",
          "As Individual, publish with no credit chosen — Individual's free ad goes 1 → 0; Company's stays 1.",
          "Check GET /users/me user.freeAdsRemaining as each persona — values differ accordingly.",
        ],
        ar: [
          "اشترِ باقة كشركة ثم بدّل إلى الفرد — لا تظهر في المحفظة.",
          "كفرد، انشر دون اختيار رصيد — ينخفض الإعلان المجاني للفرد من 1 إلى 0 ويبقى للشركة 1.",
          "افحص user.freeAdsRemaining في GET /users/me لكل هوية — القيم تختلف تبعاً لذلك.",
        ],
      },
      updatedIn: "feat/docs-platform",
    },
    {
      id: "mobile-map-location-filter",
      title: {
        en: "Map: choose several governorates and areas",
        ar: "الخريطة: اختيار عدة محافظات ومناطق",
      },
      priority: "P1",
      story: {
        en: "Verify the map's governorate and area pickers allow several choices (checkboxes and chips; the drawer stays open while picking). GET /map/discover receives governorateIds/areaIds; chosen areas narrow the pins further than their governorates; company pins match companies based in or serving any chosen place. The area list shows the areas of every chosen governorate, and removing a governorate drops its areas. The button reads 'حولي' for one choice and 'حولي +2' for three.",
        ar: "تحقق من أن منتقيي المحافظة والمنطقة في الخريطة يسمحان بعدة اختيارات (مربعات اختيار وشرائح؛ وتبقى النافذة مفتوحة أثناء الاختيار). يستقبل GET /map/discover المعاملين governorateIds/areaIds؛ والمناطق المختارة تضيّق الدبابيس أكثر من محافظاتها؛ ودبابيس الشركات تطابق الشركات الموجودة أو التي تخدم أي مكان مختار. قائمة المناطق تعرض مناطق كل محافظة مختارة، وإزالة محافظة تزيل مناطقها. يعرض الزر 'حولي' لاختيار واحد و'حولي +2' لثلاثة.",
      },
      acceptanceCriteria: {
        en: [
          "Two governorates show the pins of both; one area inside them shows only that area's pins.",
          "Removing a governorate removes its selected areas.",
          "Older app builds sending one governorateId/areaId still get filtered pins.",
        ],
        ar: [
          "اختيار محافظتين يعرض دبابيس كلتيهما؛ واختيار منطقة داخلهما يعرض دبابيس تلك المنطقة فقط.",
          "إزالة محافظة تزيل مناطقها المختارة.",
          "نسخ التطبيق القديمة التي ترسل governorateId/areaId واحداً ما زالت تحصل على دبابيس مصفّاة.",
        ],
      },
      testScenarios: {
        en: [
          "Pick العاصمة and الفروانية, then one area in each — pin counts drop accordingly.",
          "Clear filters — all pins return.",
        ],
        ar: [
          "اختر العاصمة والفروانية ثم منطقة في كل منهما — ينخفض عدد الدبابيس تبعاً لذلك.",
          "امسح الفلاتر — تعود كل الدبابيس.",
        ],
      },
      updatedIn: "fix/map-multi-location, fix/android-label-wrap, fix/review-findings",
    },
    {
      id: "mobile-android-input-labels",
      title: {
        en: "Input labels stay on one line on Android",
        ar: "عناوين الحقول تبقى على سطر واحد في Android",
      },
      priority: "P2",
      story: {
        en: "Regression check: required input labels (FormInput, the invoice FieldLabel) render the text and its red * as one Text with no letter-spacing — as separate Texts with negative letter-spacing, Android wrapped Arabic labels onto two lines ('كلمة المرور / الحالية'). The change-password title shows in full.",
        ar: "فحص تراجع: عناوين الحقول الإلزامية (FormInput و FieldLabel في الفواتير) تعرض النص والنجمة الحمراء في Text واحد دون تباعد أحرف — عندما كانا منفصلين مع تباعد سالب كان Android يقسم العناوين العربية على سطرين ('كلمة المرور / الحالية'). ويظهر عنوان تغيير كلمة المرور كاملاً.",
      },
      acceptanceCriteria: {
        en: [
          "On an Android phone, every required label in change password, login, signup and edit profile is on one line with its *.",
          "The change-password header reads 'تغيير كلمة المرور' in full.",
        ],
        ar: [
          "على هاتف Android كل عنوان إلزامي في تغيير كلمة المرور والدخول والتسجيل وتعديل الملف على سطر واحد مع النجمة.",
          "عنوان تغيير كلمة المرور يظهر 'تغيير كلمة المرور' كاملاً.",
        ],
      },
      testScenarios: {
        en: [
          "Android: open More → change password, then signup — check each label.",
        ],
        ar: [
          "Android: افتح المزيد ← تغيير كلمة المرور ثم التسجيل — افحص كل عنوان.",
        ],
      },
      updatedIn: "fix/map-multi-location, fix/android-label-wrap, fix/review-findings",
    },
  ],
};
