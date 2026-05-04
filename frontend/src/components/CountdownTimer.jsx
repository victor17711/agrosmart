import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const CountdownTimer = ({ targetDate }) => {
  const { language } = useLanguage();

  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full">
      
      <span className="font-semibold">
        {language === 'ru' ? 'Истекает:' : 'Expiră:'}
      </span>

      <div className="flex items-center gap-1">
        <span className="font-bold">{formatNumber(timeLeft.days || 259)}</span>
        <span>:</span>
        <span className="font-bold">{formatNumber(timeLeft.hours || 1)}</span>
        <span>:</span>
        <span className="font-bold">{formatNumber(timeLeft.minutes || 33)}</span>
        <span>:</span>
        <span className="font-bold">{formatNumber(timeLeft.seconds || 50)}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;