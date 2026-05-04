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
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50">
      
      {/* HERO */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-10 md:py-14">
        <div className="w-full px-6">
          <div className="flex items-center gap-3 mb-3">
            <Store className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">{t('brands.title')}</h1>
          </div>
          <p className="text-teal-100">
            {t('brands.desc')}
          </p>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">{t('brands.breadcrumb.home')}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">{t('brands.breadcrumb.page')}</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full px-6 py-10">

        {brands.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('brands.noneTitle')}
            </h2>
            <p className="text-gray-500">
              {t('brands.noneDesc')}
            </p>
          </div>
        ) : (
          <>
            {/* TITLU */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('brands.mainTitle')}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {brands.length} {t('brands.mainDesc')}
              </p>
            </div>

            {/* GRID MODERN */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              
              {brands.map((brand) => {
                const brandSlug = brand.name.toLowerCase().replace(/\s+/g, '-');
                return (
                  <Link
                    key={brand.id}
                    to={`/brand/${brandSlug}`}
                    className="group bg-white rounded-2xl p-5 flex items-center justify-center border border-gray-200 hover:border-teal-500 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  >
                  
                  {/* hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/0 via-teal-500/0 to-teal-500/10 opacity-0 group-hover:opacity-100 transition"></div>

                  <div className="flex flex-col items-center justify-center gap-3 z-10">
                    
                    {/* LOGO */}
                    <div className="w-24 h-16 flex items-center justify-center">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Tag className="w-7 h-7 text-gray-400" />
                      )}
                    </div>

                    {/* NUME */}
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-teal-600 transition text-center">
                      {brand.name}
                    </span>

                  </div>
                </Link>
              );
            })}

            </div>
          </>
        )}

      </div>

      {/* STATS */}
      {/* {brands.length > 0 && (
        <div className="bg-white border-t py-10">
          <div className="w-full px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              
              <div>
                <div className="text-3xl font-bold text-teal-600">
                  {brands.length}+
                </div>
                <div className="text-gray-600 text-sm">
                  Branduri
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold text-teal-600">
                  100%
                </div>
                <div className="text-gray-600 text-sm">
                  Autentic
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold text-teal-600">
                  24/7
                </div>
                <div className="text-gray-600 text-sm">
                  Suport
                </div>
              </div>

            </div>
          </div>
        </div>
      )} */}

    </div>
  );
};

export default BrandsPage;