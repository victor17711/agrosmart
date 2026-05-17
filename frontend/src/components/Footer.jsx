import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/images/logo.png';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { language } = useLanguage();

  const isRu = language === 'ru';

  const text = {
    addressTitle: isRu ? 'Адрес:' : 'Adresa:',
    address: isRu
      ? 'Молдова, Дурлешты, ул. Тудор Владимиреску 67c'
      : 'Moldova, Durlești, str. Tudor Vladimirescu 67c',
    contactsTitle: isRu ? 'Контакты:' : 'Contacte:',
    usefulLinks: isRu ? 'Полезные ссылки' : 'Link-uri utile',
    contacts: isRu ? 'Контакты' : 'Contacte',
    shop: isRu ? 'Магазин' : 'Magazin',
    brands: isRu ? 'Бренды' : 'Branduri',
    legalTerms: isRu ? 'Юридическая информация' : 'Termeni legali',
    delivery: isRu ? 'Доставка' : 'Livrare',
    payment: isRu ? 'Оплата' : 'Achitare',
    consumerInfo: isRu ? 'Информация для потребителей' : 'Informație pentru Consumatori',
    privacy: isRu
      ? 'Политика конфиденциальности пользовательской информации и персональных данных'
      : 'Politica de confidențialitate pentru informațiile despre utilizator și datele personale',
    contactBoxTitle: isRu ? 'Свяжитесь с нами!' : 'Contactează-ne!',
    contactBoxText: isRu
      ? 'Напишите нам или позвоните по номеру:'
      : 'În scris sau la numărul de telefon:',
    poweredBy: isRu ? 'Powered by' : 'Powered by',
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="bg-[#f3f3f3] pt-12 pb-0 border-t border-gray-200 overflow-hidden">
      <div className="w-full px-3 lg:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr_0.9fr_1.2fr] gap-10 items-start">
          <div>
            <Link to="/" className="inline-block" data-testid="footer-logo">
              <img src={logo} alt="AgroSmart" className="h-[68px] w-auto object-contain" />
            </Link>

            <div className="mt-8 space-y-6">
              <div>
                <h4 className="text-[15px] font-bold text-[#303030] mb-4">
                  {text.addressTitle}
                </h4>
                <p className="text-[15px] font-semibold text-[#303030] leading-[1.7]">
                  {text.address}
                </p>
              </div>

              <div>
                <h4 className="text-[15px] font-bold text-[#303030] mb-4">
                  {text.contactsTitle}
                </h4>

                <div className="space-y-3">
                  <a href="tel:+37367818180" className="block text-[16px] font-bold text-[#303030]">
                    +373 67 81 81 80
                  </a>

                  <a href="mailto:agrosmart.moldova@gmail.com" className="block text-[16px] font-bold text-[#303030]">
                    agrosmart.moldova@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-[#a7cf26] text-[18px] font-bold mb-5">
              {text.usefulLinks}
            </h3>

            <div className="flex flex-col gap-3">
              <Link to="/contact" className="text-[16px] font-bold text-[#303030] hover:text-[#a7cf26] transition">
                {text.contacts}
              </Link>

              <Link to="/catalog" className="text-[16px] font-bold text-[#303030] hover:text-[#a7cf26] transition">
                {text.shop}
              </Link>

              <Link to="/brands" className="text-[16px] font-bold text-[#303030] hover:text-[#a7cf26] transition">
                {text.brands}
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-[#a7cf26] text-[18px] font-bold mb-5">
              {text.legalTerms}
            </h3>

            <div className="flex flex-col gap-3">
              <Link to="/page/livrare" className="text-[16px] font-bold text-[#303030] hover:text-[#a7cf26] transition">
                {text.delivery}
              </Link>

              <Link to="/page/achitare" className="text-[16px] font-bold text-[#303030] hover:text-[#a7cf26] transition">
                {text.payment}
              </Link>

              <Link to="/page/informatie-pentru-consumatori" className="text-[16px] font-bold text-[#303030] leading-[1.3] hover:text-[#a7cf26] transition">
                {text.consumerInfo}
              </Link>

              <Link to="/page/politica-de-confidentialitate" className="text-[16px] font-bold text-[#303030] leading-[1.3] hover:text-[#a7cf26] transition">
                {text.privacy}
              </Link>
            </div>
          </div>

          <div className="bg-[#a7cf26] rounded-[22px] md:rounded-[28px] p-5 md:p-7 xl:p-8 min-h-[190px] md:min-h-[320px] flex flex-col justify-between">
            <div>
              <h2 className="text-white text-[24px] md:text-[30px] xl:text-[30px] leading-none font-extrabold mb-5 md:mb-8">
                {text.contactBoxTitle}
              </h2>

              <p className="text-white/90 text-[15px] md:text-[17px] leading-[1.55] md:leading-[1.7] mb-2">
                {text.contactBoxText}
              </p>

              <a href="tel:+37367818180" className="block text-white/90 text-[15px] md:text-[17px] leading-[1.55] md:leading-[1.7] font-semibold">
                +373 67 81 81 80 – Viber / Whatsapp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-300 py-5 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-[14px] text-[#7a7a7a] text-center lg:text-left">
            AgroSmart 2026 – {text.poweredBy}{' '}
            <a href="https://nextify.md" target="_blank" rel="noopener noreferrer" className="text-[#303030] font-medium">
              Nextify.
            </a>
          </div>

          <div className="flex items-center gap-4 lg:gap-7 flex-wrap justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-7 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg" alt="Visa" className="h-5 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d2/Maib_ID_new_artwork_colour.png" alt="Maib" className="h-5 object-contain" />
            <img src="https://www.delucru.md/upload/design/c1193233bab61e67f21f35e2ee140090.png.webp" alt="IuteCredit" className="h-6 object-contain" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;