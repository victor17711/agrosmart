import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Tag } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BrandsSection = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8 bg-white">
        <div className="w-full px-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a7cf26]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!brands.length) return null;

  return (
    <section className="bg-white py-8">
      <div className="w-full px-6">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={28}
          slidesPerView={2}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={700}
          loop={brands.length > 4}
          breakpoints={{
  640: { slidesPerView: 2 },
  768: { slidesPerView: 3 },
  1024: { slidesPerView: 5 },
  1280: { slidesPerView: 7 },
}}
          className="brands-swiper"
        >
          {brands.map((brand) => {
            const brandSlug = brand.name.toLowerCase().replace(/\s+/g, '-');

            return (
              <SwiperSlide key={brand.id}>
                <Link
                  to={`/brand/${brandSlug}`}
                  className="group h-[95px] bg-[#f4f4f4] rounded-[28px] flex items-center justify-center px-6 transition-all duration-300 hover:bg-[#eeeeee]"
                >
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-[75px] max-w-[150px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Tag className="w-10 h-10 text-gray-400" />
                  )}
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default BrandsSection;