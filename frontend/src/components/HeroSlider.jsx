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
      buttonLink: '/category/All',
    },
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
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + sliderData.length) % sliderData.length);

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

  const isRu = language === 'ru';
  const displayBadge =
    currentItem && (isRu && currentItem.badgeRu ? currentItem.badgeRu : currentItem.badge);
  const displayTitle =
    currentItem && (isRu && currentItem.titleRu ? currentItem.titleRu : currentItem.title);
  const displaySubtitle =
    currentItem &&
    (isRu && currentItem.subtitleRu ? currentItem.subtitleRu : currentItem.subtitle);
  const displayDescription =
    currentItem &&
    (isRu && currentItem.descriptionRu
      ? currentItem.descriptionRu
      : currentItem.description);
  const displayButtonText =
    currentItem &&
    (isRu && currentItem.buttonTextRu ? currentItem.buttonTextRu : currentItem.buttonText);

  const hasContent =
    displayBadge || displayTitle || displaySubtitle || displayDescription || displayButtonText;

  if (loading || sliderData.length === 0) {
    return (
      <div className="w-full px-4 md:px-6 py-5 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2.15fr_0.65fr] gap-5">
          <div className="relative rounded-[28px] overflow-hidden h-[220px] md:h-[550px] bg-gray-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a7cf26]"></div>
          </div>
          <div className="hidden lg:block rounded-[28px] bg-gray-200 h-[550px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 py-5 md:pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-[2.15fr_0.65fr] gap-5">
        {/* LEFT SLIDER */}
        <div
          className="group relative rounded-[28px] overflow-hidden h-[220px] md:h-[550px] touch-pan-y bg-gray-100"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* BACKGROUND */}
          <img
            src={currentItem.image}
            alt={displayTitle || 'Slide image'}
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
            draggable="false"
          />

          {/* OVERLAY */}
          {hasContent && <div className="absolute inset-0 bg-black/35"></div>}

          {/* CONTENT */}
          {hasContent && (
            <div className="relative z-10 h-full flex items-center justify-start px-6 md:px-20 lg:px-28">
              <div className="max-w-xl text-white space-y-3 md:space-y-5 text-left">
                {displayBadge && (
                  <span className="inline-block text-xs md:text-sm font-semibold opacity-90 uppercase tracking-wide">
                    {displayBadge}
                  </span>
                )}

                {displayTitle && (
                  <h1 className="text-[28px] sm:text-[34px] md:text-[48px] lg:text-[56px] font-extrabold leading-[1.05]">
                    {displayTitle}
                  </h1>
                )}

                {displayDescription && (
                  <p className="text-sm md:text-base opacity-90 max-w-[90%] md:max-w-md leading-relaxed">
                    {displayDescription}
                  </p>
                )}

                {displayButtonText && currentItem.buttonLink && (
                  <button
                    onClick={() => navigate(currentItem.buttonLink)}
                    className="bg-[#a7cf26] text-white px-5 md:px-7 py-2.5 md:py-3 rounded-full flex items-center gap-2 hover:bg-[#96bc21] transition group shadow-lg font-bold text-sm md:text-base cursor-pointer"
                  >
                    {displayButtonText}
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* NAV DESKTOP - apar doar la hover */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 bg-black/45 text-white w-11 h-11 rounded-full hover:bg-black/65 transition-all duration-300 z-20 items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 bg-black/45 text-white w-11 h-11 rounded-full hover:bg-black/65 transition-all duration-300 z-20 items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* DOTS - comentat
          <div className="hidden md:flex absolute bottom-5 left-1/2 -translate-x-1/2 gap-2 z-20 bg-white/90 px-4 py-2 rounded-full shadow-lg">
            {sliderData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all rounded-full ${
                  currentSlide === index
                    ? 'bg-[#a7cf26] w-8 h-2.5'
                    : 'bg-gray-300 w-2.5 h-2.5 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          */}
        </div>

        {/* RIGHT CUSTOM CARD */}
        <div className="relative rounded-[28px] overflow-hidden h-[220px] md:h-[360px] lg:h-[550px] bg-[#a7cf26] group">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=900&auto=format&fit=crop"
            alt="AgroSmart promo"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8 text-white">
            <span className="text-xs md:text-sm font-bold uppercase tracking-wide mb-3 opacity-90">
              Ofertă specială
            </span>

            <h2 className="text-[26px] md:text-[34px] font-extrabold leading-tight mb-3">
              Produse pentru grădina ta
            </h2>

            <p className="text-sm md:text-base text-white/90 leading-relaxed mb-5 max-w-[320px]">
              Alege soluții inteligente pentru agricultură, grădină și gospodărie.
            </p>

            <button
              onClick={() => navigate('/catalog')}
              className="w-fit bg-white text-[#252525] px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#f3f3f3] transition flex items-center gap-2"
            >
              Vezi oferta
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
