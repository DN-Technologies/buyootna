import { motion } from 'motion/react';
import { Eye, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';

interface VisionProps {
  language: Language;
}

export default function Vision({ language }: VisionProps) {
  const t = translations[language];

  return (
    <section className="relative py-28 bg-brand-charcoal overflow-hidden border-t border-b border-white/5">
      {/* Immersive radial background lights */}
      <div className="absolute inset-0">
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-brand-gold/4 blur-[140px] pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/25 mb-6"
        >
          <Eye className="w-4 h-4 text-brand-gold" />
          <span className={`text-brand-gold text-xs font-semibold tracking-widest uppercase ${
            language === 'ar' ? 'font-cairo' : 'font-mono'
          }`}>
            {t.visionSubtitle}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`text-white text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-8 ${
            language === 'ar' ? 'font-cairo' : 'font-outfit'
          }`}
        >
          {language === 'ar' ? 'نصنع تجارب رقمية ذات قيمة وأثر' : 'Creating Digital Experiences That Matter'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto ${
            language === 'ar' ? 'font-cairo' : 'font-outfit'
          }`}
        >
          {t.visionText}
        </motion.p>

        {/* Minimal elegant dots decorator */}
        <div className="flex justify-center items-center gap-2 mt-12">
          <div className="w-2 h-2 rounded-full bg-brand-gold/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-brand-gold" />
          <div className="w-2 h-2 rounded-full bg-brand-gold/30" />
        </div>
      </div>
    </section>
  );
}
