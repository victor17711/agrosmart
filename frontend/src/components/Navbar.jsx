import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Globe,
  ChevronDown,
  ChevronRight,
  X,
  Heart
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthModal from './AuthModal';
import axios from 'axios';
import logo from '../assets/images/logo.png';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Navbar = () => {
  const navigate = useNavigate();

  const cartContext = useCart();
  const { cartCount } = cartContext;

  const cartItems =
    cartContext.cartItems ||
    cartContext.cart ||
    cartContext.items ||
    [];

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);
    return sum + price * quantity;
  }, 0);

  const { user, isAuthenticated, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categoryMenuItems, setCategoryMenuItems] = useState([]);
  const [expandedMobileCategoryId, setExpandedMobileCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const headerRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const cartPreviewRef = useRef(null);
  const closeCategoriesTimerRef = useRef(null);
  const [dropdownTop, setDropdownTop] = useState(0);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setExpandedMobileCategoryId(null);
  };

  const getName = (item) => {
    return language === 'ru' && item.nameRu ? item.nameRu : item.name;
  };

  const getProductName = (product) => {
    return language === 'ru' && product.nameRu ? product.nameRu : product.name;
  };

  const getProductImage = (product) => {
    return product.image || product.images?.[0] || '';
  };

  const updateDropdownPosition = () => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownTop(rect.bottom);
    }
  };

  const openCategoriesDropdown = () => {
    if (closeCategoriesTimerRef.current) {
      clearTimeout(closeCategoriesTimerRef.current);
      closeCategoriesTimerRef.current = null;
    }

    updateDropdownPosition();
    setIsCategoriesOpen(true);

    if (categoryMenuItems.length > 0 && !hoveredCategoryId) {
      setHoveredCategoryId(categoryMenuItems[0].id);
    }
  };

  const closeCategoriesDropdownDelayed = () => {
    if (closeCategoriesTimerRef.current) {
      clearTimeout(closeCategoriesTimerRef.current);
    }

    closeCategoriesTimerRef.current = setTimeout(() => {
      setIsCategoriesOpen(false);
      setHoveredCategoryId(null);
    }, 160);
  };

  useEffect(() => {
    fetchMenus();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }

      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setIsLanguageDropdownOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }

      if (
        cartPreviewRef.current &&
        !cartPreviewRef.current.contains(event.target)
      ) {
        setIsCartPreviewOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);

      if (closeCategoriesTimerRef.current) {
        clearTimeout(closeCategoriesTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isCategoriesOpen && categoryMenuItems.length > 0 && !hoveredCategoryId) {
      setHoveredCategoryId(categoryMenuItems[0].id);
    }
  }, [isCategoriesOpen, categoryMenuItems, hoveredCategoryId]);

  useEffect(() => {
    if (!isCategoriesOpen) return;

    const handlePositionUpdate = () => updateDropdownPosition();

    window.addEventListener('scroll', handlePositionUpdate, true);
    window.addEventListener('resize', handlePositionUpdate);

    return () => {
      window.removeEventListener('scroll', handlePositionUpdate, true);
      window.removeEventListener('resize', handlePositionUpdate);
    };
  }, [isCategoriesOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleOpenAuthModal = () => {
      setAuthMode('login');
      setAuthModalOpen(true);
      setIsMenuOpen(false);
    };

    window.addEventListener('open-auth-modal', handleOpenAuthModal);

    return () => {
      window.removeEventListener('open-auth-modal', handleOpenAuthModal);
    };
  }, []);

  useEffect(() => {
    const handleOpenMobileMenu = () => {
      setIsMenuOpen(true);
    };

    window.addEventListener("open-mobile-menu", handleOpenMobileMenu);

    return () => {
      window.removeEventListener("open-mobile-menu", handleOpenMobileMenu);
    };
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchMenus = async () => {
    try {
      const [settingsRes, catsRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/categories`).catch(() => ({ data: [] }))
      ]);

      setMenuItems(settingsRes.data.menuItems || []);

      const rawMenu = settingsRes.data.categoryMenuItems || [];
      const cats = catsRes.data || [];

      const childrenByParent = {};

      cats.forEach((c) => {
        const pid = c.parentId || '__ROOT__';

        if (!childrenByParent[pid]) childrenByParent[pid] = [];

        childrenByParent[pid].push(c);
      });

      const buildCategoryTree = (catId, depth = 0) => {
        if (depth > 5) return [];

        const kids = childrenByParent[catId] || [];

        return kids.map((c) => ({
          id: `auto-${c.id}`,
          name: c.name,
          nameRu: c.nameRu,
          icon: c.icon,
          image: c.image,
          url: `/category/${c.slug || c.id}`,
          categoryId: c.id,
          children: buildCategoryTree(c.id, depth + 1)
        }));
      };

      const enrich = (item) => {
        const manualChildren = (item.children || []).map(enrich);

        let autoChildren = [];

        if (item.categoryId) {
          autoChildren = buildCategoryTree(item.categoryId);
        }

        const usedCatIds = new Set(
          manualChildren.map((c) => c.categoryId).filter(Boolean)
        );

        const merged = [
          ...manualChildren,
          ...autoChildren.filter((c) => !usedCatIds.has(c.categoryId))
        ];

        return { ...item, children: merged };
      };

      setCategoryMenuItems(rawMenu.map(enrich));
    } catch (error) {
      console.error('Error fetching menus:', error);

      setMenuItems([{ id: '1', name: 'Acasă', url: '/', type: 'link' }]);
    }
  };

  const fetchSearchResults = async () => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    try {
      setSearchLoading(true);

      const res = await axios.get(`${API}/products`, {
        params: {
          search: searchQuery.trim(),
          limit: 6
        }
      });

      const data = res.data.products || res.data.items || res.data || [];

      setSearchResults(Array.isArray(data) ? data : []);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchDropdown(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchDropdown(false);
      closeMobileMenu();
    }
  };

  const handleProductClick = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  return (
    <>
      <style>{`
        @keyframes navbarOverlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes navbarDropdownFadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .navbar-overlay-fade {
          animation: navbarOverlayFadeIn 0.18s ease-out forwards;
        }

        .navbar-dropdown-fade-up {
          animation: navbarDropdownFadeUp 0.22s ease-out forwards;
        }
      `}</style>

      <div className="hidden lg:flex h-[42px] bg-[#a7cf26] text-white items-center justify-center">
        <span className="text-[20px] font-bold tracking-wide uppercase">
          {language === 'ru' ? 'ОПЛАТА В 3 РАТЫ 0%' : 'ACHITĂ ÎN 3 RATE 0%'}
        </span>
      </div>

      <div ref={headerRef} className="bg-white border-b sticky top-0 z-40">
        <div className="lg:hidden bg-white">
          <div className="h-[76px] px-2 grid grid-cols-[38px_1fr_38px] items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex h-[38px] w-[38px] items-center justify-center bg-transparent p-0"
              aria-label="Deschide meniul"
            >
              <Menu className="h-7 w-7 text-[#2f2f2f]" strokeWidth={2.2} />
            </button>

            <Link
              to="/"
              className="flex items-center justify-center"
              data-testid="navbar-logo-mobile"
            >
              <img
                src={logo}
                alt="AgroSmart"
                className="h-[50px] w-auto max-w-[205px] object-contain"
              />
            </Link>

            {isAuthenticated ? (
              <Link
                to="/contul-meu"
                className="flex h-[38px] w-[38px] items-center justify-center bg-transparent p-0"
                aria-label="Contul meu"
              >
                <User className="h-6 w-6 text-[#2f2f2f]" strokeWidth={2} />
              </Link>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex h-[38px] w-[38px] items-center justify-center bg-transparent p-0"
                aria-label="Login"
              >
                <User className="h-7 w-7 text-[#2f2f2f]" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:block bg-[#f4f4f4]">
          <div className="w-full px-4 py-[18px]">
            <div className="flex items-center gap-[18px] w-full">
              <Link to="/" className="flex-shrink-0" data-testid="navbar-logo-desktop">
                <img
                  src={logo}
                  alt="AgroSmart"
                  className="h-14 w-auto object-contain"
                />
              </Link>

              <div
                className="relative flex-shrink-0"
                ref={dropdownRef}
                onMouseEnter={openCategoriesDropdown}
                onMouseLeave={closeCategoriesDropdownDelayed}
              >
                <button
                  type="button"
                  className="h-[48px] px-[18px] bg-[#222222] text-white rounded-full flex items-center gap-2 hover:bg-black transition font-semibold text-[15px]"
                >
                  <div className="grid grid-cols-2 gap-[2px] w-[17px] h-[17px]">
                    <div className="border border-2 border-white rounded-[2px]" />
                    <div className="border border-2 border-white rounded-[2px]" />
                    <div className="border border-2 border-white rounded-[2px]" />
                    <div className="border border-2 border-white rounded-[2px]" />
                  </div>

                  <span>{t('navbar.allCategories')}</span>

                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isCategoriesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isCategoriesOpen && categoryMenuItems.length > 0 && (
                  <>
                    <div
                      className="fixed left-0 right-0 bottom-0 bg-black/55 z-[900] navbar-overlay-fade pointer-events-none"
                      style={{ top: `${dropdownTop}px` }}
                    />

                    <div
                      onMouseEnter={openCategoriesDropdown}
                      onMouseLeave={closeCategoriesDropdownDelayed}
                      className="fixed left-[18px] right-[18px] bg-white rounded-[26px] shadow-2xl overflow-hidden z-[999] border border-gray-100 navbar-dropdown-fade-up"
                      style={{ top: `${dropdownTop}px` }}
                    >
                      <div className="grid grid-cols-[330px_1fr] min-h-[520px] max-h-[650px]">
                        <div className="bg-[#a7cf26] py-4 overflow-y-auto">
                          {categoryMenuItems.map((item) => {
                            const itemName = getName(item);
                            const isActive = hoveredCategoryId === item.id;

                            return (
                              <div
                                key={item.id}
                                onMouseEnter={() => setHoveredCategoryId(item.id)}
                                className={`flex items-center justify-between gap-3 px-7 py-[17px] cursor-pointer transition-colors ${
                                  isActive
                                    ? 'bg-white text-gray-900'
                                    : 'bg-[#a7cf26] text-white hover:bg-[#96bd22]'
                                }`}
                              >
                                <Link
                                  to={item.url}
                                  onClick={() => {
                                    setIsCategoriesOpen(false);
                                    setHoveredCategoryId(null);
                                  }}
                                  className="flex items-center gap-4 flex-1 min-w-0"
                                >
                                  {item.icon && (
                                    <div className="w-6 h-6 min-w-[24px] flex items-center justify-center overflow-hidden flex-shrink-0">
                                      {typeof item.icon === 'string' &&
                                      item.icon.startsWith('data:image') ? (
                                        <img
                                          src={item.icon}
                                          alt={itemName}
                                          className={`w-full h-full object-contain ${
                                            isActive ? '' : 'invert brightness-0'
                                          }`}
                                        />
                                      ) : (
                                        <span className="text-lg">{item.icon}</span>
                                      )}
                                    </div>
                                  )}

                                  <span className="font-bold text-[17px] leading-tight truncate">
                                    {itemName}
                                  </span>
                                </Link>

                                <ChevronRight
                                  className={`w-5 h-5 flex-shrink-0 ${
                                    isActive ? 'text-gray-700' : 'text-white'
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div className="bg-white px-8 py-8 overflow-y-auto">
                          {categoryMenuItems.map((item) => {
                            if (hoveredCategoryId !== item.id) return null;

                            const children = item.children || [];

                            if (children.length === 0) {
                              return (
                                <div
                                  key={item.id}
                                  className="h-full flex items-center justify-center text-gray-400 text-lg"
                                >
                                  Nu există subcategorii
                                </div>
                              );
                            }

                            return (
                              <div key={item.id} className="grid grid-cols-4 gap-x-14 gap-y-10">
                                {children.map((child) => {
                                  const childName = getName(child);
                                  const subChildren = child.children || [];

                                  return (
                                    <div key={child.id} className="min-w-0">
                                      <Link
                                        to={child.url}
                                        onClick={() => {
                                          setIsCategoriesOpen(false);
                                          setHoveredCategoryId(null);
                                        }}
                                        className="block text-[21px] font-bold text-[#a7cf26] leading-tight mb-5 hover:text-[#8faf20]"
                                      >
                                        {childName}
                                      </Link>

                                      {subChildren.length > 0 ? (
                                        <div className="space-y-[16px]">
                                          {subChildren.map((subChild) => {
                                            const subChildName = getName(subChild);

                                            return (
                                              <Link
                                                key={subChild.id}
                                                to={subChild.url}
                                                onClick={() => {
                                                  setIsCategoriesOpen(false);
                                                  setHoveredCategoryId(null);
                                                }}
                                                className="block text-[18px] font-semibold text-gray-800 hover:text-[#a7cf26] leading-snug"
                                              >
                                                {subChildName}
                                              </Link>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <Link
                                          to={child.url}
                                          onClick={() => {
                                            setIsCategoriesOpen(false);
                                            setHoveredCategoryId(null);
                                          }}
                                          className="block text-[18px] font-semibold text-gray-800 hover:text-[#a7cf26] leading-snug"
                                        >
                                          Vezi categoria
                                        </Link>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 relative min-w-[260px]" ref={searchRef}>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => {
                      if (searchQuery.trim().length >= 2) {
                        setShowSearchDropdown(true);
                      }
                    }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('navbar.search')}
                    className="w-full h-[50px] bg-white border border-gray-200 rounded-full pl-[22px] pr-[62px] text-[15px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#a7cf26] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]"
                  />

                  <button
                    type="submit"
                    className="absolute right-[4px] top-1/2 -translate-y-1/2 w-[42px] h-[42px] rounded-full bg-[#a7cf26] flex items-center justify-center hover:bg-[#95bd22] transition"
                  >
                    <Search className="w-6 h-6 text-white" strokeWidth={2.2} />
                  </button>
                </form>

                {showSearchDropdown && searchQuery.trim().length >= 2 && (
                  <div className="absolute left-0 right-0 top-full mt-3 w-full bg-white rounded-[24px] border border-gray-100 z-[999] p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-[16px] font-extrabold text-gray-900">
                          {language === 'ru' ? 'Результаты поиска' : 'Rezultate căutare'}
                        </h3>

                        <p className="text-[12px] text-gray-500">
                          {language === 'ru' ? 'по запросу' : 'pentru'} “{searchQuery}”
                        </p>
                      </div>

                      {searchResults.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSearch}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#a7cf26]/10 px-4 py-2 text-[12px] font-extrabold text-[#7fa20f] hover:bg-[#a7cf26] hover:text-white transition"
                        >
                          {language === 'ru' ? 'Все результаты' : 'Toate'}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {searchLoading ? (
                      <div className="py-7 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[#a7cf26]" />
                        <p className="mt-3 text-sm text-gray-500">
                          {language === 'ru' ? 'Загрузка...' : 'Se încarcă...'}
                        </p>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-8 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
                          <Search className="h-6 w-6 text-gray-300" />
                        </div>

                        <p className="text-sm font-bold text-gray-900">
                          {language === 'ru'
                            ? 'Товары не найдены'
                            : 'Nu au fost găsite produse'}
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[390px] overflow-y-auto pr-1">
                        <div className="grid grid-cols-1 gap-2">
                          {searchResults.map((product) => {
                            const productName =
                              language === 'ru' && product.nameRu
                                ? product.nameRu
                                : product.name;

                            return (
                              <Link
                                key={product.id}
                                to={`/product/${product.id}`}
                                onClick={handleProductClick}
                                className="flex items-center gap-3 rounded-[18px] border border-gray-100 bg-white p-2.5 hover:border-[#a7cf26]/70 hover:bg-[#a7cf26]/5 transition"
                              >
                                <div className="flex h-[64px] w-[64px] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
                                  <img
                                    src={product.image || product.images?.[0]}
                                    alt={productName}
                                    className="max-h-[54px] max-w-[54px] object-contain"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h4 className="line-clamp-2 text-[14px] font-bold leading-tight text-gray-900">
                                    {productName}
                                  </h4>

                                  <div className="mt-1.5 flex items-center gap-2">
                                    <span className="text-[15px] font-extrabold text-red-600">
                                      {product.price} lei
                                    </span>

                                    {product.originalPrice &&
                                      Number(product.originalPrice) > Number(product.price) && (
                                        <span className="text-[12px] font-semibold text-gray-400 line-through">
                                          {product.originalPrice} lei
                                        </span>
                                      )}
                                  </div>
                                </div>

                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-50">
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link
                to={language === 'ru' ? '/ru/contact' : '/contact'}
                className="h-[48px] px-[23px] rounded-full border-[2px] border-[#a7cf26] text-[#a7cf26] bg-transparent flex items-center justify-center font-semibold text-[15px] hover:bg-[#a7cf26] hover:text-white transition flex-shrink-0"
              >
                {language === 'ru' ? 'Контакты' : 'Contact'}
              </Link>

              <div className="relative flex-shrink-0" ref={languageDropdownRef}>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center transition hover:bg-gray-50"
                >
                  <Globe className="w-5 h-5 text-[#1f1f1f]" strokeWidth={2} />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="absolute top-[58px] right-0 bg-white rounded-[18px] shadow-2xl border border-gray-100 overflow-hidden min-w-[90px] z-[999]">
                    <button
                      onClick={() => {
                        changeLanguage('ro');
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-[14px] font-semibold transition ${
                        language === 'ro'
                          ? 'bg-[#a7cf26] text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      RO
                    </button>

                    <button
                      onClick={() => {
                        changeLanguage('ru');
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-[14px] font-semibold transition ${
                        language === 'ru'
                          ? 'bg-[#a7cf26] text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      RU
                    </button>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <Link
                  to="/contul-meu"
                  className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center transition flex-shrink-0"
                  aria-label="Contul meu"
                >
                  <User className="w-6 h-6 text-[#1f1f1f]" strokeWidth={2} />
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center flex-shrink-0"
                  aria-label="Login"
                >
                  <User className="w-6 h-6 text-[#1f1f1f]" strokeWidth={2} />
                </button>
              )}

              <Link
                to="/contul-meu"
                className="relative w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center transition flex-shrink-0"
                aria-label="Favorite"
              >
                <Heart className="w-6 h-6 text-[#1f1f1f]" strokeWidth={2} />
                <span className="absolute -top-[2px] -right-[2px] w-[20px] h-[20px] rounded-full bg-white text-[#a7cf26] text-[12px] leading-none font-medium flex items-center justify-center">
                  0
                </span>
              </Link>

              <div className="relative flex-shrink-0" ref={cartPreviewRef}>
                <button
                  type="button"
                  onClick={() => setIsCartPreviewOpen((prev) => !prev)}
                  className="relative w-[48px] h-[48px] rounded-full bg-[#222222] flex items-center justify-center hover:bg-black transition"
                  aria-label="Coș"
                >
                  <ShoppingCart className="w-6 h-6 text-white" strokeWidth={2} />
                  <span className="absolute -top-[2px] -right-[2px] w-[20px] h-[20px] rounded-full bg-white text-[#a7cf26] text-[12px] leading-none font-medium flex items-center justify-center">
                    {cartCount}
                  </span>
                </button>

                {isCartPreviewOpen && (
                  <div className="absolute right-0 top-[60px] w-[390px] bg-white rounded-[24px] shadow-2xl border border-gray-100 z-[1000] overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-[18px] font-extrabold text-gray-900">
                        {language === 'ru' ? 'Корзина' : 'Coșul tău'}
                      </h3>

                      <button
                        type="button"
                        onClick={() => setIsCartPreviewOpen(false)}
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                      >
                        <X className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#a7cf26]/10 flex items-center justify-center mb-4">
                          <ShoppingCart className="w-8 h-8 text-[#a7cf26]" />
                        </div>

                        <h4 className="text-[18px] font-extrabold text-gray-900 mb-2">
                          {language === 'ru' ? 'Корзина пуста' : 'Coșul este gol'}
                        </h4>

                        <p className="text-[14px] text-gray-500 leading-relaxed">
                          {language === 'ru'
                            ? 'Добавьте товары в корзину, чтобы оформить заказ.'
                            : 'Adaugă produse în coș pentru a finaliza comanda.'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-[360px] overflow-y-auto p-4 space-y-3">
                          {cartItems.map((item) => {
                            const itemName = getProductName(item);
                            const quantity = Number(item.quantity || 1);
                            const price = Number(item.price || 0);

                            return (
                              <Link
                                key={item.id}
                                to={`/product/${item.id}`}
                                onClick={() => setIsCartPreviewOpen(false)}
                                className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 hover:border-[#a7cf26] hover:bg-lime-50/40 transition"
                              >
                                <div className="w-[70px] h-[70px] rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                                  {getProductImage(item) ? (
                                    <img
                                      src={getProductImage(item)}
                                      alt={itemName}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <ShoppingCart className="w-7 h-7 text-gray-300" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[14px] font-bold text-gray-900 leading-tight line-clamp-2">
                                    {itemName}
                                  </h4>

                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="text-[13px] font-semibold text-gray-500">
                                      {quantity} x {price} MDL
                                    </span>

                                    <span className="text-[14px] font-extrabold text-[#a7cf26]">
                                      {quantity * price} MDL
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        <div className="border-t border-gray-100 px-5 py-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[15px] font-bold text-gray-600">
                              {language === 'ru' ? 'Итого:' : 'Total:'}
                            </span>

                            <span className="text-[20px] font-extrabold text-gray-900">
                              {cartTotal} MDL
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="px-5 pb-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCartPreviewOpen(false);
                          navigate('/cart');
                        }}
                        className="h-[46px] rounded-2xl border-2 border-[#a7cf26] text-[#a7cf26] font-extrabold hover:bg-[#a7cf26]/10 transition"
                      >
                        {language === 'ru' ? 'В корзину' : 'Mergi la coș'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsCartPreviewOpen(false);
                          navigate(language === 'ru' ? '/ru/checkout' : '/checkout');
                        }}
                        className="h-[46px] rounded-2xl bg-[#a7cf26] text-white font-extrabold hover:bg-[#96bc21] transition"
                      >
                        {language === 'ru' ? 'Оформить' : 'Finalizare'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        onClick={closeMobileMenu}
        className={`fixed inset-0 bg-black/55 z-[90] lg:hidden transition-all duration-300 ${
          isMenuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none'
        }`}
      />

      <div
        className={`fixed top-0 left-0 h-full w-[75%] max-w-[370px] bg-white z-[100] lg:hidden shadow-[18px_0_60px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col bg-white">
          <div className="h-[62px] px-4 flex items-center justify-end border-b border-gray-200 bg-white">
            <button
              onClick={closeMobileMenu}
              className="flex items-center gap-1.5 text-[#2f2f2f] text-[16px] font-semibold"
            >
              <X className="w-5 h-5" strokeWidth={2} />
              <span>Închide</span>
            </button>
          </div>

          <div className="px-4 py-3 border-b border-gray-200 bg-white">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută produse"
                className="w-full h-[46px] rounded-none border-0 bg-white pl-0 pr-10 text-[16px] font-semibold text-gray-800 placeholder:text-gray-500 outline-none"
              />

              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center"
              >
                <Search className="w-6 h-6 text-gray-500" strokeWidth={2} />
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            <div className="divide-y divide-gray-200 border-b border-gray-200">
              {categoryMenuItems.map((item) => {
                const itemDisplayName = getName(item);
                const children = item.children || [];
                const isExpanded = expandedMobileCategoryId === item.id;

                return (
                  <div key={item.id} className="bg-white">
                    <button
                      type="button"
                      onClick={() => {
                        if (children.length > 0) {
                          setExpandedMobileCategoryId(isExpanded ? null : item.id);
                        } else {
                          navigate(item.url);
                          closeMobileMenu();
                        }
                      }}
                      className="w-full min-h-[48px] px-4 grid grid-cols-[1fr_42px] items-center text-left bg-white"
                    >
                      <span className="text-[14px] leading-tight font-bold uppercase tracking-[-0.01em] text-[#333333]">
                        {itemDisplayName}
                      </span>

                      <span className="h-full min-h-[48px] border-l border-gray-200 flex items-center justify-center">
                        <ChevronRight
                          className={`w-5 h-5 text-[#111] transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                          strokeWidth={1.8}
                        />
                      </span>
                    </button>

                    {isExpanded && children.length > 0 && (
                      <div className="bg-white border-t border-gray-200">
                        {children.map((child) => {
                          const childDisplayName = getName(child);

                          return (
                            <Link
                              key={child.id}
                              to={child.url}
                              onClick={closeMobileMenu}
                              className="min-h-[46px] px-6 grid grid-cols-[1fr_42px] items-center border-b border-gray-200 bg-[#fafafa]"
                            >
                              <span className="text-[13px] leading-tight font-bold uppercase tracking-[-0.01em] text-gray-700">
                                {childDisplayName}
                              </span>

                              <span className="h-full min-h-[48px] border-l border-gray-200 flex items-center justify-center">
                                <ChevronRight
                                  className="w-4.2 h-4.2 text-gray-500"
                                  strokeWidth={1.8}
                                />
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-2.5 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500">
                <Globe className="w-3.5 h-3.5" />
                <span>Limbă</span>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
                <button
                  onClick={() => changeLanguage('ro')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                    language === 'ro'
                      ? 'bg-[#a7cf26] text-white'
                      : 'text-gray-600'
                  }`}
                >
                  RO
                </button>

                <button
                  onClick={() => changeLanguage('ru')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                    language === 'ru'
                      ? 'bg-[#a7cf26] text-white'
                      : 'text-gray-600'
                  }`}
                >
                  RU
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        setMode={setAuthMode}
      />
    </>
  );
};

export default Navbar;