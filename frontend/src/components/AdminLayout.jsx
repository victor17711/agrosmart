import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdmin } from '../context/AdminContext';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FolderOpen,
  LogOut,
  Menu,
  X,
  Settings as SettingsIcon,
  Bell,
  FileText,
  Tag,
  Image as ImageIcon,
  MessageSquare,
  Gift,
  Target,
  HelpCircle,
  Search,
  Leaf,
} from 'lucide-react';
import logo from '../assets/images/logo.png';

// ------- AgroSmart admin layout (light, airy, brand #A7CC32) --------
const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, adminLogout, getAuthHeaders } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global search state
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], orders: [], customers: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults({ products: [], orders: [], customers: [] });
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const headers = getAuthHeaders ? getAuthHeaders() : {};
        const [prodRes, orderRes, userRes] = await Promise.all([
          axios.get(`${API}/products?search=${encodeURIComponent(q)}&limit=6`).catch(() => ({ data: [] })),
          axios.get(`${API}/admin/orders`, headers).catch(() => ({ data: [] })),
          axios.get(`${API}/admin/users`, headers).catch(() => ({ data: [] })),
        ]);
        const qlow = q.toLowerCase();
        const orders = (orderRes.data || [])
          .filter((o) =>
            [o.customerName, o.customerEmail, o.customerPhone, o.id]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(qlow))
          )
          .slice(0, 6);
        const customers = (userRes.data || [])
          .filter((u) =>
            [u.email, u.firstName, u.lastName, u.phone]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(qlow))
          )
          .slice(0, 6);
        setSearchResults({
          products: (prodRes.data || []).slice(0, 6),
          orders,
          customers,
        });
      } catch (e) {
        console.error('search error', e);
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [searchQuery]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const mainMenu = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager'] },
    { path: '/admin/orders', label: 'Comenzi', icon: ShoppingCart, roles: ['admin', 'manager'] },
    { path: '/admin/products', label: 'Produse', icon: Package, roles: ['admin', 'manager'] },
    { path: '/admin/categories', label: 'Categorii', icon: FolderOpen, roles: ['admin'] },
    { path: '/admin/brands', label: 'Branduri', icon: Tag, roles: ['admin'] },
    { path: '/admin/users', label: 'Clienți', icon: Users, roles: ['admin'] },
    { path: '/admin/requests', label: 'Solicitări', icon: MessageSquare, roles: ['admin'] },
  ];
  const otherMenu = [
    { path: '/admin/content', label: 'Conținut', icon: ImageIcon, roles: ['admin'] },
    { path: '/admin/pages', label: 'Pagini', icon: FileText, roles: ['admin'] },
    { path: '/admin/gifts', label: 'Cadouri', icon: Gift, roles: ['admin'] },
    { path: '/admin/gift-conditions', label: 'Condiții cadouri', icon: Target, roles: ['admin'] },
    { path: '/admin/settings', label: 'Setări', icon: SettingsIcon, roles: ['admin'] },
  ];

  const role = adminUser?.role || 'user';
  const filterByRole = (items) => items.filter((it) => it.roles.includes(role));
  const currentLabel =
    [...mainMenu, ...otherMenu].find((i) => i.path === location.pathname)?.label || 'Panou Admin';

  const renderItem = (item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        data-testid={`admin-nav-${item.path.split('/').pop()}`}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-[15px] ${isActive
            ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm ring-1 ring-brand-100'
            : 'text-gray-600 hover:text-brand-700 hover:bg-gray-50 font-medium'
          }`}
      >
        <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-brand-600' : 'text-gray-500'}`} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F9F7] flex">
      {/* Sidebar */}
      <aside
        className={`bg-white w-72 fixed h-full z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-gray-100 shadow-[0_0_40px_rgba(167,204,50,0.08)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-6 pt-7 pb-4">
            <Link to="/admin/dashboard" className="flex items-center gap-3" data-testid="admin-sidebar-logo">
              {/* <span className="w-11 h-11 rounded-2xl bg-brand-500 flex items-center justify-center shadow-md shadow-brand-200">
                <Leaf className="w-6 h-6 text-white" />
              </span> */}
              <img
                src={logo}
                alt="AgroSmart"
                className="h-14 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Scrollable nav */}
          <nav className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="mt-4 mb-2 px-3 text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">
              Principale
            </div>
            <div className="space-y-1.5">{filterByRole(mainMenu).map(renderItem)}</div>

            <div className="mt-6 mb-2 px-3 text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">
              Altele
            </div>
            <div className="space-y-1.5">{filterByRole(otherMenu).map(renderItem)}</div>

            <div className="mt-6 mb-2 px-3 text-[11px] uppercase tracking-[0.14em] text-gray-400 font-semibold">
              Ieși din cont
            </div>
            <button
              onClick={handleLogout}
              data-testid="admin-logout-btn"
              className="mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition font-medium text-[15px]"
            >
              <LogOut className="w-[18px] h-[18px] text-gray-500" />
              <span>Logout</span>
            </button>
          </nav>

          {/* Help card */}
          <div className="px-4 pb-5">
            <div className="relative rounded-2xl p-4 bg-gradient-to-br from-brand-100 via-brand-50 to-white overflow-hidden ring-1 ring-brand-100">
              <div className="flex items-center gap-2 text-gray-800">
                <HelpCircle className="w-5 h-5 text-brand-600" />
                <span className="font-bold">Vezi magazinul online</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Deschide magazinul online.</p>
              <Link
                to="/admin/requests"
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2 shadow-md shadow-brand-200 transition"
              >
                Vizitează site-ul
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#F4F9F7]/80 backdrop-blur-md">
          <div className="px-6 lg:px-10 py-5 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-white shadow-sm border border-gray-100"
              data-testid="admin-mobile-menu-toggle"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-[26px] lg:text-3xl font-extrabold text-gray-900 tracking-tight truncate">
                {currentLabel === 'Dashboard' ? 'Panou de control' : currentLabel}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Bine ai revenit, {adminUser?.firstName}! Aruncă un ochi pe performanța magazinului.
              </p>
            </div>

            {/* Search */}
            <div ref={searchBoxRef} className="hidden md:block relative">
              <div className="flex items-center gap-2 bg-white rounded-full shadow-sm border border-gray-100 px-4 py-2.5 w-[340px] lg:w-[420px] focus-within:ring-2 focus-within:ring-brand-200 transition">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Caută comenzi, produse, clienți…"
                  className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 flex-1"
                  data-testid="admin-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="clear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {searchOpen && searchQuery.trim() && (
                <div data-testid="admin-search-dropdown" className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[520px] overflow-y-auto z-50">
                  {searching && (
                    <div className="p-4 text-center text-sm text-gray-400">Se caută…</div>
                  )}
                  {!searching && searchResults.products.length === 0 && searchResults.orders.length === 0 && searchResults.customers.length === 0 && (
                    <div className="p-6 text-center text-sm text-gray-400">Nimic găsit pentru „{searchQuery}"</div>
                  )}
                  {searchResults.products.length > 0 && (
                    <div className="p-2">
                      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Produse</p>
                      {searchResults.products.map((p) => (
                        <button
                          key={p.id}
                          data-testid={`search-product-${p.id}`}
                          onClick={() => { setSearchOpen(false); navigate('/admin/products'); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-50 text-left"
                        >
                          <div className="w-9 h-9 rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center">
                            {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                            <p className="text-xs text-gray-500 truncate">{p.category}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{Number(p.price).toLocaleString('ro-RO')} MDL</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.orders.length > 0 && (
                    <div className="p-2 border-t border-gray-100">
                      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Comenzi</p>
                      {searchResults.orders.map((o) => (
                        <button
                          key={o.id}
                          data-testid={`search-order-${o.id}`}
                          onClick={() => { setSearchOpen(false); navigate('/admin/orders'); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-50 text-left"
                        >
                          <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-brand-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">#{(o.id || '').slice(0, 8).toUpperCase()} – {o.customerName}</p>
                            <p className="text-xs text-gray-500 truncate">{o.customerEmail} · {o.status}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{Number(o.totalAmount || o.total || 0).toLocaleString('ro-RO')} MDL</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.customers.length > 0 && (
                    <div className="p-2 border-t border-gray-100">
                      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Clienți</p>
                      {searchResults.customers.map((u) => (
                        <button
                          key={u.id}
                          data-testid={`search-user-${u.id}`}
                          onClick={() => { setSearchOpen(false); navigate('/admin/users'); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-50 text-left"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                            {(u.firstName?.[0] || '') + (u.lastName?.[0] || '')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{u.role}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bell */}
            {/* <button className="relative p-3 bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md transition">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white"></span>
            </button> */}

            {/* Admin identity */}
            <div className="hidden md:flex items-center gap-3 bg-white rounded-full shadow-sm border border-gray-100 pl-1.5 pr-4 py-1.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold">
                {adminUser?.firstName?.[0]}
                {adminUser?.lastName?.[0]}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-800">
                  {adminUser?.firstName} {adminUser?.lastName}
                </p>
                <p className="text-[11px] text-gray-500 truncate max-w-[180px]">
                  {adminUser?.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-6 lg:px-10 pb-10">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
