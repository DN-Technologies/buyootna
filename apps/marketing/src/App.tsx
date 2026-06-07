/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Language } from './types';

// Importing premium modular sections
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Applications from './components/Applications';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import Vision from './components/Vision';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  // Arabic is the default language as strongly requested
  const [language, setLanguage] = useState<Language>('ar');

  // Dynamically update document layout properties (RTL for Arabic, LTR for English)
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Handle font styling family updates dynamically on body
    if (language === 'ar') {
      document.body.style.fontFamily = '"Cairo", "Inter", sans-serif';
    } else {
      document.body.style.fontFamily = '"Inter", "Outfit", sans-serif';
    }
  }, [language]);

  return (
    <div className="min-h-screen bg-brand-navy text-white selection:bg-brand-gold selection:text-brand-navy transition-colors duration-300">
      {/* Dynamic Header Sticky Navigation with Language switcher */}
      <Header language={language} setLanguage={setLanguage} />

      <main>
        {/* Hero Section */}
        <Hero language={language} />

        {/* About Section */}
        <About language={language} />

        {/* Applications Showcase Slider Section (Buyotona & LBSII) */}
        <Applications language={language} />

        {/* Services / What We Do Bento Grid Section */}
        <Services language={language} />

        {/* Why Choose Us trust & indicators Section */}
        <WhyChooseUs language={language} />

        {/* Big Vision & Philosophy statement */}
        <Vision language={language} />

        {/* Fully functional bilingual CRM/Contact state form */}
        <Contact language={language} />
      </main>

      {/* Footer with quick navigating elements & social handles */}
      <Footer language={language} />
    </div>
  );
}
