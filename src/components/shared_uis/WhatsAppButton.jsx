import React from 'react';
import { MessageCircle } from 'lucide-react';

function WhatsAppButton({ phoneNumber = '+1234567890', message = 'Hello! I would like to know more about SanWater products.' }) {
  const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 bg-green-500 text-white p-5 rounded-full shadow-2xl shadow-green-200 hover:bg-green-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={32} />
      <span className="absolute right-full mr-4 bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-100">
        Chat with us
      </span>
    </a>
  );
}

export default WhatsAppButton;
