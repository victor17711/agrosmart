import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const FeaturesSection = () => {
  const { language } = useLanguage();

  const features =
    language === 'ru'
      ? [
        {
          title: 'Гарантия качества',
          description: 'Тщательно отобранные товары для надежности и долговечности',
          bg: '#9ad3d3',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
          )
        },
        {
          title: 'Понедельник - Суббота',
          description: 'С 08:00 до 20:00',
          bg: '#f3e466',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 10a6 6 0 10-12 0v4a2 2 0 002 2h1v-4H8m8 0v4h1a2 2 0 002-2v-4m-5 9h-4" />
          )
        },
        {
          title: 'Возврат в течение 30 дней',
          description: 'Ваше удовлетворение — наш приоритет: возврат товара в течение 30 дней',
          bg: '#f3b98f',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h10M7 11h10M8 4h8a2 2 0 012 2v9a5 5 0 11-10 0V6a2 2 0 012-2z" />
          )
        },
        {
          title: 'Безопасная оплата',
          description: 'Покупайте без забот с безопасными способами оплаты',
          bg: '#99dc6c',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0zm-9 7a3 3 0 100-6 3 3 0 000 6z" />
          )
        }
      ]
      : [
        {
          title: 'Calitate garantată',
          description: 'Produse atent selectate pentru durabilitate și performanță',
          bg: '#9ad3d3',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
          )
        },
        {
          title: 'Luni - Sâmbătă',
          description: 'De la 08:00 până la 20:00',
          bg: '#f3e466',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 10a6 6 0 10-12 0v4a2 2 0 002 2h1v-4H8m8 0v4h1a2 2 0 002-2v-4m-5 9h-4" />
          )
        },
        {
          title: 'Retur în 30 de zile',
          description: 'Satisfacția ta este prioritatea noastră: poți returna orice produs în termen de 30 de zile',
          bg: '#f3b98f',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h10M7 11h10M8 4h8a2 2 0 012 2v9a5 5 0 11-10 0V6a2 2 0 012-2z" />
          )
        },
        {
          title: 'Plată securizată',
          description: 'Cumpărături fără griji, cu opțiuni de plată sigure și protejate',
          bg: '#99dc6c',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0zm-9 7a3 3 0 100-6 3 3 0 000 6z" />
          )
        }
      ];

  return (
    <section className="py-10 bg-white">
      <div className="w-full px-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-[24px] px-8 py-6 text-center flex flex-col items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
              style={{ backgroundColor: feature.bg }}
            >
              <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center mb-5">
                <svg className="w-9 h-9 text-[#2f3137]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>

              <h3 className="text-[18px] font-extrabold mb-2">
                {feature.title}
              </h3>

              <p className="text-[15px] text-[#4b5563]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;