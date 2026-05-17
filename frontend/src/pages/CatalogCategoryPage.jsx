import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CatalogCategoryPage = () => {
  const { t, language } = useLanguage();
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      const allCategories = response.data.categoryMenuItems || [];
      const foundCategory = allCategories.find(
        (item) => String(item.id) === String(categoryId)
      );

      setCategory(foundCategory || null);
    } catch (error) {
      console.error('Error fetching category:', error);
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a7cf26] mx-auto mb-4"></div>
          <p className="text-gray-600">{t('catalogCategory.loading')}</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-3 md:px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t('catalogCategory.notFound')}
          </h1>

          <Link
            to="/catalog"
            className="inline-flex items-center justify-center bg-[#a7cf26] text-white px-6 py-3 rounded-xl hover:bg-[#96bc21] transition font-semibold"
          >
            {t('catalogCategory.back')}
          </Link>
        </div>
      </div>
    );
  }

  const categoryName =
    language === 'ru' && category.nameRu ? category.nameRu : category.name;

  const subcategories = category.children || [];

  return (
    <div className=" bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="w-full px-3 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <Link to="/" className="hover:text-[#a7cf26] transition">
              {t('catalogCategory.breadcrumb.home')}
            </Link>

            <ChevronRight className="w-4 h-4" />

            <Link to="/catalog" className="hover:text-[#a7cf26] transition">
              {t('catalogCategory.breadcrumb.catalog')}
            </Link>

            <ChevronRight className="w-4 h-4" />

            <span className="text-gray-900 font-semibold">
              {categoryName}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full px-3 md:px-6 py-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
            {categoryName}
          </h1>

          <p className="mt-2 text-sm md:text-base text-gray-500">
            {t('catalogCategory.desc')}
          </p>
        </div>

        {subcategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('catalogCategory.emptyTitle')}
            </h2>

            <p className="text-gray-600">
              {t('catalogCategory.emptyDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6">
            {subcategories.map((child) => {
              const childName =
                language === 'ru' && child.nameRu ? child.nameRu : child.name;

              return (
                <Link
                  key={child.id}
                  to={child.url}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-[#a7cf26] hover:shadow-lg transition-all duration-300 p-3 md:p-6 text-center"
                >
                  <div className="flex justify-center mb-3 md:mb-4">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      {child.icon ? (
                        typeof child.icon === 'string' &&
                        child.icon.startsWith('data:image') ? (
                          <img
                            src={child.icon}
                            alt={childName}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <span className="text-4xl">
                            {child.icon}
                          </span>
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[#a7cf26] text-2xl font-black">
                          {childName?.[0] || '?'}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-[14px] md:text-[17px] font-bold text-gray-900 leading-5 group-hover:text-[#a7cf26] transition">
                    {childName}
                  </h3>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogCategoryPage;