import React, { useState } from 'react';
import { contentAPI } from '@/services/baseAPIs';
import { useTranslation } from '@/lib/i18n.jsx';
import { Button } from '..';

function ContactForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

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
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Failed to send message. Please try again later.' });
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96  rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96  rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-5xl mx-auto px-6">
        <div className=" rounded-[3rem] p-8 md:p-16 border border-white/20">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{t('contact.title')}</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.name')}</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-turquoise-500/10 focus:border-turquoise-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.email')}</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-turquoise-500/10 focus:border-turquoise-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="john@example.com"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.subject')}</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-turquoise-500/10 focus:border-turquoise-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="How can we help?"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">{t('contact.message')}</label>
              <textarea
                name="message"
                required
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-turquoise-500/10 focus:border-turquoise-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                placeholder="Write your message here..."
              ></textarea>
            </div>
            <div className="md:col-span-2 text-center pt-4">
              <Button
                type="submit"
                disabled={status.loading}
                variant='outline'
              >
                {status.loading ? 'Sending...' : t('contact.send')}
              </Button>
              {status.success && <p className="mt-6 text-green-600 font-bold flex items-center justify-center gap-2">✓ Message sent successfully!</p>}
              {status.error && <p className="mt-6 text-red-600 font-bold">{status.error}</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
