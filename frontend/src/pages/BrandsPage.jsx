import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, Store, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BrandsPage = () => {
  const { t } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const slugify = (value = '') =>
    value
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a7cf26] mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">
            Se încarcă brandurile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BREADCRUMB */}
      <div className="bg-white border-b border-gray-100">
        <div className="w-full px-3 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
            <Link
              to="/"
              className="hover:text-[#a7cf26]"
            >
              {t('brands.breadcrumb.home')}
            </Link>

            <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-400" />

            <span className="text-gray-900 font-semibold">
              {t('brands.breadcrumb.page')}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full px-3 md:px-6 py-8 md:py-10">
        <div className="mb-8 rounded-[28px] border border-gray-100 bg-white p-5 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#a7cf26]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#7fa20f]">
                <Store className="w-4 h-4" />
                {t('brands.title')}
              </div>

              <h1 className="mt-4 text-2xl md:text-4xl font-extrabold text-gray-950">
                {t('brands.mainTitle')}
              </h1>

              <p className="mt-2 max-w-2xl text-sm md:text-base text-gray-500 leading-relaxed">
                {t('brands.desc')}
              </p>
            </div>

            <div className="w-fit rounded-2xl bg-black px-5 py-4 text-white">
              <div className="text-2xl font-black text-[#a7cf26]">
                {brands.length}
              </div>
              <div className="text-xs font-semibold text-white/70">
                {t('brands.mainDesc')}
              </div>
            </div>
          </div>
        </div>

        {brands.length === 0 ? (
          <div className="bg-white rounded-[28px] border border-gray-100 p-10 md:p-14 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#a7cf26]/10">
              <Store className="w-8 h-8 text-[#a7cf26]" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('brands.noneTitle')}
            </h2>

            <p className="text-gray-500">
              {t('brands.noneDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
            {brands.map((brand) => {
              const brandSlug = brand.slug || slugify(brand.name);

              return (
                <Link
                  key={brand.id}
                  to={`/brand/${brandSlug}`}
                  className="bg-white rounded-[22px] p-4 md:p-5 flex min-h-[150px] md:min-h-[165px] flex-col items-center justify-center border border-gray-100"
                >
                  <div className="flex h-20 md:h-24 w-full items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 px-3">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-14 md:max-h-16 max-w-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Tag className="w-7 h-7 text-[#a7cf26]" />
                    )}
                  </div>

                  <span className="mt-4 text-center text-sm font-bold text-gray-800 line-clamp-2">
                    {brand.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;