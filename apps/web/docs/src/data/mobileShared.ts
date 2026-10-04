import { DocSection } from "./types";

export const mobileShared: DocSection = {
  slug: "mobile-shared",
  title: { en: "Mobile — Shared", ar: "الجوال — مشترك" },
  summary: {
    en: "Cross-role mobile features (apps/mobile) that apply regardless of which persona is active — guest gating, chat, search, listings, persona switching, per-persona ownership, payments, layout, and the App Store demo account. Company and office accounts are live in every build (see mobile-company-office-gate).",
    ar: "ميزات التطبيق (apps/mobile) المشتركة بين جميع الأدوار بغض النظر عن الهوية النشطة — تقييد الزوار، المحادثات، البحث، الإعلانات، تبديل الهويات، ملكية البيانات لكل هوية، المدفوعات، التخطيط، وحساب العرض التجريبي لمتجر التطبيقات. حسابات الشركات والمكاتب مفعّلة في كل النسخ (راجع mobile-company-office-gate).",
  },
  stories: [
    {
      id: "mobile-company-office-gate",
      title: {
        en: "Company and office accounts are live in every build",
        ar: "حسابات الشركات والمكاتب مفعّلة في كل النسخ",
      },
      priority: "P0",
      story: {
        en: "Company and office accounts are switched on for everyone: eas.json sets EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS and EXPO_PUBLIC_ENABLE_OFFICE_ACCOUNTS to 'true' in both the production and preview profiles, and scripts/release-ota.js builds each OTA with its channel's profile values. The account-type picker, 'change account type' sheet and 'add identity' offer company and office; the (company) and (office) tabs open instead of ComingSoonGate. The flags remain a kill switch: removing them from the production profile (and publishing an OTA) puts ComingSoonGate back for company; office needs its flag set to 'false'.",
        ar: "حسابات الشركات والمكاتب مفعّلة للجميع: يضبط eas.json المفتاحين EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS و EXPO_PUBLIC_ENABLE_OFFICE_ACCOUNTS على 'true' في ملفي الإنتاج و preview، ويبني scripts/release-ota.js كل تحديث OTA بقيم ملف قناته. شاشة اختيار نوع الحساب ونافذة 'تغيير نوع الحساب' و'إضافة هوية' تعرض الشركة والمكتب؛ وتبويبات (company) و (office) تفتح بدلاً من ComingSoonGate. يبقى المفتاحان وسيلة إيقاف: إزالتهما من ملف الإنتاج (ونشر OTA) يعيد ComingSoonGate للشركة؛ أما المكتب فيحتاج ضبط مفتاحه على 'false'.",
      },
      acceptanceCriteria: {
        en: [
          "A production build (with the latest OTA) offers company and office at signup and in 'add identity'.",
          "Opening a company or office persona shows its tabs, not 'coming soon'.",
          "The OTA checklist shows both flags coming from build.production.env, not from a local .env.",
        ],
        ar: [
          "نسخة الإنتاج (مع آخر OTA) تعرض الشركة والمكتب عند التسجيل وفي 'إضافة هوية'.",
          "فتح هوية شركة أو مكتب يعرض تبويباتها وليس 'قريباً'.",
          "قائمة تحقق OTA تُظهر أن المفتاحين من build.production.env وليس من ملف .env محلي.",
        ],
      },
      testScenarios: {
        en: [
          "On a store build after the OTA: sign up as a company; switch to it — company tabs open.",
          "Switch to an office persona — office tabs open.",
        ],
        ar: [
          "على نسخة المتجر بعد OTA: سجّل كشركة ثم بدّل إليها — تفتح تبويبات الشركة.",
          "بدّل إلى هوية مكتب — تفتح تبويبات المكتب.",
        ],
      },
      updatedIn: "chore/enable-business-accounts",
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
          "The ad banner at the top shows only when the chat was opened from that ad; opening the same chat from an office/company list or profile clears it for both sides, and opening it from an ad again brings that ad back.",
        ],
        ar: [
          "الرسالة المرسلة تظهر للمستلم دون تحديث وتبقى بعد إعادة فتح المحادثة.",
          "لا يمكن لهويتين في نفس الحساب مراسلة بعضهما ('لا يمكنك بدء محادثة مع نفسك').",
          "صندوق الوارد بعد تبديل الهوية يعرض محادثات تلك الهوية فقط.",
          "مراسلة حساب معلّق أو محظور تُرفض ('هذا الحساب غير متاح حالياً').",
          "شريط الإعلان أعلى المحادثة يظهر فقط عند فتحها من ذلك الإعلان؛ وفتح نفس المحادثة من قائمة المكاتب/الشركات أو الملف الشخصي يزيله للطرفين، وفتحها من إعلان مرة أخرى يعيده.",
        ],
      },
      testScenarios: {
        en: [
          "Two devices, two accounts: send 5 messages quickly — all arrive in order on the other device.",
          "Double-tap 'Chat' on an ad — only one conversation is created.",
          "As Individual open a chat with a company; switch to your own Company persona — that chat isn't in the inbox.",
          "Chat with an office from one of its ads (banner shows the ad), go back, then open the chat from Home → مكاتب عقارية — no banner; the office sees no banner either.",
        ],
        ar: [
          "جهازان وحسابان: أرسل 5 رسائل بسرعة — تصل جميعها بالترتيب على الجهاز الآخر.",
          "اضغط 'محادثة' مرتين على إعلان — تُنشأ محادثة واحدة فقط.",
          "كفرد افتح محادثة مع شركة ثم بدّل إلى هوية شركتك — لا تظهر تلك المحادثة في صندوق الوارد.",
          "راسل مكتباً من أحد إعلاناته (يظهر الشريط بالإعلان)، ثم ارجع وافتح المحادثة من الرئيسية ← مكاتب عقارية — لا يظهر الشريط؛ ولا يظهر للمكتب أيضاً.",
        ],
      },
      updatedIn: "fix/chat-clear-property",
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
          "On a Sell ad, turning on 'مدخول العقار' and entering an amount saves it; the card then shows 'مدخول العقار {amount} د.ك', and editing the ad shows the saved income.",
        ],
        ar: [
          "الحقول المُدخلة في SharedPropertyInfo تبقى محفوظة بشكل صحيح عند التبديل بين تبويبات بيع/إيجار/بدل قبل الإرسال.",
          "شاشة المعاينة تعكس بدقة كل حقل تم إدخاله، بما في ذلك الصور، قبل الإرسال النهائي.",
          "التحقق من الحقول المطلوبة يمنع الإرسال مع رسائل خطأ واضحة داخل الشاشة، لا فشلاً صامتاً.",
          "الإعلانات المُنشأة بنجاح تظهر فوراً في إعلانات المستخدم الخاصة ('إعلاناتي') وفي واجهات البحث ذات الصلة.",
          "في إعلان البيع، تفعيل 'مدخول العقار' وإدخال مبلغ يحفظه؛ ثم تعرض البطاقة 'مدخول العقار {المبلغ} د.ك'، ويظهر المدخول المحفوظ عند تعديل الإعلان.",
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
      updatedIn: "fix/property-income",
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
    {
      id: "mobile-add-identity",
      title: {
        en: "Add identity offers only the persona types the account doesn't have yet",
        ar: "إضافة هوية تعرض فقط أنواع الهويات غير الموجودة في الحساب",
      },
      priority: "P1",
      story: {
        en: "Verify More → switch identity → 'إضافة هوية جديدة' lists individual, company and office (company and office are live in every build — see mobile-company-office-gate), marks each type the account already has as 'موجود' and doesn't open it, and opens the onboarding screen for the others. One of each type per account, as the API enforces (see api-persona-rules).",
        ar: "تحقق من أن المزيد ← تبديل الهوية ← 'إضافة هوية جديدة' تعرض الفرد والشركة والمكتب (الشركة والمكتب مفعّلان في كل النسخ — راجع mobile-company-office-gate)، وتعلّم كل نوع موجود في الحساب بـ'موجود' ولا تفتحه، وتفتح شاشة الإضافة للبقية. هوية واحدة من كل نوع لكل حساب كما تفرض الواجهة البرمجية (راجع api-persona-rules).",
      },
      acceptanceCriteria: {
        en: [
          "With only an individual persona: individual shows 'موجود'; company and office open their forms.",
          "After adding a company, reopening the screen shows company as 'موجود' too.",
          "A store build lists all three types.",
        ],
        ar: [
          "مع هوية فرد فقط: الفرد يعرض 'موجود'؛ والشركة والمكتب يفتحان نموذجيهما.",
          "بعد إضافة شركة، إعادة فتح الشاشة تعرض الشركة 'موجود' أيضاً.",
          "نسخة المتجر تعرض الأنواع الثلاثة.",
        ],
      },
      testScenarios: {
        en: [
          "With the flag on, add a company, go back to 'إضافة هوية جديدة' — company is 'موجود', office still available.",
        ],
        ar: [
          "مع تفعيل المفتاح أضف شركة ثم ارجع إلى 'إضافة هوية جديدة' — الشركة 'موجود' والمكتب ما زال متاحاً.",
        ],
      },
      updatedIn: "fix/add-identity-business",
    },
    {
      id: "mobile-location-picker",
      title: {
        en: "Location picker: tap to place, address details, recent and saved places, Kuwait area search",
        ar: "منتقي الموقع: الضغط للتحديد وتفاصيل العنوان والأماكن الأخيرة والمحفوظة والبحث بمناطق الكويت",
      },
      priority: "P1",
      endUserStory: {
        en: "As someone adding an ad or asking for a quote, I want to place my location precisely and quickly, with the block, street and house, so that the other side finds the place.",
        ar: "بصفتي أضيف إعلاناً أو أطلب عرض سعر، أريد تحديد موقعي بدقة وسرعة مع القطعة والشارع والمنزل، حتى يجد الطرف الآخر المكان.",
      },
      story: {
        en: "Verify the map picker (add listing, quote request screen and popup, company sign-up): the search bar and buttons sit below the notch; tapping anywhere on the map moves the pin there; '+ إضافة تفاصيل العنوان' opens العنوان (editable), القطعة, الشارع, الجادة, المنزل / المبنى and علامة مميزة — the map pre-fills what it knows (block, street, house) and never overwrites a field the user typed; the summary ('قطعة 6، شارع …، منزل 12') shows under the address. With the search box focused and empty, المحفوظة (المنزل / العمل / named places, from the account) and الأخيرة (the last 5 confirmed, on the device) appear; tapping one jumps there with its details; long-press deletes a saved one. Typing an area matches our list of Kuwait areas (spelling variants such as ة/ه and أ/ا included) in an 'المناطق' group above the map results; 'السالمية قطعة 5' centres on Salmiya and fills القطعة = 5. 'حفظ الموقع' saves the spot as المنزل, العمل or a custom name (signed-in users). The details are saved on ads and quote requests and shown on the ad and on the company's request view.",
        ar: "تحقق من منتقي الموقع (إضافة إعلان، شاشة ونافذة طلب السعر، تسجيل الشركة): شريط البحث والأزرار تحت النوتش؛ الضغط في أي مكان على الخريطة ينقل الدبوس إليه؛ '+ إضافة تفاصيل العنوان' تفتح العنوان (قابل للتعديل) والقطعة والشارع والجادة والمنزل / المبنى وعلامة مميزة — تملأ الخريطة ما تعرفه (القطعة والشارع والمنزل) ولا تستبدل أبداً حقلاً كتبه المستخدم؛ ويظهر الملخص ('قطعة 6، شارع …، منزل 12') تحت العنوان. عند التركيز على البحث وهو فارغ تظهر المحفوظة (المنزل / العمل / أماكن مسماة، من الحساب) والأخيرة (آخر 5 مؤكدة، على الجهاز)؛ الضغط على أحدها ينتقل إليه مع تفاصيله؛ والضغط المطوّل يحذف المحفوظ. كتابة منطقة تطابق قائمتنا لمناطق الكويت (مع اختلافات الكتابة مثل ة/ه وأ/ا) في مجموعة 'المناطق' فوق نتائج الخريطة؛ و'السالمية قطعة 5' تتمركز على السالمية وتملأ القطعة = 5. 'حفظ الموقع' يحفظ المكان كالمنزل أو العمل أو باسم مخصص (للمسجلين). تُحفظ التفاصيل في الإعلانات وطلبات السعر وتظهر في الإعلان وفي عرض الطلب لدى الشركة.",
      },
      acceptanceCriteria: {
        en: [
          "Nothing overlaps the notch or the home indicator on any iPhone.",
          "A tap moves the pin; dragging still works.",
          "Typed details survive moving the map; the map only fills empty fields.",
          "The ad details show the address line under the location; the company sees it with the request's location.",
          "Recent places persist after closing the app; saved places follow the account to another device.",
          "Area search finds 'الاحمدي' for 'الأحمدي' and fills the block from 'قطعة N'.",
          "Guests see recent places but no 'حفظ الموقع'.",
        ],
        ar: [
          "لا يتداخل شيء مع النوتش أو مؤشر الشاشة الرئيسية على أي آيفون.",
          "الضغط ينقل الدبوس؛ والسحب ما زال يعمل.",
          "التفاصيل المكتوبة تبقى عند تحريك الخريطة؛ والخريطة تملأ الحقول الفارغة فقط.",
          "تفاصيل الإعلان تعرض سطر العنوان تحت الموقع؛ والشركة تراه مع موقع الطلب.",
          "الأماكن الأخيرة تبقى بعد إغلاق التطبيق؛ والمحفوظة تنتقل مع الحساب لجهاز آخر.",
          "البحث بالمناطق يجد 'الاحمدي' عند كتابة 'الأحمدي' ويملأ القطعة من 'قطعة N'.",
          "الزوار يرون الأماكن الأخيرة دون 'حفظ الموقع'.",
        ],
      },
      testScenarios: {
        en: [
          "Add an ad: open the map, tap a street, add الجادة and المنزل, confirm, publish; open the ad — the address line shows.",
          "Send a quote request with details; as the company open it — the details are next to the location.",
          "Save a place as المنزل, sign in on another phone, open the picker and focus search — المنزل is listed.",
          "Search 'السالميه قطعة 5' and pick the area — the map centres there and القطعة shows 5.",
        ],
        ar: [
          "أضف إعلاناً: افتح الخريطة واضغط على شارع وأضف الجادة والمنزل وأكّد وانشر؛ افتح الإعلان — يظهر سطر العنوان.",
          "أرسل طلب سعر مع التفاصيل؛ وكشركة افتحه — تظهر التفاصيل بجانب الموقع.",
          "احفظ مكاناً كالمنزل، وسجّل الدخول من هاتف آخر، وافتح المنتقي وركّز على البحث — يظهر المنزل.",
          "ابحث 'السالميه قطعة 5' واختر المنطقة — تتمركز الخريطة هناك وتظهر القطعة 5.",
        ],
      },
      updatedIn: "feat/map-picker",
    },
    {
      id: "mobile-android-text-cutoff",
      title: {
        en: "Android: button and label text is never cut off",
        ar: "أندرويد: نصوص الأزرار والعناوين لا تُقص أبداً",
      },
      priority: "P1",
      story: {
        en: "Regression check for a fixed bug: on Android, short labels in the Cairo font lost their last word — 'تسجيل الخروج' showed as 'تسجيل' in the logout sheet, and the same happened in other buttons. Android's default line breaking mis-measured the font and pushed the last word onto a hidden second line. A patch to React Native's Text (patches/react-native@0.81.5.patch) makes Android use the 'simple' strategy by default; iOS is unchanged.",
        ar: "فحص تراجع لخطأ تم إصلاحه: على أندرويد كانت العناوين القصيرة بخط Cairo تفقد كلمتها الأخيرة — 'تسجيل الخروج' تظهر 'تسجيل' في نافذة تسجيل الخروج، ويحدث نفس الشيء في أزرار أخرى. كان تقسيم الأسطر الافتراضي في أندرويد يخطئ في قياس الخط فيدفع الكلمة الأخيرة إلى سطر ثانٍ مخفي. تعديل على مكوّن Text في React Native (patches/react-native@0.81.5.patch) يجعل أندرويد يستخدم الطريقة 'simple' افتراضياً؛ ولا يتغير شيء على iOS.",
      },
      acceptanceCriteria: {
        en: [
          "On Android, the logout sheet's red button reads 'تسجيل الخروج' in full.",
          "No button or label anywhere in the app shows a cut word or a hidden second line.",
          "iOS looks exactly as before.",
        ],
        ar: [
          "على أندرويد يظهر زر نافذة تسجيل الخروج الأحمر 'تسجيل الخروج' كاملاً.",
          "لا يظهر في أي مكان بالتطبيق زر أو عنوان بكلمة مقصوصة أو سطر ثانٍ مخفي.",
          "يبقى iOS كما هو تماماً.",
        ],
      },
      testScenarios: {
        en: [
          "On an Android phone open المزيد → تسجيل الخروج — both buttons show their full text.",
          "Walk the main flows on Android (add ad, filters, sheets, settings) and look for cut labels.",
        ],
        ar: [
          "على هاتف أندرويد افتح المزيد ← تسجيل الخروج — يظهر نص الزرين كاملاً.",
          "تصفّح المسارات الرئيسية على أندرويد (إضافة إعلان، الفلاتر، النوافذ، الإعدادات) وابحث عن عناوين مقصوصة.",
        ],
      },
      updatedIn: "feat/map-picker",
    },
    {
      id: "mobile-android-keyboard-sheets",
      title: {
        en: "Android: the keyboard never covers a bottom sheet's text box",
        ar: "أندرويد: الكيبورد لا يغطي خانة الكتابة في النوافذ السفلية",
      },
      priority: "P1",
      story: {
        en: "Regression check for a fixed bug: on Android, typing in a bottom sheet (e.g. the delete-ad reason 'ما سبب حذف الاعلان؟') opened the keyboard on top of the sheet, hiding the text box and the buttons. The app draws edge-to-edge, so Android never shrinks the window for the keyboard, and the sheets were set to wait for that resize. They now lift themselves above the keyboard. Covers: delete ad, deactivate account, change-password OTP, filters, add review, report, and quote request.",
        ar: "فحص تراجع لخطأ تم إصلاحه: على أندرويد كان الكيبورد يفتح فوق النافذة السفلية عند الكتابة (مثل سبب حذف الإعلان 'ما سبب حذف الاعلان؟') فيخفي خانة الكتابة والأزرار. التطبيق يعرض الشاشة كاملة حتى الحواف، فلا يصغّر أندرويد النافذة عند ظهور الكيبورد، وكانت النوافذ تنتظر هذا التصغير. الآن ترتفع النوافذ بنفسها فوق الكيبورد. يشمل: حذف الإعلان، تعطيل الحساب، رمز تغيير كلمة المرور، الفلاتر، إضافة تقييم، الإبلاغ، وطلب عرض السعر.",
      },
      acceptanceCriteria: {
        en: [
          "On Android, tapping the text box in any of these sheets lifts the sheet so the box and its buttons stay above the keyboard.",
          "Closing the keyboard returns the sheet to its normal height.",
          "iOS behaves exactly as before.",
        ],
        ar: [
          "على أندرويد، الضغط على خانة الكتابة في أي من هذه النوافذ يرفع النافذة فتبقى الخانة وأزرارها فوق الكيبورد.",
          "إغلاق الكيبورد يعيد النافذة إلى ارتفاعها الطبيعي.",
          "يبقى iOS كما هو تماماً.",
        ],
      },
      testScenarios: {
        en: [
          "On an Android phone: إعلاناتي → delete an ad → choose 'سبب اخر' and type — the text box and the delete button stay visible.",
          "Repeat in deactivate account, change password (OTP), add review, report and quote request.",
        ],
        ar: [
          "على هاتف أندرويد: إعلاناتي ← حذف إعلان ← اختر 'سبب اخر' واكتب — تبقى خانة الكتابة وزر الحذف ظاهرين.",
          "كرر ذلك في تعطيل الحساب، تغيير كلمة المرور (الرمز)، إضافة تقييم، الإبلاغ، وطلب عرض السعر.",
        ],
      },
      updatedIn: "feat/map-picker",
    },
    {
      id: "mobile-publish-with-package",
      title: {
        en: "Publishing from a bought package spends exactly one ad",
        ar: "النشر من باقة مشتراة يخصم إعلاناً واحداً فقط",
      },
      priority: "P0",
      story: {
        en: "Regression check for a fixed bug: a user with an active package could be blocked with 'الباقة المحددة غير صالحة أو غير متبقي فيها إعلانات'. The app used to re-send the publish request on its own when the connection dropped, so the server could publish the ad and then reject the repeat (or publish it twice). Now the app never re-sends a publish by itself, every publish attempt carries one key the server uses to recognise a repeat, a double tap sends one request, and if the server refuses the picked package the app offers the packages still available.",
        ar: "فحص تراجع لخطأ تم إصلاحه: مستخدم لديه باقة نشطة قد يُمنع برسالة 'الباقة المحددة غير صالحة أو غير متبقي فيها إعلانات'. كان التطبيق يعيد إرسال طلب النشر تلقائياً عند انقطاع الاتصال، فينشر الخادم الإعلان ثم يرفض التكرار (أو ينشره مرتين). الآن لا يعيد التطبيق إرسال النشر من تلقاء نفسه، وكل محاولة نشر تحمل مفتاحاً واحداً يتعرّف به الخادم على التكرار، والضغط المزدوج يرسل طلباً واحداً، وإذا رفض الخادم الباقة المختارة يعرض التطبيق الباقات المتبقية.",
      },
      acceptanceCriteria: {
        en: [
          "With an active package, publishing a new ad succeeds and رصيد الحساب drops by exactly one ad.",
          "Tapping نشر twice quickly creates one ad and spends one ad.",
          "If the connection drops during publish and the user taps نشر again, the result is still one ad and one deduction.",
          "If the picked package can't be used, the alert explains why (used up, or it belongs to the other persona) and offers 'اختيار باقة أخرى'; with nothing left the out-of-balance sheet appears.",
          "Saving a draft never spends a package.",
        ],
        ar: [
          "مع وجود باقة نشطة، ينجح نشر إعلان جديد وينقص رصيد الحساب بإعلان واحد بالضبط.",
          "الضغط على نشر مرتين بسرعة ينشئ إعلاناً واحداً ويخصم إعلاناً واحداً.",
          "إذا انقطع الاتصال أثناء النشر وضغط المستخدم نشر مرة أخرى، تبقى النتيجة إعلاناً واحداً وخصماً واحداً.",
          "إذا تعذر استخدام الباقة المختارة، يوضح التنبيه السبب (نفدت، أو تابعة للحساب الآخر) ويعرض 'اختيار باقة أخرى'؛ وإن لم يتبقَّ شيء تظهر نافذة نفاد الرصيد.",
          "حفظ المسودة لا يخصم من أي باقة أبداً.",
        ],
      },
      testScenarios: {
        en: [
          "Note رصيد الحساب, add an ad, publish from the package — the ad opens and the balance is one less.",
          "Publish with a package that has 1 ad left — it succeeds, and the package then shows as used up.",
          "Tap نشر, switch on airplane mode straight away, switch it off and tap نشر again — check إعلاناتي shows one ad and the balance dropped by one.",
          "On a company persona's package, switch to the individual persona and try to publish — the message says the package belongs to the other account.",
        ],
        ar: [
          "سجّل رصيد الحساب، أضف إعلاناً، انشره من الباقة — يفتح الإعلان وينقص الرصيد بواحد.",
          "انشر من باقة متبقٍ فيها إعلان واحد — ينجح النشر ثم تظهر الباقة منتهية.",
          "اضغط نشر ثم فعّل وضع الطيران فوراً، ألغِه واضغط نشر مجدداً — تأكد أن إعلاناتي تعرض إعلاناً واحداً وأن الرصيد نقص بواحد.",
          "بباقة تابعة لهوية الشركة، بدّل إلى هوية الفرد وحاول النشر — توضح الرسالة أن الباقة تابعة للحساب الآخر.",
        ],
      },
      updatedIn: "feat/map-picker",
    },
    {
      id: "mobile-ad-map-preview-cached",
      title: {
        en: "The ad's map preview shows straight away on every visit",
        ar: "معاينة الخريطة في الإعلان تظهر فوراً في كل زيارة",
      },
      priority: "P2",
      story: {
        en: "The 'الموقع على الخريطة' card on تفاصيل الإعلان used a live map that loaded its tiles again each time an ad was opened. It is now a static map image of the same area, kept in the app's memory and disk cache, so it appears immediately when the ad is opened again. Tapping the card still opens the phone's maps app at the ad's location.",
        ar: "كانت بطاقة 'الموقع على الخريطة' في تفاصيل الإعلان خريطة حية تعيد تحميل أجزائها في كل مرة يُفتح فيها الإعلان. أصبحت الآن صورة خريطة ثابتة لنفس المنطقة، محفوظة في ذاكرة التطبيق وعلى الجهاز، فتظهر فوراً عند فتح الإعلان مرة أخرى. والضغط على البطاقة ما زال يفتح تطبيق الخرائط في الهاتف على موقع الإعلان.",
      },
      acceptanceCriteria: {
        en: [
          "Opening an ad shows the map of its area with a pin under the 'الموقع على الخريطة' pill.",
          "Opening the same ad again shows the map instantly, without it loading.",
          "Tapping the card opens Apple Maps / Google Maps at the ad's location.",
          "An ad without a location, or no connection on the first visit, shows the generic map picture instead of an empty box.",
        ],
        ar: [
          "فتح الإعلان يعرض خريطة منطقته مع دبوس تحت شارة 'الموقع على الخريطة'.",
          "فتح نفس الإعلان مرة أخرى يعرض الخريطة فوراً دون تحميل.",
          "الضغط على البطاقة يفتح خرائط Apple / Google على موقع الإعلان.",
          "الإعلان بدون موقع، أو عدم وجود اتصال في أول زيارة، يعرض صورة الخريطة العامة بدلاً من مربع فارغ.",
        ],
      },
      testScenarios: {
        en: [
          "Open an ad, go back, open it again — the map is there at once the second time.",
          "Turn on airplane mode and reopen an ad you viewed before — its map still shows.",
          "Tap the map card — the maps app opens at the ad.",
        ],
        ar: [
          "افتح إعلاناً، ارجع، ثم افتحه مجدداً — تظهر الخريطة فوراً في المرة الثانية.",
          "فعّل وضع الطيران وأعد فتح إعلان شاهدته من قبل — تظهر خريطته.",
          "اضغط على بطاقة الخريطة — يفتح تطبيق الخرائط على الإعلان.",
        ],
      },
      updatedIn: "fix/individual-bugs",
    },
    {
      id: "mobile-session-cleared-on-reinstall",
      title: {
        en: "Deleting and reinstalling the app boots logged out (no Keychain session resurrection)",
        ar: "حذف التطبيق وإعادة تثبيته يفتح التطبيق مسجّل الخروج (لا تُستعاد الجلسة من Keychain)",
      },
      priority: "P0",
      story: {
        en: "QA bug fix: the auth token and session id are stored in expo-secure-store (the iOS Keychain), whose items survive app deletion — so after delete + reinstall the app silently restored the old session. On every cold boot loadPersistedAuth checks an install sentinel in AsyncStorage (which IS wiped on uninstall): a missing sentinel means a fresh install, so any leftover Keychain session is deleted and the app boots logged out (onboarding/login); the sentinel is then written. Existing installs with the sentinel keep restoring their session as before. Failure mode is fail-secure: if sentinel handling throws, the app boots logged out. The device_id Keychain entry deliberately survives reinstalls — it identifies the device for push registration and grants no access by itself. (Android was never affected: its SecureStore backing is wiped on uninstall.)",
        ar: "إصلاح بلاغ QA: كان رمز الدخول ومعرّف الجلسة يُحفظان في expo-secure-store (Keychain على iOS)، وهي بيانات تنجو من حذف التطبيق — لذا كان التطبيق بعد الحذف وإعادة التثبيت يستعيد الجلسة القديمة بصمت. في كل تشغيل بارد يفحص loadPersistedAuth علامة تثبيت في AsyncStorage (وهي تُمحى عند حذف التطبيق): غياب العلامة يعني تثبيتاً جديداً، فيُحذف أي جلسة متبقية في Keychain ويفتح التطبيق مسجّل الخروج (الترحيب/تسجيل الدخول)؛ ثم تُكتب العلامة. والتثبيتات القائمة التي تحمل العلامة تُعيد استعادة جلستها كالسابق. وعند أي فشل يكون السلوك آمناً: يفتح التطبيق مسجّل الخروج. أما معرّف الجهاز (device_id) فيُترك في Keychain عمداً — فهو يعرّف الجهاز لتسجيل الإشعارات ولا يمنح أي وصول بذاته. (أندرويد لم يتأثر: مخزن SecureStore فيه يُمحى عند حذف التطبيق.)",
      },
      acceptanceCriteria: {
        en: [
          "Delete the app while logged in and reinstall: the first launch shows the onboarding/login screen — no automatic session restore.",
          "After reinstall, the stale auth_token/session_id are removed from the Keychain and never sent to the API.",
          "An existing install (sentinel present) still restores its session on cold boot.",
          "If the sentinel read/write fails, the app boots logged out (fail-secure), never auto-restoring a possibly-stale session.",
        ],
        ar: [
          "احذف التطبيق أثناء تسجيل الدخول ثم أعد تثبيته: التشغيل الأول يعرض شاشة الترحيب/تسجيل الدخول — دون استعادة تلقائية للجلسة.",
          "بعد إعادة التثبيت يُحذف auth_token/session_id القديمان من Keychain ولا يُرسلان للواجهة البرمجية أبداً.",
          "التثبيت القائم (العلامة موجودة) يستعيد جلسته عند التشغيل البارد كالسابق.",
          "عند فشل قراءة/كتابة العلامة يفتح التطبيق مسجّل الخروج (سلوك آمن)، ولا تُستعاد جلسة قد تكون قديمة أبداً.",
        ],
      },
      testScenarios: {
        en: [
          "Log in on a device, delete the app, reinstall and launch — the login/onboarding screen shows; no /users/me call is made.",
          "Log in again and force-close + relaunch (no deletion) — the session is restored as usual.",
          "Simulate sentinel-storage failure — the app boots logged out rather than restoring.",
        ],
        ar: [
          "سجّل الدخول على الجهاز، احذف التطبيق، أعد تثبيته وشغّله — تظهر شاشة الدخول/الترحيب؛ دون استدعاء /users/me.",
          "سجّل الدخول مجدداً ثم أغلق التطبيق بقوة وأعد فتحه (بدون حذف) — تُستعاد الجلسة كالعادة.",
          "حاكِ فشل تخزين العلامة — يفتح التطبيق مسجّل الخروج بدلاً من الاستعادة.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
  ],
};
