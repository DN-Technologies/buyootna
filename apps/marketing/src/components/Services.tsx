import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Language } from '../types';
import { translations, services } from '../i18n';

interface ServicesProps {
  language: Language;
}

export default function Services({ language }: ServicesProps) {
  const t = translations[language];

  // Helper function to extract correct icon from Lucide
  const renderIcon = (name: string) => {
    // Cast to access dynamic keys in Icons
    const LucidIcon = (Icons as any)[name];
    if (LucidIcon) {
      return <LucidIcon className="w-6 h-6 text-brand-gold group-hover:text-white transition duration-300" />;
    }
    return <Icons.HelpCircle className="w-6 h-6 text-brand-gold" />;
  };

  return (
    <section id="services" className="relative py-24 bg-brand-charcoal overflow-hidden border-t border-white/5">
      {/* Visual background lights */}
      <div className="absolute top-[-10%] right-[-10%] w-[33%] h-[33%] rounded-full bg-brand-gold/2 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[33%] h-[33%] rounded-full bg-brand-gold/2 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4"
          >
            <Icons.Cpu className="w-3.5 h-3.5 text-brand-gold" />
            <span className={`text-brand-gold text-[11px] font-bold tracking-wider uppercase ${language === 'ar' ? 'font-cairo' : 'font-mono'}`}>
              {language === 'ar' ? 'البراعة التسويقية' : 'CAPABILITIES & EXECUTION'}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-white text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 ${
              language === 'ar' ? 'font-cairo' : 'font-outfit'
            }`}
          >
            {t.servicesTitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-gray-400 text-sm sm:text-base leading-relaxed ${
              language === 'ar' ? 'font-cairo' : 'font-outfit'
            }`}
          >
            {t.servicesSubtitle}
          </motion.p>
        </div>

        {/* Services Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glow-border rounded-2xl bg-brand-card/40 border border-white/5 p-8 hover:border-brand-gold/30 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-navy border border-white/5 flex items-center justify-center mb-6 group-hover:bg-brand-gold group-hover:border-brand-gold transition duration-300">
                  {renderIcon(service.iconName)}
                </div>
                <h3 className={`text-white text-lg font-bold mb-3 ${
                  language === 'ar' ? 'font-cairo text-right' : 'font-outfit text-left'
                }`}>
                  {service.title[language]}
                </h3>
                <p className={`text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 ${
                  language === 'ar' ? 'font-cairo text-right' : 'font-outfit text-left'
                }`}>
                  {service.description[language]}
                </p>
              </div>

              {/* Minimalist interactive visual slider anchor */}
              <div className={`flex items-center gap-1.5 group-hover:text-brand-gold-light text-gray-500 text-xs font-semibold tracking-wider font-mono ${
                language === 'ar' ? 'justify-start flex-row-reverse' : 'justify-end'
              }`}>
                <span className={language === 'ar' ? 'font-cairo' : 'font-outfit'}>
                  {language === 'ar' ? 'معايير النخبة' : 'AL NOKHBA STANDARD'}
                </span>
                <Icons.CheckCircle2 className="w-3.5 h-3.5 text-brand-gold/40 group-hover:text-brand-gold transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
