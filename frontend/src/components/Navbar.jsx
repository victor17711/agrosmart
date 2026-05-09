import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Globe,
  ChevronDown,
  Phone,
  Headphones,
  ChevronRight,
  X,
  Heart
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthModal from './AuthModal';
import axios from 'axios';
import { Leaf } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import logo from '../assets/images/logo.png';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categoryMenuItems, setCategoryMenuItems] = useState([]);
  const [mobileMenuTab, setMobileMenuTab] = useState('menu');
  const [searchQuery, setSearchQuery] = useState('');

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const headerRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const closeCategoriesTimerRef = useRef(null);
  const [dropdownTop, setDropdownTop] = useState(0);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setMobileMenuTab('menu');
  };

  const getName = (item) => {
    return language === 'ru' && item.nameRu ? item.nameRu : item.name;
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

      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
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
        axios.get(`${API}/categories`).catch(() => ({ data: [] })),
      ]);

      setMenuItems(settingsRes.data.menuItems || []);

      const rawMenu = settingsRes.data.categoryMenuItems || [];
      const cats = catsRes.data || [];

      // Index categories by id and parent
      const catById = {};
      const childrenByParent = {};
      cats.forEach((c) => {
        catById[c.id] = c;
        const pid = c.parentId || '__ROOT__';
        if (!childrenByParent[pid]) childrenByParent[pid] = [];
        childrenByParent[pid].push(c);
      });

      // Build a fully nested tree from a category id (recursive)
      const buildCategoryTree = (catId, depth = 0) => {
        if (depth > 5) return []; // safety
        const kids = childrenByParent[catId] || [];
        return kids.map((c) => ({
          id: `auto-${c.id}`,
          name: c.name,
          nameRu: c.nameRu,
          icon: c.icon,
          image: c.image,
          url: `/category/${c.slug || c.id}`,
          categoryId: c.id,
          children: buildCategoryTree(c.id, depth + 1),
        }));
      };

      // Enrich the manually-configured menu with auto-generated subtrees from real categories
      const enrich = (item) => {
        const manualChildren = (item.children || []).map(enrich);
        // If this item is linked to a category, append the auto subtree (children/grandchildren by parentId).
        let autoChildren = [];
        if (item.categoryId) {
          autoChildren = buildCategoryTree(item.categoryId);
        }
        // De-duplicate by categoryId — manual entries take precedence
        const usedCatIds = new Set(manualChildren.map((c) => c.categoryId).filter(Boolean));
        const merged = [
          ...manualChildren,
          ...autoChildren.filter((c) => !usedCatIds.has(c.categoryId)),
        ];
        return { ...item, children: merged };
      };

      setCategoryMenuItems(rawMenu.map(enrich));
    } catch (error) {
      console.error('Error fetching menus:', error);
      setMenuItems([
        { id: '1', name: 'Acasă', url: '/', type: 'link' }
      ]);
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
      setIsMenuOpen(false);
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

      {/* Top Bar Desktop */}
      <div className="hidden lg:flex h-[42px] bg-[#a7cf26] text-white items-center justify-center">
        <span className="text-[20px] font-bold tracking-wide uppercase">
          {language === 'ru' ? 'ОПЛАТА В 3 РАТЫ 0%' : 'ACHITĂ ÎN 3 RATE 0%'}
        </span>
      </div>

      {/* Main Header */}
      <div ref={headerRef} className="bg-white border-b sticky top-0 z-40">
        <div className="w-full px-4 md:px-6 py-4 md:py-4 lg:hidden">
          <div className="lg:hidden">
            <div className="grid grid-cols-[auto_1fr_auto] items-center">
              <div className="flex justify-start">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="w-[52px] h-[52px] md:w-[72px] md:h-[72px] rounded-full border-2 border-gray-200 flex items-center justify-center bg-white"
                >
                  <Menu className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <div className="flex justify-center">
                <Link to="/" className="flex items-center justify-center gap-2" data-testid="navbar-logo-mobile">
                  <Leaf className="w-7 h-7 text-brand-600" />
                  <img
                    src={logo}
                    alt="AgroSmart"
                    className="h-14 w-auto object-contain"
                  />
                </Link>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/cart"
                  className="w-[52px] h-[52px] md:w-[72px] md:h-[72px] bg-yellow-400 rounded-full flex items-center justify-center relative"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-900" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
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

                  <span>Categorii</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
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
                                      {typeof item.icon === 'string' && item.icon.startsWith('data:image') ? (
                                        <img
                                          src={item.icon}
                                          alt={itemName}
                                          className={`w-full h-full object-contain ${isActive ? '' : 'invert brightness-0'}`}
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

                                <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-gray-700' : 'text-white'}`} />
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
                                <div key={item.id} className="h-full flex items-center justify-center text-gray-400 text-lg">
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
                    placeholder="Caută produse"
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
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[760px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-5">
                      {language === 'ru' ? 'Товары' : 'Produse'}
                    </h3>

                    {searchLoading ? (
                      <div className="py-8 text-center text-gray-500">
                        {language === 'ru' ? 'Загрузка...' : 'Se încarcă...'}
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        {language === 'ru' ? 'Товары не найдены' : 'Nu au fost găsite produse'}
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                        {searchResults.map((product) => {
                          const productName =
                            language === 'ru' && product.nameRu ? product.nameRu : product.name;

                          return (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}`}
                              onClick={handleProductClick}
                              className="flex items-center gap-5 p-4 border border-gray-200 rounded-xl hover:border-[#a7cf26] hover:bg-lime-50/50 transition"
                            >
                              <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img
                                  src={product.image || product.images?.[0]}
                                  alt={productName}
                                  className="w-full h-full object-contain"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-gray-900 line-clamp-2">
                                  {productName}
                                </h4>

                                <div className="mt-2 flex items-center gap-4">
                                  <span className="text-xl font-bold text-red-600">
                                    {product.price} lei
                                  </span>

                                  {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                                    <span className="text-base text-gray-400 line-through">
                                      {product.originalPrice} lei
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <button
                        onClick={handleSearch}
                        className="mt-5 w-full bg-[#a7cf26] text-white py-3 rounded-xl font-bold hover:bg-[#93b91f] transition"
                      >
                        {language === 'ru' ? 'Смотреть все результаты' : 'Vezi toate rezultatele'}
                      </button>
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


<div
  className="relative flex-shrink-0"
  ref={languageDropdownRef}
>
  <button
    onClick={() =>
      setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
    }
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

              <Link
                to="/cart"
                className="relative w-[48px] h-[48px] rounded-full bg-[#222222] flex items-center justify-center hover:bg-black transition flex-shrink-0"
                aria-label="Coș"
              >
                <ShoppingCart className="w-6 h-6 text-white" strokeWidth={2} />
                <span className="absolute -top-[2px] -right-[2px] w-[20px] h-[20px] rounded-full bg-white text-[#a7cf26] text-[12px] leading-none font-medium flex items-center justify-center">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        onClick={closeMobileMenu}
        className={`fixed inset-0 bg-black/45 backdrop-blur-[2px] z-[90] lg:hidden transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      />

      {/* Mobile Side Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-[86%] max-w-[360px] bg-white z-[100] lg:hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Navigare
                </div>
                <div className="text-2xl font-bold mt-1">Meniu</div>
              </div>

              <button
                onClick={closeMobileMenu}
                className="w-11 h-11 rounded-xl bg-white/15 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('navbar.search')}
                  className="w-full h-[45px] px-7 pr-16 border-2 border-white/20 bg-white text-gray-500 rounded-[10px] focus:outline-none focus:border-white"
                />

                <button type="submit" className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600">
                  <Search className="w-6 h-6" />
                </button>
              </form>
            </div>

            <div className="mt-4 rounded-2xl bg-white/10 p-1 flex items-center gap-1">
              <button
                onClick={() => setMobileMenuTab('menu')}
                className={`flex-1 rounded-xl px-4 py-3 text-[15px] font-semibold transition ${
                  mobileMenuTab === 'menu'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-white/85'
                }`}
              >
                Menu
              </button>

              <button
                onClick={() => setMobileMenuTab('categories')}
                className={`flex-1 rounded-xl px-3 py-3 text-[15px] font-semibold whitespace-nowrap transition ${
                  mobileMenuTab === 'categories'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-white/85'
                }`}
              >
                {t('navbar.allCategories')}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {mobileMenuTab === 'menu' ? (
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const displayName = getName(item);

                  return (
                    <Link
                      key={item.id}
                      to={item.url}
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-gray-800 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon && <span className="text-lg">{item.icon}</span>}
                        <span className="font-semibold">{displayName}</span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-gray-200">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        openAuthModal('login');
                        closeMobileMenu();
                      }}
                      className="w-full rounded-2xl bg-yellow-400 text-gray-900 font-bold px-4 py-3 text-left"
                    >
                      {t('navbar.loginNow')}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-2xl bg-gray-100 px-4 py-3">
                        <div className="text-sm text-gray-500">{t('navbar.account')}</div>

                        <Link
                          to="/contul-meu"
                          onClick={closeMobileMenu}
                          className="block rounded-2xl bg-gray-100 px-4 py-3"
                        >
                          <div className="font-semibold text-gray-900 w-full text-left">
                            {user?.firstName} {user?.lastName}
                          </div>
                        </Link>
                      </div>

                      <button
                        onClick={() => {
                          logout();
                          closeMobileMenu();
                        }}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700"
                      >
                        {t('navbar.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            ) : (
              <div className="space-y-3">
                {categoryMenuItems.map((item) => {
                  const itemDisplayName = getName(item);

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <Link
                        to={item.url}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 py-2"
                      >
                        {item.icon && (
                          <div className="w-10 h-10 min-w-[40px] rounded-xl flex items-center justify-center shadow-sm overflow-hidden bg-white flex-shrink-0">
                            {typeof item.icon === 'string' && item.icon.startsWith('data:image') ? (
                              <img src={item.icon} alt={itemDisplayName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg">{item.icon}</span>
                            )}
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{itemDisplayName}</div>
                        </div>
                      </Link>

                      {item.hasChildren && item.children && item.children.length > 0 && (
                        <div className="ml-13 mt-1 space-y-1 pb-2">
                          {item.children.map((child) => {
                            const childDisplayName = getName(child);

                            return (
                              <Link
                                key={child.id}
                                to={child.url}
                                onClick={closeMobileMenu}
                                className="block rounded-xl px-3 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-white transition"
                              >
                                {childDisplayName}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-3 bg-white space-y-2">
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Globe className="w-4 h-4" />
                <span className="font-medium">RO / RU</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeLanguage('ro')}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition ${
                    language === 'ro'
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  RO
                </button>

                <button
                  onClick={() => changeLanguage('ru')}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition ${
                    language === 'ru'
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  RU
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-xs text-gray-500">{t('navbar.support')}</span>
              <a href="tel:069119991" className="text-sm font-semibold text-gray-900">
                069 119 991
              </a>
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
