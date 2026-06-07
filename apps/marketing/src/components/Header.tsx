import { useState, useEffect } from 'react';
import { Menu, X, Languages } from 'lucide-react';
import { Language } from '../types';
import { translations, navigation } from '../i18n';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function Header({ language, setLanguage }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
  };

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-brand-navy/90 backdrop-blur-md border-b border-white/5 py-4 shadow-xl shadow-brand-navy/30'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-brand-gold to-brand-gold-light p-0.5 flex items-center justify-center shadow-lg shadow-brand-gold/10">
            <div className="w-full h-full rounded-[6px] bg-brand-navy flex items-center justify-center font-bold font-outfit text-brand-gold text-lg">
              DN
            </div>
          </div>
          <div>
            <h1 className={`text-white font-bold leading-tight ${language === 'ar' ? 'font-cairo text-base sm:text-lg' : 'font-outfit text-sm sm:text-base'}`}>
              {language === 'ar' ? 'دار النخبة' : 'Dar Al Nokhba'}
            </h1>
            <p className="text-brand-gold text-[10px] uppercase tracking-widest font-mono text-left font-semibold">
              {language === 'ar' ? 'للدعاية والتسويق' : 'Marketing'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`text-sm cursor-pointer transition-colors duration-300 hover:text-brand-gold ${
                language === 'ar' ? 'font-cairo font-medium' : 'font-outfit'
              } text-gray-300`}
            >
              {item.label[language]}
            </button>
          ))}
        </nav>

        {/* Language & Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-brand-gold/40 hover:text-brand-gold text-white text-xs font-semibold cursor-pointer transition-all duration-300 bg-white/5 backdrop-blur"
          >
            <Languages className="w-4 h-4 text-brand-gold" />
            <span className={language === 'ar' ? 'font-sans' : 'font-cairo'}>
              {language === 'ar' ? 'English' : 'العربية'}
            </span>
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-light hover:from-brand-gold-hover hover:to-brand-gold text-brand-navy font-bold text-xs shadow-lg shadow-brand-gold/15 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
              language === 'ar' ? 'font-cairo' : 'font-outfit'
            }`}
          >
            {t.heroCtaSecondary}
          </button>
        </div>

        {/* Mobile Hamburger Menu Toggler */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg border border-white/10 text-white bg-white/5 flex items-center justify-center cursor-pointer transition"
            title={language === 'ar' ? 'Change layout language to English' : 'تغيير اللغة للعربية'}
          >
            <Languages className="w-5 h-5 text-brand-gold" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg border border-white/10 text-white hover:text-brand-gold focus:outline-none bg-white/5 cursor-pointer"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] bg-brand-navy/95 backdrop-blur-lg z-40 border-t border-white/5 flex flex-col justify-between py-8 px-6 transition-all duration-300">
          <nav className="flex flex-col gap-6">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-lg text-left text-gray-200 hover:text-brand-gold font-medium border-b border-white/5 pb-2 cursor-pointer ${
                  language === 'ar' ? 'font-cairo text-right' : 'font-outfit text-left'
                }`}
              >
                {item.label[language]}
              </button>
            ))}
          </nav>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleNavClick('contact')}
              className={`w-full py-4 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-light hover:from-brand-gold-hover hover:to-brand-gold text-brand-navy font-bold text-sm shadow-xl shadow-brand-gold/20 cursor-pointer ${
                language === 'ar' ? 'font-cairo' : 'font-outfit'
              }`}
            >
              {t.heroCtaSecondary}
            </button>
            <p className="text-center text-xs text-gray-500 font-mono mt-4">
              Dar Al Nokhba • {language === 'ar' ? 'دار النخبة' : 'Premium Standard'}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
