import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const JivoChat = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      const script = document.querySelector('script[src*="jivosite.com/widget"]');
      if (script) script.remove();

      const jivoWidget = document.querySelector('jdiv');
      if (jivoWidget) jivoWidget.remove();

      return;
    }

    if (!document.querySelector('script[src*="jivosite.com/widget"]')) {
      const script = document.createElement('script');
      script.src = 'https://code.jivosite.com/widget/rXfTxZsR1b';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [location.pathname]);

  return null;
};

export default JivoChat;