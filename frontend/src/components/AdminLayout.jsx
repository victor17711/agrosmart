import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Settings,
  Bell,
  FileText,
  Tag,
  Image,
  MessageSquare,
  Gift,
  Target
} from 'lucide-react';
import { useState } from 'react';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, adminLogout } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const allMenuItems = [
    { path: '/admin/dashboard', label: 'Tablou de Bord', icon: LayoutDashboard, roles: ['admin', 'manager'] },
    { path: '/admin/products', label: 'Produse', icon: Package, roles: ['admin', 'manager'] },
    { path: '/admin/categories', label: 'Categorii', icon: FolderOpen, roles: ['admin'] },
    { path: '/admin/brands', label: 'Branduri', icon: Tag, roles: ['admin'] },
    { path: '/admin/orders', label: 'Comenzi', icon: ShoppingCart, roles: ['admin', 'manager'] },
    { path: '/admin/users', label: 'Utilizatori', icon: Users, roles: ['admin'] },
    { path: '/admin/content', label: 'Conținut', icon: Image, roles: ['admin'] },
    { path: '/admin/gifts', label: 'Cadouri', icon: Gift, roles: ['admin'] },
    { path: '/admin/gift-conditions', label: 'Condiții cadouri', icon: Target, roles: ['admin'] },
    { path: '/admin/pages', label: 'Pagini', icon: FileText, roles: ['admin'] },
    { path: '/admin/requests', label: 'Solicitări', icon: MessageSquare, roles: ['admin'] },
    { path: '/admin/settings', label: 'Setări', icon: Settings, roles: ['admin'] },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(adminUser?.role || 'user')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar Modern */}
      <aside className={`bg-gradient-to-b from-teal-700 to-teal-900 text-white w-72 fixed h-full z-50 transform transition-all duration-300 ease-in-out shadow-2xl lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          {/* Logo AgroSmart */}
          <div className="mb-2 pr-16 pb-4 border-b flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Agro<span className="text-emerald-300">Smart</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
  {menuItems.map((item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-white text-teal-700 shadow-md'
            : 'text-teal-50 hover:bg-teal-600 hover:text-white hover:translate-x-1'
        }`}
      >
        <Icon className="w-[18px] h-[18px]" />
        <span className="font-semibold text-[15px]">{item.label}</span>
      </Link>
    );
  })}
</nav>
        </div>

        {/* User Profile at Bottom */}
<div className="absolute bottom-0 w-full px-4 py-3 border-t border-teal-600 bg-teal-800">

  <div className="flex items-center gap-2 mb-2 p-2 bg-teal-700 rounded-lg">
    
    {/* Avatar */}
    <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
      {adminUser?.firstName?.[0]}{adminUser?.lastName?.[0]}
    </div>

    {/* User Info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white leading-tight truncate">
        {adminUser?.firstName} {adminUser?.lastName}
      </p>
      <p className="text-[11px] text-teal-200 truncate">
        {adminUser?.email}
      </p>
    </div>

    {/* Role */}
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${
      adminUser?.role === 'admin' 
        ? 'bg-purple-500 text-white' 
        : adminUser?.role === 'manager'
        ? 'bg-orange-500 text-white'
        : 'bg-blue-500 text-white'
    }`}>
      {adminUser?.role === 'admin' ? 'Admin' : adminUser?.role === 'manager' ? 'Manager' : 'User'}
    </span>
  </div>

  {/* Logout Button */}
  <button
    onClick={handleLogout}
    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-500 hover:bg-red-600 rounded-md text-sm font-medium transition"
  >
    <LogOut className="w-4 h-4" />
    <span>Logout</span>
  </button>

</div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Top Bar Modern */}
        <header className="bg-white shadow-md sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {menuItems.find(item => item.path === location.pathname)?.label || 'Panou Admin'}
                </h1>
                <p className="text-sm text-gray-500">Bine ai revenit, {adminUser?.firstName}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Settings className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
