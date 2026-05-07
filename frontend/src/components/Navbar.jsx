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
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthModal from './AuthModal';
import axios from 'axios';
import { Leaf } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';

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
  const languageDropdownRef = useRef(null);
  const searchRef = useRef(null);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCategoriesOpen && categoryMenuItems.length > 0 && !hoveredCategoryId) {
      setHoveredCategoryId(categoryMenuItems[0].id);
    }
  }, [isCategoriesOpen, categoryMenuItems, hoveredCategoryId]);

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
      const response = await axios.get(`${API}/settings`);
      setMenuItems(response.data.menuItems || []);
      setCategoryMenuItems(response.data.categoryMenuItems || []);
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
      {/* Top Bar */}
      <div className="bg-teal-700 text-white">
        <div className="w-full px-4 md:px-6">
          <div className="flex items-center justify-center lg:justify-between py-3 text-sm">
            <div className="flex items-center gap-3 lg:hidden text-[15px] font-medium">
              <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                <Headphones className="w-4 h-4" />
              </div>
              <span>{t('navbar.infoDesc')}</span>
<a
  href="tel:+37369119991"
  onClick={(e) => e.stopPropagation()}
  className="bg-yellow-400 text-black px-4 py-1.5 rounded-full font-bold text-sm inline-flex items-center justify-center hover:bg-yellow-300 transition"
>
  (+373) 691 19 991
</a>
            </div>

            <div className="hidden lg:flex items-center justify-between w-full">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                    <Headphones className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold">{t('navbar.infoDesc')}</span>
<a
  href="tel:+37369119991"
  onClick={(e) => e.stopPropagation()}
  className="bg-yellow-400 text-black px-4 py-1.5 rounded-full font-bold text-sm inline-flex items-center justify-center hover:bg-yellow-300 transition"
>
  (+373) 691 19 991
