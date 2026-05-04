import React, { useState } from 'react';
import { Truck, Headphones, RotateCcw, BadgeCheck, CheckCircle2, Play, ChevronLeft, ChevronRight, UserCircle2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import aboutImageLast from "../assets/images/about.jpeg";
import aboutDepozit from "../assets/images/depozit.webp";
import aboutShipping from "../assets/images/poza3.jpeg";
import aboutShipping2 from "../assets/images/poza4.jpeg";
import aboutFirst from "../assets/images/poza1.jpeg";
import { useLanguage } from '../context/LanguageContext';

const AboutUsPage = () => {

  const { language, changeLanguage, t } = useLanguage();

  const reviews = [
    t('about.reviews.item1'),
    t('about.reviews.item2'),
    t('about.reviews.item3'),
    t('about.reviews.item4'),
    t('about.reviews.item5'),
    t('about.reviews.item6'),
  ];

  const [currentReview, setCurrentReview] = useState(0);

  const handlePrevReview = () => {
    setCurrentReview((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNextReview = () => {
    setCurrentReview((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const visibleReviews = [
    reviews[currentReview],
    reviews[(currentReview + 1) % reviews.length],
  ];

  const stats = [
    { value: '15+', label: t('about.stats.experience') },
    { value: '10K+', label: t('about.stats.clients') },
    { value: '1000+', label: t('about.stats.products') },
    { value: '24/7', label: t('about.stats.support') },
  ];

  const priorities = [
    {
      icon: <Truck className="w-5 h-5 text-[#2c2c2c]" />,
      title: t('about.priorities.fastDelivery'),
      description: t('about.priorities.fastDeliveryDesc'),
    },
    {
      icon: <Headphones className="w-5 h-5 text-[#2c2c2c]" />,
      title: t('about.priorities.consulting'),
      description: t('about.priorities.consultingDesc'),
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-[#2c2c2c]" />,
      title: t('about.priorities.price'),
      description: t('about.priorities.priceDesc'),
    },
  ];

  const featuresList = [
    t('about.features.item1'),
    t('about.features.item2'),
    t('about.features.item3'),
    t('about.features.item4'),
  ];

  const features2List = [
    t('about.features2.item1'),
    t('about.features2.item2'),
    t('about.features2.item3'),
    t('about.features2.item4'),
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-10 md:py-14">
        <div className="w-full px-6">
          <div className="flex items-center gap-3 mb-3">
            <Info className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">{t('about.heroTitle')}</h1>
          </div>
          <p className="text-teal-100">
            {t('about.heroDesc')}
          </p>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">{t('about.breadcrumb.home')}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">{t('about.breadcrumb.page')}</span>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-10">
        {/* TOP SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.9fr] gap-8 items-start">
          <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_270px] gap-8 items-start">
              <div className="pt-2">
                <h1 className="text-[34px] md:text-[52px] leading-[1.05] font-bold text-[#2a2a2a] max-w-[650px]">
                  {t('about.mainTitle')}
                </h1>

                <div className="mt-8 space-y-6 max-w-[680px]">
                  <div>
                    <h3 className="text-[17px] md:text-[19px] font-semibold text-[#2d2d2d] mb-3">
                      {t('about.missionTitle')}
                    </h3>
                    <p className="text-[14px] md:text-[15px] leading-7 text-[#6c6c6c]">
                      {t('about.missionDesc')}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[17px] md:text-[19px] font-semibold text-[#2d2d2d] mb-3">
                      {t('about.visionTitle')}
                    </h3>
                    <p className="text-[14px] md:text-[15px] leading-7 text-[#6c6c6c]">
                      {t('about.visionDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden xl:block">
                <div className="w-full h-[270px] rounded-[18px] overflow-hidden bg-[#e9e9e9]">
                  <img
                    src={aboutFirst}
                    alt="About small visual"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#dddddd] rounded-[18px] px-4 md:px-6 py-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6">
                {stats.map((item, index) => (
                  <div
                    key={item.label}
                    className={`text-center px-3 ${index !== stats.length - 1 ? 'md:border-r md:border-[#e4e4e4]' : ''
                      }`}
                  >
                    <div className="text-[24px] md:text-[32px] font-bold text-[#2d2d2d]">
                      {item.value}
                    </div>
                    <div className="text-[12px] md:text-[14px] text-[#6d6d6d] mt-2">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full h-[420px] md:h-[560px] rounded-[18px] overflow-hidden bg-[#efb2bf]">
            <img
              src={aboutDepozit}
              alt="About main visual"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* QUALITY PRIORITY */}
        <section className="relative bg-[#f3cbe1] rounded-[34px] pt-24 pb-8 px-4 md:px-10 mt-32">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 bg-gray-50 rounded-[999px] px-8 md:px-14 py-6 md:py-8 min-w-[280px] md:min-w-[420px] text-center">
            <h2 className="text-[24px] md:text-[38px] font-bold text-[#2d2d2d]">
              {t('about.qualityTitle')}
            </h2>

            <p className="text-[13px] md:text-[15px] text-[#6d6d6d] mt-2">
              {t('about.qualityDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-2">
            {priorities.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-[14px] px-6 py-8 text-center shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-[#f4e9b8] mx-auto flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-[18px] font-bold text-[#2d2d2d]">{item.title}</h3>
                <p className="mt-3 text-[13px] leading-6 text-[#6d6d6d] max-w-[260px] mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FASTER DELIVERY */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 items-center mt-16">
          <div className="max-w-[620px]">


            <h2 className="mt-5 text-[30px] md:text-[44px] font-bold text-[#2d2d2d] leading-tight">
              {t('about.productsTitle')}
            </h2>

            <p className="mt-6 text-[14px] md:text-[15px] leading-7 text-[#6d6d6d]">
              {t('about.productsDesc')}
            </p>

            <div className="mt-6 space-y-4">
              {featuresList.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10876c] mt-0.5 shrink-0" />
                  <p className="text-[14px] leading-6 text-[#5f5f5f]">{item}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-[14px] md:text-[15px] leading-7 text-[#6d6d6d]">
              {t('about.productsDesc2')}
            </p>
          </div>

          <div className="grid grid-cols-[1.1fr_0.8fr] gap-4 md:gap-6 items-center">
            <div className="bg-[#bfe8e7] rounded-[20px] overflow-hidden h-[360px] md:h-[470px]">
              <img
                src={aboutShipping}
                alt="Delivery feature main"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-[#d9f1f5] rounded-[16px] overflow-hidden h-[270px] md:h-[350px]">
              <img
                src={aboutShipping2}
                alt="Delivery feature side"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="relative bg-[#a7e1df] rounded-[34px] pt-24 pb-10 px-4 md:px-8 lg:px-12 mt-32">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 bg-gray-50 rounded-[999px] px-8 md:px-14 py-6 md:py-8 min-w-[300px] md:min-w-[460px] text-center z-10">
            <h2 className="text-[24px] md:text-[38px] font-bold text-[#2d2d2d]">
              {t('about.testimonialsTitle')}
            </h2>

            <p className="text-[13px] md:text-[15px] text-[#6d6d6d] mt-2">
              {t('about.testimonialsDesc')}
            </p>
          </div>

          <div className="mt-6 overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(0)` }}
              key={currentReview}
            >
              {visibleReviews.map((item, index) => (
                <div
                  key={`${item.name}-${currentReview}-${index}`}
                  className="w-full lg:w-[calc(50%-12px)] shrink-0 bg-white rounded-[20px] px-6 md:px-8 py-6 md:py-8 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <UserCircle2 className="w-10 h-10 text-[#d4d4d4]" />
                    <div>
                      <h4 className="text-[15px] font-bold text-[#2d2d2d]">{item.name}</h4>
                      <p className="text-[12px] text-[#8a8a8a] mt-1">{item.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-5 text-[13px] flex-wrap">
                    <div className="flex items-center gap-1 text-[#ffb400]">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                    <span className="text-[#5f5f5f]">5.0</span>
                    <span className="flex items-center gap-1 text-[#159c7b]">
                      <BadgeCheck className="w-4 h-4" />
                      {t('about.reviews.verified')}
                    </span>
                  </div>

                  <p className="mt-5 text-[14px] leading-7 text-[#676767]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={handlePrevReview}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#7b7b7b] hover:bg-[#f3f3f3] transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNextReview}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#7b7b7b] hover:bg-[#f3f3f3] transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* IMAGE + TEXT */}
        <section className="grid grid-cols-1 lg:grid-cols-[0.95fr_1fr] gap-10 items-center mt-16 md:mt-24 mb-10">
          <div className="relative h-[320px] md:h-[470px] rounded-[20px] overflow-hidden bg-[#14c9c9]">
            <img
              src={aboutImageLast}
              alt="Customer satisfaction"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="max-w-[700px]">


            <h2 className="mt-5 text-[30px] md:text-[44px] font-bold text-[#2d2d2d] leading-tight">
              {t('about.whyTitle')}
            </h2>

            <p className="mt-6 text-[14px] md:text-[15px] leading-7 text-[#6d6d6d]">
              {t('about.whyDesc')}
            </p>

            <div className="mt-6 space-y-4">
              {features2List.slice(0, 4).map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10876c] mt-0.5 shrink-0" />
                  <p className="text-[14px] leading-6 text-[#5f5f5f]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;