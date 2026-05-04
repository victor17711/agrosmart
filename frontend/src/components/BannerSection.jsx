import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BannerSection = () => {
  const { language } = useLanguage();

  const banners =
    language === 'ru'
      ? [
          {
            id: 1,
            image: 'https://i.postimg.cc/cHy584T7/image-Photoroom.png',
            badge: 'Тепловые насосы',
            title: 'Эффективность и комфорт для вашего дома',
            desc: 'Откройте для себя тепловые насосы для экономии энергии и максимальной производительности.',
            link: '/category/pompe-de-caldura-si-panouri-solare',
            cardBg: 'bg-[#98df6b]',
            outerBg: 'bg-[#c9f1f2]',
            badgeBg: 'bg-[#f6dc62]',
            badgeText: 'text-[#1f2937]',
            titleText: 'text-[#172033]',
            descText: 'text-[#172033]',
            buttonBg: 'bg-[#0b8a83]',
            buttonText: 'text-white',
            layout: 'large',
          },
          {
            id: 2,
            image: 'https://i.postimg.cc/ydGxTtgw/image-Photoroom-2.png',
            badge: 'Инструменты и оборудование',
            title: 'Всё, что нужно для любой работы',
            desc: 'Выбирайте профессиональные инструменты и оборудование — безопасные и эффективные.',
            link: '/category/instrumente-si-scule',
            cardBg: 'bg-[#f3cfe3]',
            outerBg: 'bg-[#f3e9f0]',
            badgeBg: 'bg-[#f6dc62]',
            badgeText: 'text-[#1f2937]',
            titleText: 'text-[#172033]',
            descText: 'text-[#172033]',
            buttonBg: 'bg-[#0b8a83]',
            buttonText: 'text-white',
            layout: 'small',
          },
          {
            id: 3,
            image: 'https://i.postimg.cc/bvT3dHGM/image-Photoroom-3.png',
            badge: 'Отопление и ГВС',
            title: 'Современные решения для комфорта',
            desc: 'Откройте оборудование для отопления и горячего водоснабжения для вашего дома.',
            link: '/category/incalzire-si-acm',
            cardBg: 'bg-[#f7e55f]',
            outerBg: 'bg-[#f6efc7]',
            badgeBg: 'bg-[#9be06a]',
            badgeText: 'text-[#1f2937]',
            titleText: 'text-[#172033]',
            descText: 'text-[#172033]',
            buttonBg: 'bg-[#0b8a83]',
            buttonText: 'text-white',
            layout: 'small',
          },
        ]
      : [
          {
            id: 1,
            image: 'https://i.postimg.cc/cHy584T7/image-Photoroom.png',
            badge: 'Pompe de căldură',
            title: 'Eficiență și confort pentru casa ta',
            desc: 'Descoperă gama noastră de pompe de căldură pentru economii și performanță maximă.',
            link: '/category/pompe-de-caldura-si-panouri-solare',
            cardBg: 'bg-[#98df6b]',
            outerBg: 'bg-[#c9f1f2]',
            badgeBg: 'bg-[#f6dc62]',
            badgeText: 'text-[#1f2937]',
            titleText: 'text-[#172033]',
            descText: 'text-[#172033]',
            buttonBg: 'bg-[#0b8a83]',
            buttonText: 'text-white',
            layout: 'large',
          },
          {
            id: 2,
            image: 'https://i.postimg.cc/ydGxTtgw/image-Photoroom-2.png',
            badge: 'Instrumente și scule',
            title: 'Tot ce ai nevoie pentru orice lucrare',
            desc: 'Alege instrumente și scule profesionale sigure și eficiente.',
            link: '/category/instrumente-si-scule',
            cardBg: 'bg-[#f3cfe3]',
            outerBg: 'bg-[#f3e9f0]',
            badgeBg: 'bg-[#f6dc62]',
            badgeText: 'text-[#1f2937]',
            titleText: 'text-[#172033]',
            descText: 'text-[#172033]',
            buttonBg: 'bg-[#0b8a83]',
            buttonText: 'text-white',
            layout: 'small',
          },
          {
            id: 3,
            image: 'https://i.postimg.cc/bvT3dHGM/image-Photoroom-3.png',
            badge: 'Încălzire și ACM',
            title: 'Soluții moderne pentru confort',
            desc: 'Descoperă echipamente pentru încălzire și apă caldă menajeră.',
            link: '/category/incalzire-si-acm',
            cardBg: 'bg-[#f7e55f]',
            outerBg: 'bg-[#f6efc7]',
            badgeBg: 'bg-[#9be06a]',
            badgeText: 'text-[#1f2937]',
            titleText: 'text-[#172033]',
            descText: 'text-[#172033]',
            buttonBg: 'bg-[#0b8a83]',
            buttonText: 'text-white',
            layout: 'small',
          },
        ];

  const BannerCard = ({ banner }) => {
    const isLarge = banner.layout === 'large';

    return (
      <div
        className={`relative rounded-[28px] overflow-hidden ${banner.outerBg} ${
          isLarge ? 'min-h-[520px] md:min-h-[560px]' : 'min-h-[520px] md:min-h-[560px]'
        }`}
      >
        {banner.image && (
          <div className={`absolute inset-x-0 top-0 ${isLarge ? 'h-[58%]' : 'h-[58%]'}`}>
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-contain object-center"
            />
          </div>
        )}

        <div
          className={`absolute left-1/2 -translate-x-1/2 bottom-6 z-10 rounded-[26px] ${
            banner.cardBg
          } ${
            isLarge
              ? 'w-[calc(100%-44px)] px-6 md:px-10 py-7 md:py-8'
              : 'w-[calc(100%-40px)] px-5 md:px-6 py-6'
          }`}
        >
          <div className="flex justify-center mb-4">
            <span
              className={`inline-flex items-center rounded-full px-5 py-2 text-sm md:text-[15px] font-semibold ${banner.badgeBg} ${banner.badgeText}`}
            >
              {banner.badge}
            </span>
          </div>

          <h3
            className={`font-bold text-center leading-tight ${
              isLarge ? 'text-[34px] md:text-[42px]' : 'text-[28px] md:text-[34px]'
            } ${banner.titleText}`}
          >
            {banner.title}
          </h3>

          <p
            className={`text-center mt-4 ${
              isLarge ? 'text-[18px] md:text-[20px]' : 'text-[16px] md:text-[18px]'
            } ${banner.descText}`}
          >
            {banner.desc}
          </p>

          <div className="flex justify-center mt-7">
            <Link
              to={banner.link}
              className={`inline-flex items-center gap-3 rounded-full pl-7 pr-2 py-2 ${banner.buttonBg} ${banner.buttonText} font-semibold text-[16px] md:text-[18px] shadow-sm hover:scale-[1.02] transition`}
            >
              <span>{language === 'ru' ? 'Каталог товаров' : 'Catalog produse'}</span>
              <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-[#0b5960]" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-8 md:py-10">
      <div className="w-full px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <BannerCard banner={banners[0]} />
          </div>

          <div className="lg:col-span-1">
            <BannerCard banner={banners[1]} />
          </div>

          <div className="lg:col-span-1">
            <BannerCard banner={banners[2]} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;