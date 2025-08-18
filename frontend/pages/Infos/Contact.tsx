// /src/pages/Info/Contact.tsx

// arissane
// hutzig
// jingwu
// jlehtone
// omartela

import React, { useEffect } from 'react';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useTranslation } from 'react-i18next';
import TeamMember from '../../components/TeamMember';

const ContactPage: React.FC = () => {
  const { t } = useTranslation(); 

  useEffect(() => {
    document.title = t('pages.contact.title');
  }, [t]);

  return (
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
    <AccessiblePageDescription
      id="pageDescription"
      text={t('pages.contact.aria.description')}
    />
      <div className="text-center">
        <h1 id="pageTitle" className="text-xl font-bold mb-4">
          {t('pages.contact.title')}
        </h1>

        <div className="mt-8 mx-auto max-w-2xl">
          <p className="mt-2">{t('pages.contact.text')}</p>
          

          <TeamMember 
            name="Anssi Rissanen"
            role="Game Developer"
            profile42="https://profile.intra.42.fr/users/arissane"
            github="https://github.com/arissane"
          />


          <TeamMember 
            name="Helena Utzig"
            role="UX/UI Designer, Frontend Developer"
            profile42="https://profile.intra.42.fr/users/hutzig"
            github="https://github.com/hlntzg"
          />


          <TeamMember 
            name="Jingjing Wu"
            role="Backend Developer"
            profile42="https://profile.intra.42.fr/users/jingwu"
            github="https://github.com/Sherry5Wu"
          />


          <TeamMember 
            name="Joel Lehtonen"
            role="UX/UI Designer, Fullstack Developer"
            profile42="https://profile.intra.42.fr/users/jlehtone"
            github="https://github.com/joellehtonen"
          />


          <TeamMember 
            name="Oskari Martela"
            role="Backend Developer, DevOps Engineer"
            profile42="https://profile.intra.42.fr/users/omartela"
            github="https://github.com/omartela"
          />
          
        </div>          
      </div>
    </main>
  );        
};

export default ContactPage;