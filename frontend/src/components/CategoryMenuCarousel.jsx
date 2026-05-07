import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Sprout } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Use the Romanian category menu items (managed in admin Settings).
// Each item has: { id, name, nameRu, url, type, icon, categoryId }
const CategoryMenuCarousel = () => {
  const [items, setItems] = useState([]);
  const [categoriesById, setCategoriesById] = useState({});
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      axios.get(`${API}/settings`).catch(() => ({ data: null })),
      axios.get(`${API}/categories`).catch(() => ({ data: [] })),
    ]).then(([settingsRes, catsRes]) => {
      if (!mounted) return;
      const list = Array.isArray(settingsRes.data?.categoryMenuItems)
        ? settingsRes.data.categoryMenuItems
        : [];
      // Fall back to all categories if no menu was configured yet
      const cats = catsRes.data || [];
      const byId = {};
      const bySlug = {};
      cats.forEach((c) => {
        byId[c.id] = c;
        if (c.slug) bySlug[c.slug] = c;
      });
      setCategoriesById(byId);

      const finalItems = list.length > 0
        ? list
        : cats.map((c) => ({
            id: c.id,
            name: c.name,
            nameRu: c.nameRu,
            icon: c.icon || c.image || '',
            url: `/category/${c.slug || c.id}`,
            type: 'category',
            categoryId: c.id,
          }));
      setItems(finalItems);
    });
    return () => { mounted = false; };
  }, []);

  if (!items.length) return null;

  const resolveLink = (item) => {
    if (item.url) return item.url;
    if (item.categoryId) {
      const cat = categoriesById[item.categoryId];
      return cat ? `/category/${cat.slug || cat.id}` : '#';
    }
    return '#';
  };

  const renderIcon = (item) => {
    const src = item.icon || '';
    // image url (http/https or starts with /)
    const isUrl = /^https?:\/\//i.test(src) || src.startsWith('/uploads') || src.startsWith('/');
    if (src && isUrl) {
      return (
        <img
          src={src}
          alt=""
          className="w-7 h-7 object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      );
    }
    // emoji or short text
    if (src && src.length <= 4) {
      return <span className="text-2xl leading-none">{src}</span>;
    }
    // fallback
    return <Sprout className="w-6 h-6 text-brand-600" />;
  };

  return (
    <section
      data-testid="category-menu-carousel"
      className="bg-white border-b border-gray-100"
    >
      <div className="max-w-[1320px] mx-auto px-4 py-4 relative">
        <div className="relative group">
          {/* Prev */}
          <button
            ref={prevRef}
            data-testid="cat-carousel-prev"
            aria-label="Anterior"
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-brand-50 hover:border-brand-200 transition opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          <Swiper
            modules={[Navigation, FreeMode]}
            freeMode
            spaceBetween={12}
            slidesPerView="auto"
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            className="!px-1"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id} style={{ width: 'auto' }}>
                <Link
                  to={resolveLink(item)}
                  data-testid={`cat-carousel-item-${item.id}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-100 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {renderIcon(item)}
                  </span>
                  <span>{item.name}</span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Next */}
          <button
            ref={nextRef}
            data-testid="cat-carousel-next"
            aria-label="Următor"
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-brand-50 hover:border-brand-200 transition opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryMenuCarousel;
