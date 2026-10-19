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
          "A sent message appears for the recipient without refreshing, and is still there after reopening the chat (also when the reload is slow or fails: the cached messages stay, with a تعذر تحميل الرسائل · إعادة المحاولة row on failure).",
          "Your own messages sit on the right (light bubble), the other person's on the left (dark bubble), for text, image and property messages.",
          "Message times are 12-hour with ص/م and western digits in the phone's time zone (e.g. 2:05 م, 12:53 ص), in the chat and in the chats list.",
          "Switching to another app and back (without closing Buyootna) shows the messages that arrived meanwhile without reopening the chat, and the chats list updates too.",
          "Going back to the chats list never leaves a stuck loading spinner at the top; the spinner shows only while pulling to refresh.",
          "Two personas of the same account can't message each other ('لا يمكنك بدء محادثة مع نفسك').",
          "The inbox after switching persona lists only that persona's conversations.",
          "Messaging a suspended or blocked account is refused ('هذا الحساب غير متاح حالياً').",
          "The ad banner at the top shows only when the chat was opened from that ad; opening the same chat from an office/company list or profile clears it for both sides, and opening it from an ad again brings that ad back.",
        ],
        ar: [
          "الرسالة المرسلة تظهر للمستلم دون تحديث وتبقى بعد إعادة فتح المحادثة (حتى إذا بطؤ التحميل أو فشل: تبقى الرسائل المحفوظة، مع سطر تعذر تحميل الرسائل · إعادة المحاولة عند الفشل).",
          "رسائلك على اليمين (فقاعة فاتحة) ورسائل الطرف الآخر على اليسار (فقاعة داكنة)، للنص والصور والعقارات.",
          "أوقات الرسائل بنظام 12 ساعة مع ص/م وبأرقام غربية وبتوقيت الهاتف (مثل 2:05 م و 12:53 ص)، في المحادثة وفي قائمة المحادثات.",
          "الانتقال إلى تطبيق آخر ثم العودة (دون إغلاق بيوتنا) يعرض الرسائل التي وصلت في الأثناء دون إعادة فتح المحادثة، وتتحدّث قائمة المحادثات أيضاً.",
          "العودة إلى قائمة المحادثات لا تترك مؤشر تحميل عالقاً في الأعلى؛ يظهر المؤشر فقط أثناء السحب للتحديث.",
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
          "Send one message in a new chat, go back and reopen it 3 times — the message is there each time, on the right, with the correct time.",
          "As Individual open a chat with a company; switch to your own Company persona — that chat isn't in the inbox.",
          "Chat with an office from one of its ads (banner shows the ad), go back, then open the chat from Home → مكاتب عقارية — no banner; the office sees no banner either.",
        ],
        ar: [
          "جهازان وحسابان: أرسل 5 رسائل بسرعة — تصل جميعها بالترتيب على الجهاز الآخر.",
          "اضغط 'محادثة' مرتين على إعلان — تُنشأ محادثة واحدة فقط.",
          "أرسل رسالة واحدة في محادثة جديدة، ثم ارجع وأعد فتحها 3 مرات — تظهر الرسالة كل مرة على اليمين وبالوقت الصحيح.",
          "كفرد افتح محادثة مع شركة ثم بدّل إلى هوية شركتك — لا تظهر تلك المحادثة في صندوق الوارد.",
          "راسل مكتباً من أحد إعلاناته (يظهر الشريط بالإعلان)، ثم ارجع وافتح المحادثة من الرئيسية ← مكاتب عقارية — لا يظهر الشريط؛ ولا يظهر للمكتب أيضاً.",
        ],
      },
      updatedIn: "fix/chat-clear-property, feat/real-trust-signals",
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
      id: "mobile-login-profile-type",
      title: {
        en: "Login: pick فرد / مكتب / شركة and land straight on that dashboard",
        ar: "تسجيل الدخول: اختر فرد / مكتب / شركة وادخل مباشرة إلى لوحته",
      },
      priority: "P1",
      story: {
        en: "A user who registered as an individual and later added an office or company from المزيد used to sign back in on whichever persona the device last used, then switch by hand. The login screen's account-type dropdown now decides it: signing in on فرد (individual-auth) sends identityType INDIVIDUAL, on مكتب or شركة (business-auth) OFFICE or COMPANY. The server opens that persona and the app routes from the persona it returns (resetToIdentityHome), so an office login lands on the office dashboard without passing through the individual home. Both screens share one sign-in function (features/auth/utils/loginAs.ts). If the account has no persona of the type picked, an alert says so and offers a «الدخول كـ…» button for each persona the account does have.",
        ar: "المستخدم الذي سجّل كفرد ثم أضاف مكتباً أو شركة من المزيد كان يعود عند تسجيل الدخول إلى آخر هوية استخدمها الجهاز، ثم يبدّل يدوياً. الآن تحدد القائمة المنسدلة لنوع الحساب في شاشة الدخول ذلك: الدخول على فرد (individual-auth) يرسل identityType INDIVIDUAL، وعلى مكتب أو شركة (business-auth) يرسل OFFICE أو COMPANY. يفتح الخادم تلك الهوية ويوجّه التطبيق حسب الهوية التي يعيدها (resetToIdentityHome)، فيدخل حساب المكتب مباشرة إلى لوحة المكتب دون المرور برئيسية الفرد. الشاشتان تستخدمان دالة دخول واحدة (features/auth/utils/loginAs.ts). وإذا لم يكن في الحساب هوية من النوع المختار يظهر تنبيه بذلك مع زر «الدخول كـ…» لكل هوية موجودة في الحساب.",
      },
      acceptanceCriteria: {
        en: [
          "Account with individual + office, logged out: picking مكتب and signing in opens the office dashboard directly.",
          "Picking فرد opens the individual home; picking شركة on an account with a company opens the company dashboard.",
          "Picking شركة on an account without one shows «لا يوجد هذا الحساب» with buttons for the personas it has; tapping one signs in there.",
          "The individual home is never shown on the way to an office or company dashboard.",
        ],
        ar: [
          "حساب فيه فرد ومكتب بعد تسجيل الخروج: اختيار مكتب وتسجيل الدخول يفتح لوحة المكتب مباشرة.",
          "اختيار فرد يفتح رئيسية الفرد، واختيار شركة في حساب فيه شركة يفتح لوحة الشركة.",
          "اختيار شركة في حساب بلا شركة يعرض «لا يوجد هذا الحساب» مع أزرار للهويات الموجودة، والضغط على أحدها يدخل إليها.",
          "لا تظهر رئيسية الفرد أبداً في الطريق إلى لوحة المكتب أو الشركة.",
        ],
      },
      testScenarios: {
        en: [
          "Register an individual, add an office (المزيد › إضافة حساب), log out. On the login screen pick مكتب and sign in: office dashboard. Log out, pick فرد: individual home.",
          "On the same account pick شركة: the alert offers الدخول كـفرد and الدخول كـمكتب.",
        ],
        ar: [
          "سجّل فرداً وأضف مكتباً (المزيد ثم إضافة حساب) ثم سجّل الخروج. في شاشة الدخول اختر مكتب وسجّل الدخول: لوحة المكتب. سجّل الخروج واختر فرد: رئيسية الفرد.",
          "على الحساب نفسه اختر شركة: يعرض التنبيه الدخول كـفرد والدخول كـمكتب.",
        ],
      },
      updatedIn: "feat/login-profile-type",
    },
    {
      id: "mobile-new-company-opens-company-home",
      title: {
        en: "After adding a company, «العودة الى الرئيسية» opens the company home",
        ar: "بعد إضافة شركة، «العودة الى الرئيسية» يفتح رئيسية الشركة",
      },
      priority: "P1",
      story: {
        en: "Adding a company from المزيد (add-identity-company) created it, but the success sheet's «العودة الى الرئيسية» always opened the individual home: the account stayed on its individual persona and the button reset to the default home. The screen now keeps the id the server returns for the new company; the button switches the session to it (switchIdentity, which issues a token for that persona) and opens the company home. If the switch fails, an alert says so and the app returns to the home it was on; the company can still be opened from المزيد. A new business sign-up keeps its old behaviour (the form's onSuccessDone is optional).",
        ar: "كانت إضافة شركة من المزيد (add-identity-company) تنشئها، لكن زر «العودة الى الرئيسية» في نافذة النجاح كان يفتح دائماً رئيسية الفرد: يبقى الحساب على هوية الفرد ويعود الزر إلى الرئيسية الافتراضية. الآن تحتفظ الشاشة بمعرّف الشركة الجديدة الذي يعيده الخادم، ويبدّل الزر الجلسة إليها (switchIdentity الذي يصدر رمزاً لتلك الهوية) ويفتح رئيسية الشركة. وإذا فشل التبديل يظهر تنبيه بذلك ويعود التطبيق إلى الرئيسية التي كان عليها، ويمكن فتح الشركة من المزيد. والتسجيل الجديد لنشاط تجاري يبقى كما كان (onSuccessDone في النموذج اختياري).",
      },
      acceptanceCriteria: {
        en: [
          "Signed in as an individual, add a company: «العودة الى الرئيسية» opens the company home, with the company as the active account.",
          "المزيد then shows the company's menu, not the individual one.",
          "If the switch fails, an alert explains and the individual home opens.",
        ],
        ar: [
          "مسجّلاً كفرد، أضف شركة: «العودة الى الرئيسية» يفتح رئيسية الشركة والشركة هي الحساب النشط.",
          "ثم تعرض المزيد قائمة الشركة لا قائمة الفرد.",
          "إذا فشل التبديل يظهر تنبيه توضيحي وتفتح رئيسية الفرد.",
        ],
      },
      testScenarios: {
        en: ["Sign in as an individual, المزيد › إضافة حساب › شركة, fill it in and submit; tap «العودة الى الرئيسية»: the company home opens."],
        ar: ["سجّل الدخول كفرد، المزيد ثم إضافة حساب ثم شركة، املأ البيانات وأرسلها؛ اضغط «العودة الى الرئيسية»: تفتح رئيسية الشركة."],
      },
      updatedIn: "fix/new-company-goes-home",
    },
    {
      id: "mobile-own-company-no-quote-chat",
      title: {
        en: "Your own company: «طلب عرض سعر» and chat don't respond",
        ar: "شركتك أنت: «طلب عرض سعر» والمحادثة لا يستجيبان",
      },
      priority: "P2",
      story: {
        en: "An account that owns a company saw it in شركات like any other, with working «طلب عرض سعر» and chat buttons, so it could ask itself for a quote or open a chat with itself. When a company's owner (CompanyDto.userId) is the signed-in account, whichever persona is active, its card's quote and chat buttons are now disabled and dimmed (CompanyListCard isOwn), and on its company page the «طلب عرض سعر» bar is disabled too (CompanyBottomBar disabled). Other companies are unchanged.",
        ar: "الحساب الذي يملك شركة كان يراها في شركات مثل غيرها، مع زري «طلب عرض سعر» والمحادثة يعملان، فيستطيع طلب عرض سعر من نفسه أو فتح محادثة مع نفسه. الآن عندما يكون مالك الشركة (CompanyDto.userId) هو الحساب المسجّل، أياً كانت الهوية النشطة، يُعطّل زرا عرض السعر والمحادثة في بطاقتها ويبهتان (CompanyListCard isOwn)، ويُعطّل شريط «طلب عرض سعر» في صفحة الشركة كذلك (CompanyBottomBar disabled). وبقية الشركات دون تغيير.",
      },
      acceptanceCriteria: {
        en: [
          "In شركات, your own company's «طلب عرض سعر» and chat are dimmed and do nothing.",
          "Other companies' buttons work as before.",
          "On your own company's page, «طلب عرض سعر» is dimmed and does nothing.",
        ],
        ar: [
          "في شركات يكون زرا «طلب عرض سعر» والمحادثة لشركتك باهتين ولا يفعلان شيئاً.",
          "أزرار الشركات الأخرى تعمل كما كانت.",
          "في صفحة شركتك يكون «طلب عرض سعر» باهتاً ولا يفعل شيئاً.",
        ],
      },
      testScenarios: {
        en: ["Add a company to your account, open شركات: its buttons don't respond, another company's do. Open your company's page: «طلب عرض سعر» doesn't respond."],
        ar: ["أضف شركة إلى حسابك وافتح شركات: أزرارها لا تستجيب وأزرار شركة أخرى تستجيب. افتح صفحة شركتك: «طلب عرض سعر» لا يستجيب."],
      },
      updatedIn: "fix/own-company-actions",
    },
    {
      id: "mobile-services-catalogue",
      title: {
        en: "One services catalogue for إضافة خدمة, طلب عرض سعر and the شركات filter",
        ar: "قائمة خدمات واحدة لإضافة خدمة وطلب عرض سعر وتصفية الشركات",
      },
      priority: "P1",
      story: {
        en: "The specialties and their service types now come from the client's Buyootna_RFQ_2Level_Classification_v1.0.xlsx (sheet «التصنيف النهائي»): 33 specialties, in shared/data/serviceCatalog.ts. The sheet pairs «مكتب هندسي / دار استشارية» and «مقاول عام / مقاول بناء»; in the app each is its own specialty with the pair's types (29 and 8), and «إدارة الأملاك» is spelled with the hamza. The «Potential» sheet is not in yet. إضافة خدمة: every specialty has its own checklist with الكل and اخرى. طلب عرض سعر (public): مجال التخصص lists the 33 specialties; نوع الطلب lists the chosen specialty's types plus اخرى, stays disabled («اختر مجال التخصص أولاً») until a specialty is picked and clears when it changes; the request is sent with category = the specialty and title = the request type (or the specialty). The old generic request types (عرض سعر، استشارة…) are gone. شركات › تصفية البحث: نوع الخدمة lists the types of the picked specialties, waits for one («اختر التخصص أولاً»), and drops types that no longer belong when the specialties change.",
        ar: "أصبحت التخصصات وأنواع خدماتها من ملف العميل Buyootna_RFQ_2Level_Classification_v1.0.xlsx (ورقة «التصنيف النهائي»): 33 تخصصاً في shared/data/serviceCatalog.ts. يجمع الملف «مكتب هندسي / دار استشارية» و«مقاول عام / مقاول بناء»؛ وفي التطبيق كل منها تخصص مستقل بأنواع الزوج (29 و8)، وتُكتب «إدارة الأملاك» بالهمزة. وورقة «Potential» لم تُضف بعد. إضافة خدمة: لكل تخصص قائمته الخاصة مع الكل واخرى. طلب عرض سعر (العام): مجال التخصص يعرض الـ33 تخصصاً، ونوع الطلب يعرض أنواع التخصص المختار مع اخرى، ويبقى معطلاً («اختر مجال التخصص أولاً») حتى يُختار تخصص ويُمسح عند تغييره؛ ويُرسل الطلب مع category = التخصص وtitle = نوع الطلب (أو التخصص). وأُزيلت الأنواع العامة القديمة (عرض سعر، استشارة…). شركات › تصفية البحث: نوع الخدمة يعرض أنواع التخصصات المختارة وينتظر اختيار تخصص («اختر التخصص أولاً») ويحذف الأنواع التي لم تعد تنتمي عند تغيير التخصصات.",
      },
      acceptanceCriteria: {
        en: [
          "إضافة خدمة lists 33 specialties (مكتب هندسي, دار استشارية, مقاول عام and مقاول بناء separate); picking any shows its own types with الكل and اخرى.",
          "طلب عرض سعر: نوع الطلب is disabled until مجال التخصص is chosen, then lists that specialty's types and اخرى.",
          "Changing مجال التخصص clears نوع الطلب.",
          "A sent request carries the specialty as its category and the request type as its title.",
          "شركات filter: نوع الخدمة lists only the picked specialties' types.",
        ],
        ar: [
          "إضافة خدمة تعرض 33 تخصصاً (مكتب هندسي ودار استشارية ومقاول عام ومقاول بناء منفصلة)، واختيار أي منها يعرض أنواعه مع الكل واخرى.",
          "طلب عرض سعر: نوع الطلب معطل حتى يُختار مجال التخصص، ثم يعرض أنواع ذلك التخصص مع اخرى.",
          "تغيير مجال التخصص يمسح نوع الطلب.",
          "الطلب المرسل يحمل التخصص كفئة ونوع الطلب كعنوان.",
          "تصفية الشركات: نوع الخدمة يعرض أنواع التخصصات المختارة فقط.",
        ],
      },
      testScenarios: {
        en: [
          "Open طلب عرض سعر, pick المسابح: نوع الطلب shows its 5 types and اخرى; switch to التكييف: the pick is cleared.",
          "As a company, إضافة خدمة › التشطيب: its 10 types are listed.",
        ],
        ar: [
          "افتح طلب عرض سعر واختر المسابح: يعرض نوع الطلب أنواعه الخمسة واخرى؛ بدّل إلى التكييف: يُمسح الاختيار.",
          "كشركة، إضافة خدمة › التشطيب: تظهر أنواعه العشرة.",
        ],
      },
      updatedIn: "feat/split-specialties",
    },
    {
      id: "mobile-more-stack-back",
      title: {
        en: "Back from إضافة خدمة never lands on an older form",
        ar: "الرجوع من إضافة خدمة لا يفتح نموذجاً قديماً",
      },
      priority: "P1",
      story: {
        en: "On a company or office account, the forms opened from the + sheet and المزيد (إضافة خدمة, إضافة مشروع, إصدار فاتورة…) live in a stack nested in the tabs ((more)/_layout.tsx). A stack can't pop its last screen, so a form left with back stayed underneath: opening إضافة خدمة after an earlier إضافة مشروع stacked on top of it, and back opened the project form. The stack now forgets its screens whenever its tab is left (useResetStackOnBlur), so each visit starts from the screen asked for. Moving between screens inside it (e.g. الباقات › سجل الاشتراك) keeps its back as before.",
        ar: "في حساب الشركة أو المكتب تعيش النماذج التي تُفتح من نافذة + ومن المزيد (إضافة خدمة، إضافة مشروع، إصدار فاتورة…) في مكدس داخل التبويبات ((more)/_layout.tsx). ولا يستطيع المكدس إزالة آخر شاشة فيه، فيبقى النموذج الذي خرج منه المستخدم بالرجوع تحت غيره: فتح إضافة خدمة بعد إضافة مشروع سابق يضعها فوقه، والرجوع يفتح نموذج المشروع. الآن ينسى المكدس شاشاته كلما غادر المستخدم تبويبه (useResetStackOnBlur)، فتبدأ كل زيارة من الشاشة المطلوبة. والتنقل بين شاشاته (مثل الباقات › سجل الاشتراك) يبقى رجوعه كما كان.",
      },
      acceptanceCriteria: {
        en: [
          "Open إضافة مشروع, go back, then open إضافة خدمة and go back: you return to where you opened it, not to إضافة مشروع.",
          "The same for an office account.",
        ],
        ar: [
          "افتح إضافة مشروع وارجع، ثم افتح إضافة خدمة وارجع: تعود إلى حيث فتحتها لا إلى إضافة مشروع.",
          "وكذلك في حساب المكتب.",
        ],
      },
      testScenarios: {
        en: ["As a company: + › إضافة مشروع › back; + › إضافة خدمة › back: the home shows."],
        ar: ["كشركة: + › إضافة مشروع › رجوع؛ ثم + › إضافة خدمة › رجوع: تظهر الرئيسية."],
      },
      updatedIn: "feat/add-service-second-time",
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
          "In the اختر الهوية sheet the active persona is listed first; the others keep their order below it.",
        ],
        ar: [
          "التبديل على الجهاز A لا يغيّر الهوية التي يستخدمها الجهاز B.",
          "تسجيل الخروج ثم الدخول على الجهاز A يعيد آخر هوية استخدمها الجهاز A.",
          "الجهاز الذي لم يسجّل الدخول من قبل يفتح بآخر هوية مستخدمة في الحساب.",
          "بعد التبديل يُعاد اتصال مقبس المحادثة ويعرض صندوق الوارد محادثات الهوية الجديدة فقط.",
          "الرئيسية ونشاطي والمفضلة والمحفظة والفواتير تعكس الهوية النشطة فقط.",
          "في نافذة اختر الهوية تظهر الهوية النشطة أولاً، وتبقى بقية الهويات بترتيبها تحتها.",
        ],
      },
      testScenarios: {
        en: [
          "Two phones on one account: switch phone A to Company; phone B stays Individual after a pull-to-refresh.",
          "On phone A: switch to Company, log out, log in — lands on Company.",
          "Install on a third device and log in — opens with the persona most recently used.",
          "Favorite a property as Individual, switch to Company — the Favorites list doesn't show it.",
          "With three personas, switch to the last one and reopen اختر الهوية — it is at the top.",
        ],
        ar: [
          "هاتفان على نفس الحساب: بدّل الهاتف A إلى الشركة؛ يبقى الهاتف B على الفرد بعد السحب للتحديث.",
          "على الهاتف A: بدّل إلى الشركة، سجّل الخروج ثم الدخول — يفتح على الشركة.",
          "ثبّت على جهاز ثالث وسجّل الدخول — يفتح بآخر هوية استُخدمت.",
          "فضّل عقاراً كفرد ثم بدّل إلى الشركة — لا يظهر في قائمة المفضلة.",
          "مع ثلاث هويات، بدّل إلى آخرها وأعد فتح اختر الهوية — تظهر في الأعلى.",
        ],
      },
      updatedIn: "feat/docs-platform, fix/property-host-avatar",
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
      updatedIn:
        "fix/map-multi-location, fix/android-label-wrap, fix/review-findings",
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
      updatedIn:
        "fix/map-multi-location, fix/android-label-wrap, fix/review-findings",
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
      id: "mobile-chat-figma-list-and-screen",
      title: {
        en: "Chat: one chats list for every account, navy bubbles for my messages",
        ar: "المحادثات: قائمة واحدة لكل الحسابات وفقاعات كحلية لرسائلي",
      },
      priority: "P1",
      story: {
        en: "The chat follows its Figma frames. Chats list: the company and office tabs now show the same 'محادثاتي' list as individuals, with the search field and the الكل / غير المقروء tabs (before they had only a title). Each row shows the avatar (a coloured initial when there is no photo), the name, the time, a tag for what the chat is about ('طلب عرض سعر' or the ad, e.g. 'شقة السالمية'), the last message, and either the unread count or the ticks on my last message. Chat screen: my messages are now navy with white text on the right and the other person's are light on the left (the colours were the other way round); the time and the ticks sit under every bubble (text, photo, file, voice note, ad, location, offer), on the bubble's own side and in one size, so the times line up down the chat; delivered ticks are navy and read ticks gold. The bar pinned under the header shows a title, 'area • price' and a chevron, without a photo. The quoted message in a reply is a white card with a navy bar.",
        ar: "أصبحت المحادثات مطابقة لتصميم Figma. قائمة المحادثات: تبويبا الشركة والمكتب يعرضان الآن قائمة 'محادثاتي' نفسها التي يراها الأفراد، مع حقل البحث وتبويبي الكل / غير المقروء (كان فيهما عنوان فقط). كل صف يعرض الصورة (حرف ملوّن عند غياب الصورة) والاسم والوقت ووسم موضوع المحادثة ('طلب عرض سعر' أو الإعلان مثل 'شقة السالمية') وآخر رسالة، ثم عدد غير المقروء أو علامات رسالتي الأخيرة. شاشة المحادثة: رسائلي الآن كحلية بنص أبيض على اليمين ورسائل الطرف الآخر فاتحة على اليسار (كانت الألوان معكوسة)؛ الوقت والعلامات تحت كل فقاعة (نص، صورة، ملف، رسالة صوتية، إعلان، موقع، عرض)، عند حافة الفقاعة وبحجم واحد، فتصطف الأوقات في المحادثة؛ علامتا التسليم كحليتان وعلامتا القراءة ذهبيتان. الشريط المثبت تحت الرأس يعرض عنواناً و'المنطقة • السعر' وسهماً بلا صورة. الرسالة المقتبسة في الرد بطاقة بيضاء بشريط كحلي.",
      },
      acceptanceCriteria: {
        en: [
          "The company and office chats tabs show the search field and the الكل / غير المقروء tabs, with no back arrow.",
          "غير المقروء lists only chats that have unread messages.",
          "A chat opened about a quote request is tagged 'طلب عرض سعر' on the list; one opened from an ad is tagged with the ad.",
          "My text messages are navy on the right with ticks and time on their left; theirs are light on the left with the time on their right.",
          "Voice notes, photos and files follow the same colours: navy for mine, light for theirs.",
          "A reply shows the quoted message inside the bubble; tapping it still jumps to the original.",
          "The time (with my ticks) is under every bubble, at the bubble's own edge, the same size for text, photos, files, voice notes, ads, locations and offers, received or sent; scrolling a mixed chat the times line up.",
          "The الكل and غير المقروء tabs each show their label on one line, fully visible, on Android and iPhone.",
        ],
        ar: [
          "تبويبا محادثات الشركة والمكتب يعرضان حقل البحث وتبويبي الكل / غير المقروء بلا سهم رجوع.",
          "غير المقروء يعرض فقط المحادثات التي فيها رسائل غير مقروءة.",
          "المحادثة المفتوحة عن طلب عرض سعر توسم بـ 'طلب عرض سعر' في القائمة؛ والمفتوحة من إعلان توسم بالإعلان.",
          "رسائلي النصية كحلية على اليمين والعلامات والوقت على يسارها؛ ورسائل الطرف الآخر فاتحة على اليسار والوقت على يمينها.",
          "الرسائل الصوتية والصور والملفات بالألوان نفسها: كحلي لرسائلي وفاتح للطرف الآخر.",
          "الرد يعرض الرسالة المقتبسة داخل الفقاعة؛ والضغط عليها ما زال ينقل إلى الأصل.",
          "الوقت (مع علاماتي) تحت كل فقاعة، عند حافتها، وبالحجم نفسه للنص والصور والملفات والرسائل الصوتية والإعلانات والمواقع والعروض، مستلمة أو مرسلة؛ وعند التمرير في محادثة مختلطة تصطف الأوقات.",
          "يعرض تبويبا الكل وغير المقروء اسميهما في سطر واحد ظاهر كاملاً، في Android و iPhone.",
        ],
      },
      testScenarios: {
        en: [
          "Sign in as a company and open المحادثات: search for a client by name, then switch to غير المقروء.",
          "Exchange a few messages between two accounts and compare both phones with the design.",
        ],
        ar: [
          "سجّل الدخول كشركة وافتح المحادثات: ابحث عن عميل بالاسم ثم بدّل إلى غير المقروء.",
          "تبادل بضع رسائل بين حسابين وقارن الهاتفين بالتصميم.",
        ],
      },
      updatedIn: "fix/chat-filter-tabs-one-line",
    },
    {
      id: "mobile-chat-online-typing-request",
      title: {
        en: "Chat: online status, 'يكتب الان...' and the pinned quote request",
        ar: "المحادثات: حالة الاتصال و'يكتب الان...' وطلب السعر المثبت",
      },
      priority: "P1",
      story: {
        en: "Three live additions to chat. Online: when the other person's app is open, the chat header shows a green 'متصل' under their name and a green dot on their avatar, and the chats list shows the dot too; it clears when they close the app. Typing: while the other person is writing, 'يكتب الان...' replaces the status in the header and the last message on the chats list; it ends when their message arrives, when they clear the field, after a few seconds without typing, or when they leave the chat. Quote requests: when a company taps الرد on a request (from the home, the requests list or the request details), or the requester opens the chat from their request, the chat is linked to that request: its title, area and budget are pinned under the header, and tapping the bar opens the request.",
        ar: "ثلاث إضافات حية للمحادثات. الاتصال: عند فتح الطرف الآخر للتطبيق يعرض رأس المحادثة 'متصل' بالأخضر تحت اسمه ونقطة خضراء على صورته، وتظهر النقطة في قائمة المحادثات أيضاً؛ وتختفي عند إغلاقه التطبيق. الكتابة: أثناء كتابة الطرف الآخر يحل 'يكتب الان...' محل الحالة في الرأس ومحل آخر رسالة في القائمة؛ وينتهي عند وصول رسالته أو مسحه الحقل أو بعد ثوانٍ بلا كتابة أو مغادرته المحادثة. طلبات السعر: عند ضغط الشركة على الرد في طلب (من الرئيسية أو قائمة الطلبات أو تفاصيل الطلب)، أو فتح صاحب الطلب المحادثة من طلبه، تُربط المحادثة بذلك الطلب: يُثبَّت عنوانه ومنطقته وميزانيته تحت الرأس، والضغط على الشريط يفتح الطلب.",
      },
      acceptanceCriteria: {
        en: [
          "With both phones in the app, each sees 'متصل' for the other; closing one app removes it on the other within a moment.",
          "Typing on one phone shows 'يكتب الان...' on the other, in the open chat and on its chats list.",
          "'يكتب الان...' disappears when the message is sent, when the field is emptied, and by itself after about six seconds if nothing else arrives.",
          "After a company taps الرد on a request, both sides see the request pinned in that chat.",
          "The company's tap on the pinned request opens the request it received; the requester's tap opens their own request.",
          "Opening the same chat later from an ad replaces the pinned request with that ad.",
        ],
        ar: [
          "عند وجود الهاتفين في التطبيق يرى كل طرف 'متصل' للآخر؛ وإغلاق أحدهما يزيلها عند الآخر خلال لحظات.",
          "الكتابة على هاتف تعرض 'يكتب الان...' على الآخر، في المحادثة المفتوحة وفي قائمة محادثاته.",
          "'يكتب الان...' يختفي عند إرسال الرسالة وعند إفراغ الحقل، ومن تلقاء نفسه بعد نحو ست ثوانٍ إن لم يصل شيء.",
          "بعد ضغط الشركة على الرد في طلب يرى الطرفان الطلب مثبتاً في تلك المحادثة.",
          "ضغط الشركة على الطلب المثبت يفتح الطلب الوارد إليها؛ وضغط صاحب الطلب يفتح طلبه.",
          "فتح المحادثة نفسها لاحقاً من إعلان يستبدل الطلب المثبت بذلك الإعلان.",
        ],
      },
      testScenarios: {
        en: [
          "Two phones, two accounts: open the same chat on both and watch the status while one types, sends, and closes the app.",
          "Send a quote request from an individual to a company, reply as the company, and check the pinned bar on both phones.",
        ],
        ar: [
          "هاتفان بحسابين: افتح المحادثة نفسها عليهما وراقب الحالة أثناء كتابة أحدهما وإرساله وإغلاقه التطبيق.",
          "أرسل طلب سعر من فرد إلى شركة ثم ردّ كشركة وتحقق من الشريط المثبت على الهاتفين.",
        ],
      },
      updatedIn: "feat/chat-flow-figma",
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
          "OTA safety: an older 1.4.0 binary without the AsyncStorage native module (iOS build 10, Android versionCode 4) skips the sentinel check and keeps its session, instead of being logged out on every launch.",
        ],
        ar: [
          "احذف التطبيق أثناء تسجيل الدخول ثم أعد تثبيته: التشغيل الأول يعرض شاشة الترحيب/تسجيل الدخول — دون استعادة تلقائية للجلسة.",
          "بعد إعادة التثبيت يُحذف auth_token/session_id القديمان من Keychain ولا يُرسلان للواجهة البرمجية أبداً.",
          "التثبيت القائم (العلامة موجودة) يستعيد جلسته عند التشغيل البارد كالسابق.",
          "عند فشل قراءة/كتابة العلامة يفتح التطبيق مسجّل الخروج (سلوك آمن)، ولا تُستعاد جلسة قد تكون قديمة أبداً.",
          "أمان تحديثات OTA: نسخة 1.4.0 أقدم لا تحتوي وحدة AsyncStorage الأصلية (iOS build 10، Android versionCode 4) تتخطى فحص العلامة وتحتفظ بجلستها، بدلاً من تسجيل خروجها مع كل تشغيل.",
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
      updatedIn: "fix/ota-asyncstorage-guard",
    },
    {
      id: "mobile-western-numerals",
      title: {
        en: "Numerals stay Western (1,234) regardless of the device language",
        ar: "الأرقام تبقى بالصيغة الغربية (1,234) بغض النظر عن لغة الجهاز",
      },
      priority: "P1",
      story: {
        en: "QA bug fix: with the device language set to Arabic, prices and counts rendered Eastern Arabic numerals (١٬٢٣٤) because ~20 call sites used bare toLocaleString(), which follows the device locale. All number formatting now goes through a shared formatNumber() helper pinned to en-US, so digits stay 1, 2, 3 everywhere (ad cards, My Ads cards, chat property bubbles, office cards, alerts, invoice totals). Arabic dates keep their Arabic month names but also render Western digits — every ar-KW/ar-EG date format is pinned to ar-KW-u-nu-latn (matching the invoice receipt design 'الأربعاء، 5 يوليو 2026 • 09:30 صباحا').",
        ar: "إصلاح بلاغ QA: مع ضبط لغة الجهاز على العربية كانت الأسعار والأعداد تُعرض بالأرقام العربية الشرقية (١٬٢٣٤) لأن نحو 20 موضعاً كانت تستخدم toLocaleString() بدون تحديد لغة، فتتبع لغة الجهاز. الآن يمر كل تنسيق أرقام عبر مساعد مشترك formatNumber() مثبّت على en-US، فتبقى الأرقام 1، 2، 3 في كل الشاشات (بطاقات الإعلانات، بطاقات نشاطي، فقاعات العقار في المحادثات، بطاقات المكتب، التنبيهات، إجماليات الفواتير). والتواريخ العربية تحتفظ بأسماء الأشهر العربية لكنها أيضاً تعرض أرقاماً غربية — كل صيغ ar-KW/ar-EG مثبتة على ar-KW-u-nu-latn (مطابقة تصميم إيصال الفاتورة 'الأربعاء، 5 يوليو 2026 • 09:30 صباحا').",
      },
      acceptanceCriteria: {
        en: [
          "With the device language set to Arabic, prices and ad counts on all cards (Home, My Ads, chat, office, alerts) render Western digits with thousands separators (e.g. 1,234 د.ك) — never ١٬٢٣٤.",
          "Arabic dates (chat timestamps, notifications, invoice dates, license expiry) keep Arabic month names but Western digits, regardless of device language.",
          "Number formatting is centralized in shared/utils/formatNumber; new code must not call toLocaleString() bare.",
        ],
        ar: [
          "مع ضبط لغة الجهاز على العربية، تعرض الأسعار وأعداد الإعلانات في كل البطاقات (الرئيسية، نشاطي، المحادثات، المكتب، التنبيهات) أرقاماً غربية مع فواصل الآلاف (مثل 1,234 د.ك) — وليس ١٬٢٣٤ أبداً.",
          "التواريخ العربية (طوابع المحادثة، الإشعارات، تواريخ الفواتير، انتهاء الرخصة) تحتفظ بأسماء الأشهر العربية بأرقام غربية بغض النظر عن لغة الجهاز.",
          "تنسيق الأرقام مركزي في shared/utils/formatNumber؛ ولا يجوز للكود الجديد استدعاء toLocaleString() بدون تحديد لغة.",
        ],
      },
      testScenarios: {
        en: [
          "Set the iOS device language to Arabic and open Home, My Ads and chat — all prices show Western digits (e.g. 150,000 د.ك).",
          "Open an invoice review — the issue date shows Arabic month names with Western digits (e.g. 5 يوليو 2026).",
          "Run formatNumber.spec.ts and the card suites — all pass with Western-digit expectations.",
        ],
        ar: [
          "اضبط لغة جهاز iOS على العربية وافتح الرئيسية ونشاطي والمحادثات — كل الأسعار بأرقام غربية (مثل 150,000 د.ك).",
          "افتح مراجعة فاتورة — يظهر تاريخ الإصدار بأسماء أشهر عربية وأرقام غربية (مثل 5 يوليو 2026).",
          "شغّل formatNumber.spec.ts واختبارات البطاقات — تنجح جميعها بتوقعات الأرقام الغربية.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
    {
      id: "mobile-bottom-safe-area-actions",
      title: {
        en: "Bottom sheets and bottom action bars stay clear of the home indicator / navigation bar",
        ar: "النوافذ السفلية وأزرار أسفل الشاشة لا تتداخل مع شريط الهوم / شريط التنقل",
      },
      priority: "P2",
      story: {
        en: "QA bug fix: bottom sheets run edge-to-edge to the bottom of the screen, and most only had a fixed bottom padding, so their action buttons sat on (or under) the iOS home indicator and the Android navigation bar. Every bottom sheet now reserves the device's bottom safe-area inset below its content (SafeBottomSheetView); sheets with a pinned footer (filters, categories, طلب عرض سعر) and fixed bottom bars that ignored the inset (رصيد الحساب, فواتير الخدمات, إضافة تنبيه, طلب عرض سعر) pad the inset plus 16px.",
        ar: "إصلاح بلاغ QA: النوافذ السفلية تمتد حتى أسفل الشاشة، ومعظمها كان بمسافة سفلية ثابتة فقط، فكانت أزرارها فوق (أو تحت) شريط الهوم في iOS وشريط التنقل في Android. الآن تحجز كل نافذة سفلية مسافة الأمان السفلية للجهاز أسفل محتواها (SafeBottomSheetView)؛ والنوافذ ذات الأزرار المثبتة (الفلاتر، التصنيفات، طلب عرض سعر) وأشرطة الأزرار السفلية التي كانت تتجاهلها (رصيد الحساب، فواتير الخدمات، إضافة تنبيه، طلب عرض سعر) تضيف هذه المسافة مع 16px.",
      },
      acceptanceCriteria: {
        en: [
          "On an iPhone with a home indicator and on Android with gesture or 3-button navigation, no bottom-sheet button touches or sits under the indicator / nav bar.",
          "Fixed bottom buttons on رصيد الحساب, فواتير الخدمات, إضافة تنبيه and طلب عرض سعر sit above the indicator, and the last list item isn't hidden behind them.",
        ],
        ar: [
          "على iPhone به شريط هوم وعلى Android بتنقل الإيماءات أو الأزرار الثلاثة، لا يلمس أي زر في نافذة سفلية شريط الهوم/التنقل ولا يقع تحته.",
          "الأزرار الثابتة أسفل رصيد الحساب وفواتير الخدمات وإضافة تنبيه وطلب عرض سعر فوق شريط الهوم، ولا يختفي آخر عنصر في القائمة خلفها.",
        ],
      },
      testScenarios: {
        en: [
          "Open several sheets (حذف الإعلان, الترتيب حسب, تصفية البحث, طلب عرض سعر, تسجيل الخروج) — bottom buttons have clear space above the indicator.",
          "On Android switch to 3-button navigation and repeat — buttons are fully above the nav bar.",
        ],
        ar: [
          "افتح عدة نوافذ (حذف الإعلان، الترتيب حسب، تصفية البحث، طلب عرض سعر، تسجيل الخروج) — الأزرار السفلية بمسافة واضحة فوق شريط الهوم.",
          "على Android فعّل التنقل بالأزرار الثلاثة وكرر — الأزرار بالكامل فوق شريط التنقل.",
        ],
      },
      updatedIn: "feat/company-more-edit-profile",
    },
    {
      id: "mobile-property-host-avatar",
      title: {
        en: "Ad details host card shows the advertiser's photo",
        ar: "بطاقة المعلن في تفاصيل الإعلان تعرض صورة المعلن",
      },
      priority: "P2",
      story: {
        en: "QA bug fix: on an ad's details screen the host card showed an empty grey circle, while the advertiser's profile showed their photo. Individual identities often have no photo of their own — it's stored on the account — and the ad details and favorites endpoints only looked at the identity. They now fall back to the account's photo (and name), the same way chat already does.",
        ar: "إصلاح بلاغ QA: في شاشة تفاصيل الإعلان كانت بطاقة المعلن تعرض دائرة رمادية فارغة، بينما يعرض ملف المعلن صورته. الهويات الفردية غالباً بلا صورة خاصة بها — الصورة محفوظة على الحساب — وكانت واجهتا تفاصيل الإعلان والمفضلة تقرآن الهوية فقط. الآن تستخدمان صورة الحساب (واسمه) عند غيابها، كما تفعل المحادثات.",
      },
      acceptanceCriteria: {
        en: [
          "An individual advertiser with a profile photo shows that photo on the host card of every ad they posted.",
          "A company or office ad still shows the company/office logo, and an individual identity with its own photo shows that photo, not the account's.",
          "The host photo in the favorites list matches the one on the ad details screen.",
        ],
        ar: [
          "المعلن الفرد الذي لديه صورة ملف شخصي تظهر صورته في بطاقة المعلن في كل إعلاناته.",
          "إعلانات الشركات والمكاتب ما زالت تعرض شعار الشركة/المكتب، والهوية الفردية التي لها صورة خاصة تعرض صورتها لا صورة الحساب.",
          "صورة المعلن في قائمة المفضلة مطابقة لصورتها في شاشة تفاصيل الإعلان.",
        ],
      },
      testScenarios: {
        en: [
          "Open an ad posted by an individual who has a profile photo — the host card shows the photo, not a grey circle; tap it and the profile shows the same photo.",
          "Add that ad to favorites and open المفضلة — the host photo is shown.",
          "Open a company ad — the host card still shows the company logo.",
        ],
        ar: [
          "افتح إعلاناً نشره فرد لديه صورة ملف شخصي — تظهر الصورة في بطاقة المعلن لا دائرة رمادية؛ اضغط عليها فيظهر الملف بنفس الصورة.",
          "أضف الإعلان إلى المفضلة وافتح المفضلة — تظهر صورة المعلن.",
          "افتح إعلان شركة — ما زالت البطاقة تعرض شعار الشركة.",
        ],
      },
      updatedIn: "fix/property-host-avatar",
    },
    {
      id: "mobile-details-sheet-instant",
      title: {
        en: "Home feed details sheet opens instantly with the card's data",
        ar: "نافذة تفاصيل العقار في الرئيسية تفتح فوراً ببيانات البطاقة",
      },
      priority: "P2",
      story: {
        en: "QA: tapping a home-feed card (or عرض تفاصيل) opened the تفاصيل العقار sheet on a full-screen spinner until the ad was fetched, although the card already had the photos, price and specs. The sheet now opens straight away with the card's data, and the description, views and address details fill in when the full ad arrives. Reopening an ad uses the cached details, which also makes the full ad page open faster.",
        ar: "بلاغ QA: الضغط على بطاقة في الرئيسية (أو عرض تفاصيل) كان يفتح نافذة تفاصيل العقار على مؤشر تحميل حتى يصل الإعلان، رغم أن البطاقة تحمل الصور والسعر والمواصفات. الآن تفتح النافذة فوراً ببيانات البطاقة، ويكتمل الوصف والمشاهدات وتفاصيل العنوان عند وصول الإعلان كاملاً. وإعادة فتح الإعلان تستخدم التفاصيل المحفوظة، مما يسرّع فتح صفحة الإعلان الكاملة أيضاً.",
      },
      acceptanceCriteria: {
        en: [
          "The sheet never shows the full-screen جاري تحميل التفاصيل spinner when opened from a home-feed card; photos, price, specs and location show immediately.",
          "A small loader sits where the description goes until the full ad arrives, then the description and view count appear.",
          "On the card and list views, مدخول العقار sits at the start (right) of its row, followed by the amount.",
        ],
        ar: [
          "لا تعرض النافذة مؤشر جاري تحميل التفاصيل الكامل عند فتحها من بطاقة في الرئيسية؛ تظهر الصور والسعر والمواصفات والموقع فوراً.",
          "يظهر مؤشر تحميل صغير مكان الوصف حتى يصل الإعلان كاملاً، ثم يظهر الوصف وعدد المشاهدات.",
          "في عرض البطاقات والقائمة، يأتي مدخول العقار في بداية السطر (اليمين) يليه المبلغ.",
        ],
      },
      testScenarios: {
        en: [
          "On a slow network, tap a card in الرئيسية (all/بيع/إيجار/بدل and the horizontal sliders) — the sheet opens with the card's content right away.",
          "Close and reopen the same ad — it opens complete with no loader.",
          "Open an ad with income in both card and list views — the label is on the right and the amount after it.",
        ],
        ar: [
          "على شبكة بطيئة، اضغط بطاقة في الرئيسية (الكل/بيع/إيجار/بدل والقوائم الأفقية) — تفتح النافذة بمحتوى البطاقة فوراً.",
          "أغلق نفس الإعلان وأعد فتحه — يفتح كاملاً دون مؤشر تحميل.",
          "افتح إعلاناً له مدخول في عرض البطاقات والقائمة — العنوان على اليمين والمبلغ بعده.",
        ],
      },
      updatedIn: "fix/property-host-avatar",
    },
    {
      id: "mobile-seller-trust-signals",
      title: {
        en: "Profiles show real rating, activity, sold count and response speed",
        ar: "الملفات تعرض تقييماً ونشاطاً وعدد مباع وسرعة رد حقيقية",
      },
      priority: "P1",
      story: {
        en: "QA: every advertiser profile showed 4.5 stars (214 تقييم), a permanent green نشط الآن, 2 sold and 30 دقيقة response time, even with 0 reviews in the summary below. The individual, company and office profiles, the ad host card and company cards now show only real data: the real rating and count (لا توجد تقييمات بعد when there are none), نشط الآن while the advertiser has the app open, نشط منذ X for up to a week, then nothing, the number of ads deleted as تم البيع, and a response-speed bucket (خلال دقائق / خلال ساعة / خلال ساعات / خلال يوم / أكثر من يوم) once there are at least 3 answered chats.",
        ar: "بلاغ QA: كان كل ملف معلن يعرض 4.5 نجوم (214 تقييم) ونشط الآن باللون الأخضر دائماً و2 مباع وسرعة رد 30 دقيقة، حتى مع 0 تقييمات في الملخص أسفلها. الآن ملفات الأفراد والشركات والمكاتب وبطاقة المعلن وبطاقات الشركات تعرض بيانات حقيقية فقط: التقييم وعدده الحقيقيان (لا توجد تقييمات بعد عند عدم وجودها)، ونشط الآن ما دام المعلن يفتح التطبيق، ونشط منذ X لمدة أسبوع ثم لا شيء، وعدد الإعلانات المحذوفة بسبب تم البيع، وفئة سرعة الرد (خلال دقائق / خلال ساعة / خلال ساعات / خلال يوم / أكثر من يوم) بعد 3 ردود على الأقل.",
      },
      acceptanceCriteria: {
        en: [
          "A profile with no reviews shows لا توجد تقييمات بعد, never 4.5 or 214; with reviews the header matches ملخص التقييم.",
          "نشط الآن shows only while that advertiser's app is open; otherwise نشط منذ X up to 7 days, then no badge.",
          "العقارات المباعة shows the real count (0 for none).",
          "سرعة الرد is hidden until there are 3 answered chats, then shows a bucket, never an invented number.",
          "Company cards and the ad host card hide the star when there are no reviews.",
          "A review can be just the stars: نشر works with the text box empty, and the review shows without an empty comment line.",
          "Typing a review keeps the text and نشر above the keyboard (the sheet grows and the box shrinks to fit).",
        ],
        ar: [
          "الملف بلا تقييمات يعرض لا توجد تقييمات بعد، وليس 4.5 أو 214؛ ومع وجود تقييمات يطابق الرأس ملخص التقييم.",
          "يظهر نشط الآن فقط ما دام تطبيق المعلن مفتوحاً؛ وإلا نشط منذ X حتى 7 أيام، ثم لا شارة.",
          "العقارات المباعة تعرض العدد الحقيقي (0 عند عدم وجودها).",
          "سرعة الرد مخفية حتى 3 ردود على محادثات، ثم تعرض فئة، وليس رقماً مخترعاً.",
          "بطاقات الشركات وبطاقة المعلن تخفي النجمة عند عدم وجود تقييمات.",
          "يمكن أن يكون التقييم بالنجوم فقط: يعمل زر نشر والنص فارغ، ويظهر التقييم دون سطر تعليق فارغ.",
          "عند كتابة التقييم يبقى النص وزر نشر فوق لوحة المفاتيح (تكبر النافذة ويصغر مربع النص ليتسع).",
        ],
      },
      testScenarios: {
        en: [
          "Open the profile of a new advertiser — لا توجد تقييمات بعد, no activity badge, sold 0, no response speed.",
          "On a second device, open the app as that advertiser, then refresh the profile — نشط الآن; close it, wait a few minutes and refresh — نشط منذ X دقيقة.",
          "Leave a review — the header shows the same rating and count as ملخص التقييم.",
          "As the advertiser, delete an ad with تم البيع — العقارات المباعة goes up by 1.",
          "Have the advertiser answer 3 chats within about 10 minutes — سرعة الرد shows خلال دقائق.",
        ],
        ar: [
          "افتح ملف معلن جديد — لا توجد تقييمات بعد، ولا شارة نشاط، والمباعة 0، ولا سرعة رد.",
          "على جهاز ثانٍ افتح التطبيق بحساب ذلك المعلن ثم حدّث الملف — نشط الآن؛ أغلقه وانتظر بضع دقائق وحدّث — نشط منذ X دقيقة.",
          "أضف تقييماً — يعرض الرأس نفس التقييم والعدد كما في ملخص التقييم.",
          "بصفتك المعلن احذف إعلاناً بسبب تم البيع — يزيد العقارات المباعة بواحد.",
          "اجعل المعلن يرد على 3 محادثات خلال 10 دقائق تقريباً — تظهر سرعة الرد خلال دقائق.",
        ],
      },
      updatedIn: "feat/real-trust-signals",
    },
    {
      id: "mobile-chat-push",
      title: {
        en: "A new chat message sends a push notification",
        ar: "الرسالة الجديدة في المحادثة ترسل إشعاراً",
      },
      priority: "P1",
      story: {
        en: "QA: sending a chat message notified nobody unless the recipient had the app open. Each new message now pushes to the devices currently using the recipient persona, titled with the sender's name and previewing the text (📷 صورة / 🏠 عقار for images and property cards). Tapping it opens the chat. No push goes to the sender, to someone already looking at that chat, to a device on another persona of the same account, or to an account with app notifications turned off.",
        ar: "بلاغ QA: إرسال رسالة لم يكن ينبه أحداً إلا إذا كان التطبيق مفتوحاً عند المستلم. الآن كل رسالة جديدة ترسل إشعاراً إلى الأجهزة التي تستخدم هوية المستلم حالياً، بعنوان اسم المرسل ومعاينة للنص (📷 صورة / 🏠 عقار للصور والعقارات). والضغط عليه يفتح المحادثة. لا يُرسل إشعار للمرسل، ولا لمن يشاهد تلك المحادثة الآن، ولا لجهاز على هوية أخرى في نفس الحساب، ولا لحساب أوقف إشعارات التطبيق.",
      },
      acceptanceCriteria: {
        en: [
          "With the recipient's app in the background or closed, a new message shows a notification with the sender's name and the message preview.",
          "Tapping the notification opens that conversation.",
          "With the app fully closed, tapping the notification starts the app, shows the launch screen, then opens the conversation on top of the home screen; Back returns to home and the user is still signed in.",
          "When the chat came from an ad, the notification names it first: 'عمارة للبيع · هاي'.",
          "No notification while the recipient has that conversation open on screen.",
          "A conversation left open when the app goes to the background does not count as open: the message arrives as a notification (Android kept the connection alive and used to get none), and on return the chat shows it.",
          "The sender never gets a notification for their own message.",
          "A device using a different persona of the recipient's account gets no notification.",
        ],
        ar: [
          "عندما يكون تطبيق المستلم في الخلفية أو مغلقاً، تظهر رسالة جديدة كإشعار باسم المرسل ومعاينة الرسالة.",
          "الضغط على الإشعار يفتح تلك المحادثة.",
          "والتطبيق مغلق تماماً: الضغط على الإشعار يشغّل التطبيق ويعرض شاشة البدء ثم يفتح المحادثة فوق الشاشة الرئيسية؛ والرجوع يعيد إلى الرئيسية والمستخدم ما زال مسجلاً.",
          "إذا بدأت المحادثة من إعلان، يذكره الإشعار أولاً: 'عمارة للبيع · هاي'.",
          "لا يظهر إشعار ما دام المستلم يفتح تلك المحادثة على الشاشة.",
          "المحادثة التي تُركت مفتوحة عند انتقال التطبيق إلى الخلفية لا تُعد مفتوحة: تصل الرسالة كإشعار (كان Android يُبقي الاتصال فلا يصله شيء)، وعند العودة تظهر الرسالة في المحادثة.",
          "لا يتلقى المرسل إشعاراً برسالته.",
          "الجهاز الذي يستخدم هوية أخرى في حساب المستلم لا يتلقى إشعاراً.",
        ],
      },
      testScenarios: {
        en: [
          "Two devices: put B's app in the background, send 'هاي' from A — B shows 'A's name / هاي'; tap it — the chat opens.",
          "With the chat open on B, send from A — the message appears, no notification.",
          "Android: open the chat on B, press Home (and again with the screen locked), send from A — B gets the notification; reopen the app — the message is in the chat.",
          "iPhone: swipe the app away, send from A, tap the notification on B — the chat opens with its messages; press Back — home, signed in; close and reopen the app — still signed in.",
          "Send an image and a property card — B's notifications say 📷 صورة and 🏠 عقار.",
          "Turn off app notifications on B's account, send again — no notification.",
        ],
        ar: [
          "جهازان: ضع تطبيق B في الخلفية وأرسل 'هاي' من A — يظهر على B إشعار 'اسم A / هاي'؛ اضغطه — تفتح المحادثة.",
          "والمحادثة مفتوحة على B، أرسل من A — تظهر الرسالة دون إشعار.",
          "Android: افتح المحادثة على B واضغط زر الرئيسية (ومرة أخرى والشاشة مقفلة)، وأرسل من A — يصل الإشعار إلى B؛ أعد فتح التطبيق — الرسالة في المحادثة.",
          "iPhone: أغلق التطبيق بالسحب، وأرسل من A، واضغط الإشعار على B — تُفتح المحادثة برسائلها؛ اضغط رجوع — الرئيسية وأنت مسجل؛ أغلق التطبيق وافتحه — ما زلت مسجلاً.",
          "أرسل صورة وبطاقة عقار — تقول إشعارات B 📷 صورة و 🏠 عقار.",
          "أوقف إشعارات التطبيق في حساب B وأرسل مجدداً — لا يظهر إشعار.",
        ],
      },
      updatedIn: "fix/chat-push-while-backgrounded",
    },
    {
      id: "mobile-chat-unavailable-user",
      title: {
        en: "A chat with a deleted, suspended or blocked account is read-only",
        ar: "المحادثة مع حساب محذوف أو معلّق أو محظور للقراءة فقط",
      },
      priority: "P1",
      story: {
        en: "QA: when the other person's account was deleted, deactivated or banned, the chat looked normal and messages could still be typed; they failed or went nowhere. The chat now says so: in place of the message field a notice reads 'هذا المستخدم لم يعد متاحاً' with 'لا يمكن إرسال رسائل جديدة في هذه المحادثة.' The earlier messages stay readable, the header shows no 'متصل' or 'يكتب الان...', and there is no +, microphone or send button. The notice is the same for all three cases, so it never says which. It comes from the server's `otherUser.isAvailable`; the notice appears once the API with that field is deployed.",
        ar: "بلاغ QA: حين يُحذف حساب الطرف الآخر أو يُعطَّل أو يُحظر كانت المحادثة تبدو عادية ويمكن كتابة الرسائل، فتفشل أو لا تصل لأحد. الآن تذكر المحادثة ذلك: مكان حقل الرسالة يظهر تنبيه 'هذا المستخدم لم يعد متاحاً' مع 'لا يمكن إرسال رسائل جديدة في هذه المحادثة.' وتبقى الرسائل السابقة مقروءة، ولا تعرض الترويسة 'متصل' ولا 'يكتب الان...'، ولا يوجد زر + ولا ميكروفون ولا إرسال. التنبيه واحد للحالات الثلاث فلا يذكر أيها. ومصدره `otherUser.isAvailable` من الخادم؛ ويظهر التنبيه بعد نشر الـ API الذي يحمل هذا الحقل.",
      },
      acceptanceCriteria: {
        en: [
          "Other account deleted: the chat opens with its history and the notice; nothing can be typed or attached.",
          "Other account suspended by its owner or by an admin, or blocked: same notice.",
          "When a suspended account comes back, reopening the chat shows the message field again.",
          "An available account: the chat is unchanged, with its message field.",
        ],
        ar: [
          "حساب الطرف الآخر محذوف: تُفتح المحادثة بسجلها والتنبيه؛ ولا يمكن الكتابة ولا الإرفاق.",
          "حساب الطرف الآخر معلّق من صاحبه أو من الإدارة، أو محظور: التنبيه نفسه.",
          "حين يعود الحساب المعلّق تعرض المحادثة حقل الرسالة من جديد عند فتحها.",
          "الحساب المتاح: المحادثة كما هي بحقل الرسالة.",
        ],
      },
      testScenarios: {
        en: [
          "A and B chat; block B from the admin portal; A opens the chat — notice, no field. Unblock B; A reopens — the field is back.",
          "B deactivates their own account; A opens the chat — notice.",
          "B deletes their account; A opens the chat — the old messages and the notice.",
        ],
        ar: [
          "A و B يتحادثان؛ احظر B من بوابة الإدارة؛ يفتح A المحادثة — تنبيه بلا حقل. ألغِ الحظر؛ يعيد A الفتح — يعود الحقل.",
          "B يعطّل حسابه بنفسه؛ يفتح A المحادثة — تنبيه.",
          "B يحذف حسابه؛ يفتح A المحادثة — الرسائل القديمة والتنبيه.",
        ],
      },
      updatedIn: "feat/chat-unavailable-user",
    },
    {
      id: "mobile-identity-contact-phone",
      title: {
        en: "Each persona can use the account's phone or its own verified number",
        ar: "كل هوية تستخدم رقم الحساب أو رقمها الخاص الموثّق",
      },
      priority: "P1",
      story: {
        en: "In the edit profile of an individual, company or office there's a box 'استخدم رقم هاتف الحساب للتواصل مع هذه الهوية' (ticked by default, today's behaviour). Unticked, the persona gets its own number (e.g. a company's line): it's proven with an SMS code, then becomes what people call on that persona's ads and profile. Ticking it again goes back to the account's number; the verified own number is kept for later. New ads start with the persona's contact number in the phone field (never a made-up number).",
        ar: "في تعديل الملف الشخصي للفرد أو الشركة أو المكتب يوجد مربع 'استخدم رقم هاتف الحساب للتواصل مع هذه الهوية' (محدد افتراضياً كما الآن). عند إلغاء تحديده تحصل الهوية على رقمها الخاص (مثل خط الشركة): يُوثّق برمز SMS ثم يصبح الرقم الذي يتصل به الناس في إعلانات تلك الهوية وملفها. وتحديده مجدداً يعيدها إلى رقم الحساب مع حفظ الرقم الخاص الموثّق للاحقاً. والإعلانات الجديدة تبدأ برقم تواصل الهوية في حقل الهاتف (وليس رقماً مخترعاً).",
      },
      acceptanceCriteria: {
        en: [
          "The box is ticked by default and shows the account's number.",
          "Unticked, a new number must pass the SMS code before it's used; until then the account's number stays in use.",
          "After verifying, the persona's ads and profile call the new number; the account's sign-in phone is unchanged.",
          "Ticking the box returns to the account's number; unticking again reuses the verified own number with no new code.",
          "The office and company forms no longer pre-fill made-up numbers (58094586 / 60468839).",
        ],
        ar: [
          "المربع محدد افتراضياً ويعرض رقم الحساب.",
          "عند إلغاء التحديد يجب أن يجتاز الرقم الجديد رمز SMS قبل استخدامه؛ وحتى ذلك الحين يبقى رقم الحساب مستخدماً.",
          "بعد التوثيق تتصل إعلانات الهوية وملفها بالرقم الجديد؛ ويبقى رقم تسجيل الدخول للحساب كما هو.",
          "تحديد المربع يعيد رقم الحساب؛ وإلغاء تحديده مجدداً يستخدم الرقم الخاص الموثّق دون رمز جديد.",
          "نماذج المكتب والشركة لم تعد تملأ أرقاماً مخترعة مسبقاً (58094586 / 60468839).",
        ],
      },
      testScenarios: {
        en: [
          "As a company, untick the box, enter a new mobile number, verify the SMS code — the company profile's call button dials it.",
          "Enter a wrong code — nothing changes; the account's number is still used.",
          "Tick the box again — the profile calls the account's number.",
          "Start a new ad as that company — the phone field already holds its contact number.",
        ],
        ar: [
          "كشركة ألغِ تحديد المربع وأدخل رقم جوال جديداً ووثّقه برمز SMS — زر الاتصال في ملف الشركة يتصل به.",
          "أدخل رمزاً خاطئاً — لا يتغير شيء ويبقى رقم الحساب مستخدماً.",
          "حدد المربع مجدداً — يتصل الملف برقم الحساب.",
          "ابدأ إعلاناً جديداً بهذه الشركة — حقل الهاتف يحمل رقم تواصلها مسبقاً.",
        ],
      },
      updatedIn: "feat/identity-contact-phone",
    },
    {
      id: "mobile-no-whatsapp-business",
      title: {
        en: "Companies and offices are reached by phone or chat, not WhatsApp",
        ar: "التواصل مع الشركات والمكاتب بالهاتف أو المحادثة وليس الواتساب",
      },
      priority: "P2",
      story: {
        en: "Companies and offices have no WhatsApp: their edit profile has no رقم الواتساب field, and their ads (details sheet and full page) show only call and in-app chat. Individuals keep WhatsApp. An ad with no number shows 'لا يوجد رقم هاتف متاح لهذا الإعلان' instead of dialing a made-up number.",
        ar: "الشركات والمكاتب ليس لها واتساب: لا يوجد حقل رقم الواتساب في تعديل ملفها، وإعلاناتها (النافذة والصفحة الكاملة) تعرض الاتصال والمحادثة داخل التطبيق فقط. ويبقى الواتساب للأفراد. والإعلان بلا رقم يعرض 'لا يوجد رقم هاتف متاح لهذا الإعلان' بدل الاتصال برقم مخترع.",
      },
      acceptanceCriteria: {
        en: [
          "Company and office edit profiles have no رقم الواتساب field.",
          "A company's or office's ad shows call + chat only, in both the details sheet and the full ad page.",
          "An individual's ad still shows call + WhatsApp + chat.",
        ],
        ar: [
          "لا يوجد حقل رقم الواتساب في تعديل ملف الشركة أو المكتب.",
          "إعلان الشركة أو المكتب يعرض الاتصال والمحادثة فقط في النافذة وفي صفحة الإعلان الكاملة.",
          "إعلان الفرد ما زال يعرض الاتصال والواتساب والمحادثة.",
        ],
      },
      testScenarios: {
        en: [
          "Open an office's ad from Home — no WhatsApp button; call and chat work.",
          "Open an individual's ad — the WhatsApp button is there.",
          "Open a company's edit profile — no WhatsApp field.",
        ],
        ar: [
          "افتح إعلان مكتب من الرئيسية — لا يوجد زر واتساب؛ والاتصال والمحادثة يعملان.",
          "افتح إعلان فرد — زر الواتساب موجود.",
          "افتح تعديل ملف شركة — لا يوجد حقل واتساب.",
        ],
      },
      updatedIn: "feat/identity-contact-phone",
    },
    {
      id: "mobile-chat-list-preview-alignment",
      title: {
        en: "محادثاتي: the last-message preview sits on the right, under the name",
        ar: "محادثاتي: معاينة آخر رسالة على اليمين تحت الاسم",
      },
      priority: "P2",
      story: {
        en: "QA bug fix: in the chat list the last-message preview ('بدء المحادثة', 'هندسه'…) was pushed to the left edge while the name and the property tag were on the right. It now starts on the right, directly under the name; the time and the read ticks / unread badge stay on the left.",
        ar: "إصلاح بلاغ QA: في قائمة المحادثات كانت معاينة آخر رسالة ('بدء المحادثة' و'هندسه'…) مدفوعة إلى الحافة اليسرى بينما الاسم ووسم العقار على اليمين. الآن تبدأ من اليمين مباشرة تحت الاسم؛ ويبقى الوقت وعلامات القراءة/شارة غير المقروء على اليسار.",
      },
      acceptanceCriteria: {
        en: [
          "Each row's preview text starts on the right edge, under the name (and the property tag when there is one).",
          "The time stays on the left of the name line; the ticks or unread badge stay on the left of the preview line.",
          "Long previews are cut with … on the left side.",
          "The unread number sits in the middle of its red circle, fully visible (1, 2, 9+), on iPhone and Android; the circle touches neither the name nor the preview, and a long name is cut with … on its own line.",
        ],
        ar: [
          "نص المعاينة في كل صف يبدأ من الحافة اليمنى تحت الاسم (ووسم العقار إن وُجد).",
          "يبقى الوقت يسار سطر الاسم؛ وتبقى العلامات أو شارة غير المقروء يسار سطر المعاينة.",
          "المعاينات الطويلة تُقطع بـ … من الجهة اليسرى.",
          "رقم غير المقروء في منتصف دائرته الحمراء وظاهر كاملاً (1، 2، 9+) في iPhone و Android؛ والدائرة لا تلامس الاسم ولا المعاينة، والاسم الطويل يُقطع بـ … في سطره.",
        ],
      },
      testScenarios: {
        en: [
          "Open محادثاتي with a chat that has a short message and one with a property tag — both previews line up under the name on the right.",
          "iPhone: receive 2 messages, then more than 9, in a chat whose other person has a long name — the badge shows 2 then 9+, centred, and the name is not covered.",
        ],
        ar: [
          "افتح محادثاتي بمحادثة برسالة قصيرة وأخرى بوسم عقار — تصطف المعاينتان تحت الاسم على اليمين.",
          "iPhone: استقبل رسالتين ثم أكثر من 9 في محادثة مع شخص اسمه طويل — تعرض الشارة 2 ثم 9+ في المنتصف، والاسم غير مغطى.",
        ],
      },
      updatedIn: "fix/chat-list-unread-badge",
    },
    {
      id: "mobile-status-bar-icons",
      title: {
        en: "The clock and system icons stay visible at the top of every screen",
        ar: "الساعة وأيقونات النظام تبقى ظاهرة أعلى كل شاشة",
      },
      priority: "P1",
      story: {
        en: "QA (Samsung A36): the status bar was white with white time, battery and signal icons, so they could not be seen. The app's screens are light whatever the phone's theme, but with the phone in dark mode Android drew light icons. The app now asks for dark icons everywhere; the dark screens (the launch screen and the full-screen photo viewer) ask for light icons while they are open.",
        ar: "بلاغ QA (Samsung A36): كان شريط الحالة أبيض وأيقونات الوقت والبطارية والإشارة بيضاء فلا تُرى. شاشات التطبيق فاتحة أياً كان مظهر الهاتف، لكن مع الوضع الداكن في الهاتف كان Android يرسم أيقونات فاتحة. يطلب التطبيق الآن أيقونات داكنة في كل مكان؛ والشاشات الداكنة (شاشة البدء وعارض الصور بملء الشاشة) تطلب أيقونات فاتحة ما دامت مفتوحة.",
      },
      acceptanceCriteria: {
        en: [
          "With the phone in dark mode and in light mode, the time, battery and signal icons are dark and readable on the home, chats, activity, more, ad details and settings screens, on Android and iPhone.",
          "On the dark-blue launch screen and in the full-screen photo viewer the icons are light; closing the viewer brings back dark icons.",
          "Nothing else about the top of the screens changes: headers keep their place below the status bar.",
        ],
        ar: [
          "مع الوضع الداكن والوضع الفاتح في الهاتف تكون أيقونات الوقت والبطارية والإشارة داكنة ومقروءة في الرئيسية والمحادثات ونشاطي والمزيد وتفاصيل الإعلان والإعدادات، في Android و iPhone.",
          "في شاشة البدء الكحلية وفي عارض الصور بملء الشاشة تكون الأيقونات فاتحة؛ وإغلاق العارض يعيد الأيقونات الداكنة.",
          "لا يتغير شيء آخر أعلى الشاشات: تبقى الترويسات في مكانها تحت شريط الحالة.",
        ],
      },
      testScenarios: {
        en: [
          "Android, phone set to dark mode: open the app and walk through the tabs — the clock is readable on every screen.",
          "Open an ad's photo full screen, then close it — light icons over the photo, dark icons after.",
          "Repeat with the phone in light mode, and on an iPhone in dark mode.",
        ],
        ar: [
          "Android والهاتف في الوضع الداكن: افتح التطبيق وتنقّل بين التبويبات — الساعة مقروءة في كل شاشة.",
          "افتح صورة إعلان بملء الشاشة ثم أغلقها — أيقونات فاتحة فوق الصورة وداكنة بعدها.",
          "كرّر والهاتف في الوضع الفاتح، وعلى iPhone في الوضع الداكن.",
        ],
      },
      updatedIn: "fix/android-status-bar-icons",
    },
    {
      id: "mobile-tab-bar-above-system-bar",
      title: {
        en: "The bottom tab bar sits above Android's navigation bar",
        ar: "شريط التبويبات السفلي فوق شريط التنقل في Android",
      },
      priority: "P1",
      story: {
        en: "QA (Galaxy A36): Android's own navigation bar (the gesture line or the 3 buttons) drew over the app's bottom tabs. The app draws edge to edge, and the tab bar kept a fixed 16px under its tabs. It now keeps the navigation bar's real height there (at least 16px), so the tabs and the + button sit above it; the navy bar still runs to the bottom edge behind it. Lists on the tab screens leave the same extra room so their last item isn't hidden.",
        ar: "بلاغ QA (Galaxy A36): كان شريط التنقل الخاص بـ Android (خط الإيماءات أو الأزرار الثلاثة) يُرسم فوق تبويبات التطبيق السفلية. التطبيق يُرسم على كامل الشاشة، وكان شريط التبويبات يترك 16px ثابتة تحت التبويبات. الآن يترك الارتفاع الحقيقي لشريط التنقل (16px على الأقل)، فتكون التبويبات وزر + فوقه؛ ويبقى الشريط الكحلي ممتداً إلى أسفل الشاشة خلفه. والقوائم في شاشات التبويبات تترك المسافة نفسها كي لا يختفي آخر عنصر.",
      },
      acceptanceCriteria: {
        en: [
          "Android with 3-button navigation and with gesture navigation: the tab icons, their labels and the + button are fully above the system bar and can be tapped; nothing overlaps.",
          "The last item of the home, activity, chats and more screens can be scrolled into view above the tab bar.",
          "iPhone is unchanged.",
        ],
        ar: [
          "Android بأزرار التنقل الثلاثة وبالإيماءات: أيقونات التبويبات وأسماؤها وزر + فوق شريط النظام كاملة ويمكن الضغط عليها؛ ولا يوجد تداخل.",
          "يمكن تمرير آخر عنصر في الرئيسية ونشاطي والمحادثات والمزيد ليظهر فوق شريط التبويبات.",
          "لا تغيير في iPhone.",
        ],
      },
      testScenarios: {
        en: [
          "Galaxy A36: switch the phone between gesture navigation and the 3 buttons (Settings > Display > Navigation bar) and look at the tab bar on the individual, company and office accounts.",
        ],
        ar: [
          "Galaxy A36: بدّل الهاتف بين التنقل بالإيماءات والأزرار الثلاثة (الإعدادات > الشاشة > شريط التنقل) وانظر إلى شريط التبويبات في حسابات الفرد والشركة والمكتب.",
        ],
      },
      updatedIn: "fix/android-tab-bar-insets",
    },
    {
      id: "mobile-image-viewer",
      title: {
        en: "Photos open full screen with swipe and zoom",
        ar: "الصور تفتح بملء الشاشة مع التنقل والتكبير",
      },
      priority: "P2",
      story: {
        en: "Tapping a photo opens it full screen: on the ad page, in the تفاصيل العقار sheet, on a company's معرض الأعمال project (all of that project's photos) and in chat (all of the conversation's images). Swipe between photos with an 'n / total' counter; pinch (up to 4x) or double-tap to zoom in and out at the touched point, pan while zoomed; swipe down or ✕ (or Android back) to close; tap once to hide the top bar. The company gallery no longer shows stock projects: a company with none shows 'لا توجد أعمال في المعرض بعد'.",
        ar: "الضغط على صورة يفتحها بملء الشاشة: في صفحة الإعلان، وفي نافذة تفاصيل العقار، وفي مشروع ضمن معرض الأعمال للشركة (كل صور المشروع)، وفي المحادثة (كل صور المحادثة). تنقّل بين الصور مع عدّاد 'n / الإجمالي'؛ قرّب أو بعّد بإصبعين (حتى 4x) أو بالضغط المزدوج عند النقطة الملموسة، وحرّك الصورة أثناء التكبير؛ اسحب للأسفل أو ✕ (أو زر الرجوع في Android) للإغلاق؛ وضغطة واحدة تخفي الشريط العلوي. ولم يعد معرض الشركة يعرض مشاريع وهمية: الشركة بلا مشاريع تعرض 'لا توجد أعمال في المعرض بعد'.",
      },
      acceptanceCriteria: {
        en: [
          "Tapping any photo in the four places opens the viewer at that photo, with the right counter.",
          "Pinch and double-tap zoom in and out; a zoomed photo can be moved but not past its edges; swiping to another photo resets the zoom.",
          "Swipe down (not zoomed), ✕ or Android back closes the viewer.",
          "The photo is visible as soon as the viewer has opened, with no swipe needed; while a photo is still downloading a spinner shows in its place, never a plain black screen.",
          "The no-image placeholder doesn't open the viewer.",
          "The company gallery shows only real projects, or the empty message.",
        ],
        ar: [
          "الضغط على أي صورة في الأماكن الأربعة يفتح العارض عند تلك الصورة بالعدّاد الصحيح.",
          "التكبير بإصبعين والضغط المزدوج يقرّبان ويبعّدان؛ ويمكن تحريك الصورة المكبّرة دون تجاوز حوافها؛ والانتقال لصورة أخرى يعيد التكبير.",
          "السحب للأسفل (دون تكبير) أو ✕ أو زر الرجوع في Android يغلق العارض.",
          "تظهر الصورة فور فتح العارض دون حاجة إلى سحب؛ وأثناء تنزيل الصورة يظهر مؤشر تحميل مكانها، لا شاشة سوداء فارغة.",
          "الصورة البديلة عند عدم وجود صور لا تفتح العارض.",
          "معرض الشركة يعرض المشاريع الحقيقية فقط أو رسالة عدم وجودها.",
        ],
      },
      testScenarios: {
        en: [
          "Open the 250,000 building ad, tap the second photo — full screen at '2 / n'; swipe through; pinch in, pan, double-tap out; swipe down to close.",
          "From the home feed, open تفاصيل العقار and tap a photo — same viewer.",
          "iPhone: open several ads in turn and tap the first photo of each, then a middle one — every time the photo shows without swiping, at the right counter.",
          "Open a company with projects → معرض الأعمال → tap a project with several photos — '1 / n' over that project's photos.",
          "In a chat with images, tap one — the viewer opens on it and swipes to the conversation's other images.",
        ],
        ar: [
          "افتح إعلان العمارة بـ 250,000 واضغط الصورة الثانية — بملء الشاشة عند '2 / n'؛ تنقّل؛ كبّر بإصبعين وحرّك ثم بعّد بضغط مزدوج؛ واسحب للأسفل للإغلاق.",
          "من الرئيسية افتح تفاصيل العقار واضغط صورة — نفس العارض.",
          "iPhone: افتح عدة إعلانات بالتتابع واضغط الصورة الأولى في كل منها ثم صورة في الوسط — تظهر الصورة كل مرة دون سحب وبالعدّاد الصحيح.",
          "افتح شركة لها مشاريع ← معرض الأعمال ← اضغط مشروعاً بعدة صور — '1 / n' لصور ذلك المشروع.",
          "في محادثة فيها صور اضغط إحداها — يفتح العارض عليها ويتنقّل بين صور المحادثة الأخرى.",
        ],
      },
      updatedIn: "fix/image-viewer-black-first-open",
    },
    {
      id: "mobile-property-card-price-swipe",
      title: {
        en: "Listing card: undisclosed price and swipe-safe photos",
        ar: "بطاقة العقار: السعر غير معلن وتمرير الصور دون فتح التفاصيل",
      },
      priority: "P2",
      story: {
        en: "A listing card with no price shows 'السعر غير معلن' instead of a lone 'د.ك'. Swiping the card's photos moves between photos and no longer opens the details sheet; only a tap opens it.",
        ar: "بطاقة العقار بدون سعر تعرض 'السعر غير معلن' بدل 'د.ك' وحدها. تمرير صور البطاقة ينتقل بين الصور ولا يفتح نافذة التفاصيل؛ الضغط فقط هو ما يفتحها.",
      },
      acceptanceCriteria: {
        en: [
          "A card whose price is empty or 0 shows 'السعر غير معلن' and no currency.",
          "A card with a price still shows the number and 'د.ك'.",
          "Swiping the photos never opens the details sheet; tapping the card does.",
        ],
        ar: [
          "البطاقة التي سعرها فارغ أو 0 تعرض 'السعر غير معلن' بدون العملة.",
          "البطاقة التي لها سعر ما زالت تعرض الرقم و'د.ك'.",
          "تمرير الصور لا يفتح نافذة التفاصيل أبداً، والضغط على البطاقة يفتحها.",
        ],
      },
      testScenarios: {
        en: [
          "Open the home feed, find the ad with no price — it reads 'السعر غير معلن'.",
          "On a card with several photos, swipe quickly and slowly — photos change and no sheet opens; tap the card — the sheet opens.",
        ],
        ar: [
          "افتح الرئيسية وابحث عن إعلان بلا سعر — يظهر 'السعر غير معلن'.",
          "على بطاقة بعدة صور مرّر بسرعة وببطء — تتغير الصور ولا تُفتح النافذة؛ اضغط البطاقة — تُفتح النافذة.",
        ],
      },
      updatedIn: "fix/property-card-price-swipe",
    },
    {
      id: "mobile-chat-reply-and-options",
      title: {
        en: "Reply to a message (swipe right) and long-press options",
        ar: "الرد على رسالة (السحب لليمين) وخيارات الضغط المطوّل",
      },
      priority: "P1",
      story: {
        en: "Like WhatsApp: swipe a message to the right (or long-press → رد) to reply to it. A 'الرد على …' bar shows above the input with ✕ to cancel; the sent reply shows the quoted message on top (name: أنت or the other person), and tapping the quote jumps to the original and tints it briefly. A quoted message that was deleted shows 'رسالة محذوفة'. Long-pressing a message opens رد / نسخ (text only) / حذف لدي, which removes it on your side only; the other person still sees it.",
        ar: "مثل الواتساب: اسحب الرسالة لليمين (أو اضغط مطولاً ← رد) للرد عليها. يظهر شريط 'الرد على …' فوق حقل الكتابة مع ✕ للإلغاء؛ ويظهر الرد المرسل وفوقه الرسالة المقتبسة (الاسم: أنت أو الطرف الآخر)، والضغط على الاقتباس ينتقل إلى الرسالة الأصلية ويلوّنها لحظة. والرسالة المقتبسة المحذوفة تظهر 'رسالة محذوفة'. والضغط المطوّل على رسالة يفتح رد / نسخ (للنص فقط) / حذف لدي، الذي يحذفها من جهتك فقط ويبقيها عند الطرف الآخر.",
      },
      acceptanceCriteria: {
        en: [
          "Swiping a message to the right past the reply icon starts a reply (with a light vibration); swiping left or scrolling doesn't.",
          "The reply is quoted on both phones, with the right name; tapping the quote jumps to the original.",
          "نسخ copies the text; حذف لدي removes the message on this side only and survives reopening the chat.",
          "A message still sending can't be replied to or deleted yet.",
          "Under a one-word reply the quote keeps a readable width; the quoted name stays on one line.",
        ],
        ar: [
          "سحب الرسالة لليمين بعد أيقونة الرد يبدأ الرد (مع اهتزاز خفيف)؛ والسحب لليسار أو التمرير لا يبدأه.",
          "يظهر الاقتباس على الهاتفين بالاسم الصحيح؛ والضغط عليه ينتقل إلى الرسالة الأصلية.",
          "نسخ ينسخ النص؛ وحذف لدي يحذف الرسالة من هذه الجهة فقط ويبقى بعد إعادة فتح المحادثة.",
          "الرسالة قيد الإرسال لا يمكن الرد عليها أو حذفها بعد.",
          "تحت رد من كلمة واحدة يحتفظ الاقتباس بعرض مقروء، ويبقى الاسم المقتبس في سطر واحد.",
        ],
      },
      testScenarios: {
        en: [
          "Two devices: on A swipe B's message right, type and send — both see the quote; on A tap the quote — it jumps to B's message.",
          "Long-press your own text message → نسخ, paste elsewhere — same text.",
          "Long-press a message → حذف لدي — gone on A, still on B; reopen the chat on A — still gone.",
        ],
        ar: [
          "جهازان: على A اسحب رسالة B لليمين واكتب وأرسل — يرى الطرفان الاقتباس؛ وعلى A اضغط الاقتباس — ينتقل إلى رسالة B.",
          "اضغط مطولاً على رسالتك النصية ← نسخ، والصق في مكان آخر — النص نفسه.",
          "اضغط مطولاً على رسالة ← حذف لدي — تختفي على A وتبقى على B؛ أعد فتح المحادثة على A — ما زالت محذوفة.",
        ],
      },
      updatedIn: "fix/reply-quote-width",
    },
    {
      id: "mobile-chat-attachments",
      title: {
        en: "Send photos, camera shots and documents in chat",
        ar: "إرسال الصور والكاميرا والمستندات في المحادثة",
      },
      priority: "P1",
      story: {
        en: "In a chat, + swaps the keyboard for an attachment panel of the same height, like WhatsApp (the + becomes a keyboard icon to switch back; tapping the text field also brings the keyboard back): الصور (up to 10 at once) / الكاميرا / مستند (PDF, Word, Excel). A preview shows the picked files to remove any and add an optional caption, then إرسال. The bubble appears at once with upload progress; on failure it shows 'تعذر الإرسال · إعادة المحاولة'. Photos show as one large image or a grid (+N beyond 4) and open in the full-screen viewer; a document shows as a card (type, name, size) and opens the phone's preview/share sheet. Files are private: only the two people in the chat can open them, through links that expire after 15 minutes and are renewed automatically. The chats list and the push show '📷 صورة', '📷 3 صور' or '📎 file name'.",
        ar: "في المحادثة، + يستبدل لوحة المفاتيح بلوحة مرفقات بنفس الارتفاع مثل الواتساب (يتحول + إلى أيقونة لوحة مفاتيح للرجوع، والضغط على حقل الكتابة يعيد لوحة المفاتيح أيضاً): الصور (حتى 10 مرة واحدة) / الكاميرا / مستند (PDF و Word و Excel). تظهر معاينة للملفات المختارة لإزالة أي منها وإضافة تعليق اختياري، ثم إرسال. تظهر الرسالة فوراً مع نسبة الرفع؛ وعند الفشل تظهر 'تعذر الإرسال · إعادة المحاولة'. تظهر الصور كصورة كبيرة أو شبكة (+N بعد 4) وتفتح في العارض بملء الشاشة؛ ويظهر المستند كبطاقة (النوع والاسم والحجم) ويفتح في معاينة/مشاركة الهاتف. الملفات خاصة: لا يفتحها إلا طرفا المحادثة، عبر روابط تنتهي بعد 15 دقيقة وتُجدد تلقائياً. وتظهر في قائمة المحادثات والإشعار '📷 صورة' أو '📷 3 صور' أو '📎 اسم الملف'.",
      },
      acceptanceCriteria: {
        en: [
          "Photos up to 10 MB each and documents up to 20 MB; more than 10 files, a bigger file or another type (zip, video) is refused with a clear message.",
          "Several photos sent together are one message, shown as a grid on both phones; a caption shows under them.",
          "A failed upload stays as a bubble with retry; retrying sends it once.",
          "A chat file's link doesn't open for anyone outside the chat, and the raw storage address is denied.",
          "Replying to a message while attaching quotes it on the sent attachment.",
          "A sent file's bubble appears at once with its progress and stays on screen until it is sent: it never disappears in between, also when the chat reloads after coming back from the file picker (Android), and it turns into the sent message in place, without a flicker.",
          "A failed send keeps its bubble with retry when the chat reloads.",
        ],
        ar: [
          "الصور حتى 10 ميجابايت لكل صورة والمستندات حتى 20 ميجابايت؛ وأكثر من 10 ملفات أو ملف أكبر أو نوع آخر (zip، فيديو) يُرفض برسالة واضحة.",
          "الصور المرسلة معاً رسالة واحدة تظهر كشبكة على الهاتفين، والتعليق يظهر تحتها.",
          "الرفع الفاشل يبقى كرسالة مع إعادة المحاولة، وإعادة المحاولة ترسلها مرة واحدة.",
          "رابط ملف المحادثة لا يفتح لأي شخص خارجها، وعنوان التخزين المباشر مرفوض.",
          "الرد على رسالة أثناء الإرفاق يظهر الاقتباس على المرفق المرسل.",
          "فقاعة الملف المرسل تظهر فوراً بتقدّم الرفع وتبقى على الشاشة حتى يُرسل: لا تختفي في الأثناء، حتى حين تُعاد تحميل المحادثة بعد العودة من منتقي الملفات (Android)، وتتحول إلى الرسالة المرسلة في مكانها دون وميض.",
          "الإرسال الفاشل يحتفظ بفقاعته مع إعادة المحاولة عند إعادة تحميل المحادثة.",
        ],
      },
      testScenarios: {
        en: [
          "Two devices: on A send 3 gallery photos with a caption — B sees a grid and the caption, gets the push '📷 3 صور'; tap a photo — viewer opens, swipe between them.",
          "On A send a PDF — B taps the card — the phone's preview opens the file; the chats list shows '📎 name.pdf'.",
          "Turn off the network on A, send a photo — retry appears; turn it on, tap retry — sent once.",
          "Wait over 15 minutes in an open chat, then tap a document — it still opens (link renewed).",
          "Android, current store build (1.5.0): tap a PDF — it opens to be read in the in-app browser tab, not the share chooser; tap a Word or Excel file — the share chooser, as before.",
          "Android, a build that includes the viewer module (the next store build): tap a PDF, Word or Excel file — it opens in the phone's own app for that type; with no such app installed the share chooser shows.",
          "iPhone: tap a PDF, Word or Excel file — it opens to be read in the in-app Safari sheet (its share button saves or sends it); a file of yours that is still uploading opens through the system sheet.",
          "Send a PDF: your own bubble shows no download icon (the other person's does); tap it while it is still uploading — your copy opens from the phone; tap it after it is sent — it opens the same way a received file does.",
          "Open the same received document twice — the second time it opens without downloading again (also with the phone offline).",
          "Take a photo with the camera and send it (Android: check the camera permission prompt).",
          "Refuse the camera, then press الكاميرا again — 'الإذن مطلوب' shows with فتح الإعدادات; press it — the app's settings page opens; allow the camera and come back — it opens.",
        ],
        ar: [
          "جهازان: على A أرسل 3 صور من المعرض مع تعليق — يرى B شبكة والتعليق ويصله إشعار '📷 3 صور'؛ اضغط صورة — يفتح العارض والتنقل بينها بالسحب.",
          "على A أرسل ملف PDF — يضغط B البطاقة — تفتح معاينة الهاتف الملف؛ وتظهر قائمة المحادثات '📎 الاسم.pdf'.",
          "افصل الشبكة على A وأرسل صورة — تظهر إعادة المحاولة؛ أعد الاتصال واضغطها — تُرسل مرة واحدة.",
          "انتظر أكثر من 15 دقيقة في محادثة مفتوحة ثم اضغط مستنداً — يفتح (تجدد الرابط).",
          "Android بالبناء الحالي في المتجر (1.5.0): اضغط ملف PDF — يُفتح للقراءة في تبويب المتصفح داخل التطبيق لا في قائمة المشاركة؛ واضغط ملف Word أو Excel — قائمة المشاركة كما كانت.",
          "Android ببناء يتضمن وحدة العرض (البناء القادم): اضغط ملف PDF أو Word أو Excel — يُفتح في تطبيق الهاتف المخصص لنوعه؛ وإن لم يوجد تطبيق له تظهر قائمة المشاركة.",
          "iPhone: اضغط ملف PDF أو Word أو Excel — يُفتح للقراءة في نافذة Safari داخل التطبيق (وزر المشاركة فيها للحفظ أو الإرسال)؛ وملفك الذي ما زال يُرفع يُفتح عبر نافذة النظام.",
          "أرسل ملف PDF: فقاعتك بلا أيقونة تنزيل (وفقاعة الطرف الآخر بها)؛ اضغطها أثناء الرفع — تُفتح نسختك من الهاتف؛ واضغطها بعد الإرسال — تُفتح كما يُفتح الملف المستلَم.",
          "افتح المستند المستلَم نفسه مرتين — في المرة الثانية يُفتح دون تنزيل جديد (وحتى والهاتف دون اتصال).",
          "التقط صورة بالكاميرا وأرسلها (Android: تحقق من طلب إذن الكاميرا).",
          "ارفض الكاميرا ثم اضغط الكاميرا مجدداً — يظهر 'الإذن مطلوب' مع فتح الإعدادات؛ اضغطه — تُفتح صفحة إعدادات التطبيق؛ اسمح بالكاميرا وعُد — تُفتح.",
        ],
      },
      updatedIn: "fix/chat-sent-file-flicker",
    },
    {
      id: "mobile-chat-media-cache",
      title: {
        en: "Chat photos and voice notes are kept on the phone, not downloaded on every visit",
        ar: "صور المحادثة ورسائلها الصوتية تُحفظ على الهاتف ولا تُنزَّل في كل زيارة",
      },
      priority: "P2",
      story: {
        en: "QA: every time a chat was reopened its photos, video stills and voice notes loaded again. Chat files are private, so the server signs a new link for each one on every load of the messages, and the app cached by the whole link. Photos and video stills are now cached by the file itself, in memory and on disk, so a reopened chat shows them at once; the full-screen viewer uses the same cache. A voice note keeps the player it opened with when the links change, and once played it is kept on the phone and plays from there the next time, with no network.",
        ar: "بلاغ QA: في كل مرة تُفتح المحادثة كانت صورها ولقطات فيديوهاتها ورسائلها الصوتية تُحمَّل من جديد. ملفات المحادثة خاصة، فيوقّع الخادم رابطاً جديداً لكل ملف عند كل تحميل للرسائل، وكان التطبيق يخزّن حسب الرابط كاملاً. الآن تُخزَّن الصور ولقطات الفيديو حسب الملف نفسه، في الذاكرة وعلى القرص، فتظهر فوراً عند إعادة فتح المحادثة؛ وعارض الصور بملء الشاشة يستخدم التخزين نفسه. والرسالة الصوتية تحتفظ بمشغّلها عند تغيّر الروابط، وبعد تشغيلها مرة تُحفظ على الهاتف وتُشغَّل منه في المرة التالية دون شبكة.",
      },
      acceptanceCriteria: {
        en: [
          "Open a chat with photos, go back, open it again: the photos are there at once, with no grey tiles or flicker.",
          "The same after closing the app fully and opening it again (disk cache), and with the phone offline.",
          "A photo opened full screen from the chat appears at once the second time.",
          "A voice note played once plays again after reopening the chat with the phone offline.",
          "A voice note never played still plays from the network, and after 15 minutes in the chat (its link is renewed).",
          "Sending a new photo or voice note works as before.",
        ],
        ar: [
          "افتح محادثة فيها صور، وعُد، وافتحها مجدداً: الصور ظاهرة فوراً دون مربعات رمادية أو وميض.",
          "وكذلك بعد إغلاق التطبيق تماماً وفتحه (تخزين القرص)، والهاتف دون اتصال.",
          "الصورة المفتوحة بملء الشاشة من المحادثة تظهر فوراً في المرة الثانية.",
          "الرسالة الصوتية التي شُغّلت مرة تعمل بعد إعادة فتح المحادثة والهاتف دون اتصال.",
          "الرسالة الصوتية التي لم تُشغَّل تعمل من الشبكة، وبعد 15 دقيقة داخل المحادثة (يُجدَّد رابطها).",
          "إرسال صورة أو رسالة صوتية جديدة يعمل كما كان.",
        ],
      },
      testScenarios: {
        en: [
          "iPhone: open a chat with several photos and two voice notes, play one note, go back and reopen three times — nothing reloads.",
          "Turn on flight mode and reopen the chat — photos show and the played note plays; the other note does not.",
        ],
        ar: [
          "iPhone: افتح محادثة فيها عدة صور ورسالتان صوتيتان، وشغّل إحداهما، وعُد وأعد الفتح ثلاث مرات — لا شيء يُعاد تحميله.",
          "فعّل وضع الطيران وأعد فتح المحادثة — تظهر الصور وتعمل الرسالة التي شُغّلت؛ والأخرى لا تعمل.",
        ],
      },
      updatedIn: "fix/chat-media-cache",
    },
    {
      id: "mobile-chat-search",
      title: {
        en: "Search inside a chat and across the chats list",
        ar: "البحث داخل المحادثة وفي قائمة المحادثات",
      },
      priority: "P2",
      story: {
        en: "In a chat, 🔍 opens a search bar: matches in message text and file names, newest first, with '2 / 7' and ↑ (older) / ↓ (newer). Each match scrolls into view and is tinted briefly; older messages load automatically until it's there. Messages you deleted on your side (حذف لدي) aren't found. In محادثاتي the search box now searches every chat on the server: the other person's name, the ad title in Arabic (e.g. 'عمارة', 'للبيع'), or any message text.",
        ar: "في المحادثة، 🔍 يفتح شريط بحث: نتائج في نص الرسائل وأسماء الملفات، الأحدث أولاً، مع '2 / 7' و ↑ (الأقدم) / ↓ (الأحدث). كل نتيجة تُعرض وتلوّن لحظة، وتُحمّل الرسائل الأقدم تلقائياً حتى تظهر. والرسائل التي حذفتها لديك (حذف لدي) لا تظهر في النتائج. وفي محادثاتي يبحث مربع البحث الآن في كل المحادثات على الخادم: اسم الطرف الآخر، أو عنوان الإعلان بالعربية (مثل 'عمارة'، 'للبيع')، أو نص أي رسالة.",
      },
      acceptanceCriteria: {
        en: [
          "In-chat search finds an old message not loaded yet and scrolls to it.",
          "↑ / ↓ move between matches and the counter follows; no matches shows 'لا نتائج'.",
          "Closing the bar clears the search.",
          "Chats list: 'عمارة' finds chats about a building ad; a word from a message finds that chat even if it isn't on the first page; no matches shows 'لا توجد نتائج'.",
        ],
        ar: [
          "البحث داخل المحادثة يجد رسالة قديمة لم تُحمّل بعد وينتقل إليها.",
          "↑ / ↓ تتنقل بين النتائج ويتبعها العداد، وعند عدم وجود نتائج تظهر 'لا نتائج'.",
          "إغلاق الشريط يمسح البحث.",
          "قائمة المحادثات: 'عمارة' تجد محادثات إعلان عمارة، وكلمة من رسالة تجد تلك المحادثة حتى لو لم تكن في الصفحة الأولى، وعند عدم وجود نتائج تظهر 'لا توجد نتائج'.",
        ],
      },
      testScenarios: {
        en: [
          "In a long chat, 🔍 → type a word from the first message — it loads older messages and jumps there.",
          "Delete a message on your side, search its text — not found.",
          "محادثاتي: search the other person's name, 'للإيجار', and a word from a message.",
        ],
        ar: [
          "في محادثة طويلة، 🔍 ← اكتب كلمة من أول رسالة — تُحمّل الرسائل الأقدم وينتقل إليها.",
          "احذف رسالة لديك وابحث عن نصها — لا تظهر.",
          "محادثاتي: ابحث باسم الطرف الآخر، و'للإيجار'، وكلمة من رسالة.",
        ],
      },
      updatedIn: "feat/chat-attachments-search",
    },
    {
      id: "mobile-chat-share-property",
      title: {
        en: "Share an ad in chat",
        ar: "مشاركة إعلان في المحادثة",
      },
      priority: "P2",
      story: {
        en: "In a chat, + → عقار opens إعلاناتي (my live ads) and المفضلة with a search. Tapping an ad sends it as a card (photo, price, specs, area); tapping the card opens the ad. An ad that later expires or closes shows 'الإعلان غير متاح' on its card and doesn't open.",
        ar: "في المحادثة، + ← عقار يفتح إعلاناتي (الإعلانات النشطة) والمفضلة مع بحث. الضغط على إعلان يرسله كبطاقة (الصورة والسعر والمواصفات والمنطقة)، والضغط على البطاقة يفتح الإعلان. والإعلان الذي ينتهي أو يُغلق لاحقاً تظهر على بطاقته 'الإعلان غير متاح' ولا يُفتح.",
      },
      acceptanceCriteria: {
        en: [
          "Only live ads are listed under إعلاناتي; hidden ads aren't.",
          "Each ad's title, price and area start from the right, next to its photo (right-to-left).",
          "The card shows the shared ad, not the chat's own ad.",
          "Sharing an expired favourite fails with a message; nothing is sent.",
        ],
        ar: [
          "تظهر الإعلانات النشطة فقط في إعلاناتي، ولا تظهر الإعلانات المخفية.",
          "عنوان كل إعلان وسعره ومنطقته تبدأ من اليمين بجانب صورته (من اليمين لليسار).",
          "البطاقة تعرض الإعلان المُشارك وليس إعلان المحادثة.",
          "مشاركة إعلان منتهٍ من المفضلة تفشل برسالة ولا يُرسل شيء.",
        ],
      },
      testScenarios: {
        en: [
          "In a chat about ad A, share ad B from إعلاناتي — both phones show B's card; tap it — B opens.",
          "Close ad B from my ads — its card shows 'الإعلان غير متاح'.",
        ],
        ar: [
          "في محادثة عن الإعلان A، شارك الإعلان B من إعلاناتي — يظهر الإعلان B على الهاتفين، والضغط عليه يفتحه.",
          "أغلق الإعلان B من إعلاناتي — تظهر على بطاقته 'الإعلان غير متاح'.",
        ],
      },
      updatedIn: "feat/chat-message-ticks",
    },
    {
      id: "mobile-chat-location",
      title: {
        en: "Send a location in chat",
        ar: "إرسال موقع في المحادثة",
      },
      priority: "P2",
      story: {
        en: "+ → الموقع offers موقعي الحالي (GPS, asks permission the first time) or اختر على الخريطة (the app's map picker). The message shows a map preview with the address; tapping it opens Apple Maps or Google Maps (Android: Google Maps). The chats list and the push show '📍 <address>'.",
        ar: "+ ← الموقع يعرض موقعي الحالي (GPS، ويطلب الإذن أول مرة) أو اختر على الخريطة (منتقي الخريطة في التطبيق). تظهر الرسالة بمعاينة خريطة مع العنوان، والضغط عليها يفتح خرائط Apple أو Google (في Android خرائط Google). وتظهر في قائمة المحادثات والإشعار '📍 العنوان'.",
      },
      acceptanceCriteria: {
        en: [
          "The pin opens at the same point that was sent.",
          "Refusing the location permission shows a notice inside the sheet with فتح الإعدادات; nothing is sent, and the sheet, the map option and the chat stay usable.",
          "When the position cannot be read, the sheet says so and offers the map; no app alert opens over the sheet.",
          "Coordinates outside the valid range are refused by the server.",
        ],
        ar: [
          "الدبوس يفتح على النقطة نفسها التي أُرسلت.",
          "رفض إذن الموقع يعرض تنبيهاً داخل الورقة مع فتح الإعدادات؛ ولا يُرسل شيء، وتبقى الورقة وخيار الخريطة والمحادثة قابلة للاستخدام.",
          "حين يتعذر تحديد الموقع تذكر الورقة ذلك وتقترح الخريطة؛ ولا يُفتح تنبيه التطبيق فوق الورقة.",
          "الإحداثيات خارج النطاق الصحيح يرفضها الخادم.",
        ],
      },
      testScenarios: {
        en: [
          "Send موقعي الحالي — B sees the map and address; tap — Maps opens at that point.",
          "Pick a point on the map and send — same on both phones.",
          "iPhone, location denied: press موقعي الحالي twice, close the sheet, type a message, go back to the chats list — nothing freezes. Press فتح الإعدادات — the app's settings page opens.",
        ],
        ar: [
          "أرسل موقعي الحالي — يرى B الخريطة والعنوان، والضغط يفتح الخرائط على النقطة.",
          "اختر نقطة على الخريطة وأرسلها — تظهر نفسها على الهاتفين.",
          "iPhone والموقع مرفوض: اضغط موقعي الحالي مرتين، وأغلق الورقة، واكتب رسالة، وعُد إلى قائمة المحادثات — لا شيء يتجمد. واضغط فتح الإعدادات — تُفتح صفحة إعدادات التطبيق.",
        ],
      },
      updatedIn: "feat/landing-home-figma",
    },
    {
      id: "mobile-chat-appointment",
      title: {
        en: "Viewing appointments in chat",
        ar: "مواعيد المعاينة في المحادثة",
      },
      priority: "P1",
      story: {
        en: "+ → موعد معاينة: pick a day (next 60 days) and a time (8:00 ص–10:00 م, every 30 minutes; times less than 30 minutes ahead are disabled) with an optional note. The card shows the day and time and a status. The other side answers قبول / رفض / موعد آخر (a new proposed time; the old one shows 'تم الرد بعرض مقابل'); the sender can إلغاء while pending. Answers update both phones at once and notify the sender. Both people get a reminder push within the hour before an accepted appointment.",
        ar: "+ ← موعد معاينة: اختر يوماً (خلال 60 يوماً) ووقتاً (من 8:00 ص إلى 10:00 م كل 30 دقيقة، والأوقات بعد أقل من 30 دقيقة معطلة) مع ملاحظة اختيارية. تعرض البطاقة اليوم والوقت والحالة. يرد الطرف الآخر بقبول / رفض / موعد آخر (وقت مقترح جديد، والقديم يظهر 'تم الرد بعرض مقابل')، ويمكن للمرسل الإلغاء ما دام بانتظار الرد. تتحدث الردود على الهاتفين فوراً ويصل المرسل إشعار. ويصل الطرفين تذكير خلال الساعة التي تسبق الموعد المقبول.",
      },
      acceptanceCriteria: {
        en: [
          "Only the receiver sees قبول / رفض / موعد آخر; only the sender sees إلغاء; no buttons once answered.",
          "A pending appointment whose time has passed shows 'انتهى الموعد' and can't be accepted.",
          "The reminder arrives once, within the hour before, on both phones.",
        ],
        ar: [
          "يرى المستلم فقط قبول / رفض / موعد آخر، ويرى المرسل فقط إلغاء، ولا أزرار بعد الرد.",
          "الموعد المعلّق الذي فات وقته يظهر 'انتهى الموعد' ولا يمكن قبوله.",
          "يصل التذكير مرة واحدة خلال الساعة التي تسبق الموعد على الهاتفين.",
        ],
      },
      testScenarios: {
        en: [
          "A proposes tomorrow 4:30 م; B accepts — both cards show مقبول without reopening; A gets the push.",
          "B taps موعد آخر and picks 6:00 م — A's first card shows 'تم الرد بعرض مقابل', a new card appears.",
          "Accept an appointment ~70 minutes ahead — both phones get the reminder within the next 20 minutes.",
        ],
        ar: [
          "يقترح A غداً 4:30 م ويقبل B — تظهر البطاقتان مقبول دون إعادة الفتح، ويصل A إشعار.",
          "يضغط B موعد آخر ويختار 6:00 م — تظهر البطاقة الأولى 'تم الرد بعرض مقابل' وتظهر بطاقة جديدة.",
          "اقبل موعداً بعد 70 دقيقة تقريباً — يصل التذكير للهاتفين خلال 20 دقيقة.",
        ],
      },
      updatedIn: "feat/chat-share-location-proposals",
    },
    {
      id: "mobile-chat-offer",
      title: {
        en: "Price offers in chat",
        ar: "عروض الأسعار في المحادثة",
      },
      priority: "P1",
      story: {
        en: "+ → عرض سعر: an amount in KWD (Arabic digits accepted, shown with thousands separators), إجمالي / شهري / سنوي (monthly by default in a rental ad's chat) and an optional note. The other side answers قبول / رفض / عرض مقابل (a new offer; the old one shows 'تم الرد بعرض مقابل'); the sender can إلغاء while pending. The card notes it's a record in the chat, not a binding contract. The chats list and push show '💰 عرض سعر: 250,000 د.ك'.",
        ar: "+ ← عرض سعر: مبلغ بالدينار (تُقبل الأرقام العربية ويُعرض بفواصل الآلاف)، وإجمالي / شهري / سنوي (شهري افتراضياً في محادثة إعلان إيجار)، وملاحظة اختيارية. يرد الطرف الآخر بقبول / رفض / عرض مقابل (عرض جديد، والقديم يظهر 'تم الرد بعرض مقابل')، ويمكن للمرسل الإلغاء ما دام بانتظار الرد. تذكر البطاقة أنه للتوثيق داخل المحادثة وليس عقداً ملزماً. وتظهر في قائمة المحادثات والإشعار '💰 عرض سعر: 250,000 د.ك'.",
      },
      acceptanceCriteria: {
        en: [
          "Zero or empty amounts can't be sent.",
          "An offer answered on one phone can't be answered again on the other (second answer gets 'تم الرد على هذا العرض مسبقاً').",
          "A counter-offer can only answer the other side's pending offer.",
          "The line 'العرض للتوثيق داخل المحادثة وليس عقداً ملزماً' at the bottom of an offer card starts at the same right edge as the title, the amount and the note above it.",
        ],
        ar: [
          "لا يمكن إرسال مبلغ صفر أو فارغ.",
          "العرض الذي رُد عليه في هاتف لا يمكن الرد عليه مرة أخرى في الآخر (الرد الثاني يظهر 'تم الرد على هذا العرض مسبقاً').",
          "العرض المقابل يرد فقط على عرض معلّق من الطرف الآخر.",
          "سطر 'العرض للتوثيق داخل المحادثة وليس عقداً ملزماً' أسفل بطاقة العرض يبدأ من الحافة اليمنى نفسها التي يبدأ منها العنوان والمبلغ والملاحظة فوقه.",
        ],
      },
      testScenarios: {
        en: [
          "A offers 250,000; B counters 240,000; A accepts — first card 'تم الرد بعرض مقابل', second 'مقبول' on both phones.",
          "In a rental ad's chat, the period starts at شهري.",
          "A cancels a pending offer — B's card shows ملغي and no buttons.",
        ],
        ar: [
          "يعرض A مبلغ 250,000 ويرد B بعرض 240,000 ويقبل A — البطاقة الأولى 'تم الرد بعرض مقابل' والثانية 'مقبول' على الهاتفين.",
          "في محادثة إعلان إيجار تبدأ المدة على شهري.",
          "يلغي A عرضاً معلّقاً — تظهر بطاقة B ملغي بلا أزرار.",
        ],
      },
      updatedIn: "fix/offer-card-disclaimer-align",
    },
    {
      id: "mobile-chat-video",
      title: {
        en: "Send a video tour in chat (app 1.5.0+)",
        ar: "إرسال فيديو في المحادثة (التطبيق 1.5.0 وما بعده)",
      },
      priority: "P1",
      story: {
        en: "+ → فيديو picks one video from the gallery (up to 2 minutes and 100 MB; iOS exports it at 720p). The preview shows its still image, length and size, with an optional caption. The message shows the still with ▶ and the length; tapping it plays the video full screen with the system controls. Videos are private like other chat files. The chats list and push show '🎥 فيديو'. Needs app version 1.5.0 (native build).",
        ar: "+ ← فيديو يختار فيديو واحداً من المعرض (حتى دقيقتين و100 ميجابايت، ويُصدَّر في iOS بدقة 720p). تعرض المعاينة الصورة المصغرة والمدة والحجم مع تعليق اختياري. تظهر الرسالة بالصورة المصغرة مع ▶ والمدة، والضغط عليها يشغل الفيديو بملء الشاشة بعناصر تحكم النظام. الفيديوهات خاصة مثل بقية ملفات المحادثة. وتظهر في قائمة المحادثات والإشعار '🎥 فيديو'. يتطلب إصدار التطبيق 1.5.0 (بناء أصلي).",
      },
      acceptanceCriteria: {
        en: [
          "A video over 100 MB or longer than 2 minutes is refused at once with an alert 'تعذر إرسال المرفق' that names the limit ('حجم الفيديو يتجاوز الحد المسموح به (الحد الأقصى 100 ميجابايت)' / 'مدة الفيديو أطول من الحد المسموح به (2 دقيقة)'); no preview opens and nothing is sent.",
          "If the server refuses an upload (too large, wrong type), the failed bubble comes with an alert giving the reason; a lost connection only shows the failed bubble with retry.",
          "Upload shows progress; a failed upload offers retry.",
          "The video still plays after the chat has been open more than 15 minutes (the link is renewed on tap).",
          "While the video waits on the network a spinner shows over it, and playback carries on by itself once data arrives; on iPhone a wait that drags on is restarted automatically, with no need to press pause then play. A video the user paused stays paused.",
        ],
        ar: [
          "الفيديو الأكبر من 100 ميجابايت أو الأطول من دقيقتين يُرفض فوراً بتنبيه 'تعذر إرسال المرفق' يذكر الحد ('حجم الفيديو يتجاوز الحد المسموح به (الحد الأقصى 100 ميجابايت)' / 'مدة الفيديو أطول من الحد المسموح به (2 دقيقة)')؛ ولا تُفتح المعاينة ولا يُرسل شيء.",
          "إذا رفض الخادم الرفع (حجم زائد أو نوع غير مسموح) يظهر مع الرسالة الفاشلة تنبيه بالسبب؛ وانقطاع الاتصال يعرض الرسالة الفاشلة مع إعادة المحاولة فقط.",
          "يظهر تقدم الرفع، والرفع الفاشل يعرض إعادة المحاولة.",
          "يعمل الفيديو بعد بقاء المحادثة مفتوحة أكثر من 15 دقيقة (يُجدد الرابط عند الضغط).",
          "أثناء انتظار الفيديو للشبكة يظهر مؤشر تحميل فوقه، ويستمر التشغيل تلقائياً عند وصول البيانات؛ وفي iPhone يُعاد تشغيل الانتظار الطويل تلقائياً دون الحاجة إلى ضغط إيقاف ثم تشغيل. والفيديو الذي أوقفه المستخدم يبقى متوقفاً.",
        ],
      },
      testScenarios: {
        en: [
          "Send a 30-second video with a caption — B sees the still, 0:30 and the caption; tap — it plays.",
          "Try a 3-minute video — refused with the alert naming the 2-minute limit; try one that is still over 100 MB after iOS shrinks it to 720p — refused with the alert naming 100 MB.",
          "iPhone on a slow or throttled connection: play a long video to the end without touching it — it may wait with a spinner but never stays frozen; pause it yourself — it stays paused.",
        ],
        ar: [
          "أرسل فيديو 30 ثانية مع تعليق — يرى B الصورة المصغرة و0:30 والتعليق، والضغط يشغله.",
          "جرّب فيديو 3 دقائق — يُرفض بتنبيه يذكر حد الدقيقتين؛ وجرّب فيديو يبقى أكبر من 100 ميجابايت بعد تصغير iOS له إلى 720p — يُرفض بتنبيه يذكر 100 ميجابايت.",
          "iPhone على اتصال بطيء أو مقيَّد: شغّل فيديو طويلاً حتى نهايته دون لمسه — قد ينتظر مع مؤشر تحميل لكنه لا يبقى متجمداً؛ وأوقفه بنفسك — يبقى متوقفاً.",
        ],
      },
      updatedIn: "fix/chat-video-too-large-message",
    },
    {
      id: "mobile-chat-voice",
      title: {
        en: "Voice notes in chat (app 1.5.0+)",
        ar: "الرسائل الصوتية في المحادثة (التطبيق 1.5.0 وما بعده)",
      },
      priority: "P1",
      story: {
        en: "While the text field is empty, a mic shows instead of the send button. Hold it to record and release to send; slide away while holding to cancel ('ارفع إصبعك للإلغاء'). A quick tap keeps recording with a delete button and a send button. A timer shows while recording; the limit is 5 minutes (it's sent automatically), and recordings under a second aren't sent. The note shows play / pause, progress and length; only one note plays at a time. The first use asks for the microphone. The chats list and push show '🎤 رسالة صوتية (0:42)'.",
        ar: "عندما يكون حقل الكتابة فارغاً يظهر ميكروفون بدلاً من زر الإرسال. اضغط مطولاً للتسجيل وارفع إصبعك للإرسال، واسحب بعيداً أثناء الضغط للإلغاء ('ارفع إصبعك للإلغاء'). والضغطة السريعة تُبقي التسجيل مستمراً مع زر حذف وزر إرسال. يظهر مؤقت أثناء التسجيل، والحد 5 دقائق (تُرسل تلقائياً)، والتسجيل الأقل من ثانية لا يُرسل. تعرض الرسالة تشغيل / إيقاف والتقدم والمدة، وتعمل رسالة واحدة فقط في كل مرة. أول استخدام يطلب إذن الميكروفون. وتظهر في قائمة المحادثات والإشعار '🎤 رسالة صوتية (0:42)'.",
      },
      acceptanceCriteria: {
        en: [
          "Typing text swaps the mic back to the send button.",
          "Refusing the microphone shows 'الإذن مطلوب' with فتح الإعدادات (opens the app's settings page) and إلغاء, every time the mic is pressed while it is refused; nothing is recorded.",
          "Starting a second note pauses the first.",
          "A voice note is sent alone (never mixed with other files).",
        ],
        ar: [
          "كتابة نص تعيد زر الإرسال مكان الميكروفون.",
          "رفض إذن الميكروفون يعرض 'الإذن مطلوب' مع فتح الإعدادات (يفتح صفحة إعدادات التطبيق) وإلغاء، في كل ضغطة على الميكروفون ما دام مرفوضاً؛ ولا يُسجَّل شيء.",
          "تشغيل رسالة ثانية يوقف الأولى مؤقتاً.",
          "الرسالة الصوتية تُرسل وحدها (لا تُدمج مع ملفات أخرى).",
        ],
      },
      testScenarios: {
        en: [
          "Hold the mic 5 seconds and release — B gets a 0:05 note and the push; play it on B.",
          "Hold, slide away, release — nothing is sent.",
          "Tap the mic quickly, speak, tap delete — nothing is sent; repeat and tap send — sent.",
        ],
        ar: [
          "اضغط الميكروفون 5 ثوانٍ وارفع إصبعك — تصل B رسالة 0:05 والإشعار، وشغّلها على B.",
          "اضغط واسحب بعيداً وارفع إصبعك — لا يُرسل شيء.",
          "اضغط الميكروفون سريعاً وتحدث واضغط حذف — لا يُرسل شيء، ثم كرر واضغط إرسال — تُرسل.",
        ],
      },
      updatedIn: "fix/chat-camera-mic-denied",
    },
    {
      id: "mobile-chat-notification-tone",
      title: {
        en: "Buyootna tone for chat notifications (app 1.5.0+)",
        ar: "نغمة بيوتنا لإشعارات المحادثات (التطبيق 1.5.0 وما بعده)",
      },
      priority: "P2",
      story: {
        en: "Chat message pushes play the Buyootna tone instead of the default sound. On Android the tone belongs to the 'رسائل المحادثات' notification channel, created by app 1.5.0 on first launch; older builds keep the default sound. Other notifications are unchanged.",
        ar: "إشعارات رسائل المحادثة تشغّل نغمة بيوتنا بدلاً من الصوت الافتراضي. في Android النغمة تابعة لقناة الإشعارات 'رسائل المحادثات' التي ينشئها التطبيق 1.5.0 عند أول تشغيل، والإصدارات الأقدم تبقى على الصوت الافتراضي. وبقية الإشعارات لا تتغير.",
      },
      acceptanceCriteria: {
        en: [
          "iOS and Android 1.5.0: a chat push with the app in the background plays the Buyootna tone.",
          "Android: 'رسائل المحادثات' appears under the app's notification settings.",
          "Camera permission is requested when taking a photo in chat on Android.",
        ],
        ar: [
          "iOS و Android 1.5.0: إشعار محادثة والتطبيق في الخلفية يشغّل نغمة بيوتنا.",
          "Android: تظهر 'رسائل المحادثات' ضمن إعدادات إشعارات التطبيق.",
          "يُطلب إذن الكاميرا عند التقاط صورة في المحادثة على Android.",
        ],
      },
      testScenarios: {
        en: [
          "With the app in the background, receive a chat message — the Buyootna tone plays.",
          "Receive a non-chat notification — the default sound plays.",
        ],
        ar: [
          "والتطبيق في الخلفية استقبل رسالة محادثة — تُشغَّل نغمة بيوتنا.",
          "استقبل إشعاراً غير المحادثة — يُشغَّل الصوت الافتراضي.",
        ],
      },
      updatedIn: "feat/native-1.5.0-video-voice",
    },
    {
      id: "mobile-app-icon-badge",
      title: {
        en: "Unread number on the app icon",
        ar: "عدد غير المقروء على أيقونة التطبيق",
      },
      priority: "P2",
      story: {
        en: "The app icon shows a red number: unread chat messages for the persona the phone is using, plus the account's unread notifications. Every push carries the new total, so the number grows while the app is closed. The app corrects it when it opens, when it goes to the background, after reading a chat or a notification, and when switching persona; signing out clears it. iOS shows the number on the icon; on Android it depends on the launcher (some show a dot or the notification count instead). GET /notifications/badge returns { count, chats, notifications }.",
        ar: "تعرض أيقونة التطبيق رقماً أحمر: رسائل المحادثات غير المقروءة للهوية المستخدمة على الهاتف، مع إشعارات الحساب غير المقروءة. كل إشعار يحمل المجموع الجديد، فيزيد الرقم والتطبيق مغلق. ويصححه التطبيق عند فتحه، وعند انتقاله للخلفية، وبعد قراءة محادثة أو إشعار، وعند تبديل الهوية، وتسجيل الخروج يمسحه. يعرض iOS الرقم على الأيقونة، وفي Android يعتمد على الواجهة (بعضها يعرض نقطة أو عدد الإشعارات). و GET /notifications/badge يعيد { count, chats, notifications }.",
      },
      acceptanceCriteria: {
        en: [
          "With the app closed, two chat messages arrive: the icon shows 2 (plus any unread notifications).",
          "Open the chat and read them, go to the home screen: the number drops.",
          "Messages you sent, and messages you deleted on your side, aren't counted.",
          "A phone on another persona of the same account doesn't count this persona's chats.",
          "Sign out: no number.",
        ],
        ar: [
          "والتطبيق مغلق تصل رسالتا محادثة: تعرض الأيقونة 2 (مع أي إشعارات غير مقروءة).",
          "افتح المحادثة واقرأهما ثم اذهب للشاشة الرئيسية: ينخفض الرقم.",
          "الرسائل التي أرسلتها أنت والتي حذفتها لديك لا تُحتسب.",
          "هاتف على هوية أخرى للحساب نفسه لا يحتسب محادثات هذه الهوية.",
          "سجّل الخروج: لا يظهر رقم.",
        ],
      },
      testScenarios: {
        en: [
          "Two devices: close the app on B, send 3 messages from A — B's icon shows 3; open and read — back on the home screen it shows 0.",
          "Leave one notification unread and receive one message — the icon shows 2.",
          "Switch persona on B — the number changes to that persona's unread chats.",
        ],
        ar: [
          "جهازان: أغلق التطبيق على B وأرسل 3 رسائل من A — تعرض أيقونة B الرقم 3، افتح واقرأ — عند العودة للشاشة الرئيسية تعرض 0.",
          "اترك إشعاراً غير مقروء واستقبل رسالة — تعرض الأيقونة 2.",
          "بدّل الهوية على B — يتغير الرقم إلى محادثات تلك الهوية غير المقروءة.",
        ],
      },
      updatedIn: "feat/app-icon-badge",
    },
    {
      id: "mobile-chat-message-ticks",
      title: {
        en: "Message ticks: sent, delivered, read",
        ar: "علامات الرسائل: أُرسلت، سُلّمت، قُرئت",
      },
      priority: "P1",
      story: {
        en: "Like WhatsApp, each of my chat messages shows its state next to the time: a clock while sending, one grey tick once sent, two grey ticks once it reached the other person's app (their app was open, or they opened it later), and two gold ticks once they opened the chat. Ticks change live, without reopening the chat, and show on every message type (text, photos, files, video, voice, location, appointment, offer, shared ad). In the chats list the same ticks show beside my last message. There's no setting to turn read receipts off. The API sends the other person's lastDeliveredAt / lastReadAt as otherReceipt and a conversation_receipt socket event.",
        ar: "مثل الواتساب، تعرض كل رسالة أرسلتها حالتها بجانب الوقت: ساعة أثناء الإرسال، وعلامة رمادية واحدة بعد الإرسال، وعلامتان رماديتان عند وصولها لتطبيق الطرف الآخر (كان تطبيقه مفتوحاً أو فتحه لاحقاً)، وعلامتان ذهبيتان عند فتحه المحادثة. تتغير العلامات مباشرة دون إعادة فتح المحادثة، وتظهر على كل أنواع الرسائل (نص، صور، ملفات، فيديو، صوت، موقع، موعد، عرض، إعلان). وفي قائمة المحادثات تظهر العلامات نفسها بجانب آخر رسالة لي. لا يوجد إعداد لإيقاف إشعارات القراءة. ويرسل الـ API قيم lastDeliveredAt / lastReadAt للطرف الآخر في otherReceipt وحدث conversation_receipt عبر الـ socket.",
      },
      acceptanceCriteria: {
        en: [
          "The other person's app is closed: my message stays on one grey tick.",
          "They open the app without opening the chat: two grey ticks.",
          "They open the chat: two gold ticks, on that message and every earlier one.",
          "Both in the chat: a new message turns gold within a moment.",
          "Their messages show no ticks; a failed send shows its retry row, not ticks.",
          "Chats that were already read before this release show two gold ticks, not one.",
        ],
        ar: [
          "تطبيق الطرف الآخر مغلق: تبقى رسالتي بعلامة رمادية واحدة.",
          "يفتح التطبيق دون فتح المحادثة: علامتان رماديتان.",
          "يفتح المحادثة: علامتان ذهبيتان على تلك الرسالة وكل ما قبلها.",
          "الطرفان داخل المحادثة: تتحول الرسالة الجديدة للذهبي خلال لحظة.",
          "رسائل الطرف الآخر بلا علامات، والإرسال الفاشل يعرض إعادة المحاولة لا العلامات.",
          "المحادثات المقروءة قبل هذا الإصدار تعرض علامتين ذهبيتين لا علامة واحدة.",
        ],
      },
      testScenarios: {
        en: [
          "Two devices: force-close the app on B, send from A — one grey tick. Open the app on B (stay on the home tab) — A shows two grey ticks. Open the chat on B — A shows two gold ticks.",
          "With both in the chat, send a photo, a voice note and an offer from A — each turns gold.",
          "Check A's chats list: the tick beside the last message matches the one in the chat.",
        ],
        ar: [
          "جهازان: أغلق التطبيق تماماً على B وأرسل من A — علامة رمادية واحدة. افتح التطبيق على B (ابقَ في الرئيسية) — تظهر على A علامتان رماديتان. افتح المحادثة على B — تظهر على A علامتان ذهبيتان.",
          "والطرفان داخل المحادثة، أرسل من A صورة ورسالة صوتية وعرض سعر — تتحول كل واحدة للذهبي.",
          "تحقق من قائمة محادثات A: العلامة بجانب آخر رسالة تطابق التي داخل المحادثة.",
        ],
      },
      updatedIn: "feat/chat-message-ticks",
    },
    {
      id: "mobile-chat-bubble-text-fits",
      title: {
        en: "Chat message text is fully visible inside its bubble",
        ar: "نص رسالة المحادثة ظاهر كاملاً داخل فقاعته",
      },
      priority: "P1",
      story: {
        en: "QA (iPhone): the first and last letters of a message were cut at the edges of its bubble ('للبيع البيت؟' lost its first letter), and the time beside the bubble lost its top. The message text had a negative letter spacing, which made iOS size the bubble narrower than the Arabic text it drew; the time had a line shorter than the font needs. The text now has no letter spacing and a taller line, and the time a full line. A sent document also shows its readable name ('Buyootna QA.pdf'), not the URL-encoded one the iOS picker can return ('Buyootna%20QA.pdf').",
        ar: "بلاغ QA (iPhone): كان أول حرف وآخر حرف من الرسالة يُقطعان عند حافتي الفقاعة ('للبيع البيت؟' فقدت حرفها الأول)، والوقت بجانب الفقاعة يفقد أعلاه. كان لنص الرسالة تباعد أحرف سالب جعل iOS يحسب الفقاعة أضيق من النص العربي المرسوم؛ وللوقت سطر أقصر مما يحتاجه الخط. الآن النص بلا تباعد أحرف وبسطر أطول، وللوقت سطر كامل. والمستند المرسل يعرض اسمه المقروء ('Buyootna QA.pdf') لا الاسم المرمَّز الذي قد يعيده منتقي iOS ('Buyootna%20QA.pdf').",
      },
      acceptanceCriteria: {
        en: [
          "Short and long messages, mine and theirs, Arabic, English and mixed: every letter is inside the bubble with space on both sides, on iPhone and Android.",
          "A message of several lines wraps inside the bubble, and no line is cut at the top or bottom.",
          "The time and the ticks under the bubble are fully visible and do not overlap.",
          "A document picked on iPhone with spaces or Arabic in its name shows that name as written: in the preview, in the bubble, and after '📎' in the chats list. Documents sent earlier under an encoded name show decoded too.",
        ],
        ar: [
          "رسائل قصيرة وطويلة، لي وله، بالعربية والإنجليزية ومختلطة: كل حرف داخل الفقاعة مع مسافة من الجانبين، في iPhone و Android.",
          "الرسالة متعددة الأسطر تلتف داخل الفقاعة ولا يُقطع سطر من أعلاه أو أسفله.",
          "الوقت والعلامات تحت الفقاعة ظاهرة كاملة ولا تتداخل.",
          "المستند المختار في iPhone وفي اسمه مسافات أو حروف عربية يعرض الاسم كما كُتب: في المعاينة وفي الفقاعة وبعد '📎' في قائمة المحادثات. والمستندات المرسلة سابقاً باسم مرمَّز تظهر مفكوكة الترميز أيضاً.",
        ],
      },
      testScenarios: {
        en: [
          "iPhone: send 'للبيع البيت؟', 'لا', a long sentence and an English one — compare the first and last letters with what was typed.",
          "Send a PDF named 'Buyootna QA (v2).pdf' — the bubble shows that name.",
        ],
        ar: [
          "iPhone: أرسل 'للبيع البيت؟' و'لا' وجملة طويلة وجملة إنجليزية — وقارن أول حرف وآخر حرف بما كُتب.",
          "أرسل ملف PDF باسم 'Buyootna QA (v2).pdf' — تعرض الفقاعة هذا الاسم.",
        ],
      },
      updatedIn: "fix/chat-file-name-decoded",
    },
    {
      id: "mobile-chat-keyboard-android",
      title: {
        en: "The chat's message field stays above the keyboard on Android",
        ar: "حقل الرسالة في المحادثة يبقى فوق لوحة المفاتيح في Android",
      },
      priority: "P0",
      story: {
        en: "QA (Galaxy A36): opening the keyboard in a chat covered the message field, so the user typed blind. The app draws edge to edge on Android, and then the system no longer shrinks the window for the keyboard. The input bar now lifts itself by the keyboard's height plus the navigation bar, as it already did on iPhone, and drops back when the keyboard closes; the messages above make room.",
        ar: "بلاغ QA (Galaxy A36): فتح لوحة المفاتيح في المحادثة كان يغطي حقل الرسالة فيكتب المستخدم دون أن يرى. التطبيق يُرسم على كامل الشاشة في Android، وعندها لا يصغّر النظام النافذة للوحة المفاتيح. الآن يرتفع شريط الكتابة بمقدار ارتفاع لوحة المفاتيح وشريط التنقل، كما يحدث في iPhone، ويعود عند إغلاقها؛ وتفسح الرسائل فوقه المكان.",
      },
      acceptanceCriteria: {
        en: [
          "Android: tapping the message field opens the keyboard with the field and its buttons fully visible just above it; what is typed is visible.",
          "Closing the keyboard (back, or sending) puts the bar back on the navigation bar with no gap.",
          "The newest messages stay visible above the bar while the keyboard is open.",
          "The + panel, the voice button and the reply bar behave as before; iPhone is unchanged.",
        ],
        ar: [
          "Android: الضغط على حقل الرسالة يفتح لوحة المفاتيح والحقل وأزراره ظاهرة كاملة فوقها مباشرة؛ وما يُكتب ظاهر.",
          "إغلاق لوحة المفاتيح (رجوع أو إرسال) يعيد الشريط فوق شريط التنقل دون فراغ.",
          "تبقى أحدث الرسائل ظاهرة فوق الشريط ولوحة المفاتيح مفتوحة.",
          "لوحة + وزر الصوت وشريط الرد تعمل كما كانت؛ ولا تغيير في iPhone.",
        ],
      },
      testScenarios: {
        en: [
          "Galaxy A36 and one phone with 3-button navigation: open a chat, tap the field, type a long message, send, open the keyboard again, close it with back.",
          "Open the + panel, then tap the field — the keyboard replaces the panel and the field stays visible.",
        ],
        ar: [
          "Galaxy A36 وهاتف بأزرار تنقل ثلاثة: افتح محادثة واضغط الحقل واكتب رسالة طويلة وأرسلها، وافتح لوحة المفاتيح مجدداً وأغلقها بزر الرجوع.",
          "افتح لوحة + ثم اضغط الحقل — تحل لوحة المفاتيح محل اللوحة ويبقى الحقل ظاهراً.",
        ],
      },
      updatedIn: "fix/android-chat-keyboard",
    },
  ],
};
