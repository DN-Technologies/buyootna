import { motion } from 'motion/react';
import { Sparkles, ArrowDown, ShieldCheck, Users, Eye } from 'lucide-react';
import { Language } from '../types';
import { translations, trustStats } from '../i18n';

interface HeroProps {
  language: Language;
}

export default function Hero({ language }: HeroProps) {
  const t = translations[language];

  // Formatted app mock image from image generation
  const heroMockImage = '/src/assets/images/hero_app_mockup_1780174425307.png';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentStats = [
    { icon: <Eye className="w-5 h-5 text-brand-gold" />, ...trustStats[0] },
    { icon: <Users className="w-5 h-5 text-brand-gold" />, ...trustStats[1] },
    { icon: <ShieldCheck className="w-5 h-5 text-brand-gold" />, ...trustStats[3] },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden bg-brand-navy"
    >
      {/* Background Orbs & Accents */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-gold/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand-gold/5 blur-[140px]" />
        <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] rounded-full bg-white/2 blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10 w-full">
        {/* Texts - Left column on LTR / Right column on RTL */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit mb-6 ${
              language === 'ar' ? 'font-cairo self-start' : 'font-outfit self-start'
            }`}
          >
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span className="text-brand-gold text-xs font-semibold tracking-wider uppercase">
              {language === 'ar' ? 'تصميم رقمي • تسويق خليجي نخبوّي' : 'Premium Gulf Tech Ecosystem'}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-white font-extrabold tracking-tight leading-[1.15] mb-6 ${
              language === 'ar' ? 'font-cairo text-4xl sm:text-5xl md:text-6xl text-right' : 'font-outfit text-4xl sm:text-5xl md:text-6xl text-left'
            }`}
          >
            <span className="text-gold-gradient block mb-1">
              {language === 'ar' ? 'نبني علامات رقمية' : 'Building Digital Brands'}
            </span>
            <span className="text-white block">
              {language === 'ar' ? 'تصنع المستقبل' : 'That Shape the Future'}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-gray-300 leading-relaxed text-base sm:text-lg mb-10 max-w-2xl ${
              language === 'ar' ? 'font-cairo text-right ml-auto' : 'font-outfit text-left'
            }`}
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`flex flex-wrap gap-4 mb-12 ${
              language === 'ar' ? 'justify-start' : 'justify-start'
            }`}
          >
            <button
              onClick={() => scrollToSection('apps')}
              className={`px-8 py-4 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-light hover:from-brand-gold-hover hover:to-brand-gold text-brand-navy font-bold text-sm tracking-wide shadow-xl shadow-brand-gold/15 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                language === 'ar' ? 'font-cairo' : 'font-outfit'
              }`}
            >
              {t.heroCtaPrimary}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className={`px-8 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-brand-gold/40 text-white font-bold text-sm tracking-wide cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                language === 'ar' ? 'font-cairo' : 'font-outfit'
              }`}
            >
              {t.heroCtaSecondary}
            </button>
          </motion.div>

          {/* Direct Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8"
          >
            {currentStats.map((item, index) => (
              <div key={index} className={language === 'ar' ? 'text-right' : 'text-left'}>
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                  <span className="text-white font-bold text-lg font-mono sm:text-xl">
                    {item.value}
                  </span>
                </div>
                <p className={`text-gray-400 text-xs ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}>
                  {item.label[language]}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating App Mockup Image - Grid Right Column on LTR / Left on RTL */}
        <div className="lg:col-span-5 flex justify-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative w-full max-w-[400px]"
          >
            {/* Soft decorative golden aura behind mock */}
            <div className="absolute inset-0 bg-brand-gold/20 rounded-3xl blur-[40px] -z-10 animate-pulse duration-[6000ms]" />

            <div className="glow-border rounded-3xl bg-brand-card/40 p-3 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80">
              <img
                src={heroMockImage}
                alt="Dar Al Nokhba Premium Application Interface"
                className="w-full h-auto rounded-2xl object-cover object-center shadow-lg transform hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Micro Badge Overlay 1 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 p-4 rounded-2xl bg-brand-charcoal/90 border border-white/10 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400 text-sm font-bold">✓</span>
              </div>
              <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                <p className="text-white text-xs font-semibold">100% Verified</p>
                <p className="text-gray-400 text-[10px]">Gulf Regulations</p>
              </div>
            </motion.div>

            {/* Micro Badge Overlay 2 */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1.5 }}
              className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-brand-charcoal/90 border border-white/10 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-gold" />
              </div>
              <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                <p className="text-white text-xs font-semibold">Luxury UI</p>
                <p className="text-gray-400 text-[10px]">Gold Standards</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Animated Scroll Down Badge */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition duration-300 z-10">
        <button
          onClick={() => scrollToSection('about')}
          className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center cursor-pointer hover:border-brand-gold/60 text-white hover:text-brand-gold transition duration-300"
        >
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
