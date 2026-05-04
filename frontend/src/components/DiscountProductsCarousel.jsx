import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import CountdownTimer from './CountdownTimer';
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
      <section className="py-12 bg-gray-50">
        <div className="w-full px-6">
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

  return (
    <section className="py-12 bg-gray-50">
      <div className="w-full px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
            {t('discountProducts')}
          </h2>

          <CountdownTimer targetDate={new Date('2026-05-15T23:59:59+03:00')} />
        </div>

        {featuredProducts.length > 0 ? (
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={12}
              slidesPerView={1.5}
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
              loop={displayProducts.length > 5}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
              className="hot-picks-carousel"
            >
              {displayProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} showProgress />
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} showProgress />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DiscountProductsCarousel;