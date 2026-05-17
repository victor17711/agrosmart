import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  X,
  ChevronDown
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Preloader from '../components/Preloader';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const PAGE_SIZE = 12;

const CategoryPage = () => {
  const { language, t } = useLanguage();
  const { slug } = useParams();

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [brands, setBrands] = useState([]);
  const [availableBrandIds, setAvailableBrandIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const [maxCategoryPrice, setMaxCategoryPrice] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 0 });

  const [sortOrder, setSortOrder] = useState('');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [mobileSortDropdownOpen, setMobileSortDropdownOpen] = useState(false);

  const sortOptions = [
    { value: '', label: 'Implicit' },
    { value: 'asc', label: 'Preț: mic → mare' },
    { value: 'desc', label: 'Preț: mare → mic' }
  ];

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortOrder)?.label || 'Implicit';

  useEffect(() => {
    setCurrentPage(1);
  }, [slug, priceRange.min, priceRange.max, selectedBrands.join(','), sortOrder]);

  useEffect(() => {
    fetchCategoryAndBrands();
  }, [slug]);

  useEffect(() => {
    if (category && subcategories.length === 0) {
      fetchProducts();
    }
  }, [
    category,
    subcategories,
    currentPage,
    priceRange.min,
    priceRange.max,
    selectedBrands.join(','),
    sortOrder
  ]);

  const fetchCategoryAndBrands = async () => {
    const startTime = Date.now();

    try {
      setLoading(true);
      setError(null);

      const [catRes, brRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/brands`)
      ]);

      const foundCategory = catRes.data.find(
        (c) => c.slug === slug || c.id === slug
      );

      if (!foundCategory) {
        setError('Categoria nu a fost găsită');
        return;
      }

      const directSubs = (catRes.data || []).filter(
        (c) => c.parentId === foundCategory.id
      );

      setCategory(foundCategory);
      setSubcategories(directSubs);
      setBrands(brRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading category:', err);
      setError('Categoria nu a fost găsită');
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(1000 - elapsed, 0);

      setTimeout(() => {
        setLoading(false);
      }, remaining);
    }
  };

  const fetchProducts = async () => {
    if (!category) return;

    try {
      const params = new URLSearchParams({
        category: category.name,
        page: String(currentPage),
        pageSize: String(PAGE_SIZE)
      });

      if (priceRange.min > 0) {
        params.append('minPrice', String(priceRange.min));
      }

      if (priceRange.max > 0 && priceRange.max < maxCategoryPrice) {
        params.append('maxPrice', String(priceRange.max));
      }

      if (selectedBrands.length > 0) {
        params.append('brandIds', selectedBrands.join(','));
      }

      if (sortOrder) {
        params.append('sortBy', 'price');
        params.append('sortOrder', sortOrder);
      }

      const res = await axios.get(
        `${API}/products/list/paginated?${params.toString()}`
      );

      let items = res.data.items || [];

      if (sortOrder === 'asc') {
        items = [...items].sort(
          (a, b) => Number(a.price || 0) - Number(b.price || 0)
        );
      }

      if (sortOrder === 'desc') {
        items = [...items].sort(
          (a, b) => Number(b.price || 0) - Number(a.price || 0)
        );
      }

      setProducts(items);
      setTotalProducts(res.data.total || 0);
      setAvailableBrandIds(res.data.availableBrandIds || []);

      if (maxCategoryPrice === 0 && res.data.maxPrice > 0) {
        setMaxCategoryPrice(res.data.maxPrice);
        setPriceRange({ min: 0, max: res.data.maxPrice });
        setTempPriceRange({ min: 0, max: res.data.maxPrice });
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handlePriceRangeApply = () => {
    setPriceRange(tempPriceRange);
  };

  const resetFilters = () => {
    setPriceRange({ min: 0, max: maxCategoryPrice });
    setTempPriceRange({ min: 0, max: maxCategoryPrice });
    setSelectedBrands([]);
    setSortOrder('');
    setSortDropdownOpen(false);
    setMobileSortDropdownOpen(false);
    setCurrentPage(1);
  };

  const handleBrandToggle = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((b) => b !== brandId)
        : [...prev, brandId]
    );
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
      min: Math.max(0, safeMin)
    }));
  };

  const handleMaxPriceChange = (value) => {
    const nextMax = clampPrice(value);
    const safeMax = Math.max(nextMax, tempPriceRange.min + 10);

    setTempPriceRange((prev) => ({
      ...prev,
      max: Math.min(maxCategoryPrice || 0, safeMax)
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
            {isMobile ? 'Preț' : t('categoryPage.price')}
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
          {isMobile ? 'Aplică' : t('categoryPage.apply')}
        </button>
      </div>
    );
  };

  const visibleBrands = availableBrandIds.length
    ? brands.filter((b) => availableBrandIds.includes(b.id))
    : [];

  const categoryName =
    language === 'ru' && category?.nameRu ? category.nameRu : category?.name;

  if (!loading && (error || !category)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">
            {error || t('categoryPage.notFound')}
          </p>
          <Link
            to="/"
            className="bg-[#a7cf26] text-white px-6 py-3 rounded-xl transition font-semibold inline-block"
          >
            {t('categoryPage.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {loading && <Preloader />}

      {category && (
        <>
          <div className="bg-white border-b">
            <div className="w-full px-3 md:px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Link to="/" className="hover:text-[#a7cf26]">
                  {t('categoryPage.breadcrumb.home')}
                </Link>

                <ChevronRight className="w-4 h-4" />

                <span className="text-gray-900 font-semibold">
                  {categoryName}
                </span>
              </div>
            </div>
          </div>

          {subcategories.length > 0 ? (
            <div className="w-full px-3 md:px-6 py-8 md:py-10">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
                {categoryName}
              </h1>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
                {subcategories.map((sub) => {
                  const subName =
                    language === 'ru' && sub.nameRu ? sub.nameRu : sub.name;
                  const linkPrefix = language === 'ru' ? '/ru' : '';

                  return (
                    <Link
                      key={sub.id}
                      to={`${linkPrefix}/category/${sub.slug || sub.id}`}
                      data-testid={`subcategory-card-${sub.id}`}
                      className="group bg-white rounded-2xl border border-gray-100 p-3 md:p-4 flex flex-col items-center text-center transition hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5"
                    >
                      <div className="w-full aspect-square rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center mb-3">
                        {sub.image ? (
                          <img
                            src={sub.image}
                            alt={subName}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-lg font-bold">
                            {subName?.[0] || '?'}
                          </div>
                        )}
                      </div>

                      <span className="text-sm md:text-[15px] font-semibold text-gray-800 group-hover:text-brand-700 transition leading-tight line-clamp-2">
                        {subName}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full px-3 md:px-6 py-8">
              <div className="flex gap-8">
                <aside className="hidden lg:block w-80 flex-shrink-0">
                  <div className="bg-white rounded-[28px] p-6 border border-gray-100 sticky top-24 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-[#a7cf26]" />
                        {t('categoryPage.filters')}
                      </h3>

                      <button
                        onClick={resetFilters}
                        className="text-sm text-[#a7cf26]/90 hover:text-[#a7cf26] font-semibold"
                      >
                        {t('categoryPage.reset')}
                      </button>
                    </div>

                    <div className="mb-6 pb-6 border-b">
                      <h4 className="font-bold text-gray-900 mb-4">Sortare</h4>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setSortDropdownOpen((prev) => !prev)}
                          className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-left hover:border-[#a7cf26]/90 focus:outline-none focus:ring-2 focus:ring-[#a7cf26]/90 transition"
                        >
                          <span className="font-semibold text-gray-700">
                            {currentSortLabel}
                          </span>

                          <ChevronDown
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              sortDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {sortDropdownOpen && (
                          <div className="absolute z-30 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                            {sortOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setSortOrder(option.value);
                                  setSortDropdownOpen(false);
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
                    </div>

                    <div className="mb-6 pb-6 border-b">
                      {renderPriceSlider(false)}
                    </div>

                    {visibleBrands.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4">
                          {t('categoryPage.brand')}
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
                                  {brand.name}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
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
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">
                            {t('categoryPage.filters')}
                          </h3>

                          <button onClick={() => setFilterOpen(false)}>
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        <div className="mb-6 pb-6 border-b">
                          <h4 className="font-bold text-gray-900 mb-4">
                            Sortare
                          </h4>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setMobileSortDropdownOpen((prev) => !prev)
                              }
                              className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-left hover:border-[#a7cf26]/90 focus:outline-none focus:ring-2 focus:ring-[#a7cf26]/90 transition"
                            >
                              <span className="font-semibold text-gray-700">
                                {currentSortLabel}
                              </span>

                              <ChevronDown
                                className={`w-5 h-5 text-gray-500 transition-transform ${
                                  mobileSortDropdownOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>

                            {mobileSortDropdownOpen && (
                              <div className="mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                                {sortOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      setSortOrder(option.value);
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
                        </div>

                        <div className="mb-6 pb-6 border-b">
                          {renderPriceSlider(true)}
                        </div>

                        {visibleBrands.length > 0 && (
                          <div>
                            <h4 className="font-bold text-gray-900 mb-4">
                              Brand
                            </h4>

                            <div className="space-y-3">
                              {visibleBrands.map((brand) => (
                                <label
                                  key={brand.id}
                                  className="flex items-center gap-3 cursor-pointer rounded-2xl p-2 hover:bg-gray-50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedBrands.includes(brand.id)}
                                    onChange={() => handleBrandToggle(brand.id)}
                                    className="w-4 h-4 text-[#a7cf26] border-gray-300 rounded focus:ring-[#a7cf26]/90"
                                  />

                                  <div className="flex items-center gap-3">
                                    {brand.logo && (
                                      <img
                                        src={brand.logo}
                                        alt={brand.name}
                                        className="w-12 h-9 object-contain"
                                      />
                                    )}

                                    <span className="text-gray-700">
                                      {brand.name}
                                    </span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            resetFilters();
                            setFilterOpen(false);
                          }}
                          className="w-full mt-6 bg-gray-200 text-gray-700 py-2.5 rounded-2xl hover:bg-gray-300 transition font-semibold"
                        >
                          {t('categoryPage.resetFilters')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                      {categoryName}
                    </h1>

                    <span className="text-sm text-gray-500 hidden md:block">
                      {totalProducts} {t('categoryPage.productsAvailable')}
                    </span>
                  </div>

                  {products.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center">
                      <p className="text-xl text-gray-600">
                        {t('categoryPage.empty')}
                      </p>

                      <button
                        onClick={resetFilters}
                        className="mt-4 text-[#a7cf26]/90 hover:text-[#a7cf26] font-semibold"
                      >
                        {t('categoryPage.resetFilters')}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                        {products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>

                      {(() => {
                        const totalPages = Math.max(
                          1,
                          Math.ceil(totalProducts / PAGE_SIZE)
                        );

                        if (totalPages <= 1) return null;

                        const PAGE_GROUP_SIZE = 5;
                        const currentGroup = Math.floor(
                          (currentPage - 1) / PAGE_GROUP_SIZE
                        );
                        const groupStart = currentGroup * PAGE_GROUP_SIZE + 1;
                        const groupEnd = Math.min(
                          groupStart + PAGE_GROUP_SIZE - 1,
                          totalPages
                        );

                        const visiblePages = [];

                        for (let p = groupStart; p <= groupEnd; p++) {
                          visiblePages.push(p);
                        }

                        const goTo = (n) => {
                          setCurrentPage(n);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        };

                        return (
                          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                              {t('categoryPage.showing') || 'Afișare'}{' '}
                              <span className="font-semibold">
                                {(currentPage - 1) * PAGE_SIZE + 1}
                              </span>
                              {' '}-{' '}
                              <span className="font-semibold">
                                {Math.min(currentPage * PAGE_SIZE, totalProducts)}
                              </span>{' '}
                              {t('categoryPage.from') || 'din'}{' '}
                              <span className="font-semibold">{totalProducts}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  goTo(Math.max(1, groupStart - PAGE_GROUP_SIZE))
                                }
                                disabled={groupStart === 1}
                                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                {t('categoryPage.prev') || 'Anterior'}
                              </button>

                              <div className="flex gap-1">
                                {visiblePages.map((p) => (
                                  <button
                                    key={p}
                                    onClick={() => goTo(p)}
                                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                                      currentPage === p
                                        ? 'bg-[#a7cf26] text-white'
                                        : 'border border-gray-300 hover:bg-gray-100'
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>

                              <button
                                onClick={() =>
                                  goTo(Math.min(totalPages, groupEnd + 1))
                                }
                                disabled={groupEnd >= totalPages}
                                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                {t('categoryPage.next') || 'Următor'}
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoryPage;