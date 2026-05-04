import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FreshFindsSection = () => {
  const { language } = useLanguage();
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [tabProducts, setTabProducts] = useState([]);
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
          axios.get(`${API}/categories`)
        ]);

        const categories = categoriesRes.data || [];
        const configured = (settingsRes.data?.freshFindsTabs || [])
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const resolved = configured
          .map((cfg) => {
            const cat = categories.find((c) => c.id === cfg.categoryId);
            if (!cat) return null;
            return {
              id: cat.id,
              categoryName: cat.name,
              label: cfg.label || cat.name,
              labelRu: cfg.labelRu || cat.nameRu || cat.name
            };
          })
          .filter(Boolean);

        setTabs(resolved);
        if (resolved.length > 0) {
          setActiveTabId(resolved[0].id);
        }
      } catch (error) {
        console.error('Error fetching FreshFinds tabs:', error);
      }
    };
    fetchTabs();
  }, []);

  // Fetch products whenever active tab changes (server-side, by category)
  useEffect(() => {
    if (!activeTabId || tabs.length === 0) return;
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;

    let cancelled = false;
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${API}/products?category=${encodeURIComponent(activeTab.categoryName)}&limit=20`
        );
        if (!cancelled) setTabProducts(res.data || []);
      } catch (error) {
        console.error('Error fetching FreshFinds products:', error);
        if (!cancelled) setTabProducts([]);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [activeTabId, tabs]);

  const visibleProducts = isMobile ? tabProducts.slice(0, 8) : tabProducts.slice(0, 10);

  if (tabs.length === 0) return null;

  return (
    <section className="py-4" data-testid="fresh-finds-section">
      <div className="w-full px-6">
        <div className="mb-8 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 text-center md:text-left">
              {language === 'ru' ? 'Новые товары' : 'Produse noi'}
            </h2>

            <div className="flex md:justify-end gap-4 overflow-x-auto md:overflow-visible no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  data-testid={`fresh-finds-tab-${tab.id}`}
                  className={`flex-shrink-0 px-6 py-3 font-semibold border-b-2 whitespace-nowrap ${
                    activeTabId === tab.id
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {language === 'ru' ? tab.labelRu : tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {language === 'ru'
              ? 'В этой категории пока нет товаров'
              : 'Nu există produse în această categorie'}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FreshFindsSection;
