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
          "When the chat came from an ad, the notification names it first: 'عمارة للبيع · هاي'.",
          "No notification while the recipient has that conversation open.",
          "The sender never gets a notification for their own message.",
          "A device using a different persona of the recipient's account gets no notification.",
        ],
        ar: [
          "عندما يكون تطبيق المستلم في الخلفية أو مغلقاً، تظهر رسالة جديدة كإشعار باسم المرسل ومعاينة الرسالة.",
          "الضغط على الإشعار يفتح تلك المحادثة.",
          "إذا بدأت المحادثة من إعلان، يذكره الإشعار أولاً: 'عمارة للبيع · هاي'.",
          "لا يظهر إشعار ما دام المستلم يفتح تلك المحادثة.",
          "لا يتلقى المرسل إشعاراً برسالته.",
          "الجهاز الذي يستخدم هوية أخرى في حساب المستلم لا يتلقى إشعاراً.",
        ],
      },
      testScenarios: {
        en: [
          "Two devices: put B's app in the background, send 'هاي' from A — B shows 'A's name / هاي'; tap it — the chat opens.",
          "With the chat open on B, send from A — the message appears, no notification.",
          "Send an image and a property card — B's notifications say 📷 صورة and 🏠 عقار.",
          "Turn off app notifications on B's account, send again — no notification.",
        ],
        ar: [
          "جهازان: ضع تطبيق B في الخلفية وأرسل 'هاي' من A — يظهر على B إشعار 'اسم A / هاي'؛ اضغطه — تفتح المحادثة.",
          "والمحادثة مفتوحة على B، أرسل من A — تظهر الرسالة دون إشعار.",
          "أرسل صورة وبطاقة عقار — تقول إشعارات B 📷 صورة و 🏠 عقار.",
          "أوقف إشعارات التطبيق في حساب B وأرسل مجدداً — لا يظهر إشعار.",
        ],
      },
      updatedIn: "feat/real-trust-signals",
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
          "The no-image placeholder doesn't open the viewer.",
          "The company gallery shows only real projects, or the empty message.",
        ],
        ar: [
          "الضغط على أي صورة في الأماكن الأربعة يفتح العارض عند تلك الصورة بالعدّاد الصحيح.",
          "التكبير بإصبعين والضغط المزدوج يقرّبان ويبعّدان؛ ويمكن تحريك الصورة المكبّرة دون تجاوز حوافها؛ والانتقال لصورة أخرى يعيد التكبير.",
          "السحب للأسفل (دون تكبير) أو ✕ أو زر الرجوع في Android يغلق العارض.",
          "الصورة البديلة عند عدم وجود صور لا تفتح العارض.",
          "معرض الشركة يعرض المشاريع الحقيقية فقط أو رسالة عدم وجودها.",
        ],
      },
      testScenarios: {
        en: [
          "Open the 250,000 building ad, tap the second photo — full screen at '2 / n'; swipe through; pinch in, pan, double-tap out; swipe down to close.",
          "From the home feed, open تفاصيل العقار and tap a photo — same viewer.",
          "Open a company with projects → معرض الأعمال → tap a project with several photos — '1 / n' over that project's photos.",
          "In a chat with images, tap one — the viewer opens on it and swipes to the conversation's other images.",
        ],
        ar: [
          "افتح إعلان العمارة بـ 250,000 واضغط الصورة الثانية — بملء الشاشة عند '2 / n'؛ تنقّل؛ كبّر بإصبعين وحرّك ثم بعّد بضغط مزدوج؛ واسحب للأسفل للإغلاق.",
          "من الرئيسية افتح تفاصيل العقار واضغط صورة — نفس العارض.",
          "افتح شركة لها مشاريع ← معرض الأعمال ← اضغط مشروعاً بعدة صور — '1 / n' لصور ذلك المشروع.",
          "في محادثة فيها صور اضغط إحداها — يفتح العارض عليها ويتنقّل بين صور المحادثة الأخرى.",
        ],
      },
      updatedIn: "feat/image-viewer",
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
        ],
        ar: [
          "سحب الرسالة لليمين بعد أيقونة الرد يبدأ الرد (مع اهتزاز خفيف)؛ والسحب لليسار أو التمرير لا يبدأه.",
          "يظهر الاقتباس على الهاتفين بالاسم الصحيح؛ والضغط عليه ينتقل إلى الرسالة الأصلية.",
          "نسخ ينسخ النص؛ وحذف لدي يحذف الرسالة من هذه الجهة فقط ويبقى بعد إعادة فتح المحادثة.",
          "الرسالة قيد الإرسال لا يمكن الرد عليها أو حذفها بعد.",
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
      updatedIn: "feat/chat-reply-resume",
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
        ],
        ar: [
          "الصور حتى 10 ميجابايت لكل صورة والمستندات حتى 20 ميجابايت؛ وأكثر من 10 ملفات أو ملف أكبر أو نوع آخر (zip، فيديو) يُرفض برسالة واضحة.",
          "الصور المرسلة معاً رسالة واحدة تظهر كشبكة على الهاتفين، والتعليق يظهر تحتها.",
          "الرفع الفاشل يبقى كرسالة مع إعادة المحاولة، وإعادة المحاولة ترسلها مرة واحدة.",
          "رابط ملف المحادثة لا يفتح لأي شخص خارجها، وعنوان التخزين المباشر مرفوض.",
          "الرد على رسالة أثناء الإرفاق يظهر الاقتباس على المرفق المرسل.",
        ],
      },
      testScenarios: {
        en: [
          "Two devices: on A send 3 gallery photos with a caption — B sees a grid and the caption, gets the push '📷 3 صور'; tap a photo — viewer opens, swipe between them.",
          "On A send a PDF — B taps the card — the phone's preview opens the file; the chats list shows '📎 name.pdf'.",
          "Turn off the network on A, send a photo — retry appears; turn it on, tap retry — sent once.",
          "Wait over 15 minutes in an open chat, then tap a document — it still opens (link renewed).",
          "Take a photo with the camera and send it (Android: check the camera permission prompt).",
        ],
        ar: [
          "جهازان: على A أرسل 3 صور من المعرض مع تعليق — يرى B شبكة والتعليق ويصله إشعار '📷 3 صور'؛ اضغط صورة — يفتح العارض والتنقل بينها بالسحب.",
          "على A أرسل ملف PDF — يضغط B البطاقة — تفتح معاينة الهاتف الملف؛ وتظهر قائمة المحادثات '📎 الاسم.pdf'.",
          "افصل الشبكة على A وأرسل صورة — تظهر إعادة المحاولة؛ أعد الاتصال واضغطها — تُرسل مرة واحدة.",
          "انتظر أكثر من 15 دقيقة في محادثة مفتوحة ثم اضغط مستنداً — يفتح (تجدد الرابط).",
          "التقط صورة بالكاميرا وأرسلها (Android: تحقق من طلب إذن الكاميرا).",
        ],
      },
      updatedIn: "feat/chat-attachments-search",
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
  ],
};
