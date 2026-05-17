import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/images/logo.png';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { t } = useLanguage();

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="bg-[#f3f3f3] pt-12 pb-0 border-t border-gray-200 overflow-hidden">
      <div className="w-full px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr_0.9fr_1.2fr] gap-10 items-start">
          {/* LEFT */}
          <div>
            <Link
              to="/"
              className="inline-block"
              data-testid="footer-logo"
            >
              <img
                src={logo}
                alt="AgroSmart"
                className="h-[68px] w-auto object-contain"
              />
            </Link>

            <div className="mt-8 space-y-6">
              <div>
                <h4 className="text-[15px] font-bold text-[#303030] mb-4">
                  Adresa:
                </h4>

                <p className="text-[15px] font-semibold text-[#303030] leading-[1.7]">
                  Moldova, Durlești, str. Tudor Vladimirescu 67c
                </p>
              </div>

              <div>
                <h4 className="text-[15px] font-bold text-[#303030] mb-4">
                  Contacte:
                </h4>

                <div className="space-y-3">
                  <a
                    href="tel:+37367818180"
                    className="block text-[16px] font-bold text-[#303030]"
                  >
                    +373 67 81 81 80
                  </a>

                  <a
                    href="mailto:agrosmart.moldova@gmail.com"
                    className="block text-[16px] font-bold text-[#303030]"
                  >
                    agrosmart.moldova@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER 1 */}
          <div className="pt-2">
            <h3 className="text-[#a7cf26] text-[16px] font-bold mb-5">
              Link-uri utile
            </h3>

            <div className="flex flex-col gap-3">
              <Link
                to="/contact"
                className="text-[16px] font-bold text-[#303030] hover:text-[#a7cf26] transition"
              >
                Contacte
              </Link>

              <Link
                to="/catalog"
                className="text-[16px] font-bold text-[#303030] hover:text-[#a7cf26] transition"
              >
                Magazin
              </Link>
            </div>
          </div>

          {/* CENTER 2 */}
          <div className="pt-2">
            <h3 className="text-[#a7cf26] text-[16px] font-bold mb-5">
              Termeni legali
            </h3>

            <div className="flex flex-col gap-3">
              <Link
                to="/page/livrare"
                className="text-[16px] font-bold text-[#303030] hover:text-[#a7cf26] transition"
              >
                Livrare
              </Link>

              <Link
                to="/page/achitare"
                className="text-[16px] font-bold text-[#303030] hover:text-[#a7cf26] transition"
              >
                Achitare
              </Link>

              <Link
                to="/page/informatie-pentru-consumatori"
                className="text-[16px] font-bold text-[#303030] leading-[1.3] hover:text-[#a7cf26] transition"
              >
                Informație pentru Consumatori
              </Link>

              <Link
                to="/page/politica-de-confidentialitate"
                className="text-[16px] font-bold text-[#303030] leading-[1.3] hover:text-[#a7cf26] transition"
              >
                Politica de confidențialitate pentru informațiile despre utilizator și datele personale
              </Link>
            </div>
          </div>

          {/* RIGHT BOX */}
          <div className="bg-[#a7cf26] rounded-[28px] p-7 xl:p-8 min-h-[320px] flex flex-col justify-between">
            <div>
              <h2 className="text-white text-[30px] xl:text-[30px] leading-none font-extrabold mb-8">
                Contactează-ne!
              </h2>

              <p className="text-white/90 text-[17px] leading-[1.7] mb-2">
                În scris sau la numărul de telefon:
              </p>

              <a 
              href="tel:+37367818180"
              className="text-white/90 text-[17px] leading-[1.7]">
                +373 67 81 81 80 – Viber / Whatsapp
              </a>
            </div>

            {/* NEWSLETTER */}
            {/* <div className="mt-8">
              <div className="text-white text-[17px] font-bold mb-4">
                Abonează-te la newsletter
              </div>

              <form onSubmit={handleSubscribe}>
                <div className="bg-white rounded-full h-[52px] flex items-center px-3 shadow-lg">
                  <div className="w-9 h-9 rounded-full bg-[#f3f3f3] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#a7cf26]" />
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email-ul tău"
                    className="flex-1 h-full bg-transparent outline-none px-3 text-[14px] text-[#303030] placeholder:text-[#909090]"
                  />

                  <button
                    type="submit"
                    className="h-[40px] px-5 rounded-full bg-[#a7cf26] text-white font-bold hover:bg-[#96bc21] transition"
                  >
                    Abonare
                  </button>
                </div>
              </form>
            </div> */}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-10 border-t border-gray-300 py-5 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-[14px] text-[#7a7a7a] text-center lg:text-left">
            AgroSmart 2026 – Powered by{' '}
            <a
              href="https://nextify.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#303030] font-medium"
            >
              Nextify.
            </a>
          </div>

          <div className="flex items-center gap-4 lg:gap-7 flex-wrap justify-center">

            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
              alt="Mastercard"
              className="h-7 object-contain"
            />

            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg"
              alt="Visa"
              className="h-5 object-contain"
            />

            <img
              src="https://upload.wikimedia.org/wikipedia/commons/d/d2/Maib_ID_new_artwork_colour.png"
              alt="Maib"
              className="h-5 object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;