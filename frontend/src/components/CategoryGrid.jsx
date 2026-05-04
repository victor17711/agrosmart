import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import 'swiper/css';
import 'swiper/css/navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CategoryGrid = () => {
  const { language } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      const parentCategories = response.data.filter(cat => !cat.parentId);
      setCategories(parentCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="w-full px-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-white">
      <div className="w-full px-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold text-gray-900">
              {language === 'ru' ? 'Категории' : 'Explorează categoriile'}
            </h2>

            <div className="hidden md:flex gap-2">
              <button
                ref={prevRef}
                className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition border border-teal-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                ref={nextRef}
                className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition border border-teal-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* Swiper */}
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView={2}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          speed={800}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          loop={true}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 }
          }}
          className="category-carousel"
        >
          {categories.map((category) => {
            // 🔥 TRADUCERE CATEGORIE
            const categoryName =
              language === 'ru' && category.nameRu
                ? category.nameRu
                : category.name;

            return (
              <SwiperSlide key={category.id}>
                <Link
                  to={`/category/${category.slug}`}
                  className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition group block h-full mb-2"
                >
                  {category.image ? (
                    <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition">
                      <img
                        src={category.image}
                        alt={categoryName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center group-hover:scale-110 transition">
                      <span className="text-2xl font-bold text-teal-600">
                        {categoryName.charAt(0)}
                      </span>
                    </div>
                  )}

                  <h3 className="font-semibold text-gray-800 mb-1 truncate w-full">
                    {categoryName}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {category.itemCount || 0}{' '}
                    {language === 'ru' ? 'товаров' : 'Produse'}
                  </p>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

      </div>
    </section>
  );
};

export default CategoryGrid;