// components/Footer.tsx

import React from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="w-full py-4 mt-auto bg-transparent overflow-x-auto">
      <div className="w-full flex justify-between items-center text-sm text-black px-4 min-w-[320px]">
        <span className="whitespace-nowrap flex-shrink-0">© {new Date().getFullYear()} ft_transcendence. {t('components.footer.rights')}.</span>
        <div className="flex space-x-4 flex-shrink-0">
          <Link to="/about" 
            className="px-4 inline-block whitespace-nowrap text-center hover:scale-110 hover:font-bold transition-transform duration-200 ease-in-out">
              {t('components.footer.about')}
            </Link>
          <Link to="/contact"
            className="inline-block whitespace-nowrap text-center hover:scale-110 hover:font-bold transition-transform duration-200 ease-in-out">
              {t('components.footer.contact')}
            </Link>
          {/* <Link to="/privacy"
            className="inline-block w-[60px] text-center hover:scale-110 hover:font-bold transition-transform duration-200 ease-in-out">
              {t('components.footer.privacy')}
            </Link> */}
        </div>
      </div>
    </footer>
  );
}