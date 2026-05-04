import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('catalog.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* HERO */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-14">
        <div className="w-full px-4 md:px-6">
          <div className="flex items-center gap-3 mb-3">
            <FolderOpen className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">{t('catalog.title')}</h1>
          </div>
          <p className="text-teal-100">
           {t('catalog.desc')}
          </p>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 py-8 md:py-10">
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
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => {
              const categoryName = language === 'ru' && category.nameRu ? category.nameRu : category.name;
              return (
                <Link
                  key={category.id}
                  to={`/catalog/${category.id}`}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 p-5 md:p-6 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      {category.icon ? (
                        typeof category.icon === 'string' && category.icon.startsWith('data:image') ? (
                          <img
                            src={category.icon}
                            alt={categoryName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-4xl">{category.icon}</span>
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-[15px] md:text-[17px] font-bold text-gray-900 leading-5 group-hover:text-teal-600 transition">
                    {categoryName}
                  </h3>

                  {category.children?.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500">
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