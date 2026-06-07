import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, ArrowRight, ArrowLeft, Check, Sparkles, Star } from 'lucide-react';
import { Language } from '../types';
import { translations, applications } from '../i18n';

interface ApplicationsProps {
  language: Language;
}

export default function Applications({ language }: ApplicationsProps) {
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const t = translations[language];

  const handleNext = () => {
    setActiveAppIndex((prev) => (prev + 1) % applications.length);
  };

  const handlePrev = () => {
    setActiveAppIndex((prev) => (prev - 1 + applications.length) % applications.length);
  };

  const activeApp = applications[activeAppIndex];

  return (
    <section id="apps" className="relative py-24 bg-brand-navy overflow-hidden">
      {/* Background soft glowing orb */}
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-brand-gold/2 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 mb-4"
          >
            <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold/30" />
            <span className={`text-brand-gold text-[11px] font-bold tracking-wider uppercase ${language === 'ar' ? 'font-cairo' : 'font-mono'}`}>
              {language === 'ar' ? 'ملكية وإشراف دار النخبة' : 'AL NOKHBA DIGITAL SUITE'}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-white text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 ${
              language === 'ar' ? 'font-cairo' : 'font-outfit'
            }`}
          >
            {t.appsTitle}
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
            {t.appsSubtitle}
          </motion.p>
        </div>

        {/* Tab Selection Row */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-12">
          {applications.map((app, index) => (
            <button
              key={app.id}
              onClick={() => setActiveAppIndex(index)}
              className={`px-6 py-3 rounded-xl border font-bold text-xs sm:text-sm tracking-wide cursor-pointer transition-all duration-300 ${
                activeAppIndex === index
                  ? 'bg-gradient-to-r from-brand-gold to-brand-gold-light border-brand-gold text-brand-navy shadow-lg shadow-brand-gold/15'
                  : 'bg-brand-card/40 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              } ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}
            >
              {app.name[language]}
            </button>
          ))}
        </div>

        {/* App Showcase Showcase Content - Slide Transitions */}
        <div className="relative min-h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeApp.id}
              initial={{ opacity: 0, x: language === 'ar' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-brand-card/25 border border-white/5 rounded-3xl p-6 sm:p-10 backdrop-blur"
            >
              {/* Image/Mock Column */}
              <div className="lg:col-span-5 flex justify-center relative">
                {/* Floating Glow elements */}
                <div className="absolute inset-0 bg-brand-gold/10 rounded-2xl blur-[35px] pointer-events-none" />

                <div className="p-3 bg-brand-charcoal/80 border border-white/10 rounded-2xl shadow-2xl relative max-w-[280px]">
                  <img
                    src={activeApp.image}
                    alt={activeApp.name[language]}
                    className="w-full h-auto aspect-square rounded-xl object-contain shadow bg-brand-navy p-1"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Floating App Indicator Category Badge */}
                  <span className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full bg-brand-gold text-brand-navy text-[10px] font-bold shadow-lg tracking-wider whitespace-nowrap ${
                    language === 'ar' ? 'font-cairo' : 'font-mono'
                  }`}>
                    {activeApp.badge[language]}
                  </span>
                </div>
              </div>

              {/* Application details column */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="mb-4">
                  <span className={`text-brand-gold text-xs font-semibold tracking-widest font-mono uppercase block mb-1 ${
                    language === 'ar' ? 'text-right' : 'text-left'
                  }`}>
                    {activeApp.category[language]}
                  </span>
                  <h3 className={`text-white text-3xl font-extrabold ${
                    language === 'ar' ? 'font-cairo text-right' : 'font-outfit text-left'
                  }`}>
                    {activeApp.name[language]}
                  </h3>
                </div>

                <p className={`text-gray-300 text-sm sm:text-base leading-relaxed mb-6 ${
                  language === 'ar' ? 'font-cairo text-right' : 'font-outfit text-left'
                }`}>
                  {activeApp.description[language]}
                </p>

                {/* Features Checklist */}
                <div className="mb-8">
                  <h4 className={`text-white text-xs font-bold uppercase tracking-wider mb-3 ${
                    language === 'ar' ? 'font-cairo text-right' : 'font-outfit text-left'
                  }`}>
                    {language === 'ar' ? 'المزايا والقدرات الجوهرية:' : 'Core Capabilities:'}
                  </h4>
                  <ul className="space-y-2">
                    {activeApp.features[language].map((feat, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-2.5 text-xs text-gray-400 ${
                          language === 'ar' ? 'flex-row-reverse text-right' : 'text-left'
                        }`}
                      >
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-brand-gold" />
                        </div>
                        <span className={language === 'ar' ? 'font-cairo' : 'font-outfit'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metric panels specific to the active application */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mb-8">
                  {activeApp.stats.map((stat, statIdx) => (
                    <div key={statIdx} className={language === 'ar' ? 'text-right' : 'text-left'}>
                      <p className="text-white font-extrabold text-xl font-mono tracking-tight text-brand-gold-light">
                        {stat.value}
                      </p>
                      <p className={`text-gray-400 text-[11px] mt-0.5 ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}>
                        {stat.label[language]}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Platform CTAs */}
                <div className={`flex flex-wrap gap-3 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  <button
                    className={`px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-gold/40 text-white font-semibold text-xs tracking-wider transition duration-300 flex items-center gap-1.5 cursor-pointer hover:bg-white/10 group ${
                      language === 'ar' ? 'font-cairo flex-row-reverse' : 'font-outfit'
                    }`}
                  >
                    <span>{t.visitPlatform}</span>
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold group-hover:scale-110 transition" />
                  </button>
                  <button
                    onClick={() => {
                      const contactSection = document.getElementById('contact');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`px-5 py-2.5 rounded-xl border border-transparent hover:border-white/10 text-brand-navy font-bold text-xs tracking-wider bg-gradient-to-r from-brand-gold to-brand-gold-light transition duration-300 flex items-center gap-1.5 cursor-pointer ${
                      language === 'ar' ? 'font-cairo flex-row-reverse' : 'font-outfit'
                    }`}
                  >
                    <span>{language === 'ar' ? 'طلب توأمة واستثمار' : 'Investment & Partnerships'}</span>
                    {language === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Stepper Controllers */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handlePrev}
            className="p-3 rounded-full border border-white/5 bg-brand-card/40 hover:bg-brand-card hover:border-brand-gold/40 text-white cursor-pointer active:scale-95 transition"
            title="Previous Application"
          >
            {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={handleNext}
            className="p-3 rounded-full border border-white/5 bg-brand-card/40 hover:bg-brand-card hover:border-brand-gold/40 text-white cursor-pointer active:scale-95 transition"
            title="Next Application"
          >
            {language === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </section>
  );
}
