import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [language, setLanguage] = useState(() => {
    // Check URL for /ru prefix first
    if (location.pathname.startsWith('/ru')) {
      return 'ru';
    }
    // Otherwise get from localStorage or default to 'ro'
    return localStorage.getItem('language') || 'ro';
  });

  useEffect(() => {
    // Save language to localStorage whenever it changes
    localStorage.setItem('language', language);
  }, [language]);

  // Sync URL with language
  useEffect(() => {
    const currentPath = location.pathname;

    // Admin panel is always accessible without /ru prefix — skip sync for these routes
    if (currentPath.startsWith('/admin')) {
      return;
    }

    // If someone lands on /ru/admin, strip the /ru prefix
    if (currentPath.startsWith('/ru/admin')) {
      navigate(currentPath.replace(/^\/ru/, ''), { replace: true });
      return;
    }

    if (language === 'ru' && !currentPath.startsWith('/ru')) {
      // Switch to Russian - add /ru prefix
      navigate('/ru' + currentPath, { replace: true });
    } else if (language === 'ro' && currentPath.startsWith('/ru')) {
      // Switch to Romanian - remove /ru prefix
      navigate(currentPath.replace(/^\/ru/, '') || '/', { replace: true });
    }
  }, [language, location.pathname, navigate]);

  const t = (key) => {
    // Navigate through nested keys (e.g., 'navbar.home')
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return value || key;
  };

  const changeLanguage = (lang) => {
    if (lang === 'ro' || lang === 'ru') {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
