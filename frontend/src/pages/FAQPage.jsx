import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import {
  ChevronRight,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  CircleHelp,
  MessagesSquare
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FAQPage = () => {
  const { language, t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(null);
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setFaqData(response.data.faqs || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      // Fallback to default FAQs
      setFaqData([
        {
          question: 'Cum pot plasa o comandă?',
          answer: 'Poți plasa o comandă direct pe site, adăugând produsele dorite în coș și completând formularul de comandă. De asemenea, ne poți contacta telefonic sau prin formularul de contact.'
        },
        {
          question: 'În cât timp se livrează produsele?',
          answer: 'Livrarea se efectuează în 24-72 ore, în funcție de localitate și disponibilitatea produselor. Pentru anumite zone, livrarea poate fi realizată mai rapid.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const leftColumn = faqData.slice(0, Math.ceil(faqData.length / 2));
  const rightColumn = faqData.slice(Math.ceil(faqData.length / 2));

  const renderFaqCard = (item, realIndex) => (
    <div
      key={realIndex}
      className="relative overflow-hidden rounded-[24px] border border-gray-200 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* <div className="absolute -top-8 -right-8 w-24 h-24 bg-teal-200 rounded-full opacity-80 blur-2xl"></div>
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-cyan-100 rounded-full opacity-70 blur-2xl"></div> */}

      <button
        onClick={() => setActiveIndex(activeIndex === realIndex ? null : realIndex)}
        className="relative z-10 w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 min-w-[40px] rounded-full bg-teal-100 flex items-center justify-center">
            <CircleHelp className="w-5 h-5 text-teal-600" />
          </div>

          <span className="font-semibold text-gray-900 text-lg leading-snug">
            {language === 'ru' && item.questionRu ? item.questionRu : item.question}
          </span>
        </div>

        <div className="w-9 h-9 min-w-[36px] rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
              activeIndex === realIndex ? 'rotate-180 text-teal-600' : ''
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ${
          activeIndex === realIndex ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-80'
        }`}
      >
        <div className="overflow-hidden">
          <div className="relative z-10 px-6 pb-6 pl-[70px] text-gray-600 leading-relaxed text-sm">
            {language === 'ru' && item.answerRu ? item.answerRu : item.answer}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* BACKGROUND DECOR */}
      <div className="pointer-events-none absolute inset-0">
        {/* <div className="absolute top-32 left-[-70px] w-72 h-72 bg-teal-200 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-[380px] right-[-60px] w-80 h-80 bg-cyan-200 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-16 left-[8%] w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute bottom-[140px] right-[12%] w-64 h-64 bg-sky-100 rounded-full blur-3xl opacity-60"></div> */}

        <div className="absolute top-[220px] right-[12%] opacity-[0.12] rotate-[-12deg]">
          <MessagesSquare className="w-44 h-44 text-teal-700" />
        </div>

        <div className="absolute bottom-[120px] left-[6%] opacity-[0.12] rotate-[10deg]">
          <MessageCircle className="w-36 h-36 text-teal-700" />
        </div>
      </div>

      {/* HERO */}
      <div className="relative bg-gradient-to-r from-teal-600 to-teal-700 text-white py-14">
        <div className="w-full px-4 md:px-6">
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">{t('faq.mainTitle')}</h1>
          </div>
          <p className="text-teal-100">
            {t('faq.mainDesc')}
          </p>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="relative bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">
              {t('faq.breadcrumb.home')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">{t('faq.breadcrumb.page')}</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative w-full px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">


            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t('faq.title')}
            </h2>
            <p className="text-gray-500 text-sm md:text-base mt-2 max-w-2xl mx-auto">
              {t('faq.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              {leftColumn.map((item, index) => renderFaqCard(item, index))}
            </div>

            <div className="space-y-6">
              {rightColumn.map((item, index) =>
                renderFaqCard(item, index + leftColumn.length)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;