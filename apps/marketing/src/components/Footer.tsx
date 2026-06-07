import { Star, Mail, Phone, Globe, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { translations, navigation } from '../i18n';

interface FooterProps {
  language: Language;
}

export default function Footer({ language }: FooterProps) {
  const t = translations[language];

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const socials = [
    { label: 'Twitter', url: '#', icon: '𝕏' },
    { label: 'LinkedIn', url: '#', icon: 'in' },
    { label: 'Instagram', url: '#', icon: '📷' },
    { label: 'TikTok', url: '#', icon: '♪' },
  ];

  return (
    <footer className="bg-brand-navy border-t border-white/5 relative overflow-hidden pt-16 pb-8">
      {/* Decorative tiny lights */}
      <div className="absolute bottom-0 left-0 w-[20%] h-[20%] rounded-full bg-brand-gold/2.5 blur-[80px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          
          {/* Logo Brand Statement Column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-gold to-brand-gold-light p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-[5px] bg-brand-navy flex items-center justify-center font-bold font-outfit text-brand-gold text-base">
                    DN
                  </div>
                </div>
                <div>
                  <h3 className={`text-white font-bold text-base leading-tight ${
                    language === 'ar' ? 'font-cairo' : 'font-outfit'
                  }`}>
                    {language === 'ar' ? 'دار النخبة للأعمال' : 'Dar Al Nokhba'}
                  </h3>
                  <p className="text-brand-gold text-[9px] uppercase tracking-widest font-mono text-left font-semibold">
                    {language === 'ar' ? 'للدعاية والتسويق' : 'Marketing'}
                  </p>
                </div>
              </div>

              <p className={`text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm ${
                language === 'ar' ? 'font-cairo text-right' : 'font-outfit text-left'
              }`}>
                {language === 'ar'
                  ? 'دار النخبة للدعاية والتسويق هي شركة ريادية رائدة في منطقة الخليج العربي، متخصصة في ابتكار وتطوير وبناء العلامات التجارية والمنصات الرقمية المتكاملة.'
                  : 'Dar Al Nokhba Advertising & Marketing is a GCC leader, specialized in building, engineering, and launching state-of-the-art mobile and web solutions.'}
              </p>
            </div>

            {/* Social Icons row */}
            <div className={`flex items-center gap-2.5 mt-6 ${language === 'ar' ? 'justify-start' : 'justify-start'}`}>
              {socials.map((soc, idx) => (
                <a
                  key={idx}
                  href={soc.url}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white hover:text-brand-gold hover:border-brand-gold hover:-translate-y-0.5 flex items-center justify-center text-xs font-bold transition duration-300"
                  title={soc.label}
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Nav Columns */}
          <div className="md:col-span-3">
            <h4 className={`text-white text-xs font-bold uppercase tracking-widest mb-6 ${
              language === 'ar' ? 'font-cairo text-right' : 'font-outfit text-left text-brand-gold'
            }`}>
              {language === 'ar' ? 'روابط سريعة' : 'QUICK NAVIGATION'}
            </h4>
            <ul className="space-y-3">
              {navigation.map((item) => (
                <li key={item.id} className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`text-gray-400 text-xs sm:text-sm hover:text-brand-gold cursor-pointer transition ${
                      language === 'ar' ? 'font-cairo' : 'font-outfit'
                    }`}
                  >
                    {item.label[language]}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Core App Ecosystem Links Column */}
          <div className="md:col-span-4">
            <h4 className={`text-white text-xs font-bold uppercase tracking-widest mb-6 ${
              language === 'ar' ? 'font-cairo text-right' : 'font-outfit text-left text-brand-gold'
            }`}>
              {language === 'ar' ? 'منتجاتنا الرقمية' : 'OUR ECOSYSTEM'}
            </h4>
            <ul className="space-y-4">
              <li className={language === 'ar' ? 'text-right' : 'text-left'}>
                <button
                  onClick={() => handleNavClick('apps')}
                  className="text-white hover:text-brand-gold font-semibold text-xs sm:text-sm cursor-pointer transition flex items-center gap-1.5 justify-start"
                >
                  <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                  <span className={language === 'ar' ? 'font-cairo' : 'font-outfit'}>
                    {language === 'ar' ? 'بيوتنا العقارية' : 'Buyotona Real Estate'}
                  </span>
                </button>
                <p className={`text-gray-400 text-[11px] mt-1 ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}>
                  {language === 'ar' ? 'منصة بيع وتأجير العقارات الحصرية' : 'Exclusive property sales & rental hub'}
                </p>
              </li>
              <li className={language === 'ar' ? 'text-right' : 'text-left'}>
                <button
                  onClick={() => handleNavClick('apps')}
                  className="text-white hover:text-brand-gold font-semibold text-xs sm:text-sm cursor-pointer transition flex items-center gap-1.5 justify-start"
                >
                  <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                  <span className={language === 'ar' ? 'font-cairo' : 'font-outfit'}>
                    {language === 'ar' ? 'لبسي الفاخرة' : 'LBSII Luxury Apparel'}
                  </span>
                </button>
                <p className={`text-gray-400 text-[11px] mt-1 ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}>
                  {language === 'ar' ? 'أزياء راقية، مصممات وحفلات كاترينغ' : 'Premium gown designs, catering, and styles'}
                </p>
              </li>
            </ul>
          </div>

        </div>

        {/* Dynamic lower bar coordinates and licenses */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={`text-gray-500 text-xs text-center sm:text-left ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}>
            &copy; {new Date().getFullYear()} {t.rights}
          </p>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-brand-gold" />
            <span className={language === 'ar' ? 'font-cairo' : 'font-outfit'}>
              {language === 'ar' ? 'مرخص بموجب قوانين الدعاية والتسويق الخليجية' : 'Standard License • CR & SAGIA compliant'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
