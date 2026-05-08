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
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const PAGE_SIZE = 12;

const CategoryPage = () => {
  const { language, t } = useLanguage();
  const { slug } = useParams();

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (category && subcategories.length === 0) {
      // Only fetch products when there are no subcategories to show
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subcategories, currentPage, priceRange.min, priceRange.max, selectedBrands.join(','), sortOrder]);

  const fetchCategoryAndBrands = async () => {
    try {
      setLoading(true);

      const [catRes, brRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/brands`)
      ]);

      const foundCategory = catRes.data.find((c) => c.slug === slug);

      if (!foundCategory) {
        setError('Categoria nu a fost găsită');
        return;
      }

      // Find direct subcategories (parentId === foundCategory.id)
      const directSubs = (catRes.data || []).filter(
        (c) => c.parentId === foundCategory.id
      );

      setCategory(foundCategory);
      setSubcategories(directSubs);
      setAllCategories(catRes.data || []);
      setBrands(brRes.data);
      setError(null);
    } catch (err) {
      console.error('Error loading category:', err);
      setError('Categoria nu a fost găsită');
    } finally {
      setLoading(false);
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
      } else if (priceRange.max > 0 && maxCategoryPrice === 0) {
        params.append('maxPrice', String(priceRange.max));
      }

      if (selectedBrands.length > 0) {
        params.append('brandIds', selectedBrands.join(','));
      }

      if (sortOrder) {
        params.append('sortBy', 'price');
        params.append('sortOrder', sortOrder);
      }

      const res = await axios.get(`${API}/products/list/paginated?${params.toString()}`);

      let items = res.data.items || [];

      if (sortOrder === 'asc') {
        items = [...items].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      }

      if (sortOrder === 'desc') {
        items = [...items].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
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

  const visibleBrands = availableBrandIds.length
    ? brands.filter((b) => availableBrandIds.includes(b.id))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('categoryPage.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">
            {error || t('categoryPage.notFound')}
          </p>
          <Link
            to="/"
            className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition font-semibold inline-block"
          >
            {t('categoryPage.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  const categoryName =
    language === 'ru' && category.nameRu ? category.nameRu : category.name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">
              {t('categoryPage.breadcrumb.home')}
            </Link>

            <ChevronRight className="w-4 h-4" />

            <div className="flex items-center gap-2">
              {category.image && (
                <img
                  src={category.image}
                  alt={categoryName}
                  className="w-6 h-6 rounded object-cover"
                />
              )}
              <span className="text-gray-900 font-semibold">
                {categoryName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="w-full px-6 py-8">
          <div className="flex items-center gap-4">
            {category.image && (
              <div className="w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center overflow-hidden">
                <img
                  src={category.image}
                  alt={categoryName}
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
            )}

            <div>
              <h1 className="text-3xl md:text-5xl font-bold">
                {categoryName}
              </h1>
              <p className="text-teal-100 mt-2">
                {totalProducts} {t('categoryPage.productsAvailable')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories grid (shown when category has children) */}
      {subcategories.length > 0 ? (
        <div className="w-full px-6 py-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
            {language === 'ru' ? 'Подкатегории' : 'Subcategorii'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {subcategories.map((sub) => {
              const subName = language === 'ru' && sub.nameRu ? sub.nameRu : sub.name;
              const linkPrefix = language === 'ru' ? '/ru' : '';
              return (
                <Link
                  key={sub.id}
                  to={`${linkPrefix}/category/${sub.slug || sub.id}`}
                  data-testid={`subcategory-card-${sub.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center text-center transition hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5"
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
      /* Main Content */
      <div className="w-full px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filter - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-teal-600" />
                  {t('categoryPage.filters')}
                </h3>

                <button
                  onClick={resetFilters}
                  className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
                >
                  {t('categoryPage.reset')}
                </button>
              </div>

              {/* Sort Filter */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="font-bold text-gray-900 mb-4">Sortare</h4>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSortDropdownOpen((prev) => !prev)}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
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
                    <div className="absolute z-30 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
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
                              ? 'bg-teal-600 text-white'
                              : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="font-bold text-gray-900 mb-4">
                  {t('categoryPage.price')}
                </h4>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={t('categoryPage.min')}
                      value={tempPriceRange.min}
                      onChange={(e) =>
                        setTempPriceRange({
                          ...tempPriceRange,
                          min: Number(e.target.value)
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />

                    <input
                      type="number"
                      placeholder={t('categoryPage.max')}
                      value={tempPriceRange.max}
                      onChange={(e) =>
                        setTempPriceRange({
                          ...tempPriceRange,
                          max: Number(e.target.value)
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    onClick={handlePriceRangeApply}
                    className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition font-semibold"
                  >
                    {t('categoryPage.apply')}
                  </button>
                </div>
              </div>

              {/* Brand Filter */}
              {visibleBrands.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">
                    {t('categoryPage.brand')}
                  </h4>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {visibleBrands.map((brand) => (
                      <label
                        key={brand.id}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.id)}
                          onChange={() => handleBrandToggle(brand.id)}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />

                        <div className="flex items-center gap-2 flex-1">
                          {brand.logo && (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-6 h-6 object-contain"
                            />
                          )}

                          <span className="text-gray-700 group-hover:text-teal-600 transition">
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

          {/* Mobile Filter Button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden fixed bottom-6 left-6 bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition z-40"
          >
            <SlidersHorizontal className="w-6 h-6" />
          </button>

          {/* Mobile Filter Drawer */}
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

                  {/* Sort Mobile */}
                  <div className="mb-6 pb-6 border-b">
                    <h4 className="font-bold text-gray-900 mb-4">
                      Sortare
                    </h4>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMobileSortDropdownOpen((prev) => !prev)}
                        className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
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
                        <div className="mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
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
                                  ? 'bg-teal-600 text-white'
                                  : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Mobile */}
                  <div className="mb-6 pb-6 border-b">
                    <h4 className="font-bold text-gray-900 mb-4">
                      Preț (MDL)
                    </h4>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={tempPriceRange.min}
                          onChange={(e) =>
                            setTempPriceRange({
                              ...tempPriceRange,
                              min: Number(e.target.value)
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />

                        <input
                          type="number"
                          placeholder="Max"
                          value={tempPriceRange.max}
                          onChange={(e) =>
                            setTempPriceRange({
                              ...tempPriceRange,
                              max: Number(e.target.value)
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <button
                        onClick={() => {
                          handlePriceRangeApply();
                          setFilterOpen(false);
                        }}
                        className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition font-semibold"
                      >
                        Aplică
                      </button>
                    </div>
                  </div>

                  {visibleBrands.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4">
                        Brand
                      </h4>

                      <div className="space-y-2">
                        {visibleBrands.map((brand) => (
                          <label
                            key={brand.id}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand.id)}
                              onChange={() => handleBrandToggle(brand.id)}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />

                            <div className="flex items-center gap-2">
                              {brand.logo && (
                                <img
                                  src={brand.logo}
                                  alt={brand.name}
                                  className="w-6 h-6 object-contain"
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
                    className="w-full mt-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    {t('categoryPage.resetFilters')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <p className="text-xl text-gray-600">
                  {t('categoryPage.empty')}
                </p>

                <button
                  onClick={resetFilters}
                  className="mt-4 text-teal-600 hover:text-teal-700 font-semibold"
                >
                  {t('categoryPage.resetFilters')}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {(() => {
                  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

                  if (totalPages <= 1) return null;

                  const PAGE_GROUP_SIZE = 5;
                  const currentGroup = Math.floor((currentPage - 1) / PAGE_GROUP_SIZE);
                  const groupStart = currentGroup * PAGE_GROUP_SIZE + 1;
                  const groupEnd = Math.min(groupStart + PAGE_GROUP_SIZE - 1, totalPages);

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
                        </span>
                        {' '}
                        {t('categoryPage.from') || 'din'}{' '}
                        <span className="font-semibold">{totalProducts}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => goTo(Math.max(1, groupStart - PAGE_GROUP_SIZE))}
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
                                  ? 'bg-teal-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => goTo(Math.min(totalPages, groupEnd + 1))}
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
    </div>
  );
};

export default CategoryPage;