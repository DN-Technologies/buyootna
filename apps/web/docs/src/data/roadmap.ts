import { DocSection } from "./types";

// Features planned from the client's requirements document ("اضافات في
// المستقبل"). Nothing here is built yet; the full plan, with what exists
// today and the work, is docs/ai/plans/future-features-pdf.md.
export const roadmap: DocSection = {
  slug: "roadmap",
  title: { en: "Planned features", ar: "الميزات المخطط لها" },
  summary: {
    en: "Features from the client's requirements document, not built yet: the add-ad form's fields per category, clear prices, and five tools for offices and companies. Each story says what is planned and how it will be checked once built.",
    ar: "ميزات من وثيقة متطلبات العميل لم تُبنَ بعد: حقول نموذج إضافة الإعلان حسب الفئة، والسعر الواضح، وخمس أدوات للمكاتب والشركات. كل قصة توضح ما هو مخطط وكيف سيُختبر بعد بنائه.",
  },
  stories: [
    {
      id: "roadmap-add-ad-category-fields",
      title: {
        en: "Planned · Add-ad form: fields follow the property category",
        ar: "مخطط · نموذج إضافة الإعلان: الحقول تتبع فئة العقار",
      },
      priority: "P0",
      story: {
        en: "Planned, not built. From the client's requirements document. Every ad keeps the common fields (المحافظة، المنطقة، الموقع، فئة العقار، الرقم الآلي، المساحة، رقم الهاتف، تفاصيل الإعلان، نوع الإعلان، الصور) and the deal-type fields it has today (sale: price; rent: monthly rent, extra costs, rent terms; exchange: request year, required year, allocation status). What changes is the per-category set. بيت gains عدد الأدوار. شقة shows رقم الدور (the floor it is on) in place of a floors count. عمارة hides rooms and baths and gains عدد الشقق and حالة التأجير. أرض gains نوع التخصيص (سكني / استثماري / تجاري / حرفي) and حالة التخصيص. تجاري and استثماري hide rooms and baths and gain عدد الوحدات أو المحلات and الدخل الشهري; استثماري is offered again for new ads. شاليه keeps عمر العقار، الغرف، الحمامات. مزرعة gains مزروعة and مبنية. Needs a database migration (approval first), then the app by OTA and the website.",
        ar: "مخطط، لم يُبنَ. من وثيقة متطلبات العميل. يحتفظ كل إعلان بالحقول الثابتة (المحافظة، المنطقة، الموقع، فئة العقار، الرقم الآلي، المساحة، رقم الهاتف، تفاصيل الإعلان، نوع الإعلان، الصور) وبحقول نوع العملية الحالية (بيع: السعر؛ إيجار: الإيجار الشهري والمصاريف الإضافية وشروط الإيجار؛ بدل: سنة الطلب والسنة المطلوبة وحالة التخصيص). ما يتغير هو حقول كل فئة. بيت: يضاف عدد الأدوار. شقة: رقم الدور مكان عدد الأدوار. عمارة: تُخفى الغرف والحمامات ويضاف عدد الشقق وحالة التأجير. أرض: يضاف نوع التخصيص (سكني / استثماري / تجاري / حرفي) وحالة التخصيص. تجاري واستثماري: تُخفى الغرف والحمامات ويضاف عدد الوحدات أو المحلات والدخل الشهري، ويعود استثماري متاحاً للإعلانات الجديدة. شاليه: عمر العقار والغرف والحمامات. مزرعة: يضاف مزروعة ومبنية. يتطلب ترحيلاً لقاعدة البيانات (بعد الموافقة) ثم التطبيق عبر OTA والموقع.",
      },
      acceptanceCriteria: {
        en: [
          "Each category shows exactly the fields in the requirements table, and none of the hidden ones.",
          "Fields a category doesn't have are not saved, even if an older app sends them.",
          "The ad page and the preview show every new field that has a value.",
          "Changing the category while editing drops the fields the new category doesn't have.",
        ],
        ar: [
          "كل فئة تعرض الحقول الواردة في جدول المتطلبات فقط، ولا شيء من الحقول المخفية.",
          "الحقول التي ليست للفئة لا تُحفظ، حتى لو أرسلها تطبيق قديم.",
          "صفحة الإعلان والمعاينة تعرضان كل حقل جديد له قيمة.",
          "تغيير الفئة أثناء التعديل يُسقط الحقول التي ليست للفئة الجديدة.",
        ],
      },
      testScenarios: {
        en: [
          "For each of the eight categories, open إضافة إعلان and compare the fields with the table.",
          "Publish a land ad with نوع التخصيص تجاري and a farm marked مزروعة; check the ad page.",
        ],
        ar: [
          "لكل فئة من الفئات الثماني افتح إضافة إعلان وقارن الحقول بالجدول.",
          "انشر إعلان أرض بنوع تخصيص تجاري وإعلان مزرعة مزروعة؛ وتحقق من صفحة الإعلان.",
        ],
      },
      updatedIn: "docs/future-features-plan",
    },
    {
      id: "roadmap-clear-price-and-owner",
      title: {
        en: "Planned · A clear price, and the owner says so",
        ar: "مخطط · سعر واضح، والمالك يصرّح بذلك",
      },
      priority: "P0",
      story: {
        en: "Planned, not built. A Ministry of Commerce decision (December 2024) requires an advertised price to be clear and fixed: words such as «حد», «سوم» and «مراجعة» may not be added to it. It applies to real-estate companies and licensed offices; an owner may advertise if they follow the rules and state that they are the owner. Planned: sale and rent ads from companies and offices must have a price; an ad whose description qualifies the price with those words is refused with a clear message; an individual confirms «أنا مالك العقار» when publishing, and the ad page shows «المعلن هو المالك».",
        ar: "مخطط، لم يُبنَ. قرار وزارة التجارة (ديسمبر 2024) يشترط أن يكون السعر المعلن واضحاً ومحدداً، ويمنع إضافة كلمات مثل «حد» و«سوم» و«مراجعة» إليه. القرار يخص الشركات العقارية والمكاتب المرخصة، ويسمح للمالك بالإعلان بشرط الالتزام بالأحكام وتوضيح أنه المالك. المخطط: إعلانات البيع والإيجار من الشركات والمكاتب تتطلب سعراً؛ والإعلان الذي يقيّد السعر بتلك الكلمات في وصفه يُرفض برسالة واضحة؛ والفرد يؤكد «أنا مالك العقار» عند النشر، وتعرض صفحة الإعلان «المعلن هو المالك».",
      },
      acceptanceCriteria: {
        en: [
          "A company or office sale / rent ad without a price can't be published.",
          "A description such as «السعر حد 120 ألف» or «السعر على السوم» is refused with a message naming the rule.",
          "An individual can't publish without ticking أنا مالك العقار; the ad page then shows it.",
        ],
        ar: [
          "إعلان بيع أو إيجار من شركة أو مكتب بلا سعر لا يُنشر.",
          "وصف مثل «السعر حد 120 ألف» أو «السعر على السوم» يُرفض برسالة تذكر القاعدة.",
          "لا يستطيع الفرد النشر دون تحديد أنا مالك العقار، وتعرضه صفحة الإعلان بعدها.",
        ],
      },
      testScenarios: {
        en: [
          "As an office, publish a rent ad with «السعر مراجعة» in the description — refused.",
          "As an individual, publish with and without the owner box ticked.",
        ],
        ar: [
          "كمكتب انشر إعلان إيجار وفي وصفه «السعر مراجعة» — يُرفض.",
          "كفرد انشر مع تحديد خانة المالك ودونها.",
        ],
      },
      updatedIn: "docs/future-features-plan",
    },
    {
      id: "roadmap-owner-confirms-listing",
      title: {
        en: "Planned · The owner confirms the ad is still available",
        ar: "مخطط · المالك يؤكد أن الإعلان ما زال متاحاً",
      },
      priority: "P1",
      story: {
        en: "Planned for the next version, after discussion. Instead of an office calling the owner every day, the owner gets a message: «شقتك في السالمية معروضة للإيجار بسعر 350 د.ك، هل العقار ما زال متاحاً؟ وهل ترغب بتحديث السعر؟». The owner confirms, marks it let or sold, or changes the price from the app (or an SMS link if they don't have it). If nothing comes back within a set time, the office sees the ad as «يحتاج تحديث» rather than assuming it is still available. The office adds the owner's phone to the ad.",
        ar: "مخطط للإصدار القادم بعد النقاش. بدلاً من أن يتصل موظف المكتب بالمالك كل يوم، يصل المالكَ إشعار: «شقتك في السالمية معروضة للإيجار بسعر 350 د.ك، هل العقار ما زال متاحاً؟ وهل ترغب بتحديث السعر؟». يؤكد المالك، أو يحدد أنه تأجّر أو بيع، أو يغيّر السعر من التطبيق (أو من رابط SMS إن لم يكن لديه التطبيق). وإن لم يصل رد خلال مدة محددة يظهر الإعلان للمكتب «يحتاج تحديث» بدلاً من افتراض أنه ما زال متاحاً. ويضيف المكتب رقم المالك إلى الإعلان.",
      },
      acceptanceCriteria: {
        en: [
          "The owner receives the check at the agreed interval, by push or SMS.",
          "Confirming, marking let / sold, or changing the price updates the ad and is visible to the office.",
          "An ad not confirmed in time is flagged «يحتاج تحديث» in the office's list.",
        ],
        ar: [
          "يصل المالكَ التحقق في المدة المتفق عليها، بإشعار أو SMS.",
          "التأكيد أو تحديد أنه تأجّر / بيع أو تغيير السعر يحدّث الإعلان ويظهر للمكتب.",
          "الإعلان الذي لم يؤكَّد في الوقت يظهر بعلامة «يحتاج تحديث» في قائمة المكتب.",
        ],
      },
      testScenarios: {
        en: [
          "As an office, add an ad with the owner's number; as the owner, answer the check with a new price.",
        ],
        ar: [
          "كمكتب أضف إعلاناً برقم المالك؛ وكمالك أجب على التحقق بسعر جديد.",
        ],
      },
      updatedIn: "docs/future-features-plan",
    },
    {
      id: "roadmap-smart-client-requests",
      title: {
        en: "Planned · Smart client requests reach the office",
        ar: "مخطط · طلبات العملاء الذكية تصل إلى المكتب",
      },
      priority: "P1",
      story: {
        en: "Planned for the next version, after discussion. A client's search request (for example a flat in حولي, budget 400 KWD, three bedrooms) is matched with listed properties. Today a client's alert already matches new ads and tells the client. Planned: a client can allow offices to contact them about matches; when an office or company adds a matching ad, its staff are told there is an interested client and can start a chat, within the client's preferences and consent.",
        ar: "مخطط للإصدار القادم بعد النقاش. يُطابق طلب بحث العميل (مثلاً شقة في حولي بميزانية 400 د.ك وثلاث غرف نوم) مع العقارات المسجلة. اليوم يطابق تنبيه العميل الإعلانات الجديدة ويُعلم العميل. المخطط: يستطيع العميل السماح للمكاتب بالتواصل معه بشأن المطابقات؛ وحين يضيف مكتب أو شركة إعلاناً مطابقاً يُبلَّغ الموظف بوجود عميل مهتم ويستطيع بدء محادثة، وفق تفضيلات العميل وموافقته.",
      },
      acceptanceCriteria: {
        en: [
          "The consent is off by default and can be changed on the alert.",
          "A matching office ad notifies the office and lists the interested clients on the ad.",
          "A client who hasn't consented is never shown to an office.",
        ],
        ar: [
          "الموافقة مغلقة افتراضياً ويمكن تغييرها في التنبيه.",
          "الإعلان المطابق للمكتب يرسل إشعاراً للمكتب ويعرض العملاء المهتمين على الإعلان.",
          "العميل الذي لم يوافق لا يظهر لأي مكتب.",
        ],
      },
      testScenarios: {
        en: [
          "As a client, create an alert with consent on; as an office, publish a matching flat.",
        ],
        ar: [
          "كعميل أنشئ تنبيهاً مع الموافقة؛ وكمكتب انشر شقة مطابقة.",
        ],
      },
      updatedIn: "docs/future-features-plan",
    },
    {
      id: "roadmap-commission-agreement",
      title: {
        en: "Planned · Commission agreement in the deal file",
        ar: "مخطط · اتفاق العمولة في ملف الصفقة",
      },
      priority: "P2",
      story: {
        en: "Planned for the next version, after discussion. To avoid disputes about the commission, the office creates an agreement stating the parties, the property, the commission amount or how it is calculated, who pays it, and when it is due. It is sent to the other party in the app to accept, and a copy is kept in the deal's file. Introduces a deal file (صفقة) per property and client.",
        ar: "مخطط للإصدار القادم بعد النقاش. لتجنب الخلافات حول العمولة ينشئ المكتب اتفاقاً يوضح أطراف الاتفاق والعقار وقيمة العمولة أو طريقة احتسابها والطرف المسؤول عن دفعها وشروط الاستحقاق. يُرسل إلى الطرف الآخر داخل التطبيق ليوافق عليه، وتُحفظ نسخة في ملف الصفقة. ويضيف ملف صفقة لكل عقار وعميل.",
      },
      acceptanceCriteria: {
        en: [
          "The agreement holds the five items and can't be sent with one missing.",
          "The other party accepts or declines in the app; the result and the time are recorded.",
          "A PDF copy is kept in the deal file for both parties.",
        ],
        ar: [
          "يتضمن الاتفاق البنود الخمسة ولا يُرسل إن نقص أحدها.",
          "يوافق الطرف الآخر أو يرفض داخل التطبيق، ويُسجَّل الرد ووقته.",
          "تُحفظ نسخة PDF في ملف الصفقة للطرفين.",
        ],
      },
      testScenarios: {
        en: [
          "As an office, send a commission agreement for a flat; accept it as the client.",
        ],
        ar: [
          "كمكتب أرسل اتفاق عمولة لشقة؛ ووافق عليه كعميل.",
        ],
      },
      updatedIn: "docs/future-features-plan",
    },
    {
      id: "roadmap-office-cooperation",
      title: {
        en: "Planned · Cooperation between real-estate offices",
        ar: "مخطط · التعاون بين المكاتب العقارية",
      },
      priority: "P2",
      story: {
        en: "Planned for the next version, after discussion. An office may have the right property for another office's client. An office can offer a cooperation opportunity to approved offices, stating the property and the opportunity, the office that has the client, the terms and agreed commission, and the deal's status; agreements and approvals are recorded. Builds on the commission agreement's deal file.",
        ar: "مخطط للإصدار القادم بعد النقاش. قد يملك مكتب عقاراً مناسباً لعميل لدى مكتب آخر. يستطيع المكتب عرض فرصة تعاون على المكاتب المعتمدة مع تحديد العقار والفرصة المتاحة، والمكتب الذي لديه العميل، وشروط التعاون والعمولة المتفق عليها، وحالة الصفقة؛ وتُحفظ الاتفاقات وسجل الموافقات. ويبني على ملف الصفقة في اتفاق العمولة.",
      },
      acceptanceCriteria: {
        en: [
          "Only approved offices and companies can offer or take an opportunity.",
          "An accepted opportunity becomes a deal file with both offices and the agreed split.",
          "Every request, acceptance and status change is kept in the deal's history.",
        ],
        ar: [
          "المكاتب والشركات المعتمدة فقط تستطيع عرض فرصة أو قبولها.",
          "الفرصة المقبولة تصبح ملف صفقة بالمكتبين والتقسيم المتفق عليه.",
          "كل طلب وقبول وتغيير حالة يُحفظ في سجل الصفقة.",
        ],
      },
      testScenarios: {
        en: [
          "Office A offers a flat for cooperation; office B requests it; A accepts — check the deal file.",
        ],
        ar: [
          "المكتب أ يعرض شقة للتعاون؛ والمكتب ب يطلبها؛ ويوافق أ — تحقق من ملف الصفقة.",
        ],
      },
      updatedIn: "docs/future-features-plan",
    },
    {
      id: "roadmap-electronic-lease",
      title: {
        en: "Planned · Electronic lease contract",
        ar: "مخطط · عقد إيجار إلكتروني",
      },
      priority: "P2",
      story: {
        en: "Planned for the next version, after discussion and a legal check. Today someone carries the paper lease to the owner to sign, then to the tenant. Planned: from the + button an office issues an electronic lease with its logo and terms, sends it as a link over a secure channel, and the owner and tenant sign it with their identity checked; the signed copy goes to all parties. Open question: whether a lease signed in the app (OTP and signature) is legally valid in Kuwait, or a national e-signature is required.",
        ar: "مخطط للإصدار القادم بعد النقاش والتحقق القانوني. اليوم يأخذ شخص العقد الورقي إلى المالك ليوقّعه ثم إلى المستأجر. المخطط: من زر + يُصدر المكتب عقد إيجار إلكترونياً بشعاره وشروطه، ويرسله رابطاً عبر قناة آمنة، فيوقّعه المالك والمستأجر بعد التحقق من هويتهما، وتصل النسخة الموقعة لجميع الأطراف. سؤال مفتوح: هل العقد الموقّع داخل التطبيق (OTP وتوقيع) صالح قانونياً في الكويت، أم يلزم توقيع إلكتروني وطني.",
      },
      acceptanceCriteria: {
        en: [
          "The lease shows the office's logo, the parties, the property, rent, duration, deposit and terms.",
          "Each signer is verified by a code to their phone before signing.",
          "The signed PDF is stored privately and sent to the office, owner and tenant.",
        ],
        ar: [
          "يعرض العقد شعار المكتب والأطراف والعقار والإيجار والمدة والتأمين والشروط.",
          "يُتحقق من كل موقّع برمز إلى هاتفه قبل التوقيع.",
          "يُحفظ ملف PDF الموقّع بشكل خاص ويُرسل إلى المكتب والمالك والمستأجر.",
        ],
      },
      testScenarios: {
        en: [
          "As an office, issue a lease; sign it as the owner, then as the tenant.",
        ],
        ar: [
          "كمكتب أصدر عقداً؛ ووقّعه كمالك ثم كمستأجر.",
        ],
      },
      updatedIn: "docs/future-features-plan",
    },
  ],
};
