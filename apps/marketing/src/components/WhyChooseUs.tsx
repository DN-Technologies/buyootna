import { motion } from 'motion/react';
import { Sparkles, CheckSquare, BarChart3, HeartHandshake, ShieldAlert } from 'lucide-react';
import { Language } from '../types';
import { translations, reasons, trustStats } from '../i18n';

interface WhyChooseUsProps {
  language: Language;
}

export default function WhyChooseUs({ language }: WhyChooseUsProps) {
  const t = translations[language];

  // Visual icons for reasons
  const iconList = [
    <CheckSquare className="w-5 h-5 text-brand-gold" />,
    <BarChart3 className="w-5 h-5 text-brand-gold" />,
    <HeartHandshake className="w-5 h-5 text-brand-gold" />,
    <ShieldAlert className="w-5 h-5 text-brand-gold" />,
  ];

  return (
    <section id="why-us" className="relative py-24 bg-brand-navy overflow-hidden">
      {/* Background Soft Gradients */}
      <div className="absolute top-[30%] left-[-15%] w-[450px] h-[450px] rounded-full bg-brand-gold/2 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] w-[450px] h-[450px] rounded-full bg-brand-gold/2 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: List of 4 advantages */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            >
              <span className="text-brand-gold font-mono text-xs uppercase tracking-widest font-semibold mb-3 block">
                {language === 'ar' ? 'الكفاءة والنمو' : 'STABILITY & EXPERTISE'}
              </span>
              <h2 className={`text-white text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 ${
                language === 'ar' ? 'font-cairo' : 'font-outfit'
              }`}>
                {t.whyUsTitle}
              </h2>
              <p className={`text-gray-400 text-sm sm:text-base leading-relaxed mb-10 ${
                language === 'ar' ? 'font-cairo' : 'font-outfit'
              }`}>
                {t.whyUsSubtitle}
              </p>
            </motion.div>

            <div className="space-y-6">
              {reasons.map((reason, index) => (
                <motion.div
                  key={reason.id}
                  initial={{ opacity: 0, x: language === 'ar' ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex gap-4 p-5 rounded-2xl bg-brand-card/30 border border-white/5 hover:border-brand-gold/25 transition-all duration-300 ${
                    language === 'ar' ? 'flex-row-reverse text-right' : 'text-left'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-charcoal border border-white/10 flex items-center justify-center shrink-0">
                    {iconList[index]}
                  </div>
                  <div>
                    <h3 className={`text-white text-base font-bold mb-1.5 ${
                      language === 'ar' ? 'font-cairo' : 'font-outfit'
                    }`}>
                      {reason.label[language]}
                    </h3>
                    <p className={`text-gray-400 text-xs sm:text-sm leading-relaxed ${
                      language === 'ar' ? 'font-cairo' : 'font-outfit'
                    }`}>
                      {reason.description[language]}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Statistics Bento Grid */}
          <div className="lg:col-span-6">
            <div className="glow-border rounded-3xl bg-brand-card/45 p-8 sm:p-10 border border-white/5 backdrop-blur">
              <div className="text-center mb-8">
                <span className={`text-brand-gold text-xs font-semibold tracking-widest font-mono uppercase block mb-1`}>
                  {language === 'ar' ? 'تأثير دار النخبة' : 'AL NOKHBA MOMENTUM'}
                </span>
                <h3 className={`text-white text-xl sm:text-2xl font-bold ${
                  language === 'ar' ? 'font-cairo' : 'font-outfit'
                }`}>
                  {t.statsHold}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-6 sm:gap-8">
                {trustStats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`p-5 rounded-2xl bg-brand-charcoal/60 border border-white/5 text-center hover:border-brand-gold/20 transition-colors ${
                      idx === 0 || idx === 3 ? 'col-span-2 sm:col-span-1' : ''
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-gold-gradient block mb-2">
                      {stat.value}
                    </span>
                    <p className={`text-gray-300 text-xs ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}>
                      {stat.label[language]}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Secure trust guarantee tagline footer within stats card */}
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
                <p className={`text-gray-400 text-xs text-center ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}>
                  {language === 'ar' 
                    ? 'فريق وطني بامتياز يدعم ريادة الاقتصاد الرقمي' 
                    : '100% GCC Owned and Operated Entity'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
