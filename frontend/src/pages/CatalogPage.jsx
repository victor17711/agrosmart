import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CatalogPage = () => {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setCategories(response.data.categoryMenuItems || []);
    } catch (error) {
      console.error('Error fetching catalog categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a7cf26] mx-auto mb-4"></div>
          <p className="text-gray-600">{t('catalog.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="w-full px-3 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#a7cf26] transition">
              {t('categoryPage.breadcrumb.home') || 'Acasă'}
            </Link>

            <ChevronRight className="w-4 h-4" />

            <span className="text-gray-900 font-semibold">
              {t('catalog.title')}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full px-3 md:px-6 py-8 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
              {t('catalog.title')}
            </h1>

            <p className="mt-2 text-sm md:text-base text-gray-500">
              {t('catalog.desc')}
            </p>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('catalog.emptyTitle')}
            </h2>

            <p className="text-gray-600">
              {t('catalog.emptyDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6">
            {categories.map((category) => {
              const categoryName =
                language === 'ru' && category.nameRu
                  ? category.nameRu
                  : category.name;

              return (
                <Link
                  key={category.id}
                  to={`/catalog/${category.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-[#a7cf26] hover:shadow-lg transition-all duration-300 p-3 md:p-6 text-center"
                >
                  <div className="flex justify-center mb-3 md:mb-4">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      {category.icon ? (
                        typeof category.icon === 'string' &&
                        category.icon.startsWith('data:image') ? (
                          <img
                            src={category.icon}
                            alt={categoryName}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <span className="text-4xl">
                            {category.icon}
                          </span>
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[#a7cf26] text-2xl font-black">
                          {categoryName?.[0] || '?'}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-[14px] md:text-[17px] font-bold text-gray-900 leading-5 group-hover:text-[#a7cf26] transition">
                    {categoryName}
                  </h3>

                  {category.children?.length > 0 && (
                    <p className="mt-2 text-xs md:text-sm text-gray-500">
                      {category.children.length} {t('catalog.subcategories')}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;