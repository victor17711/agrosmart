import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { Leaf } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { language, changeLanguage, t } = useLanguage();

  const [openFooterMenu, setOpenFooterMenu] = useState({
    usefulLinks: false,
    info: false,
    categories: false,
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    toast({
      title: 'Success',
      description: 'Successfully subscribed to newsletter!',
    });
    setEmail('');
  };

  const toggleFooterMenu = (key) => {
    setOpenFooterMenu((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      {/* Newsletter Section */}
      <section className="bg-[#f5f5f5] pt-12 pb-12 md:pt-16">
        <div className="max-w-[1320px] mx-auto px-4">
          <div className="text-center">
            <h2 className="text-[#1d2433] text-[30px] md:text-[38px] font-bold leading-tight">
              {t('footer.newsletter')}
            </h2>

            <p className="mt-5 text-[#94A3B8] text-[15px] md:text-[16px] leading-[1.7]">
              {t('footer.newsletterDesc')}
            </p>

            <form
              onSubmit={handleSubscribe}
              className="mt-7 mx-auto w-full max-w-[500px]"
            >
              <div className="h-[58px] rounded-full border border-[#D9E0E7] bg-white flex items-center pl-3 md:pl-5 pr-2 md:pr-[7px] shadow-[0_4px_18px_rgba(15,92,92,0.06)]">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-[#4B5563] shrink-0" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.newsletterText')}
                  required
                  className="flex-1 h-full bg-transparent outline-none px-2 md:px-4 text-[14px] md:text-[16px] text-[#64748B] placeholder:text-[#94A3B8]"
                />

                <button
                  type="submit"
                  className="h-[36px] md:h-[42px] px-4 md:px-7 text-[14px] md:text-[16px] rounded-full bg-[#16a085] text-white font-semibold hover:bg-[#0d7c7e] transition whitespace-nowrap"
                >
                  {t('footer.subscribe')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#16a085] pt-10 md:pt-12 pb-[50px] md:pb-12 xl:rounded-tr-[22px] xl:rounded-tl-[22px] relative">
        <div className="max-w-[1320px] mx-auto px-4">
          <div className="grid grid-cols-12 gap-x-6 gap-y-6 md:gap-y-8 pb-9 xl:flex xl:justify-between">
            {/* Column 1 */}
            <div className="col-span-12 md:col-span-12 xl:w-1/4 flex flex-col gap-y-6">
              <div>
                <Link to="/" className="inline-flex items-center gap-2" data-testid="footer-logo">
                  <Leaf className="w-9 h-9 text-emerald-300" />
                  <span className="text-3xl font-extrabold tracking-tight text-white">
                    Agro<span className="text-emerald-300">Smart</span>
                  </span>
                </Link>
              </div>

              <p className="text-[#D8ECE6] text-base leading-[1.8] max-w-[330px]">
                {t('footer.aboutUs')}
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61574327334921"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center size-10 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110"
                >
                  <FaFacebookF className="w-4 h-4 text-white" />
                </a>

                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center size-10 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110"
                >
                  <FaInstagram className="w-4 h-4 text-white" />
                </a>

                <a
                  href="https://tiktok.com/@agrosmart.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center size-10 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110"
                >
                  <FaTiktok className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>

            {/* Column 2 */}
            <div className="col-span-12 md:col-span-6 xl:w-1/4">
              <button
                type="button"
                onClick={() => toggleFooterMenu('usefulLinks')}
                className="flex items-center gap-2 xl:pointer-events-none"
              >
                <h5 className="text-[#D8ECE6] text-[18px] font-semibold border-b border-[rgba(145,158,171,0.24)] pb-1 uppercase md:normal-case">
                  {t('footer.menuFirst')}
                </h5>

                <span className="xl:hidden ml-3 text-white shrink-0">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      openFooterMenu.usefulLinks ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>

              <ul
                className={`flex flex-col gap-y-1.5 pt-4 overflow-hidden transition-all duration-300 ${
                  openFooterMenu.usefulLinks ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 xl:max-h-[500px] xl:opacity-100'
                }`}
              >
                {[
                  { to: '/despre-noi', label: t('footer.links.about') },
                  { to: '/catalog', label: t('footer.links.catalog') },
                  { to: '/servicii', label: t('footer.links.services') },
                  { to: '/brands', label: t('footer.links.brands') },
                  { to: '/contact', label: t('footer.links.contacts') },
                ].map((item) => (
                  <li key={item.label} className="py-1.5 flex items-center gap-x-2">
                    <span className="inline-flex items-center">
                      <ChevronRight className="w-5 h-5 text-[#D8ECE6]" />
                    </span>
                    <Link
                      to={item.to}
                      className="text-[#D8ECE6] font-semibold hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div className="col-span-12 md:col-span-6 xl:w-1/4">
              <button
                type="button"
                onClick={() => toggleFooterMenu('info')}
                className="flex items-center gap-2 xl:pointer-events-none"
              >
                <h5 className="text-[#D8ECE6] text-[18px] font-semibold border-b border-[rgba(145,158,171,0.24)] pb-1 uppercase md:normal-case">
                  {t('footer.menuSecond')}
                </h5>

                <span className="xl:hidden ml-3 text-white shrink-0">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      openFooterMenu.info ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>

              <ul
                className={`flex flex-col gap-y-1.5 pt-4 overflow-hidden transition-all duration-300 ${
                  openFooterMenu.info ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 xl:max-h-[500px] xl:opacity-100'
                }`}
              >
                {[
                  { to: '/page/termeni-si-conditii', label: t('footer.links.terms') },
                  { to: '/page/politica-de-confidentialitate', label: t('footer.links.policy') },
                  { to: '/page/politica-cookie', label: t('footer.links.policyCookie') },
                  { to: '/page/livrare-si-plata', label: t('footer.links.shipping') },
                  { to: '/intrebari-frecvente', label: t('footer.links.faq') },
                ].map((item) => (
                  <li key={item.label} className="py-1.5 flex items-center gap-x-2">
                    <span className="inline-flex items-center">
                      <ChevronRight className="w-5 h-5 text-[#D8ECE6]" />
                    </span>
                    <Link
                      to={item.to}
                      className="text-[#D8ECE6] font-semibold hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 - Categorii comentată */}
            {/*
            <div className="col-span-12 md:col-span-6 xl:col-span-2">
              <button
                type="button"
                onClick={() => toggleFooterMenu('categories')}
                className="flex items-center gap-2 xl:pointer-events-none"
              >
                <h5 className="text-[#D8ECE6] text-[18px] font-semibold border-b border-[rgba(145,158,171,0.24)] pb-1 uppercase md:normal-case">
                  {t('footer.menuThird')}
                </h5>

                <span className="xl:hidden ml-3 text-white shrink-0">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      openFooterMenu.categories ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>

              <ul
                className={`flex flex-col gap-y-1.5 pt-4 overflow-hidden transition-all duration-300 ${
                  openFooterMenu.categories ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 xl:max-h-[500px] xl:opacity-100'
                }`}
              >
                {[
                  { to: '/toate-produsele', label: t('footer.links.allProducts') },
                  { to: '/category/reduceri', label: t('footer.links.saleProducts') },
                  { to: '/category/cele-mai-vandute', label: t('footer.links.bestProducts') },
                  { to: '/category/produse-noi', label: t('footer.links.newProducts') },
                ].map((item) => (
                  <li key={item.label} className="py-1.5 flex items-center gap-x-2">
                    <span className="inline-flex items-center">
                      <ChevronRight className="w-5 h-5 text-[#D8ECE6]" />
                    </span>
                    <Link
                      to={item.to}
                      className="text-[#D8ECE6] font-semibold hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            */}

            {/* Column 5 */}
            <div className="col-span-12 md:col-span-6 xl:w-1/4">
              <h5 className="text-[#D8ECE6] text-[20px] font-semibold pb-0 border-b border-[rgba(145,158,171,0.24)]">
                {t('footer.contactUs')}
              </h5>

              <ul className="flex flex-col gap-y-3 py-4">
                <li className="flex items-center gap-x-3">
                  <span className="size-10 inline-flex items-center justify-center rounded-full bg-[#ffffff]/20 shrink-0">
                    <MapPin className="w-5 h-5 text-[#D8ECE6]" />
                  </span>
                  <p className="text-[#D8ECE6] font-semibold leading-[1.6]">
                    {t('footer.address')}
                  </p>
                </li>

                <li className="flex items-center gap-x-3">
                  <span className="size-10 inline-flex items-center justify-center rounded-full bg-[#ffffff]/20 shrink-0">
                    <Phone className="w-5 h-5 text-[#D8ECE6]" />
                  </span>
                  <p className="text-[#D8ECE6] font-semibold">
                    {t('footer.call')} (373) 691 19 991
                  </p>
                </li>

                <li className="flex items-center gap-x-3">
                  <span className="size-10 inline-flex items-center justify-center rounded-full bg-[#ffffff]/20 shrink-0">
                    <Mail className="w-5 h-5 text-[#D8ECE6]" />
                  </span>
                  <p className="text-[#D8ECE6] font-semibold">
                    contact@agrosmart.md
                  </p>
                </li>

                {/* <li className="flex items-center gap-x-3">
                  <span className="size-10 inline-flex items-center justify-center rounded-full bg-[#ffffff]/20 shrink-0">
                    <Mail className="w-5 h-5 text-[#D8ECE6]" />
                  </span>
                  <p className="text-[#D8ECE6] font-semibold">
                    comenzi@agrosmart.md
                  </p>
                </li> */}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="text-center text-white pt-[22px] pb-px bg-no-repeat bg-center relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-full max-w-[520px] h-[48px] border-t border-[#fff] rounded-t-[120px]" />
            <p className="relative z-10 text-[15px] text-[#EAF6F2]">
              © 2026 Domix. {t('footer.allRightsReserved')}{' '}
              <a
                href="https://nextify.md"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition"
              >
                Nextify
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;