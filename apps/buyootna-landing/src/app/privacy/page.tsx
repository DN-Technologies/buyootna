import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0A1118] text-[#ECEFF2] py-12 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C5A880]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto z-10 relative">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#C5A880] mb-8 transition-colors group"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          الرجوع للرئيسية
        </Link>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="p-4 rounded-2xl bg-[#C5A880]/10 text-[#C5A880]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">سياسة الخصوصية</h1>
          <p className="text-sm text-zinc-500">آخر تحديث: يوليو 2026</p>
          <div className="w-16 h-1 bg-[#C5A880] rounded-full mt-2" />
        </div>

        {/* Content Box */}
        <div className="bg-[#0F1E2E]/30 border border-[#1B2936]/50 rounded-3xl p-8 md:p-12 shadow-xl leading-relaxed text-right space-y-8 font-sans">
          <p className="text-zinc-300 text-lg">
            نلتزم في تطبيق (بيوتنا) بسياسة خصوصية راسخة وشاملة وكاملة، تعمل على حماية بياناتك ومعلوماتك الشخصية ومعالجتها وفقاً للقوانين والأنظمة واللوائح المعمول بها في دولة الكويت، بما في ذلك قانون المعاملات الإلكترونية رقم 20 لعام 2014م وقانون مكافحة جرائم تكنولوجيا المعلومات رقم 63 لسنة 2015 ولائحة حماية خصوصية البيانات الصادرة من الهيئة العامة للاتصالات وتقنية المعلومات في القرار رقم 26/2024 والقوانين الأخرى الناظمة. وتشمل سياسة الخصوصية آلية جمع البيانات وكيفية معالجتها واستخدامها وحمايتها على النحو التالي:
          </p>

          {/* Section 1 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#C5A880]">أولاً: جمع البيانات</h2>
            
            <h3 className="font-semibold text-white mt-4">- تسجيل الأفراد وإدارة العقار:</h3>
            <p className="text-zinc-300 text-sm">عزيزي المستخدم، عند تسجيلك في الموقع فإننا نطلب منك تزويدنا بمعلومات شخصية محددة:</p>
            <ul className="list-disc list-inside mr-4 text-zinc-400 text-sm space-y-2">
              <li>اسم المستخدم كاملاً</li>
              <li>رقم الهاتف المحمول</li>
              <li>البريد الإلكتروني</li>
            </ul>

            <h3 className="font-semibold text-white mt-4">- تسجيل الشركات والمكاتب العقارية:</h3>
            <ul className="list-disc list-inside mr-4 text-zinc-400 text-sm space-y-2">
              <li>اسم الشركة</li>
              <li>البريد الإلكتروني</li>
              <li>المقر الرئيسي</li>
              <li>الخدمات</li>
              <li>مناطق تقديم الخدمة</li>
              <li>نبذة قصيرة عن الشركة</li>
              <li>لوجو الشركة</li>
              <li>نشاط الرخصة</li>
              <li>تاريخ انتهاء الرخصة</li>
              <li>رفع صورة واضحة للرخصة التجارية</li>
            </ul>

            <h3 className="font-semibold text-white mt-4">- بيانات تُجمع تلقائياً:</h3>
            <div className="text-zinc-300 text-sm space-y-3">
              <p><strong className="text-zinc-100">عنوان بروتوكول الإنترنت:</strong> وهو عبارة عن رقم مميز يُعطى لك من مقدم خدمة الإنترنت (ISP)، بهدف تحليل أنماط النشاطات التي تمارسها على التطبيق، وبالتالي تحسين تجربتك في استخدام التطبيق.</p>
              <p>نوع الجهاز المستخدم ونظام التشغيل الخاص به.</p>
              <p>تسجيل الدردشات عبر التطبيق والمكالمات الهاتفية مع موظفي الدعم الفني.</p>
              <p>ملفات تعريف الارتباط.</p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#C5A880]">ثانياً: استخدام البيانات</h2>
            <p className="text-zinc-300 text-sm">
              نحن في تطبيق بيوتنا نستخدم سياسة صارمة في عملية استخدام البيانات الخاصة بالعملاء من أجل حمايتها والحفاظ عليها، ونستخدم المعلومات الشخصية للعملاء فقط في:
            </p>
            <ul className="list-disc list-inside mr-4 text-zinc-400 text-sm space-y-2">
              <li>تسجيل العملاء في التطبيق وإثبات هويتهم.</li>
              <li>عمليات دفع الرسوم الخاصة بالباقات وأي عمليات دفع أخرى عبر تطبيق بيوتنا.</li>
              <li>استخدام البيانات في مراسلتك عبر البريد الإلكتروني.</li>
              <li>توثيق المعلومات مع أطراف تزويد الخدمات المالية (مثل البنوك وشركات الدفع الإلكتروني) لأهداف تتعلق بالدفع أو زيادة مستوى الأمان.</li>
            </ul>
            <p className="text-zinc-300 text-sm">
              في تطبيق بيوتنا، وبالرغم من السياسة الصارمة التي نتبعها في حماية بيانات عملائنا، إلا أننا قد نضطر إلى الإفصاح عن معلوماتك الشخصية للأجهزة التي تعمل على تنفيذ القانون، وإلى جهات حكومية أخرى بموجب قرارات صادرة من المحاكم في الكويت أو من الهيئات والوزارات المختصة بالرقابة على التطبيقات. ويُعد هذا الإفصاح جزءاً من التزامنا العميق بسيادة القانون ومن أجل تحقيق العدالة.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#C5A880]">ثالثاً: حقوق المستخدم</h2>
            <p className="text-zinc-300 text-sm">نضمن في تطبيق بيوتنا مجموعة من الحقوق للمستخدم ونتفهم أحقيته في ذلك:</p>
            <ul className="list-disc list-inside mr-4 text-zinc-400 text-sm space-y-3">
              <li><strong className="text-zinc-100">حق المستخدم في الوصول إلى معلوماته الشخصية:</strong> تتيح في بيوتنا للمستخدم حق الوصول إلى كافة معلوماته الشخصية المسجلة لدينا، وذلك بعد التأكد من هويته عبر مجموعة من الإجراءات مثل إدخال كلمة المرور، وذلك من أجل حماية تلك المعلومات الشخصية من أي اختراق أو سرقة أو احتيال.</li>
              <li><strong className="text-zinc-100">حق المستخدم في تعديل البيانات غير الدقيقة:</strong> نتفهم في تطبيق بيوتنا أن بعض المعلومات الشخصية قد تتغير أو قد تكون قد أُدخلت بشكل خاطئ دون قصد، وبالتالي يمكنك تعديل البيانات تلقائياً وتحديثها. وهذا يتطلب أيضاً مراجعة من قبلنا للتحقق من صحة البيانات المعدلة والمحدثة من خلال تواصلك مع خدمة العملاء لدينا.</li>
              <li><strong className="text-zinc-100">تقديم شكوى في حالة إساءة استخدام البيانات:</strong> نتيح للمستخدم تقديم شكوى في حال تم استخدام بياناته بشكل مخالف لما وافق عليه، وذلك في حدود القوانين الناظمة لعملنا.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#C5A880]">رابعاً: الاحتفاظ بالبيانات</h2>
            <p className="text-zinc-300 text-sm">
              بالموافقة على سياسة الخصوصية، فإنك توافق على احتفاظنا بمعلوماتك الشخصية عند استخدامك للتطبيق وبعد الانتهاء من استخدامه، بما يتوافق مع القانون، ولتذليل العقبات المستقبلية ولحل أي خلاف أو مسألة قانونية قد تنشأ في المستقبل.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#C5A880]">خامساً: الرسائل الإلكترونية</h2>
            <p className="text-zinc-300 text-sm">
              نحن في تطبيق بيوتنا لا نستخدم أي نوع من الرسائل الإلكترونية التدميرية أو المخادعة، وبالتالي لا يجب عليك التعامل مع مثل هذه الرسائل، ويجب إبلاغ الدعم الفني للتطبيق عند التعصد لمثل هذه المواقف.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#C5A880]">سادساً: التعديلات على سياسة الخصوصية</h2>
            <p className="text-zinc-300 text-sm">
              نحن في تطبيق بيوتنا نعمل على تحديث سياسة الخصوصية بشكل دائم ومتواصل من أجل حماية العملاء وتطوير عمل الموقع الإلكتروني. وبناءً عليه، ينبغي على المستخدم متابعة هذه الصفحة بشكل مستمر، وفي حال إجراء أي تعديل على سياسة الخصوصية، فإننا نرسل للمستخدمين رسائل تنبيه عبر الموقع أو البريد الإلكتروني توضح التعديلات، بالإضافة إلى طلب تحديث الموافقة على سياسة الخصوصية أو رفضها، مما قد يؤدي إلى عدم القدرة على استخدام الموقع أو التخلي عن استخدامه في حال الرفض.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#C5A880]">سابعاً: تنبيه</h2>
            <p className="text-zinc-300 text-sm">
              نحن في تطبيق بيوتنا نحظر استخدام الحساب الخاص بالعملاء من قبل أي طرف آخر، وعند اكتشاف ذلك نقوم بإغلاق وحظر الحساب. ونحن غير مسؤولين عن استخدام حسابك الشخصي عبر التطبيق من قبل شخص آخر، وأي استخدام لحسابك الشخصي من طرف ثالث يُعتبر بمثابة تعبير عن إرادتك الحقيقية. لذلك، ينبغي عليك عدم تزويد أي طرف آخر بمعلومات تسجيل الدخول الخاصة بك، أو بالرقم السري، أو بأي معلومة تتيح لشخص آخر استخدام حسابك الشخصي عبر التطبيق. وفي حال فقدان بيانات الدخول أو حصول أي طرف آخر على المعلومات بأي طريقة كانت، يجب على المستخدم الإسراع بالتواصل مع موظفي الدعم الفني لمعالجة الأمر.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#C5A880]">ثامناً: التواصل</h2>
            <p className="text-zinc-300 text-sm">
              نحن في تطبيق بيوتنا نفتح قنوات التواصل الخاصة بنا على مدار الساعة، فلا تتردد في التواصل والاستفسار عن الخدمات أو الإبلاغ عن أي مشكلة فنية تواجهك عبر قنوات الاتصال المتاحة في صفحة (تواصل معنا).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-3">
          <Image
            src="/logo.png"
            alt="Buyootna Logo"
            width={24}
            height={24}
            className="rounded-md border border-[#C5A880]/30"
          />
          <span>&copy; {new Date().getFullYear()} بيوتنا. جميع الحقوق محفوظة.</span>
        </div>
      </div>
    </div>
  );
}
