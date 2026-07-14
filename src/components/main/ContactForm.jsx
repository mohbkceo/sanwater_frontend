import React, { useState, useRef, useEffect } from 'react';
import { contentAPI } from '@/services/baseAPIs';
import { useTranslation } from '@/lib/i18n.jsx';
import { Send, Mail, User, MessageSquare, Sparkles, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

function ContactForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });
  const [activeField, setActiveField] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    try {
      await contentAPI.post('/contact', formData);
      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus({ loading: false, success: false, error: null }), 3000);
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Failed to send message. Please try again later.' });
    }
  };

  const inputClasses = (fieldName) => `
    w-full px-5 py-4 bg-white/40 backdrop-blur-sm 
    border rounded-2xl outline-none transition-all duration-300
    placeholder:text-stone-400 text-stone-800
    ${activeField === fieldName 
      ? 'border-blue-400/60 lg blue-400/10 bg-white/60' 
      : 'border-stone-200/60 hover:border-stone-300/80'
    }
  `;

  return (
    <section id="contact" className="relative py-32 overflow-hidden bg-gradient-to-b from-transparent via-blue-50/80 to-stone-50/30">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 left-10 w-64 h-64 border border-stone-400 rounded-full" />
        <div className="absolute top-40 left-32 w-48 h-48 border border-stone-400 rounded-full" />
        <div className="absolute bottom-20 right-10 w-80 h-80 border border-stone-400 rounded-full" />
        <div className="absolute bottom-40 right-32 w-56 h-56 border border-stone-400 rounded-full" />
      </div>

      <div className="absolute top-20 left-[15%] w-2 h-2 bg-blue-400/30 rounded-full animate-float" />
      <div className="absolute top-1/3 right-[20%] w-3 h-3 bg-rose-300/30 rounded-full animate-float-delayed" />
      <div className="absolute bottom-1/4 left-[25%] w-2 h-2 bg-emerald-400/30 rounded-full animate-float" />
      
      <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-stone-300/40 to-transparent" />
      <div className="absolute right-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-stone-300/40 to-transparent" />

      <div className="max-w-4xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400/60" />
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-medium tracking-[0.2em] text-stone-500 uppercase">Get in Touch</span>
            <Sparkles className="w-5 h-5 text-blue-500" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400/60" />
          </div>
          
          <h2 className="text-5xl lg:text-7xl font-mono font-bold text-stone-800 mb-4 tracking-tight">
            {t('contact.title')}
          </h2>
          
          <p className="text-stone-500 text-lg font-light tracking-wide max-w-xl mx-auto leading-relaxed">
            Let's create something beautiful together
          </p>
          
          {/* Decorative separator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-8 h-[1px] bg-stone-300" />
            <div className="w-1.5 h-1.5 rotate-45 bg-blue-400/60" />
            <div className="w-16 h-[1px] bg-stone-300" />
            <div className="w-1.5 h-1.5 rotate-45 bg-blue-400/60" />
            <div className="w-8 h-[1px] bg-stone-300" />
          </div>
        </div>

        {/* Main card with Pinterest-style elevation and hover effect */}
        <div 
          ref={cardRef}
          className="relative group"
        >
          {/* Card shadow layers for Pinterest depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-rose-400/5 rounded-[2.5rem] blur-xl transform translate-y-2" />
          
          <div 
            className="relative bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-14 
                       border border-white/80 2xl stone-200/50
                       transition-all duration-500 hover:2xl hover:stone-300/50
                       hover:border-blue-200/60"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(251, 191, 36, 0.05) 0%, transparent 50%)`
            }}
          >
            
            <div className="absolute inset-3 rounded-[2rem] border border-stone-200/30 pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="relative space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-2 group/field">
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
                    <User className="w-4 h-4 text-blue-500" />
                    {t('contact.name')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setActiveField('name')}
                      onBlur={() => setActiveField(null)}
                      className={inputClasses('name')}
                      placeholder="Your name"
                    />
                    <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-400/0 to-transparent transition-all duration-300 group-focus-within/field:via-blue-400/60" />
                  </div>
                </div>

                
                <div className="space-y-2 group/field">
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    {t('contact.email')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setActiveField('email')}
                      onBlur={() => setActiveField(null)}
                      className={inputClasses('email')}
                      placeholder="your@email.com"
                    />
                    <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-400/0 to-transparent transition-all duration-300 group-focus-within/field:via-blue-400/60" />
                  </div>
                </div>
              </div>

              
              <div className="space-y-2 group/field">
                <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  {t('contact.subject')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onFocus={() => setActiveField('subject')}
                    onBlur={() => setActiveField(null)}
                    className={inputClasses('subject')}
                    placeholder="What's this about?"
                  />
                  <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-400/0 to-transparent transition-all duration-300 group-focus-within/field:via-blue-400/60" />
                </div>
              </div>

              
              <div className="space-y-2 group/field">
                <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  {t('contact.message')}
                </label>
                <div className="relative">
                  <textarea
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setActiveField('message')}
                    onBlur={() => setActiveField(null)}
                    className={`${inputClasses('message')} resize-none`}
                    placeholder="Tell me about your project..."
                  ></textarea>
                </div>
              </div>

              
              <div className="flex flex-col items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={status.loading}
                  className="group/btn relative inline-flex items-center gap-3 px-10 py-4 
                           bg-stone-800 text-white rounded-2xl font-medium
                           hover:bg-stone-700 transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed
                            stone-800/10  hover:stone-800/20
                           hover:scale-[0.99] active:scale-[0.98]"
                >
                  {status.loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>{t('contact.send')}</span>
                      <Send className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </>
                  )}
                </button>

                
                {status.success && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200/60 animate-slideUp">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Message sent successfully!</span>
                  </div>
                )}
                
                {status.error && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200/60 animate-slideUp">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{status.error}</span>
                  </div>
                )}
              </div>
            </form>


            
          </div>
        </div>

        
       
      </div>

   
    </section>
  );
}

export default ContactForm;