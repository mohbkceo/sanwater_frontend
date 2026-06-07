import { useState, useEffect, createContext, useContext } from 'react';

const translations = {
  en: {
    nav: {
      products: 'Products',
      about: 'About',
      news: 'News',
      hiring: 'Hiring',
      contact: 'Contact Sales'
    },
    hero: {
      title: 'Advanced Water Solutions',
      subtitle: 'Pure, Sustainable, Reliable.',
      cta: 'Explore Products'
    },
    contact: {
      title: 'Contact Us',
      name: 'Full Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Message',
      send: 'Send Message'
    }
  },
  ar: {
    nav: {
      products: 'المنتجات',
      about: 'حولنا',
      news: 'الأخبار',
      hiring: 'التوظيف',
      contact: 'اتصل بالمبيعات'
    },
    hero: {
      title: 'حلول المياه المتقدمة',
      subtitle: 'نقية، مستدامة، موثوقة.',
      cta: 'استكشف المنتجات'
    },
    contact: {
      title: 'اتصل بنا',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      subject: 'الموضوع',
      message: 'الرسالة',
      send: 'إرسال الرسالة'
    }
  }
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[lang];
    for (const key of keys) {
      if (result) result = result[key];
    }
    return result || path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslation = () => useContext(I18nContext);
