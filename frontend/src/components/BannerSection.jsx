import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
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
        // 1) try to find a category with products
        const catRes = await axios
          .get(`${API}/categories`)
          .catch(() => ({ data: [] }));
        const cats = catRes.data || [];

        // Prefer a category that has products and a usable image
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

        // Fallback: latest products
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
        if (!cancelled) setProducts([]);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!products.length) return null;

  const { name, nameRu, slug: categorySlug, image: bannerImage, title, titleRu } = categoryInfo;
  const categoryName = language === 'ru' && nameRu ? nameRu : name;
  const displayTitle = language === 'ru' && titleRu ? titleRu : title;
  const linkPrefix = language === 'ru' ? '/ru' : '';

  return (
    <section className="py-8 md:py-10">
      <div className="w-full px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] gap-5">

          {/* Left Banner */}
          <Link
            to={`${linkPrefix}/category/${categorySlug}`}
            className="relative min-h-[460px] md:min-h-[500px] rounded-[24px] overflow-hidden group"
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
                {language === 'ru' ? 'Смотреть все товары' : 'Vezi Toate Produsele'}
              </span>
            </div>
          </Link>

          {/* Products Carousel */}
          <div className="min-w-0">
            <Swiper
              modules={[FreeMode]}
              freeMode
              grabCursor
              slidesPerView={1.15}
              spaceBetween={16}
              breakpoints={{
                480: {
                  slidesPerView: 1.4,
                },
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
                1280: {
                  slidesPerView: 3,
                },
              }}
              className="!pb-1"
            >
              {products.map((product) => (
                <SwiperSlide key={product.id} className="!h-auto">
                  <div className="h-full">
                    <ProductCard product={product} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BannerSection;