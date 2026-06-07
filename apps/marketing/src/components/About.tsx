import { motion } from 'motion/react';
import { Award, Target, Users, MapPin } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';

interface AboutProps {
  language: Language;
}

export default function About({ language }: AboutProps) {
  const t = translations[language];

  // Key pillar blocks in About US
  const pillars = [
    {
      icon: <Award className="w-6 h-6 text-brand-gold" />,
      title: { ar: 'الريادة والتميز', en: 'Leadership & Prestige' },
      desc: {
        ar: 'حيازة ثقة النخبة من رواد الأعمال والمصمات العقاريين في الخليج.',
        en: 'Earning the confidence of premier founders and leading designers across the GCC.',
      },
    },
    {
      icon: <Target className="w-6 h-6 text-brand-gold" />,
      title: { ar: 'النمو الاستراتيجي', en: 'Strategic Evolution' },
      desc: {
        ar: 'توسيع نطاق حضور منصاتنا الرقمية لزيادة قيمتها السوقية والإنتاجية.',
        en: 'Scaling our application ecosystems to optimize long-term market valuations.',
      },
    },
    {
      icon: <Users className="w-6 h-6 text-brand-gold" />,
      title: { ar: 'مجتمعات حيوية', en: 'Vital Communities' },
      desc: {
        ar: 'بناء وتنمية مجتمعات مستخدمين مخلصين يتفاعلون يومياً مع تطبيقاتنا.',
        en: 'Fostering vibrant, highly loyal user networks active in ours applications daily.',
      },
    },
    {
      icon: <MapPin className="w-6 h-6 text-brand-gold" />,
      title: { ar: 'محور وطني وخليجي', en: 'National & Regional Hub' },
      desc: {
        ar: 'تقديم خدمات بأعلى معايير الهوية الخليجية المحافظة والفاخرة.',
        en: 'Maintaining custom interfaces reflecting Gulf luxury and elite conservative traditions.',
      },
    },
  ];

  return (
    <section id="about" className="relative py-24 bg-brand-charcoal overflow-hidden border-t border-white/5">
      {/* Background decoration */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-brand-gold/2.5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Column 1: Copy texts */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            >
              <h4 className="text-brand-gold text-xs font-mono uppercase tracking-widest font-semibold mb-3">
                {language === 'ar' ? 'من نكون' : 'OUR IDENTITY'}
              </h4>
              <h2 className={`text-white text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 ${
                language === 'ar' ? 'font-cairo' : 'font-outfit'
              }`}>
                {t.aboutTitle}
              </h2>
              <div className={`w-12 h-1 bg-brand-gold mb-8 ${language === 'ar' ? 'ml-auto' : 'mr-auto'}`} />

              <p className={`text-gray-300 text-base leading-relaxed mb-6 ${
                language === 'ar' ? 'font-cairo' : 'font-outfit'
              }`}>
                {t.aboutText1}
              </p>
              <p className={`text-gray-400 text-sm leading-relaxed mb-8 ${
                language === 'ar' ? 'font-cairo' : 'font-outfit'
              }`}>
                {t.aboutText2}
              </p>

              {/* Company Visionary Quote Statement */}
              <div className={`p-5 rounded-2xl bg-brand-navy/60 border-l-2 border-brand-gold relative ${
                language === 'ar' ? 'border-l-0 border-r-2 text-right' : 'text-left'
              }`}>
                <p className={`text-gray-300 italic text-sm ${
                  language === 'ar' ? 'font-cairo' : 'font-outfit'
                }`}>
                  {language === 'ar' 
                    ? '"إننا في دار النخبة لا نسوق المنتجات فحسب، بل نبني علاقات وكيانات رقمية متطورة تلهم وتخدم وتصنع تأثيراً كبيراً ومستداماً."'
                    : '"At Dar Al Nokhba, we don’t just market apps; we curate elite digital entities that serve, inspire, and foster generational convenience."'}
                </p>
                <p className="text-brand-gold text-xs font-mono mt-3 uppercase tracking-wider font-semibold">
                  {language === 'ar' ? '— مجلس الإدارة، دار النخبة' : '— Board of Directors, Dar Al Nokhba'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Column 2: Bento Grid cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glow-border rounded-2xl bg-brand-card/45 p-6 backdrop-blur border border-white/5 hover:border-brand-gold/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[170px]"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-navy/60 border border-white/5 flex items-center justify-center group-hover:bg-brand-gold/10 group-hover:border-brand-gold/20 transition-all duration-300 mb-4">
                  {item.icon}
                </div>
                <div>
                  <h3 className={`text-white text-base font-bold mb-2 ${
                    language === 'ar' ? 'font-cairo text-right' : 'font-outfit text-left'
                  }`}>
                    {item.title[language]}
                  </h3>
                  <p className={`text-gray-400 text-xs leading-relaxed ${
                    language === 'ar' ? 'font-cairo text-right' : 'font-outfit text-left'
                  }`}>
                    {item.desc[language]}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
