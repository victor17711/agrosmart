import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  X,
  ChevronDown,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SearchResultsPage = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState('');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [mobileSortDropdownOpen, setMobileSortDropdownOpen] = useState(false);

  const [maxCategoryPrice, setMaxCategoryPrice] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 0 });

  const sortOptions = [
    { value: '', label: language === 'ru' ? 'По умолчанию' : 'Implicit' },
    { value: 'asc', label: language === 'ru' ? 'Цена: по возрастанию' : 'Preț: mic → mare' },
    { value: 'desc', label: language === 'ru' ? 'Цена: по убыванию' : 'Preț: mare → mic' },
  ];

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortOrder)?.label ||
    sortOptions[0].label;

  useEffect(() => {
    if (query) {
      searchProducts();
      fetchBrands();
    } else {
      setProducts([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, language]);

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${API}/brands`);
      setBrands(res.data || []);
    } catch (error) {
      console.error('Brands error:', error);
      setBrands([]);
    }
  };

  const searchProducts = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API}/products?search=${encodeURIComponent(query)}&limit=200`
      );

      const data = response.data.products || response.data.items || response.data || [];
      const items = Array.isArray(data) ? data : [];

      setProducts(items);

      const maxPrice = items.reduce((max, p) => {
        const price = Number(p.price || 0);
        return price > max ? price : max;
      }, 0);

      setMaxCategoryPrice(maxPrice);
      setPriceRange({ min: 0, max: maxPrice });
      setTempPriceRange({ min: 0, max: maxPrice });
      setSelectedCategories([]);
      setSelectedBrands([]);
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductCategoryName = (product) =>
    language === 'ru' && product.categoryRu ? product.categoryRu : product.category;

  const categories = [
    ...new Set(products.map((p) => getProductCategoryName(p))),
  ].filter(Boolean);

  const visibleBrands = brands.filter((brand) =>
    products.some((product) => product.brandId === brand.id)
  );

  const filteredProducts = products
    .filter((p) => {
      const cat = getProductCategoryName(p);
      const price = Number(p.price || 0);

      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(cat);

      const brandMatch =
        selectedBrands.length > 0 ? selectedBrands.includes(p.brandId) : true;

      const priceMatch =
        price >= Number(priceRange.min || 0) &&
        price <= Number(priceRange.max || maxCategoryPrice || 0);

      return categoryMatch && brandMatch && priceMatch;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return Number(a.price || 0) - Number(b.price || 0);
      if (sortOrder === 'desc') return Number(b.price || 0) - Number(a.price || 0);
      return 0;
    });

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSortOrder('');
    setSortDropdownOpen(false);
    setMobileSortDropdownOpen(false);
    setPriceRange({ min: 0, max: maxCategoryPrice });
    setTempPriceRange({ min: 0, max: maxCategoryPrice });
  };

  const handleCategoryToggle = (categoryName) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((item) => item !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleBrandToggle = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handlePriceRangeApply = () => {
    setPriceRange(tempPriceRange);
  };

  const clampPrice = (value) => {
    const max = maxCategoryPrice || 0;
    return Math.min(Math.max(Number(value), 0), max);
  };

  const handleMinPriceChange = (value) => {
    const nextMin = clampPrice(value);
    const safeMin = Math.min(nextMin, tempPriceRange.max - 10);

    setTempPriceRange((prev) => ({
      ...prev,
      min: Math.max(0, safeMin),
    }));
  };

  const handleMaxPriceChange = (value) => {
    const nextMax = clampPrice(value);
    const safeMax = Math.max(nextMax, tempPriceRange.min + 10);

    setTempPriceRange((prev) => ({
      ...prev,
      max: Math.min(maxCategoryPrice || 0, safeMax),
    }));
  };

  const getPercent = (value) => {
    if (!maxCategoryPrice) return 0;
    return Math.round((value / maxCategoryPrice) * 100);
  };

  const renderPriceSlider = (isMobile = false) => {
    const currentMax = tempPriceRange.max || maxCategoryPrice;
    const displayMax =
      currentMax >= maxCategoryPrice - 10 ? maxCategoryPrice : currentMax;

    const minPercent = getPercent(tempPriceRange.min);
    const maxPercent =
      displayMax >= maxCategoryPrice ? 100 : getPercent(displayMax);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-bold text-gray-900">
            {language === 'ru' ? 'Цена' : 'Preț'}
          </h4>

          <div className="rounded-full bg-[#a7cf26]/10 px-3 py-1 text-xs font-black text-[#7fa20f]">
            {tempPriceRange.min || 0} - {displayMax} MDL
          </div>
        </div>

        <div className="relative pt-5 pb-4">
          <div className="relative h-[24px]">
            <div className="absolute left-0 right-0 top-1/2 h-[8px] -translate-y-1/2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="absolute top-0 h-full rounded-full bg-gradient-to-r from-[#a7cf26] to-[#8fb71d]"
                style={{
                  left: `${minPercent}%`,
                  right: `${100 - maxPercent}%`,
                }}
              />
            </div>

            <input
              type="range"
              min="0"
              max={maxCategoryPrice || 0}
              step="10"
              value={tempPriceRange.min || 0}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className="price-range price-range-min pointer-events-none absolute inset-y-0 -left-[12px] w-[calc(100%+24px)] h-[24px] appearance-none bg-transparent"
            />

            <input
              type="range"
              min="0"
              max={maxCategoryPrice || 0}
              step="10"
              value={tempPriceRange.max || maxCategoryPrice || 0}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className="price-range price-range-max pointer-events-none absolute inset-y-0 -left-[12px] w-[calc(100%+28px)] h-[24px] appearance-none bg-transparent"
            />
          </div>

          <style>{`
            .price-range {
              -webkit-appearance: none;
              appearance: none;
              background: transparent;
            }

            .price-range::-webkit-slider-runnable-track {
              height: 8px;
              background: transparent;
              border: none;
            }

            .price-range::-moz-range-track {
              height: 8px;
              background: transparent;
              border: none;
            }

            .price-range::-webkit-slider-thumb {
              pointer-events: auto;
              -webkit-appearance: none;
              appearance: none;
              width: 24px;
              height: 24px;
              border-radius: 9999px;
              background: #a7cf26;
              border: 6px solid #ffffff;
              box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
              cursor: pointer;
              margin-top: -8px;
            }

            .price-range::-moz-range-thumb {
              pointer-events: auto;
              width: 24px;
              height: 24px;
              border-radius: 9999px;
              background: #a7cf26;
              border: 6px solid #ffffff;
              box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
              cursor: pointer;
            }

            .price-range:focus {
              outline: none;
            }
          `}</style>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
          <span>0 MDL</span>
          <span>{maxCategoryPrice} MDL</span>
        </div>

        <button
          onClick={() => {
            handlePriceRangeApply();
            if (isMobile) setFilterOpen(false);
          }}
          className="w-full bg-[#a7cf26] text-white py-2.5 rounded-2xl hover:bg-[#96bc21] transition font-semibold"
        >
          {language === 'ru' ? 'Применить' : 'Aplică'}
        </button>
      </div>
    );
  };

  const renderSortDropdown = (isMobile = false) => {
    const isOpen = isMobile ? mobileSortDropdownOpen : sortDropdownOpen;
    const setIsOpen = isMobile ? setMobileSortDropdownOpen : setSortDropdownOpen;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-left hover:border-[#a7cf26]/90 focus:outline-none focus:ring-2 focus:ring-[#a7cf26]/90 transition"
        >
          <span className="font-semibold text-gray-700">
            {currentSortLabel}
          </span>

          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSortOrder(option.value);
                  setSortDropdownOpen(false);
                  setMobileSortDropdownOpen(false);
                }}
                className={`w-full px-4 py-3 text-left font-medium transition ${
                  sortOrder === option.value
                    ? 'bg-[#a7cf26] text-white'
                    : 'text-gray-700 hover:bg-[#a7cf26]/10 hover:text-[#a7cf26]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCategoriesFilter = () => {
    if (categories.length === 0) return null;

    return (
      <div className="mb-6 pb-6 border-b">
        <h4 className="font-bold text-gray-900 mb-4">
          {language === 'ru' ? 'Категории' : 'Categorii'}
        </h4>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {categories.map((categoryName) => (
            <label
              key={categoryName}
              className="flex items-center gap-3 cursor-pointer group rounded-2xl hover:bg-gray-50 p-2 transition"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(categoryName)}
                onChange={() => handleCategoryToggle(categoryName)}
                className="w-4 h-4 text-[#a7cf26] border-gray-300 rounded focus:ring-[#a7cf26]/90"
              />

              <span className="text-gray-700 group-hover:text-[#a7cf26] transition font-medium">
                {categoryName}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderFilters = (isMobile = false) => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#a7cf26]" />
          {t('categoryPage.filters') || 'Filtre'}
        </h3>

        {!isMobile && (
          <button
            onClick={resetFilters}
            className="text-sm text-[#a7cf26]/90 hover:text-[#a7cf26] font-semibold"
          >
            {t('categoryPage.reset') || 'Reset'}
          </button>
        )}
      </div>

      <div className="mb-6 pb-6 border-b">
        <h4 className="font-bold text-gray-900 mb-4">
          {language === 'ru' ? 'Сортировка' : 'Sortare'}
        </h4>

        {renderSortDropdown(isMobile)}
      </div>

      {renderCategoriesFilter()}

      {maxCategoryPrice > 0 && (
        <div className="mb-6 pb-6 border-b">
          {renderPriceSlider(isMobile)}
        </div>
      )}

      {visibleBrands.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 mb-4">
            {t('categoryPage.brand') || 'Brand'}
          </h4>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {visibleBrands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-3 cursor-pointer group rounded-2xl hover:bg-gray-50 p-2 transition"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => handleBrandToggle(brand.id)}
                  className="w-4 h-4 text-[#a7cf26] border-gray-300 rounded focus:ring-[#a7cf26]/90"
                />

                <div className="flex items-center gap-3 flex-1">
                  {brand.logo && (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-12 h-9 object-contain"
                    />
                  )}

                  <span className="text-gray-700 group-hover:text-[#a7cf26] transition font-medium">
                    {language === 'ru' && brand.nameRu ? brand.nameRu : brand.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {isMobile && (
        <button
          onClick={() => {
            resetFilters();
            setFilterOpen(false);
          }}
          className="w-full mt-6 bg-gray-200 text-gray-700 py-2.5 rounded-2xl hover:bg-gray-300 transition font-semibold"
        >
          {t('categoryPage.resetFilters') || 'Resetează filtrele'}
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="w-full px-3 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <Link to="/" className="hover:text-[#a7cf26] transition">
              {t('categoryPage.breadcrumb.home') || 'Acasă'}
            </Link>

            <ChevronRight className="w-4 h-4" />

            <span className="text-gray-900 font-semibold">
              {t('search.title') || 'Căutare'}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full px-3 md:px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {t('search.title') || 'Rezultate căutare'}
            </h1>

            <p className="mt-2 text-sm md:text-base text-gray-500">
              {loading ? (
                t('search.searching') || 'Se caută...'
              ) : (
                <>
                  {t('search.found') || 'Am găsit'}{' '}
                  <span className="font-bold text-[#a7cf26]">
                    {filteredProducts.length}
                  </span>{' '}
                  {filteredProducts.length === 1
                    ? t('search.result') || 'rezultat'
                    : t('search.results') || 'rezultate'}{' '}
                  {t('search.for') || 'pentru'} "{query}"
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-8">
          {!loading && products.length > 0 && (
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-[28px] p-6 border border-gray-100 sticky top-24 shadow-sm">
                {renderFilters(false)}
              </div>
            </aside>
          )}

          {!loading && products.length > 0 && (
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden fixed bottom-6 left-6 bg-[#a7cf26]/90 text-white p-4 rounded-full shadow-lg hover:bg-[#a7cf26] transition z-40"
              aria-label="Deschide filtrele"
            >
              <SlidersHorizontal className="w-6 h-6" />
            </button>
          )}

          {filterOpen && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {t('categoryPage.filters') || 'Filtre'}
                    </h3>

                    <button onClick={() => setFilterOpen(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {renderFilters(true)}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center h-64 bg-white rounded-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a7cf26]"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 md:p-12 text-center">
                <Search className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mx-auto mb-4" />

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('search.noResultsTitle')}
                </h2>

                <p className="text-gray-600 mb-6">
                  {t('search.noResultsDesc')} "{query}"
                </p>

                <Link
                  to="/"
                  className="inline-block bg-[#a7cf26] text-white px-8 py-3 rounded-xl hover:bg-[#96bc21] transition font-semibold"
                >
                  {t('search.backHome')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
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