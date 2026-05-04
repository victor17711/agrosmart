import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, FolderTree } from 'lucide-react';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('catalogCategory.loading')}</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t('catalogCategory.notFound')}
          </h1>
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition font-semibold"
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
    <div className="bg-gray-50">
      {/* HERO */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-14">
        <div className="w-full px-4 md:px-6">
          <div className="flex items-center gap-3 mb-3">
            <FolderTree className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">{categoryName}</h1>
          </div>
          <p className="text-teal-100">
            {t('catalogCategory.desc')}
          </p>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="bg-white border-b">
        <div className="w-full px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <Link to="/" className="hover:text-teal-600 transition">
              {t('catalogCategory.breadcrumb.home')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/catalog" className="hover:text-teal-600 transition">
              {t('catalogCategory.breadcrumb.catalog')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">{categoryName}</span>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 py-8 md:py-10">
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
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {subcategories.map((child) => {
              const childName =
                language === 'ru' && child.nameRu ? child.nameRu : child.name;

              return (
                <Link
                  key={child.id}
                  to={child.url}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 p-5 md:p-6 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      {child.icon ? (
                        typeof child.icon === 'string' && child.icon.startsWith('data:image') ? (
                          <img
                            src={child.icon}
                            alt={childName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-4xl">{child.icon}</span>
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-[15px] md:text-[17px] font-bold text-gray-900 leading-5 group-hover:text-teal-600 transition">
                    {childName}
                  </h3>

                  {/* <p className="mt-2 text-sm text-gray-500">
                    {child.productCount ?? 0} {t('catalogCategory.products')}
                  </p> */}
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