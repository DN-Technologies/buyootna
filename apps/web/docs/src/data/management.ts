import { DocSection } from "./types";

export const management: DocSection = {
  slug: "web-management",
  title: { en: "Web Management", ar: "بوابة إدارة الأملاك (ويب)" },
  summary: {
    en: 'Next.js property management portal (apps/web/management, port 3004). Same auth-only shell pattern as web-companies/web-offices, but with a likely-unfinished detail: SignupForm\'s defaultRole is currently "INDIVIDUAL", not a management-specific role.',
    ar: 'بوابة إدارة الأملاك المبنية على Next.js (apps/web/management، المنفذ 3004). نفس نمط الهيكل المقتصر على المصادقة الموجود في web-companies/web-offices، لكن مع تفصيل يُرجَّح أنه غير مكتمل: defaultRole في SignupForm هنا حالياً "INDIVIDUAL"، لا دوراً خاصاً بالإدارة.',
  },
  stories: [
    {
      id: "management-shell-scope",
      title: {
        en: "Portal is correctly scoped to an auth-only shell (known gap)",
        ar: "نطاق البوابة محصور بشكل صحيح في هيكل مصادقة فقط (فجوة معروفة)",
      },
      priority: "P1",
      story: {
        en: "As a QA engineer, I want to verify that apps/web/management currently only exposes the splash page and the three auth routes, so that this is tracked as expected current scope rather than filed as a missing property-manager-dashboard bug.",
        ar: "بصفتي مهندس ضمان جودة، أريد التحقق من أن apps/web/management تعرض حالياً فقط الصفحة الترحيبية ومسارات المصادقة الثلاثة، حتى يُوثَّق هذا كنطاق حالي متوقع بدلاً من أن يُبلَّغ عنه كخطأ 'لوحة تحكم مدير أملاك مفقودة'.",
      },
      acceptanceCriteria: {
        en: [
          "/ shows the 'بيوتنا للإدارة' splash with working links to login/signup.",
          "No property-management-specific routes (unit management, maintenance requests, etc.) exist yet.",
          "This story should be replaced with real dashboard coverage once a management dashboard ships.",
        ],
        ar: [
          "الصفحة / تعرض شاشة الترحيب 'بيوتنا للإدارة' مع روابط عاملة لتسجيل الدخول/التسجيل.",
          "لا توجد بعد مسارات خاصة بإدارة الأملاك (إدارة الوحدات، طلبات الصيانة، إلخ).",
          "يجب استبدال هذه القصة بتغطية اختبار حقيقية للوحة التحكم بمجرد إطلاق لوحة تحكم لإدارة الأملاك.",
        ],
      },
      testScenarios: {
        en: [
          "Crawl all links from the splash page and confirm none 404.",
          "Deep-link a plausible dashboard URL and confirm a clean 404.",
        ],
        ar: [
          "تفقّد كل الروابط من الصفحة الترحيبية وتأكد أن لا شيء منها يعطي خطأ 404.",
          "جرّب رابطاً مباشراً محتملاً للوحة التحكم وتأكد من ظهور خطأ 404 نظيف.",
        ],
      },
    },
    {
      id: "management-signup-role-bug",
      title: {
        en: "Signup defaults to INDIVIDUAL instead of a management-specific role — verify intentional or file as a bug",
        ar: "التسجيل يعتمد افتراضياً على INDIVIDUAL بدلاً من دور خاص بالإدارة — تحقق من كون هذا مقصوداً أو أبلغ عنه كخطأ",
      },
      priority: "P0",
      story: {
        en: 'As a QA engineer, I want to verify what role is actually submitted when a user signs up through apps/web/management, because SignupForm here is configured with defaultRole="INDIVIDUAL" — the same as no role selection at all — which looks like it may be an oversight left over from copying the web-companies/web-offices template rather than an intentional choice.',
        ar: 'بصفتي مهندس ضمان جودة، أريد التحقق من الدور الذي يُرسَل فعلياً عند تسجيل مستخدم عبر apps/web/management، لأن SignupForm هنا مُهيّأ بـ defaultRole="INDIVIDUAL" — وهو ما يماثل عدم اختيار أي دور إطلاقاً — وهذا يبدو وكأنه سهو متبقٍّ من نسخ قالب web-companies/web-offices، لا خياراً مقصوداً.',
      },
      acceptanceCriteria: {
        en: [
          "Confirm with product/eng whether accounts created via this portal are supposed to be INDIVIDUAL, or a dedicated MANAGEMENT-type role that hasn't been wired up yet.",
          "If INDIVIDUAL is unintentional: file a bug against apps/web/management/src/app/auth/signup (or wherever defaultRole is set) rather than treating current behavior as correct.",
          "If INDIVIDUAL is intentional (e.g. management accounts are provisioned differently, not via self-signup): document that explicitly so this story doesn't get re-flagged every regression pass.",
        ],
        ar: [
          "تأكد مع فريقَي المنتج والهندسة ما إذا كان من المفترض أن تكون الحسابات المُنشأة عبر هذه البوابة INDIVIDUAL، أم دور MANAGEMENT مخصص لم يُربط بعد.",
          "إذا كان INDIVIDUAL غير مقصود: أبلغ عن خطأ ضد apps/web/management/src/app/auth/signup (أو أينما تُحدَّد defaultRole) بدلاً من اعتبار السلوك الحالي صحيحاً.",
          "إذا كان INDIVIDUAL مقصوداً (مثلاً حسابات الإدارة تُنشأ بطريقة مختلفة، لا عبر التسجيل الذاتي): وثّق ذلك صراحةً حتى لا يُعاد الإبلاغ عن هذه القصة في كل جولة اختبار انحدار.",
        ],
      },
      testScenarios: {
        en: [
          "Complete signup on this portal and check via network inspector / admin /users table what role the created account actually has.",
          'Compare against the equivalent signup flow on web-companies (defaultRole="COMPANY") and web-offices (defaultRole="OFFICE") to confirm this portal is the outlier.',
          "Escalate to the team before closing this out either way — this is exactly the kind of copy-paste-template bug that's easy to miss without cross-portal comparison.",
        ],
        ar: [
          "أكمل التسجيل عبر هذه البوابة وتحقق عبر أداة فحص الشبكة / جدول /users في لوحة تحكم المشرف من الدور الفعلي للحساب المُنشأ.",
          'قارن مع تدفق التسجيل المكافئ على web-companies (defaultRole="COMPANY") وweb-offices (defaultRole="OFFICE") للتأكد أن هذه البوابة هي الاستثناء.',
          "صعّد الأمر إلى الفريق قبل إغلاق هذه القصة بأي اتجاه — هذا بالضبط نوع أخطاء نسخ القوالب التي يسهل تفويتها دون مقارنة بين البوابات.",
        ],
      },
    },
    {
      id: "management-shared-form-parity",
      title: {
        en: "Shared auth-form behavior stays in parity with the other portal shells",
        ar: "سلوك نماذج المصادقة المشتركة يبقى متطابقاً مع هياكل البوابات الأخرى",
      },
      priority: "P2",
      story: {
        en: "As a QA engineer, I want to verify that, aside from the role question above, apps/web/management's auth forms behave identically to web-companies/web-offices since they share the same @buyootna/ui components, so that any shared-component fix or regression is checked across all three portals, not just the one where it was first found.",
        ar: "بصفتي مهندس ضمان جودة، أريد التحقق من أنه بصرف النظر عن مسألة الدور أعلاه، تتصرف نماذج المصادقة في apps/web/management بشكل مطابق لـ web-companies/web-offices لأنها تشترك في نفس مكوّنات @buyootna/ui، حتى يُختبر أي إصلاح أو تراجع في مكوّن مشترك على البوابات الثلاث جميعها، لا على البوابة التي اكتُشف فيها أولاً فقط.",
      },
      acceptanceCriteria: {
        en: [
          "Validation behavior (non-empty checks, password confirm match, no zod/regex) matches web-companies and web-offices exactly.",
          "Forgot-password success/error states match the other two portals.",
        ],
        ar: [
          "سلوك التحقق من الصحة (فحوصات عدم الفراغ، تطابق تأكيد كلمة المرور، دون zod/regex) مطابق تماماً لـ web-companies وweb-offices.",
          "حالتا النجاح/الخطأ في نسيت كلمة المرور مطابقتان للبوابتين الأخريين.",
        ],
      },
      testScenarios: {
        en: [
          "Run the same auth test cases used for web-companies and web-offices against web-management and confirm identical behavior apart from the role field.",
        ],
        ar: [
          "شغّل نفس حالات اختبار المصادقة المستخدمة لـ web-companies وweb-offices على web-management وتأكد من تطابق السلوك باستثناء حقل الدور.",
        ],
      },
    },
  ],
};
