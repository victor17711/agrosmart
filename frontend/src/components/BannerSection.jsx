import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import {
  Truck,
  ShieldCheck,
  BadgeCheck,
  Headphones,
} from 'lucide-react';
import ProductCard from './ProductCard';
import { useLanguage } from '../context/LanguageContext';

import 'swiper/css';
import 'swiper/css/free-mode';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BannerSection = () => {
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState({
    name: 'Unelte de grădină',
    slug: 'unelte-gradina',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop',
    title: 'Unelte de grădină',
  });

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        const catRes = await axios
          .get(`${API}/categories`)
          .catch(() => ({ data: [] }));

        const cats = catRes.data || [];
        let chosen = null;

        for (const c of cats) {
          const pr = await axios
            .get(`${API}/products?category=${encodeURIComponent(c.name)}&limit=12`)
            .catch(() => ({ data: [] }));

          if ((pr.data || []).length > 0) {
            chosen = { cat: c, products: pr.data };
            break;
          }
        }

        if (!chosen) {
          const all = await axios
            .get(`${API}/products?limit=12`)
            .catch(() => ({ data: [] }));

          chosen = {
            cat: { name: 'Recomandate', slug: 'catalog', image: '' },
            products: all.data || [],
          };
        }

        if (!cancelled) {
          const c = chosen.cat;

          setCategoryInfo({
            name: c.name,
            nameRu: c.nameRu,
            slug: c.slug || 'catalog',
            image:
              c.image ||
              c.imageUrl ||
              'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop',
            title: c.name,
            titleRu: c.nameRu,
          });

          setProducts(chosen.products);
        }
      } catch (error) {
        console.error('Error fetching banner products:', error);

        if (!cancelled) {
          setProducts([]);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!products.length) return null;

  const {
    name,
    nameRu,
    slug: categorySlug,
    image: bannerImage,
    title,
    titleRu,
  } = categoryInfo;

  const isRu = language === 'ru';
  const categoryName = isRu && nameRu ? nameRu : name;
  const displayTitle = isRu && titleRu ? titleRu : title;
  const linkPrefix = isRu ? '/ru' : '';

  const benefits = [
    {
      icon: Truck,
      title: isRu ? 'Быстрая доставка' : 'Livrare rapidă',
      desc: isRu
        ? 'Получите заказ быстро и безопасно.'
        : 'Primești comanda rapid și sigur.',
    },
    {
      icon: ShieldCheck,
      title: isRu ? 'Проверенные товары' : 'Produse verificate',
      desc: isRu
        ? 'Гарантированное качество каждого товара.'
        : 'Calitate garantată pentru fiecare produs.',
    },
    {
      icon: BadgeCheck,
      title: isRu ? 'Надежные бренды' : 'Branduri de încredere',
      desc: isRu
        ? 'Мы работаем с проверенными поставщиками и брендами.'
        : 'Lucrăm cu furnizori și mărci selectate.',
    },
    {
      icon: Headphones,
      title: isRu ? 'Полезная консультация' : 'Consultanță utilă',
      desc: isRu
        ? 'Поможем выбрать подходящий товар.'
        : 'Te ajutăm să alegi produsul potrivit.',
    },
  ];

  return (
    <section className="py-8 md:py-10">
      <div className="w-full px-3 md:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] gap-5">
          {/* Left Banner */}
          <Link
            to={`${linkPrefix}/category/${categorySlug}`}
            className="relative min-h-[500px] md:min-h-[580px] lg:min-h-[590px] rounded-[24px] overflow-hidden group"
          >
            <img
              src={bannerImage}
              alt={categoryName}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="relative z-10 h-full flex flex-col items-center justify-start text-center px-8 pt-12">
              <p className="text-white/80 text-[16px] font-semibold mb-4">
                {categoryName}
              </p>

              <h2 className="text-white text-[34px] md:text-[40px] leading-tight font-extrabold max-w-[260px]">
                {displayTitle}
              </h2>

              <span className="mt-8 inline-flex items-center justify-center rounded-full bg-[#a6cf24] text-white px-7 py-3 text-[15px] font-bold">
                {isRu ? 'Смотреть все товары' : 'Vezi Toate Produsele'}
              </span>
            </div>
          </Link>

          {/* Products + Benefits */}
          <div className="min-w-0 flex flex-col">
            <Swiper
              modules={[FreeMode]}
              freeMode
              grabCursor
              slidesPerView={1.5}
              spaceBetween={15.5}
              breakpoints={{
                480: {
                  slidesPerView: 1.5,
                  spaceBetween: 12,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 16,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 18,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
              }}
              className="!pb-1 w-full"
            >
              {products.map((product) => (
                <SwiperSlide key={product.id} className="!h-auto">
                  <div className="h-full">
                    <ProductCard product={product} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Benefits */}
            <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {benefits.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="bg-white border border-[#a7cf26] rounded-[20px] p-4 md:p-5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#a7cf26]/10 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-[#a7cf26]" />
                    </div>

                    <h3 className="text-[13px] md:text-[15px] font-extrabold text-gray-900 leading-tight">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 text-[11px] md:text-[13px] text-gray-500 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;