</a>
                </div>

                <div className="flex items-center gap-2 relative" ref={languageDropdownRef}>
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:text-yellow-400 transition"
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  >
                    <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">{t('navbar.language')}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isLanguageDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white text-gray-900 rounded-lg shadow-xl py-2 min-w-[150px] z-50">
                      <button
                        onClick={() => {
                          changeLanguage('ro');
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-teal-50 transition flex items-center gap-2 ${language === 'ro' ? 'bg-teal-100 font-bold' : ''}`}
                      >
                        Română
                      </button>

                      <button
                        onClick={() => {
                          changeLanguage('ru');
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-teal-50 transition flex items-center gap-2 ${language === 'ru' ? 'bg-teal-100 font-bold' : ''}`}
                      >
                        Русский
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61574327334921"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-teal-700 transition"
                >
                  <FaFacebookF className="w-4 h-4" />
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-teal-700 transition"
                >
                  <FaInstagram className="w-4 h-4" />
                </a>

                <a
                  href="https://www.tiktok.com/@agrosmart.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-teal-700 transition"
                >
                  <FaTiktok className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b sticky top-0 z-50 lg:static">
        <div className="w-full px-4 md:px-6 py-4 md:py-4">
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
                  <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                    Agro<span className="text-brand-600">Smart</span>
                  </span>
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

          <div className="hidden lg:flex items-center justify-between gap-8">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2" data-testid="navbar-logo-desktop">
              <Leaf className="w-8 h-8 text-brand-600" />
              <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                Agro<span className="text-brand-600">Smart</span>
              </span>
            </Link>

            {/* Desktop Search */}
            <div className="flex-1 max-w-3xl relative" ref={searchRef}>
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
                  className="w-full px-7 py-4 pr-16 border-2 border-gray-200 rounded-full focus:outline-none focus:border-teal-500 text-base bg-white"
                />

                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition"
                >
                  <Search className="w-6 h-6" />
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
                      {language === 'ru'
                        ? 'Nu au fost găsite produse'
                        : 'Nu au fost găsite produse'}
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
                            className="flex items-center gap-5 p-4 border border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50/40 transition"
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
                      className="mt-5 w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition"
                    >
                      {language === 'ru' ? 'Смотреть все результаты' : 'Vezi toate rezultatele'}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 flex-shrink-0">
              {isAuthenticated ? (
                <Link
                  to="/contul-meu"
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition">
                    <User className="w-7 h-7 text-gray-900" strokeWidth={2.5} />
                  </div>

                  <div className="text-left leading-tight">
                    <div className="text-sm font-bold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>

                    <div className="text-sm text-gray-600 group-hover:text-gray-900 transition">
                      {t('navbar.account')}
                    </div>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition shadow-none">
                    <User className="w-6 h-6 text-gray-900" />
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">{t('navbar.account')}</div>
                    <div className="text-sm text-gray-600">{t('navbar.loginNow')}</div>
                  </div>
                </button>
              )}

              <Link to="/cart" className="flex items-center gap-2 group">
                <div className="w-6 h-6 md:w-12 md:h-12 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition shadow-none relative">
                  <ShoppingCart className="w-6 h-6 text-gray-900" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </div>

                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{t('navbar.cart')}</div>
                  <div className="text-sm text-gray-600">{cartCount} {t('navbar.items')}</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="hidden lg:block bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="w-full px-6">
          <div className="flex items-center justify-between py-3">
            <div className="relative hidden lg:block" ref={dropdownRef}>
              <button
                onClick={() => {
                  const nextState = !isCategoriesOpen;
                  setIsCategoriesOpen(nextState);

                  if (nextState && categoryMenuItems.length > 0) {
                    setHoveredCategoryId(categoryMenuItems[0].id);
                  }
                }}
                className="bg-teal-600 text-white px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-teal-700 transition shadow-md font-semibold"
              >
                <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                </div>

                {t('navbar.allCategories')}

                <ChevronDown className={`w-5 h-5 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoriesOpen && categoryMenuItems.length > 0 && (
                <div className="absolute top-full left-0 mt-4 w-[calc(100vw-48px)] max-w-[1600px] bg-white rounded-[24px] shadow-2xl border border-gray-100 p-6 z-50">
                  <div className="grid grid-cols-[390px_1fr] gap-6">
                    <div className="border-r border-gray-200 pr-6 space-y-3 max-h-[680px] overflow-y-auto">
                      {categoryMenuItems.map((item) => {
                        const itemName = getName(item);
                        const isActive = hoveredCategoryId === item.id;

                        return (
                          <div
                            key={item.id}
                            onMouseEnter={() => setHoveredCategoryId(item.id)}
                            className={`flex items-center justify-between gap-3 px-5 py-4 rounded-xl cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <Link
                              to={item.url}
                              onClick={() => {
                                setIsCategoriesOpen(false);
                                setHoveredCategoryId(null);
                              }}
                              className="flex items-center gap-3 flex-1 min-w-0"
                            >
                              {item.icon && (
                                <div className="w-8 h-8 min-w-[32px] flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {typeof item.icon === 'string' && item.icon.startsWith('data:image') ? (
                                    <img
                                      src={item.icon}
                                      alt={itemName}
                                      className={`w-full h-full object-contain ${isActive ? 'invert brightness-0' : ''}`}
                                    />
                                  ) : (
                                    <span className="text-lg">{item.icon}</span>
                                  )}
                                </div>
                              )}

                              <span className="font-bold uppercase text-sm leading-tight truncate">
                                {itemName}
                              </span>
                            </Link>

                            <ChevronRight className="w-5 h-5 flex-shrink-0" />
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-full min-h-[520px] max-h-[680px] overflow-y-auto pr-1">
                      {categoryMenuItems.map((item) => {
                        if (hoveredCategoryId !== item.id) return null;

                        const children = item.children || [];

                        return (
                          <div key={item.id} className="w-full">
                            {children.length > 0 ? (
                              <div className="grid grid-cols-4 gap-5 w-full">
                                {children.map((child) => {
                                  const childName = getName(child);

                                  return (
                                    <Link
                                      key={child.id}
                                      to={child.url}
                                      onClick={() => {
                                        setIsCategoriesOpen(false);
                                        setHoveredCategoryId(null);
                                      }}
                                      className="bg-gray-100 rounded-2xl min-h-[250px] p-5 flex flex-col items-center justify-between text-center transition-none"
                                    >
                                      <div className="text-lg font-medium text-gray-900 uppercase leading-tight">
                                        {childName}
                                      </div>

                                      {child.icon && (
                                        <div className="flex-1 flex items-center justify-center mt-4">
                                          {typeof child.icon === 'string' && child.icon.startsWith('data:image') ? (
                                            <img
                                              src={child.icon}
                                              alt={childName}
                                              className="max-h-[145px] max-w-full object-contain"
                                            />
                                          ) : (
                                            <span className="text-5xl">{child.icon}</span>
                                          )}
                                        </div>
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="h-full min-h-[520px] flex items-center justify-center text-gray-400">
                                Nu există subcategorii
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <nav className="hidden lg:flex items-center gap-8 text-base font-medium">
              {menuItems.map((item) => {
                const displayName = getName(item);

                return (
                  <Link
                    key={item.id}
                    to={item.url}
                    className="text-gray-700 hover:text-teal-600 font-bold transition flex items-center gap-1 uppercase"
                  >
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    {displayName}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-gray-600" />
              </div>

              <div>
                <div className="text-sm text-gray-500">{t('navbar.support')}</div>
                <div className="text-base text-right font-bold text-gray-900">069 119 991</div>
              </div>
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