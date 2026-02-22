import { Instagram, Facebook } from 'lucide-react';
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: 'Produits', href: '/produits' },
    { label: 'Nouvelles', href: '/nouvelles' },
    { label: 'Contact ventes', href: '/contact' },
  ];

  const socialLinks = [
    {
      label: 'Website Icon',
      href: '#',
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.5667 14.7386L24.072 7.33936H22.5305L16.8819 13.764L12.3704 7.33936H7.16699L13.9892 17.0546L7.16699 24.8139H8.70862L14.6736 18.0292L19.4381 24.8139H24.6415L17.5663 14.7386H17.5667ZM15.4552 17.1402L14.764 16.1728L9.2641 8.47491H11.632L16.0704 14.6873L16.7617 15.6548L22.5312 23.73H20.1633L15.4552 17.1406V17.1402Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    { label: 'Instagram', href: '#', icon: <Instagram size={32} /> },
    { label: 'Facebook', href: '#', icon: <Facebook size={32} /> },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 w-full py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          
          <a href="/" className="inline-flex justify-center mb-8">
            <img className="w-36" src="./logo-white.svg" alt="San water logo" />
          </a>

          
          <ul className="flex flex-col md:flex-row justify-center items-center gap-7 md:gap-12 text-lg mb-10 border-b border-gray-200/20 pb-10 transition-all duration-300">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-gray-800 dark:text-gray-200 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          
          <div className="flex justify-center items-center gap-8 mb-10">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-gray-900 dark:text-gray-200 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              >
                {social.icon}
              </a>
            ))}
          </div>

          
          <span className="text-gray-500 dark:text-gray-400 text-lg block">
            &copy; {currentYear}{' '}
            <a
              href="/"
              className="hover:text-indigo-600 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
            >
              San water
            </a>
            , Tous droits réservés.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;