import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language, ContactForm } from '../types';
import { translations } from '../i18n';

interface ContactProps {
  language: Language;
}

export default function Contact({ language }: ContactProps) {
  const t = translations[language];
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<ContactForm>>({});

  const validate = (): boolean => {
    const tempErrors: Partial<ContactForm> = {};
    if (!form.name.trim()) tempErrors.name = t.formRequired;
    if (!form.email.trim()) {
      tempErrors.email = t.formRequired;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      tempErrors.email = language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Provide a valid email';
    }
    if (!form.phone.trim()) tempErrors.phone = t.formRequired;
    if (!form.message.trim()) tempErrors.message = t.formRequired;

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 bg-brand-navy overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute bottom-[-15%] right-[-15%] w-[500px] h-[500px] rounded-full bg-brand-gold/2 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Column 1: Coordinate info details */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            >
              <span className="text-brand-gold font-mono text-xs uppercase tracking-widest font-semibold mb-3 block">
                {language === 'ar' ? 'ابدأ رحلتك معنا' : 'STAY CONNECTED'}
              </span>
              <h2 className={`text-white text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 ${
                language === 'ar' ? 'font-cairo' : 'font-outfit'
              }`}>
                {t.contactTitle}
              </h2>
              <p className={`text-gray-400 text-sm sm:text-base leading-relaxed mb-10 ${
                language === 'ar' ? 'font-cairo' : 'font-outfit'
              }`}>
                {t.contactSubtitle}
              </p>
            </motion.div>

            {/* Coordinates Cards */}
            <div className="space-y-6 my-auto">
              {/* Address */}
              <div className={`p-5 rounded-2xl bg-brand-card/30 border border-white/5 flex gap-4 ${
                language === 'ar' ? 'flex-row-reverse text-right' : 'text-left'
              }`}>
                <div className="w-11 h-11 rounded-xl bg-brand-charcoal border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <h4 className={`text-white text-sm font-bold mb-1 ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}>
                    {language === 'ar' ? 'المقر الرئيسي' : 'Headquarters'}
                  </h4>
                  <p className={`text-gray-400 text-xs sm:text-sm leading-relaxed ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}>
                    {language === 'ar' ? 'المملكة العربية السعودية، الرياض، حي الياسمين' : 'Alyasmin District, Riyadh, Kingdom of Saudi Arabia'}
                  </p>
                </div>
              </div>

              {/* Email */}
              <a
                href="mailto:info@alnokhba.sa"
                className={`p-5 rounded-2xl bg-brand-card/30 border border-white/5 hover:border-brand-gold/30 transition duration-300 flex gap-4 ${
                  language === 'ar' ? 'flex-row-reverse text-right' : 'text-left'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-brand-charcoal border border-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <h4 className={`text-white text-sm font-bold mb-1 ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}>
                    {language === 'ar' ? 'البريد الإلكتروني المباشر' : 'Official Inquiry Mail'}
                  </h4>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-mono">
                    info@alnokhba.sa
                  </p>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+966500000000"
                className={`p-5 rounded-2xl bg-brand-card/30 border border-white/5 hover:border-brand-gold/30 transition duration-300 flex gap-4 ${
                  language === 'ar' ? 'flex-row-reverse text-right' : 'text-left'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-brand-charcoal border border-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <h4 className={`text-white text-sm font-bold mb-1 ${language === 'ar' ? 'font-cairo' : 'font-outfit'}`}>
                    {language === 'ar' ? 'دعم الشركاء والعملاء' : 'GCC Hotline'}
                  </h4>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-mono">
                    +966 50 000 0000
                  </p>
                </div>
              </a>
            </div>

            {/* Note Tagline */}
            <p className={`text-gray-500 text-[11px] mt-8 ${language === 'ar' ? 'text-right' : 'text-left font-mono'}`}>
              * {language === 'ar' ? 'نلتزم بالرد على كافة طلبات الاستثمار والشراكة خلال 24 ساعة عمل.' : 'Al Nokhba SLA guarantees a detailed response within 24 business hours.'}
            </p>
          </div>

          {/* Column 2: Form with validation feedback */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glow-border rounded-3xl bg-brand-card/30 border border-white/5 p-8 sm:p-10 backdrop-blur h-full flex flex-col justify-between"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                    <label className={`block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 ${
                      language === 'ar' ? 'font-cairo' : 'font-outfit'
                    }`}>
                      {t.contactName} <span className="text-brand-gold">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3.5 rounded-xl bg-brand-charcoal border text-white text-sm focus:outline-none focus:border-brand-gold/60 focus:bg-brand-navy transition duration-300 ${
                        errors.name ? 'border-red-500/50' : 'border-white/10'
                      } ${language === 'ar' ? 'text-right' : 'text-left'}`}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={language === 'ar' ? 'الاسم الثنائي أو الثلاثي' : 'John Doe'}
                    />
                    {errors.name && (
                      <p className={`text-red-400 text-xs mt-1.5 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                    <label className={`block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 ${
                      language === 'ar' ? 'font-cairo' : 'font-outfit'
                    }`}>
                      {t.contactEmail} <span className="text-brand-gold">*</span>
                    </label>
                    <input
                      type="email"
                      className={`w-full px-4 py-3.5 rounded-xl bg-brand-charcoal border text-white text-sm focus:outline-none focus:border-brand-gold/60 focus:bg-brand-navy transition duration-300 ${
                        errors.email ? 'border-red-500/50' : 'border-white/10'
                      } ${language === 'ar' ? 'text-right' : 'text-left font-mono'}`}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="info@example.sa"
                    />
                    {errors.email && (
                      <p className={`text-red-400 text-xs mt-1.5 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <label className={`block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 ${
                    language === 'ar' ? 'font-cairo' : 'font-outfit'
                  }`}>
                    {t.contactPhone} <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`w-full px-4 py-3.5 rounded-xl bg-brand-charcoal border text-white text-sm focus:outline-none focus:border-brand-gold/60 focus:bg-brand-navy transition duration-300 ${
                      errors.phone ? 'border-red-500/50' : 'border-white/10'
                    } ${language === 'ar' ? 'text-right font-mono' : 'text-left font-mono'}`}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+966 5X XXX XXXX"
                  />
                  {errors.phone && (
                    <p className={`text-red-400 text-xs mt-1.5 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <label className={`block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 ${
                    language === 'ar' ? 'font-cairo' : 'font-outfit'
                  }`}>
                    {t.contactMessage} <span className="text-brand-gold">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className={`w-full px-4 py-3.5 rounded-xl bg-brand-charcoal border text-white text-sm focus:outline-none focus:border-brand-gold/60 focus:bg-brand-navy transition duration-300 resize-none ${
                      errors.message ? 'border-red-500/50' : 'border-white/10'
                    } ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={language === 'ar' ? 'اكتب تفاصيل استفسارك أو رغبتك بالاستثمار هنا...' : 'Describe how we can partner up...'}
                  />
                  {errors.message && (
                    <p className={`text-red-400 text-xs mt-1.5 flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Status messages Feedback alerts */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 ${
                      language === 'ar' ? 'flex-row-reverse text-right' : 'text-left'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className={language === 'ar' ? 'font-cairo' : 'font-outfit'}>
                      {t.contactSuccess}
                    </span>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 ${
                      language === 'ar' ? 'flex-row-reverse text-right' : 'text-left'
                    }`}
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span className={language === 'ar' ? 'font-cairo' : 'font-outfit'}>
                      {t.contactError}
                    </span>
                  </motion.div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl text-brand-navy font-bold text-sm tracking-widest uppercase transition duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-brand-gold/60 cursor-not-allowed text-brand-navy/60'
                      : 'bg-gradient-to-r from-brand-gold to-brand-gold-light hover:from-brand-gold-hover hover:to-brand-gold shadow-lg shadow-brand-gold/15'
                  } ${language === 'ar' ? 'font-cairo flex-row-reverse' : 'font-outfit'}`}
                >
                  <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  <span>{isSubmitting ? t.contactSending : t.contactSubmit}</span>
                </button>

              </form>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
