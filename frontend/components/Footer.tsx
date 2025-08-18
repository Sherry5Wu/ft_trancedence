// components/Footer.tsx

import React from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="w-full py-4 mt-auto bg-transparent">
      <div className="w-full flex justify-between items-center text-sm text-black px-4 sm:px-8">
        <span>© {new Date().getFullYear()} ft_transcendence project. {t('components.footer.rights')}.</span>
        <div className="flex space-x-4">
          <Link to="/about" 
            className="hover:font-bold hover:scale-110 transition-all ease-in-out duration-200">
              {t('components.footer.about')}
            </Link>
          <Link to="/contact"
            className="hover:font-bold hover:scale-110 transition-all ease-in-out duration-200">
              {t('components.footer.contact')}
            </Link>
          <Link to="/privacy"
            className="hover:font-bold hover:scale-110 transition-all ease-in-out duration-200">
              {t('components.footer.privacy')}
            </Link>
        </div>
      </div>
    </footer>
  );
}