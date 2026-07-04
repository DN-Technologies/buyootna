import { Search, ShieldCheck, MessageCircle, Building2, UserCog } from "lucide-react";

export default function FeatureGrid() {
  const features = [
    {
      title: "بحث عقاري متكامل",
      desc: "تصفح مئات العقارات المتاحة للبيع أو الإيجار أو البدل في مختلف مناطق ومحافظات الكويت مع فلاتر بحث ذكية ودقيقة.",
      icon: Search,
    },
    {
      title: "دليل شركات الخدمات",
      desc: "دليل شامل لشركات المقاولات العامة، الديكورات، الصيانة العامة، الصحي، والكهرباء لخدمة وتطوير منزلك.",
      icon: Building2,
    },
    {
      title: "تحقق وتوثيق رسمي",
      desc: "نضمن مصداقية وموثوقية الشركات من خلال التدقيق والتحقق من رخص النشاط التجاري قبل نشر خدماتهم.",
      icon: ShieldCheck,
    },
    {
      title: "تواصل مباشر وفوري",
      desc: "تواصل بلمسة زر مباشرة مع صاحب الإعلان أو مزود الخدمة من خلال اتصال هاتفي مباشر أو محادثة واتساب سريعة.",
      icon: MessageCircle,
    },
    {
      title: "إدارة إعلاناتك العقارية",
      desc: "لوحة تحكم سهلة لإضافة وتعديل عقاراتك، متابعة المشاهدات، وإدارة طلبات البدل والعروض بكل سلاسة وأمان.",
      icon: UserCog,
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-[#0A1118] relative">
      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880]">مزايا التطبيق</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            كل ما تحتاجه لعقارك في منصة واحدة
          </h2>
          <div className="w-16 h-1 bg-[#C5A880] rounded-full mt-2" />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Dynamically map features */}
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group p-8 rounded-3xl bg-[#0F1E2E]/30 border border-[#1B2936]/50 hover:border-[#C5A880]/30 hover:bg-[#0F1E2E]/50 transition-all duration-350 shadow-md flex flex-col items-start gap-5"
              >
                <div className="p-4 rounded-2xl bg-[#C5A880]/10 text-[#C5A880] group-hover:bg-[#C5A880] group-hover:text-[#070D14] transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-[#C5A880]">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
