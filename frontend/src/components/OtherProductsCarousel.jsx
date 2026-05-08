import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useLanguage } from '../context/LanguageContext';
import 'swiper/css';
import 'swiper/css/navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Second category-driven products carousel placed above the footer.
// Driven by `settings.secondaryFeaturedCategoryId` (configured in admin Settings).
const OtherProductsCarousel = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settingsRes = await axios.get(`${API}/settings`);
        if (cancelled) return;
        setSettings(settingsRes.data);

        const id = settingsRes.data?.secondaryFeaturedCategoryId;
        if (!id) {
          setLoading(false);
          return;
        }

        const catsRes = await axios.get(`${API}/categories`);
        const cat = (catsRes.data || []).find((c) => c.id === id);
        if (!cat) {
          setLoading(false);
          return;
        }
        if (cancelled) return;
        setCategory(cat);

        const prodRes = await axios.get(
          `${API}/products?category=${encodeURIComponent(cat.name)}&limit=24`
        );
        if (cancelled) return;
        setProducts(prodRes.data || []);
      } catch (e) {
        console.error('OtherProductsCarousel error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Hide while loading or when admin hasn't configured a category / no products
  if (loading) return null;
  if (!settings?.secondaryFeaturedCategoryId) return null;
  if (!products.length) return null;

  const isRu = language === 'ru';
  const linkPrefix = isRu ? '/ru' : '';
  const categoryName = isRu && category?.nameRu ? category.nameRu : category?.name || '';
  const titleWords = categoryName.split(' ');
  const lastWord = titleWords.pop();
  const firstWords = titleWords.join(' ');
  const categoryLink = `${linkPrefix}/category/${category?.slug || category?.id}`;
  const seeAllLabel = isRu ? 'Все товары' : 'Toate Produsele';

  return (
    <section data-testid="other-products-carousel" className="pt-2 pb-10 md:pb-12 bg-white">
      <div className="w-full px-6 md:px-10 lg:px-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-7 md:mb-8">
          <h2 className="text-[28px] md:text-[35px] font-extrabold tracking-tight text-[#222] leading-tight">
            {firstWords}{' '}
            <span className="text-brand-600">{lastWord}</span>
          </h2>

          <Link
            to={categoryLink}
            data-testid="other-products-see-all"
            className="hidden md:inline-flex items-center gap-2 bg-[#f3f3f3] hover:bg-[#e9e9e9] text-[13px] md:text-[15px] text-[#444] font-semibold rounded-full px-5 py-3 transition-all duration-300"
          >
            {seeAllLabel}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1.15}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            speed={900}
            autoplay={{
              delay: 5200,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={products.length > 6}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 18 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 22 },
              1280: { slidesPerView: 5, spaceBetween: 24 },
              1536: { slidesPerView: 6, spaceBetween: 24 },
            }}
            className="other-products-carousel"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button
            ref={prevRef}
            data-testid="other-products-prev"
            className="hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center text-brand-600 hover:bg-brand-500 hover:text-white transition-all duration-300 hover:scale-110 border border-brand-500"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            ref={nextRef}
            data-testid="other-products-next"
            className="hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center text-brand-600 hover:bg-brand-500 hover:text-white transition-all duration-300 hover:scale-110 border border-brand-500"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile button */}
        <div className="mt-7 flex md:hidden justify-center">
          <Link
            to={categoryLink}
            className="inline-flex items-center gap-2 bg-[#f3f3f3] hover:bg-[#e9e9e9] text-[#444] font-semibold rounded-full px-7 py-4 transition-all duration-300"
          >
            {seeAllLabel}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OtherProductsCarousel;
