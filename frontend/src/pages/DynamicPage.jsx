import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DynamicPage = () => {
  const { slug } = useParams();
  const { language, t } = useLanguage();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await axios.get(`${API}/pages/slug/${slug}`);
      setPage(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching page:', error);
      setError('Pagina nu a fost găsită');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">{error || 'Pagina nu a fost găsită'}</p>
          <a
            href="/"
            className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition font-semibold inline-block"
          >
            Înapoi la Acasă
          </a>
        </div>
      </div>
    );
  }

  const pageTitle = language === 'ru' && page.titleRu ? page.titleRu : page.title;
  const pageContent = language === 'ru' && page.contentRu ? page.contentRu : page.content;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div className="relative bg-gradient-to-r from-teal-600 to-teal-700 text-white py-14">
        <div className="w-full px-4 md:px-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">{pageTitle}</h1>
          </div>
          <p className="text-teal-100">
            {t('dynamic.desc')}
          </p>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="relative bg-white border-b">
        <div className="w-full px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600 transition">
              {t('dynamic.home')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">{pageTitle}</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full px-4 md:px-6 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px] md:text-base">
            {pageContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;