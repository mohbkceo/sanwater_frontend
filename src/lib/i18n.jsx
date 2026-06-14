import { useState, useEffect, createContext, useContext } from 'react';
import { fr } from './i18n_fr';
import { ar } from './i18n_ar';

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
    badge: '2026 Collection',
    title: 'Advanced Water Solutions',
    subtitle: ['Pure', 'Durable', 'Reliable.'],
    cta: 'Explore Products',
  },
    contact: {
      title: 'Contact Us',
      name: 'Full Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Message',
      send: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent successfully!',
      error: 'Failed to send message. Please try again later.',
      help_text: 'Have questions? We\'re here to help you find the perfect solution.',
    },
    about: {
      badge: 'WHO ARE WE?',
      title: 'Quality sanitary solutions since 2011',
      description: 'SANWATER, founded in 2011 in Dar El Beida (Algiers), specializes in sanitary accessories and bathroom solutions. The brand offers quality products at competitive prices, with a wide range of models, following international trends.',
      years_experience: 'YEARS OF EXPERIENCE',
      quality_freshness: 'QUALITY & FRESHNESS',
      experience_desc: 'A decade and a half of expertise',
      satisfaction_desc: 'Guaranteed customer satisfaction',
      go_back: 'Back',
    },
    products: {
      title: 'SanWater Products',
      description: 'Discover our complete collection of SanWater products.',
      search_placeholder: 'Search by name, family or product ID...',
      advanced_filters: 'Advanced Filters',
      reset: 'Reset',
      family: 'Family',
      min_price: 'Minimum Price',
      max_price: 'Maximum Price',
      availability: 'Availability',
      all: 'All',
      in_stock: 'In Stock',
      out_of_stock: 'Out of Stock',
      sort_by: 'Sort By',
      date: 'Date',
      price: 'Price',
      name: 'Name',
      id: 'ID',
      order: 'Order',
      descending: 'Descending',
      ascending: 'Ascending',
      loading_products: 'Loading products...',
      load_more: 'Load More',
      no_more_products: 'No more products',
      no_products_found_title: 'No products found',
      no_products_found_description: 'The products you are looking for cannot be found.',
      view_details: 'View Details',
      no_image: 'No Image',
      serial: 'Serial Number:',
      read_more: 'Read More',
    },
    contact_sales: {
      main_title: 'Contact our team',
      subtitle: 'Our offices and sales teams are available to assist you quickly.',
      our_offices: 'Our Offices',
      office_description: 'Click on a number to call quickly or open the address directly in Google Maps.',
      commercialization: 'Commercialization',
      commercialization_description: 'Direct contact with our wholesale and retail sales teams.',
      companies: 'Companies',
      quick_contact: 'Quick Contact',
      address: 'Address',
      open_in_google_maps: 'Open in Google Maps',
      wholesale_commercialization: 'Wholesale Commercialization',
      retail_commercialization: 'Retail Commercialization',
    },
    why_choose_us: {
      title: 'Specialists in modern bathroom solutions',
      description: 'Providing quality sanitary accessories with precision, innovation and competitive value since 2011.',
      explore_products: 'Explore Products',
      contact_sales: 'Contact Sales Department',
      premium_quality_title: 'Premium Quality & Precise Manufacturing',
      premium_quality_description: 'Our products come from rigorously selected suppliers, guaranteeing durability, careful finishes and long-term reliability.',
      view_catalog: 'View Catalog',
      specialized_expertise_title: 'Specialized Expertise',
      specialized_expertise_description: 'Focused exclusively on sanitary accessories since 2011, mastering the field to serve our customers with confidence.',
      learn_more: 'Learn More',
      modern_designs_title: 'Modern Designs',
      modern_designs_description: 'A wide variety of colors and models inspired by international trends, adapted to all styles and project needs.',
      view_collection: 'View Collection',
      competitive_value_title: 'Competitive Value',
      competitive_value_description: 'High quality sanitary solutions at affordable prices, offering maximum value without compromise.',
      get_a_quote: 'Get a Quote',
      testimonial_badge: 'Testimonial',
      testimonial_heading: 'Customers have given their opinion.',
    },
    hiring: {
      join_our_team: 'Join Our Team',
      intro_paragraph: 'We are looking for talented and passionate individuals to help us innovate in the field of sanitary solutions. Explore our career opportunities and apply today.',
      loading_opportunities: 'Loading opportunities...',
      no_open_positions: 'No open positions at the moment. Check back later!',
      apply_now: 'Apply Now',
    },
    whatsapp: {
      default_message: 'Hello! I would like to know more about SanWater products.',
      contact_us_label: 'Contact us on WhatsApp',
      chat_with_us: 'Chat with us',
    },
    email_subscribe: {
      enter_your_email: 'Please enter your email.',
      invalid_email: 'Invalid email.',
      email_placeholder: 'Enter your email',
      subscribe: 'Subscribe',
      subscription_success: 'Subscription successful!',
    },
    footer: {
      all_rights_reserved: 'All rights reserved.',
    }
  },
  fr: fr,
  ar: ar,
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    // document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
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
