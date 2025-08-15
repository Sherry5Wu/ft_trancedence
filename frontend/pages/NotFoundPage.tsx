// src/pages/NotFoundPage.tsx
import React, { useEffect } from 'react';
import NotFoundIcon from '../assets/noun-404-error-7412843.svg?react'

const NotFoundPage = () => {
  useEffect(() => {
    document.title = '404 - Page Not Found';
  }, []);

  return (
    <div className='pageLayout'>
      <div className="text-center">
        <NotFoundIcon className="mx-auto h-48 w-48 mb-6" />
        <p className="text-lg">Oops! The page you're looking for doesn't exist.</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
