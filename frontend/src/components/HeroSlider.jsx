import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HeroSlider = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderData, setSliderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      const banners = response.data.heroBanners || [];
      setSliderData(banners.length > 0 ? banners : getDefaultBanners());
    } catch (error) {
      console.error('Error fetching banners:', error);
      setSliderData(getDefaultBanners());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultBanners = () => [
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
      badge: 'Nou!',
      title: 'Colecția de Primăvară 2024',
      subtitle: 'Tendințe de sezon',
      description: 'Descoperă cele mai noi tendințe în modă',
      buttonText: 'Vezi Produse',
      buttonLink: '/category/All'
    }
  ];

  useEffect(() => {
    if (sliderData.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliderData.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + sliderData.length) % sliderData.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  const currentItem = sliderData[currentSlide];

  // Choose language-specific fields with fallback to default (Romanian)
  const isRu = language === 'ru';
  const displayBadge = currentItem && (isRu && currentItem.badgeRu ? currentItem.badgeRu : currentItem.badge);
  const displayTitle = currentItem && (isRu && currentItem.titleRu ? currentItem.titleRu : currentItem.title);
  const displaySubtitle = currentItem && (isRu && currentItem.subtitleRu ? currentItem.subtitleRu : currentItem.subtitle);
  const displayDescription = currentItem && (isRu && currentItem.descriptionRu ? currentItem.descriptionRu : currentItem.description);
  const displayButtonText = currentItem && (isRu && currentItem.buttonTextRu ? currentItem.buttonTextRu : currentItem.buttonText);

  const hasContent =
    displayBadge ||
    displayTitle ||
    displaySubtitle ||
    displayDescription ||
    displayButtonText;

  if (loading || sliderData.length === 0) {
    return (
      <div className="w-full px-4 md:px-6 py-6 md:py-10">
        <div className="relative rounded-3xl overflow-hidden h-[250px] md:h-[600px] bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-10">
      <div
        className="relative rounded-3xl overflow-hidden h-[200px] md:h-[600px] touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* BACKGROUND */}
        <img
  src={currentItem.image}
  alt={displayTitle || 'Slide image'}
  className="absolute inset-0 w-full h-full object-cover object-center md:object-center select-none pointer-events-none"
  draggable="false"
/>

        {/* OVERLAY - doar dacă există conținut */}
        {hasContent && (
          <div className="absolute inset-0 bg-black/40"></div>
        )}

        {/* CONTENT */}
        {hasContent && (
          <div className="relative z-10 h-full flex items-center justify-start px-6 md:px-32">
            <div className="max-w-2xl text-white space-y-4 md:space-y-6 text-left">
              {displayBadge && (
                <span className="inline-block text-sm md:text-base font-medium opacity-90">
                  {displayBadge}
                </span>
              )}

              {displayTitle && (
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  {displayTitle}
                </h1>
              )}

              {displayDescription && (
                <p className="text-sm md:text-lg opacity-90 max-w-[90%] md:max-w-lg">
                  {displayDescription}
                </p>
              )}

              {displayButtonText && currentItem.buttonLink && (
                <div className="flex justify-start">
                  <button 
                    onClick={() => navigate(currentItem.buttonLink)}
                    className="bg-teal-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full flex items-center gap-2 hover:bg-teal-700 transition group shadow-lg font-semibold text-sm md:text-base cursor-pointer"
                  >
                    {displayButtonText}
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NAV - doar desktop */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 bg-black/60 text-white p-4 rounded-full hover:bg-black/80 transition z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 bg-black/60 text-white p-4 rounded-full hover:bg-black/80 transition z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* DOTS */}
        <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-white/90 px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg hidden md:flex">
          {sliderData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                currentSlide === index
                  ? 'bg-teal-600 w-6 h-2 md:w-10 md:h-3'
                  : 'bg-gray-300 w-2 h-2 md:w-3 md:h-3 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;