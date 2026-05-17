import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const CountdownTimer = ({
  targetDate = '2026-05-15T23:59:59+03:00',
}) => {
  const { language } = useLanguage();

  const text = {
    ro: {
      titleHighlight: 'Ofertă',
      titleRest: 'Limitată!',
      subtitle: 'Grăbește-te să cumperi aceste produse',
      days: 'Zile',
      hours: 'Ore',
      minutes: 'Min',
      seconds: 'Sec',
    },
    ru: {
      titleHighlight: 'Ограниченное',
      titleRest: 'предложение!',
      subtitle: 'Поторопитесь купить эти товары',
      days: 'Дни',
      hours: 'Часы',
      minutes: 'Мин',
      seconds: 'Сек',
    },
    en: {
      titleHighlight: 'Limited',
      titleRest: 'Offer!',
      subtitle: 'Hurry up to buy these products',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Min',
      seconds: 'Sec',
    },
  };

  const currentText = text[language] || text.ro;

  const calculateTimeLeft = () => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const items = [
    { value: timeLeft.days, label: currentText.days },
    { value: timeLeft.hours, label: currentText.hours },
    { value: timeLeft.minutes, label: currentText.minutes },
    { value: timeLeft.seconds, label: currentText.seconds },
  ];

  return (
    <section className="w-full px-4 md:px-4 py-2">
      <div className="w-full bg-[#f4f4f4] rounded-[22px] px-5 md:px-7 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Text */}
          <div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#242424] leading-tight">
              <span className="text-[#bd4b35]">
                {currentText.titleHighlight}
              </span>{' '}
              {currentText.titleRest}
            </h2>

            <p className="mt-3 text-base md:text-lg text-[#777] font-medium">
              {currentText.subtitle}
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2.5 md:gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="w-[66px] h-[78px] md:w-[88px] md:h-[88px] bg-white rounded-[20px] shadow-[0_6px_18px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center"
              >
                <div className="text-2xl md:text-3xl font-extrabold text-[#2b2b2b] leading-none">
                  {String(item.value).padStart(2, '0')}
                </div>

                <div className="mt-1.5 text-sm md:text-base text-[#777] font-medium">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountdownTimer;