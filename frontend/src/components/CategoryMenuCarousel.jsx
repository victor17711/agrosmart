import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { Sprout } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/free-mode';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CategoryMenuCarousel = () => {
  const [items, setItems] = useState([]);
  const [categoriesById, setCategoriesById] = useState({});

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

      const cats = catsRes.data || [];
      const byId = {};

      cats.forEach((c) => {
        byId[c.id] = c;
      });

      setCategoriesById(byId);

      const finalItems =
        list.length > 0
          ? list.map((item) => {
              const cat = item.categoryId ? byId[item.categoryId] : null;

              return {
                ...item,
                icon:
                  item.icon ||
                  item.image ||
                  item.imageUrl ||
                  item.photo ||
                  item.thumbnail ||
                  cat?.icon ||
                  cat?.image ||
                  cat?.imageUrl ||
                  cat?.photo ||
                  cat?.thumbnail ||
                  '',
              };
            })
          : cats.map((c) => ({
              id: c.id,
              name: c.name,
              nameRu: c.nameRu,
              icon:
                c.icon ||
                c.image ||
                c.imageUrl ||
                c.photo ||
                c.thumbnail ||
                '',
              url: `/category/${c.slug || c.id}`,
              type: 'category',
              categoryId: c.id,
            }));

      setItems(finalItems);
    });

    return () => {
      mounted = false;
    };
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

  const getImageSrc = (src) => {
    if (!src) return '';

    // base64 / data URI — use as-is
    if (src.startsWith('data:')) return src;

    if (/^https?:\/\//i.test(src)) return src;

    if (src.startsWith('/uploads')) {
      return `${BACKEND_URL}${src}`;
    }

    if (src.startsWith('/')) {
      return src;
    }

    return `${BACKEND_URL}/uploads/${src}`;
  };

  const renderIcon = (item) => {
    // Look up the linked category to get its uploaded image
    const linkedCat = item.categoryId ? categoriesById[item.categoryId] : null;
    const rawSrc =
      item.icon ||
      item.image ||
      item.imageUrl ||
      item.photo ||
      item.thumbnail ||
      linkedCat?.image ||
      linkedCat?.imageUrl ||
      linkedCat?.photo ||
      linkedCat?.thumbnail ||
      linkedCat?.icon ||
      '';

    const src = getImageSrc(rawSrc);
    const isImagePath =
      rawSrc &&
      (rawSrc.startsWith('data:') ||
        /^https?:\/\//i.test(rawSrc) ||
        rawSrc.startsWith('/') ||
        /\.(png|jpe?g|gif|svg|webp)$/i.test(rawSrc));

    if (src && isImagePath) {
      return (
        <img
          src={src}
          alt={item.name || ''}
          className="w-9 h-9 object-cover rounded-full"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    if (rawSrc && rawSrc.length <= 4) {
      return <span className="text-base leading-none">{rawSrc}</span>;
    }

    return <Sprout className="w-6 h-6 text-black" />;
  };

  return (
    <section
      data-testid="category-menu-carousel"
      className="bg-white"
    >
      <div className="w-full px-5 py-2 pt-4">
        <div className="bg-[#f4f4f4] rounded-[26px] px-7 py-4 overflow-hidden">
          <Swiper
            modules={[FreeMode]}
            freeMode
            grabCursor
            slidesPerView="auto"
            spaceBetween={32}
            className="!overflow-visible"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id} style={{ width: 'auto' }}>
                <Link
                  to={resolveLink(item)}
                  className="flex items-center gap-2 text-[16px] md:text-[17px] font-semibold text-[#2d2d2d] whitespace-nowrap hover:text-black transition"
                >
                  <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                    {renderIcon(item)}
                  </span>

                  <span>{item.name}</span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default CategoryMenuCarousel;