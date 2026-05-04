import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const InfoBar = () => {
  const { language } = useLanguage();

  const messages =
    language === 'ru'
      ? [
          "★ Бесплатная доставка по всей Молдове",
          "★ Быстрая и безопасная оплата",
          "★ Поддержка клиентов 24/7",
          "★ Ежедневные гарантированные скидки",
          "★ Товары высокого качества",
        ]
      : [
          "★ Livrare gratuită în toată Moldova",
          "★ Plată securizată și rapidă",
          "★ Suport clienți 24/7",
          "★ Reduceri zilnice garantate",
          "★ Produse de calitate superioară",
        ];

  return (
    <section className="py-6 bg-teal-50">
      <div className="w-full overflow-hidden">
        <div className="marquee-track">
          {[...Array(4)].map((_, groupIndex) => (
            <div key={groupIndex} className="marquee-group">
              {messages.map((text, i) => (
                <span
                  key={`${groupIndex}-${i}`}
                  className="mx-8 text-lg font-semibold text-gray-600 whitespace-nowrap"
                >
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoBar;