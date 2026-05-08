import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DiscountProductsCarousel = () => {
  const { t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [featuredCategory, setFeaturedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (settings?.featuredCategoryId) {
      fetchFeaturedProducts();
    }
  }, [settings]);

  const createSlug = (text) => {
    return text
      ?.toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-ăîâșțĂÎÂȘȚ]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const fetchInitialData = async () => {
    try {
      const [settingsRes, productsRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/products`)
      ]);

      setSettings(settingsRes.data);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching discount carousel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const categoryRes = await axios.get(`${API}/categories`);
      const category = categoryRes.data.find(
        (cat) => cat.id === settings.featuredCategoryId
      );

      if (category) {
        setFeaturedCategory(category);

        const response = await axios.get(
          `${API}/products?category=${encodeURIComponent(category.name)}`
        );

        setFeaturedProducts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="w-full px-6 md:px-10 lg:px-16">
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </section>
    );
  }

  const fallbackProducts = products.slice(0, 10);
  const displayProducts =
    featuredProducts.length > 0 ? featuredProducts : fallbackProducts;

  if (!displayProducts.length) {
    return null;
  }

  const categoryName = featuredCategory?.name || t('discountProducts');
  const titleWords = categoryName.split(' ');
  const lastWord = titleWords.pop();
  const firstWords = titleWords.join(' ');

  const categoryLink = featuredCategory
    ? `/category/${featuredCategory.slug || createSlug(featuredCategory.name)}`
    : '/category';

  return (
    <section className="pt-2 pb-10 md:pb-8 bg-white">
      <div className="w-full px-6 md:px-10 lg:px-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-7 md:mb-8">
          <h2 className="text-[28px] md:text-[35px] font-extrabold tracking-tight text-[#222] leading-tight">
            {firstWords}{' '}
            <span className="text-[#0f5c70]">{lastWord}</span>
          </h2>

          <Link
            to={categoryLink}
            className="hidden md:inline-flex items-center gap-2 bg-[#f3f3f3] hover:bg-[#e9e9e9] text-[13px] md:text-[15px] text-[#444] font-semibold rounded-full px-5 py-3 transition-all duration-300"
          >
            Toate Produsele
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
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={displayProducts.length > 6}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 18 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 22 },
              1280: { slidesPerView: 5, spaceBetween: 24 },
              1536: { slidesPerView: 6, spaceBetween: 24 },
            }}
            className="discount-products-carousel"
          >
            {displayProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button
            ref={prevRef}
            className="hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-300 hover:scale-110 border border-teal-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            ref={nextRef}
            className="hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-300 hover:scale-110 border border-teal-600"
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
            Toate Produsele
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DiscountProductsCarousel;