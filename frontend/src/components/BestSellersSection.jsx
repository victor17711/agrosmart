import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BestSellersSection = () => {
  const { language } = useLanguage();

  const isRu = language === 'ru';

  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [tabProducts, setTabProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const [settingsRes, categoriesRes] = await Promise.all([
          axios.get(`${API}/settings`),
          axios.get(`${API}/categories`),
        ]);

        const categories = categoriesRes.data || [];

        const configured = (settingsRes.data?.bestSellersTabs || [])
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const resolved = configured
          .map((cfg) => {
            const cat = categories.find((c) => c.id === cfg.categoryId);
            if (!cat) return null;

            return {
              id: cat.id,
              slug: cat.slug,
              categoryName: cat.name,
              categoryNameRu: cat.nameRu || cat.name,
              label: cfg.label || cat.name,
              labelRu: cfg.labelRu || cat.nameRu || cat.name,
            };
          })
          .filter(Boolean);

        setTabs(resolved);

        if (resolved.length > 0) {
          setActiveTabId(resolved[0].id);
        }
      } catch (error) {
        console.error('Error fetching BestSellers tabs:', error);
      }
    };

    fetchTabs();
  }, []);

  useEffect(() => {
    if (!activeTabId || tabs.length === 0) return;

    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;

    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setIsProductsLoading(true);

        const res = await axios.get(
          `${API}/products?category=${encodeURIComponent(activeTab.categoryName)}&limit=20`
        );

        if (!cancelled) {
          setTabProducts(res.data || []);
        }
      } catch (error) {
        console.error('Error fetching BestSellers products:', error);

        if (!cancelled) {
          setTabProducts([]);
        }
      } finally {
        if (!cancelled) {
          setTimeout(() => {
            setIsProductsLoading(false);
          }, 80);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [activeTabId, tabs]);

  const visibleProducts = isMobile
    ? tabProducts.slice(0, 8)
    : tabProducts.slice(0, 10);

  if (tabs.length === 0) return null;

  return (
    <section className="py-5" data-testid="best-sellers-section">
      <div className="w-full px-3 md:px-8 lg:px-4">
        <div className="mb-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-[28px] md:text-[35px] leading-tight font-extrabold text-[#282828] text-left">
              {isRu ? (
                <>
                  Самые продаваемые{' '}
                  <span className="text-[#b05a8d]">товары</span>
                </>
              ) : (
                <>
                  Cele mai vândute{' '}
                  <span className="bg-gradient-to-r from-[#c86a9d] to-[#8f57d8] bg-clip-text text-transparent">
                    Produse
                  </span>
                </>
              )}
            </h2>

            <div className="flex md:justify-end gap-3 overflow-x-auto md:overflow-visible no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  data-testid={`best-sellers-tab-${tab.id}`}
                  className={`flex-shrink-0 px-5 md:px-6 py-2.5 rounded-full text-[13px] md:text-[15px] font-semibold transition whitespace-nowrap ${
                    activeTabId === tab.id
                      ? 'bg-[#a6cf24] text-white'
                      : 'bg-[#f3f3f3] text-[#303030] hover:bg-[#a6cf24] hover:text-white'
                  }`}
                >
                  {isRu ? tab.labelRu : tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {visibleProducts.length === 0 && !isProductsLoading ? (
          <div className="text-center py-10 text-gray-500">
            {isRu
              ? 'В этой категории пока нет товаров'
              : 'Nu există produse în această categorie'}
          </div>
        ) : (
          <div
            key={activeTabId}
            className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-6 transition-all duration-500 ease-out ${
              isProductsLoading
                ? 'opacity-0 translate-y-4'
                : 'opacity-100 translate-y-0'
            }`}
          >
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellersSection;