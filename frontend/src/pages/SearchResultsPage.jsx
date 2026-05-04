import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SearchResultsPage = () => {
  const { t, language } = useLanguage();

  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (query) {
      searchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      // Delegate filtering to backend: it now matches every word in `q`
      // case-insensitively against `name` AND `nameRu`.
      const response = await axios.get(
        `${API}/products?search=${encodeURIComponent(query)}&limit=200`
      );
      const filtered = response.data || [];

      setProducts(filtered);

      const uniqueCategories = [
        ...new Set(
          filtered.map((p) =>
            language === 'ru' && p.categoryRu ? p.categoryRu : p.category
          )
        )
      ].filter(Boolean);

      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => {
        const cat = language === 'ru' && p.categoryRu ? p.categoryRu : p.category;
        return cat === selectedCategory;
      })
    : products;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-6 h-6 text-teal-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t('search.title')}
            </h1>
          </div>

          <p className="text-gray-600">
            {loading ? (
              t('search.searching')
            ) : (
              <>
                {t('search.found')}{' '}
                <span className="font-bold text-teal-600">
                  {filteredProducts.length}
                </span>{' '}
                {filteredProducts.length === 1
                  ? t('search.result')
                  : t('search.results')}{' '}
                {t('search.for')} "{query}"
              </>
            )}
          </p>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          {categories.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-gray-900">
                    {t('search.filter')}
                  </h3>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      selectedCategory === ''
                        ? 'bg-teal-50 text-teal-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('search.allCategories')} ({products.length})
                  </button>

                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        selectedCategory === category
                          ? 'bg-teal-50 text-teal-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category} (
                      {products.filter(p => {
                        const cat =
                          language === 'ru' && p.categoryRu
                            ? p.categoryRu
                            : p.category;
                        return cat === category;
                      }).length}
                      )
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className={categories.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('search.noResultsTitle')}
                </h2>

                <p className="text-gray-600 mb-6">
                  {t('search.noResultsDesc')} "{query}"
                </p>

                <Link
                  to="/"
                  className="inline-block bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition font-semibold"
                >
                  {t('search.backHome')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;