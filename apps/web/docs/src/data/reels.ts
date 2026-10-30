import { DocSection } from "./types";

export const reels: DocSection = {
  slug: "reels",
  title: { en: "Reels", ar: "الريلز" },
  summary: {
    en: "Short public videos from companies and offices, hidden behind a server switch until launch. These stories grow as each part ships; today only the API exists, for posting and for the feed.",
    ar: "فيديوهات قصيرة عامة من الشركات والمكاتب، مخفية خلف مفتاح في الخادم حتى الإطلاق. تتوسع هذه القصص مع كل جزء يُنشر؛ حالياً تتوفر الواجهة البرمجية فقط، للنشر وللصفحة الرئيسية.",
  },
  stories: [
    {
      id: "reels-switch",
      title: {
        en: "Reels stay hidden until the server switch is on",
        ar: "تبقى الريلز مخفية حتى يُفعَّل المفتاح في الخادم",
      },
      priority: "P0",
      story: {
        en: "Verify that nobody can reach reels until the server turns them on, and that listed testers can reach them before everyone else.",
        ar: "تحقق من أن لا أحد يستطيع الوصول إلى الريلز حتى يفعّلها الخادم، وأن المختبرين المدرجين يصلون إليها قبل الجميع.",
      },
      acceptanceCriteria: {
        en: [
          "With REELS_ENABLED unset and no tester list, GET /reels/availability answers enabled: false and every other /reels route answers 404, signed in or not.",
          "An account listed in REELS_TESTER_USER_IDS gets enabled: true and can use the routes; anyone else still gets 404.",
          "With REELS_ENABLED=true, availability answers enabled: true for everyone, guests included.",
          "Changing the switch needs an API restart but no app update.",
        ],
        ar: [
          "عند عدم ضبط REELS_ENABLED وعدم وجود قائمة مختبرين، يجيب GET /reels/availability بـ enabled: false ويجيب كل مسار آخر في /reels بـ 404، سواء كان المستخدم مسجلاً أم لا.",
          "الحساب المدرج في REELS_TESTER_USER_IDS يحصل على enabled: true ويستطيع استخدام المسارات؛ وأي حساب آخر يبقى يحصل على 404.",
          "عند REELS_ENABLED=true يجيب availability بـ enabled: true للجميع، بمن فيهم الزوار.",
          "تغيير المفتاح يحتاج إلى إعادة تشغيل الخادم دون تحديث التطبيق.",
        ],
      },
      testScenarios: {
        en: [
          "Leave the switch off and call POST /reels/uploads with a valid company token: confirm 404, not 401 or 403.",
          "Add a test account to REELS_TESTER_USER_IDS, restart the API, and repeat: confirm it works for that account and is still 404 for another.",
          "Set REELS_ENABLED=true, restart, and call availability with no token: confirm enabled: true.",
        ],
        ar: [
          "اترك المفتاح معطلاً واستدعِ POST /reels/uploads برمز شركة صالح: تأكد من 404 وليس 401 أو 403.",
          "أضف حساب اختبار إلى REELS_TESTER_USER_IDS وأعد تشغيل الخادم وكرر: تأكد أنه يعمل لهذا الحساب ويبقى 404 لحساب آخر.",
          "اضبط REELS_ENABLED=true وأعد التشغيل واستدعِ availability دون رمز: تأكد من enabled: true.",
        ],
      },
      updatedIn: "feat/reels-api-core",
    },
    {
      id: "reels-api-publish",
      title: {
        en: "Companies and offices can upload and publish a reel",
        ar: "تستطيع الشركات والمكاتب رفع ونشر فيديو ريل",
      },
      priority: "P0",
      story: {
        en: "Verify the upload slot, direct upload to S3 and publish flow, including the server's own checks of the file.",
        ar: "تحقق من مسار حجز الرفع والرفع المباشر إلى S3 والنشر، بما في ذلك فحص الخادم للملف بنفسه.",
      },
      acceptanceCriteria: {
        en: [
          "Only approved companies with a running subscription and approved offices get a slot. An individual gets REEL_PUBLISHER_ONLY and a lapsed company gets SUBSCRIPTION_REQUIRED.",
          "A slot accepts MP4 up to 50 MB with a JPEG poster up to 1 MB. A newer slot replaces the profile's older pending one.",
          "Publish accepts H.264 up to 60 seconds and at most 12 Mbps on average, with optional AAC sound, and stores the width, height and length the server measured.",
          "A refused file answers REEL_MEDIA_INVALID with the reason in Arabic, and its files are deleted from S3 at once.",
          "Publishing before the upload finishes answers REEL_UPLOAD_INCOMPLETE and the slot stays usable; after 30 minutes it answers REEL_UPLOAD_EXPIRED.",
          "A published reel's media and poster links are public, stable and support range requests.",
          "A reel can link only to the author's own active listing. Publishing twice returns the same reel.",
          "At most 10 reels can be published in 24 hours per profile, and deleting one doesn't free a place (REEL_LIMIT).",
        ],
        ar: [
          "تحصل على حجز الرفع الشركات المعتمدة ذات الاشتراك الساري والمكاتب المعتمدة فقط. يحصل الفرد على REEL_PUBLISHER_ONLY وتحصل الشركة منتهية الاشتراك على SUBSCRIPTION_REQUIRED.",
          "يقبل الحجز ملف MP4 حتى 50 ميجابايت مع صورة غلاف JPEG حتى 1 ميجابايت. الحجز الأحدث يحل محل الحجز المعلق الأقدم للملف الشخصي نفسه.",
          "يقبل النشر فيديو H.264 حتى 60 ثانية وبمعدل لا يتجاوز 12 ميجابت في الثانية، مع صوت AAC اختياري، ويحفظ العرض والارتفاع والمدة كما قاسها الخادم.",
          "الملف المرفوض يعيد REEL_MEDIA_INVALID مع السبب بالعربية، وتُحذف ملفاته من S3 فوراً.",
          "النشر قبل اكتمال الرفع يعيد REEL_UPLOAD_INCOMPLETE ويبقى الحجز صالحاً؛ وبعد 30 دقيقة يعيد REEL_UPLOAD_EXPIRED.",
          "روابط الفيديو والغلاف للريل المنشور عامة وثابتة وتدعم طلبات النطاق.",
          "يمكن ربط الريل بإعلان نشط يخص صاحبه فقط. النشر مرتين يعيد الريل نفسه.",
          "يمكن نشر 10 ريلز كحد أقصى خلال 24 ساعة لكل ملف شخصي، وحذف أحدها لا يحرر مكاناً (REEL_LIMIT).",
        ],
      },
      testScenarios: {
        en: [
          "As a company on trial, get a slot, PUT the poster and a 45-second 720p H.264 MP4 with the signed headers, then publish: confirm 200 and that the media URL opens with no credentials.",
          "Repeat with a 61-second video, an HEVC video and a very high bitrate video: confirm 422 with too_long, video_codec and bitrate_too_high, and that each file's URL no longer opens.",
          "As an individual, ask for a slot: confirm 403. As a company with no running subscription: confirm SUBSCRIPTION_REQUIRED.",
          "Publish with another company's listing: confirm REEL_PROPERTY_INVALID.",
          "Publish 10 reels, delete one, and ask for another slot: confirm REEL_LIMIT.",
        ],
        ar: [
          "كشركة في الفترة التجريبية، احجز الرفع وارفع الغلاف وفيديو H.264 بدقة 720p مدته 45 ثانية بالترويسات الموقعة ثم انشر: تأكد من 200 ومن أن رابط الفيديو يفتح دون بيانات اعتماد.",
          "كرر بفيديو مدته 61 ثانية وفيديو HEVC وفيديو بمعدل بيانات مرتفع جداً: تأكد من 422 مع too_long وvideo_codec وbitrate_too_high، ومن أن رابط كل ملف لم يعد يفتح.",
          "كفرد، اطلب حجز رفع: تأكد من 403. وكشركة دون اشتراك ساري: تأكد من SUBSCRIPTION_REQUIRED.",
          "انشر مع إعلان يخص شركة أخرى: تأكد من REEL_PROPERTY_INVALID.",
          "انشر 10 ريلز واحذف واحداً ثم اطلب حجزاً جديداً: تأكد من REEL_LIMIT.",
        ],
      },
      updatedIn: "feat/reels-api-core",
    },
    {
      id: "reels-api-delete-cleanup",
      title: {
        en: "Deleting a reel removes its public files",
        ar: "حذف الريل يزيل ملفاته العامة",
      },
      priority: "P1",
      story: {
        en: "Verify that a deleted reel's files stop opening and that the cleanup removes what is left behind.",
        ar: "تحقق من أن ملفات الريل المحذوف لم تعد تفتح وأن التنظيف يزيل ما تبقى.",
      },
      acceptanceCriteria: {
        en: [
          "The author deletes a reel with DELETE /reels/:id. Its media and poster links stop opening at once, and repeating the call is harmless.",
          "Another profile gets 404 when it tries to publish or delete someone else's reel.",
          "The cleanup runs every 10 minutes: it retries files S3 failed to delete, and removes abandoned slots and failed reels.",
          "A deleted reel's row stays for 24 hours after publishing, because it still counts toward the limit.",
          "In production only, a daily job deletes files no reel accounts for, such as those of a deleted account.",
        ],
        ar: [
          "يحذف صاحب الريل الفيديو عبر DELETE /reels/:id. تتوقف روابط الفيديو والغلاف عن الفتح فوراً، وتكرار الطلب لا يضر.",
          "يحصل أي ملف شخصي آخر على 404 عند محاولة نشر أو حذف ريل يخص غيره.",
          "يعمل التنظيف كل 10 دقائق: يعيد محاولة حذف الملفات التي فشل حذفها في S3، ويزيل الحجوزات المتروكة والريلز المرفوضة.",
          "يبقى سجل الريل المحذوف 24 ساعة بعد نشره لأنه يظل محسوباً ضمن الحد.",
          "في الإنتاج فقط، تحذف مهمة يومية الملفات التي لا يقابلها أي ريل، مثل ملفات حساب محذوف.",
        ],
      },
      testScenarios: {
        en: [
          "Publish a reel, note its media URL, delete it, and open the URL: confirm it no longer opens.",
          "Delete the same reel again: confirm 204.",
          "Get a slot and don't upload anything. After the 30-minute window and the 5-minute grace, confirm the cleanup removes the row.",
        ],
        ar: [
          "انشر ريلاً ودوّن رابط الفيديو ثم احذفه وافتح الرابط: تأكد أنه لم يعد يفتح.",
          "احذف الريل نفسه مرة أخرى: تأكد من 204.",
          "احجز رفعاً دون رفع أي ملف. بعد مهلة 30 دقيقة و5 دقائق إضافية، تأكد من أن التنظيف أزال السجل.",
        ],
      },
      updatedIn: "feat/reels-api-core",
    },
    {
      id: "reels-api-feed",
      title: {
        en: "The main feed shows the right reels in the right order",
        ar: "تعرض الصفحة الرئيسية للريلز الفيديوهات الصحيحة بالترتيب الصحيح",
      },
      priority: "P0",
      story: {
        en: "Verify GET /reels/feed for guests and signed-in profiles: what appears, what doesn't, and in what order.",
        ar: "تحقق من GET /reels/feed للزوار والملفات المسجلة: ما يظهر وما لا يظهر وبأي ترتيب.",
      },
      acceptanceCriteria: {
        en: [
          "A guest can read the feed and gets newest first, with liked and viewed always false.",
          "A signed-in profile gets the reels it hasn't seen, newest first, then the ones it has seen, newest first.",
          "The feed leaves out the viewer's own account's reels, and reels of an account blocked either way.",
          "A reel leaves the feed when its author isn't approved or its account is disabled or blocked, and when a company's subscription has lapsed. It returns on renewal.",
          "A reel published with a listing leaves the feed when that listing is closed, expired, hidden or deleted. It returns if the listing goes live again.",
          "Same-author reels aren't back to back where a page allows it.",
          "Pages don't repeat or skip reels within a scroll. A reel published after the first page isn't part of that scroll. A cursor lasts 6 hours, then answers REEL_CURSOR_EXPIRED.",
          "No response contains a phone number.",
        ],
        ar: [
          "يستطيع الزائر قراءة الصفحة ويحصل على الأحدث أولاً، وتكون liked وviewed دائماً false.",
          "يحصل الملف المسجل على ما لم يشاهده الأحدث أولاً، ثم ما شاهده الأحدث أولاً.",
          "تستثني الصفحة ريلز حساب المشاهد نفسه، وريلز أي حساب بينه وبين المشاهد حظر من أي طرف.",
          "يخرج الريل من الصفحة إذا لم يكن صاحبه معتمداً أو كان حسابه معطلاً أو محظوراً، وإذا انتهى اشتراك الشركة. ويعود عند التجديد.",
          "الريل المنشور مع إعلان يخرج من الصفحة إذا أُغلق الإعلان أو انتهى أو أُخفي أو حُذف. ويعود إذا نُشر الإعلان مجدداً.",
          "لا تتتالى ريلز صاحب واحد حيث تسمح الصفحة بذلك.",
          "لا تتكرر الريلز ولا تُفقد بين الصفحات خلال التمرير الواحد. الريل المنشور بعد الصفحة الأولى ليس جزءاً من هذا التمرير. يبقى المؤشر صالحاً 6 ساعات ثم يعيد REEL_CURSOR_EXPIRED.",
          "لا تحتوي أي استجابة على رقم هاتف.",
        ],
      },
      testScenarios: {
        en: [
          "Call the feed with no token: confirm 200 and newest first.",
          "As an individual, record a view of the newest reel and reload: confirm it moves after the unseen ones with viewed: true.",
          "Close a linked listing: confirm the reel leaves the feed, stays on the profile, and its property is null. Reopen the listing: confirm it returns.",
          "End a company's subscription: confirm its reels leave the feed and stay on its profile.",
          "Block an author from a viewer's account: confirm its reels leave that viewer's feed, profile list and direct link, and still show to a guest.",
        ],
        ar: [
          "استدعِ الصفحة دون رمز: تأكد من 200 ومن أن الأحدث أولاً.",
          "كفرد، سجّل مشاهدة لأحدث ريل وأعد التحميل: تأكد أنه انتقل بعد غير المشاهدة مع viewed: true.",
          "أغلق إعلاناً مرتبطاً: تأكد أن الريل خرج من الصفحة وبقي في الملف الشخصي وأن property تساوي null. أعد فتح الإعلان: تأكد أنه عاد.",
          "أنهِ اشتراك شركة: تأكد أن ريلزها خرجت من الصفحة وبقيت في ملفها الشخصي.",
          "احظر صاحب ريلز من حساب مشاهد: تأكد أن ريلزه خرجت من صفحة ذلك المشاهد وقائمة الملف والرابط المباشر، وأنها ما زالت تظهر للزائر.",
        ],
      },
      updatedIn: "feat/reels-api-feed",
    },
    {
      id: "reels-api-views-likes",
      title: {
        en: "Views and likes count once per profile",
        ar: "تُحتسب المشاهدات والإعجابات مرة واحدة لكل ملف شخصي",
      },
      priority: "P1",
      story: {
        en: "Verify POST /reels/views and PUT or DELETE /reels/:id/like, and that the author sees the counts in GET /reels/me.",
        ar: "تحقق من POST /reels/views وPUT أو DELETE /reels/:id/like، ومن أن صاحب الريل يرى الأعداد في GET /reels/me.",
      },
      acceptanceCriteria: {
        en: [
          "Views and likes need sign-in; a guest gets 401.",
          "Repeating a view or a like, even at the same moment, counts once. Taking a like back lowers the count once.",
          "The author's own account's views don't count. Reels the viewer may not see are skipped without an error.",
          "A batch holds up to 50 reels.",
          "Per-viewer view rows older than 180 days are removed, and the reel keeps its count.",
        ],
        ar: [
          "تتطلب المشاهدات والإعجابات تسجيل الدخول؛ ويحصل الزائر على 401.",
          "تكرار المشاهدة أو الإعجاب، حتى في اللحظة نفسها، يُحتسب مرة واحدة. وسحب الإعجاب يخفض العدد مرة واحدة.",
          "لا تُحتسب مشاهدات حساب صاحب الريل. وتُتجاوز الريلز التي لا يحق للمشاهد رؤيتها دون خطأ.",
          "تتسع الدفعة الواحدة حتى 50 ريل.",
          "تُحذف سجلات المشاهدة الأقدم من 180 يوماً، ويحتفظ الريل بعدده.",
        ],
      },
      testScenarios: {
        en: [
          "Send the same view three times: confirm viewCount is 1.",
          "Like twice: confirm likeCount is 1. Unlike twice: confirm it is 0.",
          "As the author, send a view of your own reel: confirm viewCount doesn't change.",
          "As the author, open GET /reels/me: confirm the counts appear.",
        ],
        ar: [
          "أرسل المشاهدة نفسها ثلاث مرات: تأكد أن viewCount يساوي 1.",
          "أعجب مرتين: تأكد أن likeCount يساوي 1. واسحب الإعجاب مرتين: تأكد أنه يساوي 0.",
          "كصاحب الريل، أرسل مشاهدة لريلك: تأكد أن viewCount لم يتغير.",
          "كصاحب الريل، افتح GET /reels/me: تأكد من ظهور الأعداد.",
        ],
      },
      updatedIn: "feat/reels-api-feed",
    },
  ],
};
