import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  X,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const PAGE_SIZE = 12;

const BrandPage = () => {
  const { t, language } = useLanguage();
  const { slug } = useParams();

  const [brand, setBrand] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [maxBrandPrice, setMaxBrandPrice] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 0 });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOrder, setSortOrder] = useState('');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [mobileSortDropdownOpen, setMobileSortDropdownOpen] = useState(false);

  const sortOptions = [
    { value: '', label: language === 'ru' ? 'По умолчанию' : 'Implicit' },
    { value: 'asc', label: language === 'ru' ? 'Цена: по возрастанию' : 'Preț: mic → mare' },
    { value: 'desc', label: language === 'ru' ? 'Цена: по убыванию' : 'Preț: mare → mic' },
  ];

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortOrder)?.label ||
    sortOptions[0].label;

  useEffect(() => {
    fetchBrandAndProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    setCurrentPage(1);
  }, [priceRange.min, priceRange.max, selectedCategories.join(','), sortOrder]);

  const slugify = (value = '') =>
    value
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

  const getProductCategoryName = (product) => {
    const match = categories.find((cat) => cat.name === product.category);
    return language === 'ru' && match?.nameRu ? match.nameRu : product.category;
  };

  const fetchBrandAndProducts = async () => {
    const startTime = Date.now();

    try {
      setLoading(true);
      setError(null);

      const [brandsRes, productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/brands`),
        axios.get(`${API}/products?limit=2000`),
        axios.get(`${API}/categories`).catch(() => ({ data: [] })),
      ]);

      const foundBrand = (brandsRes.data || []).find((b) => {
        const brandSlug = b.slug || slugify(b.name);
        return brandSlug === slug || b.id === slug;
      });

      if (!foundBrand) {
        setError(t('brandPage.brandNotFound') || 'Brandul nu a fost găsit');
        return;
      }

      const brandProducts = (productsRes.data || []).filter(
        (p) => p.brandId === foundBrand.id
      );

      const prices = brandProducts
        .map((p) => Number(p.price || 0))
        .filter((price) => price > 0);

      const maxPrice = prices.length ? Math.max(...prices) : 0;

      setBrand(foundBrand);
      setAllProducts(brandProducts);
      setCategories(categoriesRes.data || []);
      setMaxBrandPrice(maxPrice);
      setPriceRange({ min: 0, max: maxPrice });
      setTempPriceRange({ min: 0, max: maxPrice });
    } catch (err) {
      console.error('Error fetching brand data:', err);
      setError(t('brandPage.loadError') || 'Eroare la încărcarea brandului');
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(500 - elapsed, 0);

      setTimeout(() => {
        setLoading(false);
      }, remaining);
    }
  };

  const availableCategories = Array.from(
    new Set(allProducts.map((p) => p.category).filter(Boolean))
  );

  const filteredProducts = allProducts
    .filter((product) => {
      const price = Number(product.price || 0);

      const matchesPrice =
        price >= Number(priceRange.min || 0) &&
        (!priceRange.max || price <= Number(priceRange.max));

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      return matchesPrice && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortOrder === 'desc') {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      return 0;
    });

  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleCategoryToggle = (categoryName) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((item) => item !== categoryName)
        : [...prev, categoryName]
    );
  };

  const clampPrice = (value) => {
    const max = maxBrandPrice || 0;
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
      max: Math.min(maxBrandPrice || 0, safeMax),
    }));
  };

  const handlePriceRangeApply = () => {
    setPriceRange(tempPriceRange);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setPriceRange({ min: 0, max: maxBrandPrice });
    setTempPriceRange({ min: 0, max: maxBrandPrice });
    setSelectedCategories([]);
    setSortOrder('');
    setSortDropdownOpen(false);
    setMobileSortDropdownOpen(false);
    setCurrentPage(1);
  };

  const getPercent = (value) => {
    if (!maxBrandPrice) return 0;
    return Math.round((value / maxBrandPrice) * 100);
  };

  const renderPriceSlider = (isMobile = false) => {
    const currentMax = tempPriceRange.max || maxBrandPrice;
    const displayMax =
      currentMax >= maxBrandPrice - 10 ? maxBrandPrice : currentMax;

    const minPercent = getPercent(tempPriceRange.min);
    const maxPercent =
      displayMax >= maxBrandPrice ? 100 : getPercent(displayMax);

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
              max={maxBrandPrice || 0}
              step="10"
              value={tempPriceRange.min || 0}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className="price-range price-range-min pointer-events-none absolute inset-y-0 -left-[12px] w-[calc(100%+24px)] h-[24px] appearance-none bg-transparent"
            />

            <input
              type="range"
              min="0"
              max={maxBrandPrice || 0}
              step="10"
              value={tempPriceRange.max || maxBrandPrice || 0}
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
          <span>{maxBrandPrice} MDL</span>
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
          <div
            className={`${
              isMobile ? 'mt-2' : 'absolute z-30 mt-2'
            } w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden`}
          >
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSortOrder(option.value);
                  setIsOpen(false);
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
    if (availableCategories.length === 0) return null;

    return (
      <div className="mb-6 pb-6 border-b">
        <h4 className="font-bold text-gray-900 mb-4">
          {language === 'ru' ? 'Категории' : 'Categorii'}
        </h4>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {availableCategories.map((categoryName) => {
            const displayName = getProductCategoryName({ category: categoryName });

            return (
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
                  {displayName}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFiltersContent = (isMobile = false) => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#a7cf26]" />
          {language === 'ru' ? 'Фильтры' : 'Filtre'}
        </h3>

        {!isMobile && (
          <button
            onClick={resetFilters}
            className="text-sm text-[#a7cf26]/90 hover:text-[#a7cf26] font-semibold"
          >
            {language === 'ru' ? 'Сбросить' : 'Reset'}
          </button>
        )}

        {isMobile && (
          <button onClick={() => setFilterOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="mb-6 pb-6 border-b">
        <h4 className="font-bold text-gray-900 mb-4">
          {language === 'ru' ? 'Сортировка' : 'Sortare'}
        </h4>

        {renderSortDropdown(isMobile)}
      </div>

      {/* Categorii deasupra la Preț */}
      {renderCategoriesFilter()}

      {maxBrandPrice > 0 && (
        <div className="mb-6 pb-6 border-b">
          {renderPriceSlider(isMobile)}
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
          {language === 'ru' ? 'Сбросить фильтры' : 'Resetează filtrele'}
        </button>
      )}
    </>
  );

  const goTo = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a7cf26] mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'ru' ? 'Загрузка...' : 'Se încarcă...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8 max-w-md w-full">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>

          <p className="text-xl text-gray-600 mb-6">
            {error || t('brandPage.brandNotFound')}
          </p>

          <Link
            to={language === 'ru' ? '/ru/brands' : '/brands'}
            className="bg-[#a7cf26] text-white px-6 py-3 rounded-xl hover:bg-[#96bc21] transition font-semibold inline-block"
          >
            {t('brandPage.backToBrands')}
          </Link>
        </div>
      </div>
    );
  }

  const brandName =
    language === 'ru' && brand.nameRu ? brand.nameRu : brand.name;

  const productsText =
    language === 'ru'
      ? totalProducts === 1
        ? 'товар'
        : 'товаров'
      : totalProducts === 1
        ? 'produs'
        : 'produse';

  const availableText =
    language === 'ru'
      ? totalProducts === 1
        ? 'доступен'
        : 'доступно'
      : totalProducts === 1
        ? 'disponibil'
        : 'disponibile';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="w-full px-3 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
            <Link
              to={language === 'ru' ? '/ru' : '/'}
              className="hover:text-[#a7cf26]"
            >
              {t('brandPage.home')}
            </Link>

            <ChevronRight className="w-4 h-4 flex-shrink-0" />

            <Link
              to={language === 'ru' ? '/ru/brands' : '/brands'}
              className="hover:text-[#a7cf26]"
            >
              {t('brandPage.brands')}
            </Link>

            <ChevronRight className="w-4 h-4 flex-shrink-0" />

            <span className="text-gray-900 font-semibold">{brandName}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      {/* <div className="bg-gradient-to-r from-[#a7cf26] to-[#86aa1d] text-white">
        <div className="w-full px-4 md:px-6 py-8 md:py-12">
          <div className="flex items-center gap-4 md:gap-6">
            {brand.logo && (
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl p-3 md:p-4 flex items-center justify-center flex-shrink-0">
                <img
                  src={brand.logo}
                  alt={brandName}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 break-words">
                {brandName}
              </h1>

              <p className="text-white/90 font-medium">
                {totalProducts} {productsText} {availableText}
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Products + Filters */}
      <div className="w-full px-3 md:px-6 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-[28px] p-6 border border-gray-100 sticky top-24 shadow-sm">
              {renderFiltersContent(false)}
            </div>
          </aside>

          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden fixed bottom-[82px] left-4 bg-[#a7cf26]/90 text-white p-3.5 rounded-full shadow-lg hover:bg-[#a7cf26] transition z-40"
            aria-label="Deschide filtrele"
          >
            <SlidersHorizontal className="w-6 h-6" />
          </button>

          {filterOpen && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                <div className="p-6">{renderFiltersContent(true)}</div>
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {brandName}
              </h2>

              <span className="text-sm text-gray-500 hidden md:block">
                {totalProducts}{' '}
                {language === 'ru' ? 'товаров найдено' : 'produse găsite'}
              </span>
            </div>

            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      {language === 'ru' ? 'Показано' : 'Afișare'}{' '}
                      <span className="font-semibold">
                        {(currentPage - 1) * PAGE_SIZE + 1}
                      </span>
                      {' '}-{' '}
                      <span className="font-semibold">
                        {Math.min(currentPage * PAGE_SIZE, totalProducts)}
                      </span>
                      {' '}
                      {language === 'ru' ? 'из' : 'din'}{' '}
                      <span className="font-semibold">{totalProducts}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goTo(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {language === 'ru' ? 'Назад' : 'Anterior'}
                      </button>

                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, index) => index + 1)
                          .slice(
                            Math.max(0, currentPage - 3),
                            Math.max(5, currentPage + 2)
                          )
                          .map((page) => (
                            <button
                              key={page}
                              onClick={() => goTo(page)}
                              className={`w-10 h-10 rounded-lg font-semibold transition ${
                                currentPage === page
                                  ? 'bg-[#a7cf26] text-white'
                                  : 'border border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                      </div>

                      <button
                        onClick={() => goTo(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {language === 'ru' ? 'Далее' : 'Următor'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-8 md:p-12 text-center">
                <p className="text-xl text-gray-600 mb-4">
                  {t('brandPage.noProducts') || 'Nu există produse pentru acest brand.'}
                </p>

                <button
                  onClick={resetFilters}
                  className="inline-block bg-[#a7cf26] text-white px-6 py-3 rounded-xl hover:bg-[#96bc21] transition font-semibold"
                >
                  {language === 'ru' ? 'Сбросить фильтры' : 'Resetează filtrele'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPage;