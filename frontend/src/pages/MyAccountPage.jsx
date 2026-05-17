import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User, ChevronRight, Package, MapPin, Settings, LogOut, Edit, Save, X, Clock, Heart, Trash2 } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyAccountPage = () => {
  const { t, language } = useLanguage();
  const { wishlist, removeFromWishlist } = useCart();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  useEffect(() => {
    fetchUserData();
    fetchOrders();
  }, []);

  // Fetch product details for items in wishlist (wishlist stores product IDs)
  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (!wishlist || wishlist.length === 0) {
        setFavoriteProducts([]);
        return;
      }
      setFavoritesLoading(true);
      try {
        const ids = wishlist.map((item) => (typeof item === 'string' ? item : item.id));
        const results = await Promise.all(
          ids.map((id) =>
            axios.get(`${API}/products/${id}`).then((r) => r.data).catch(() => null)
          )
        );
        setFavoriteProducts(results.filter(Boolean));
      } catch (error) {
        console.error('Error fetching favorite products:', error);
      } finally {
        setFavoritesLoading(false);
      }
    };
    fetchFavoriteProducts();
  }, [wishlist]);

  const handleRemoveFavorite = async (productId) => {
    try {
      await removeFromWishlist(productId);
      toast({
        title: t('myAccount.toast.successTitle'),
        description: t('myAccount.favorites.removed')
      });
    } catch (error) {
      toast({
        title: t('myAccount.toast.errorTitle'),
        description: error.response?.data?.detail || t('myAccount.toast.errorDesc'),
        variant: 'destructive'
      });
    }
  };

  const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');

  if (!token) {
    setLoading(false);
    return null;
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

  const fetchUserData = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.get(`${API}/auth/me`, headers);
      setUser(response.data);
      setProfileForm({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        city: response.data.city || '',
        postalCode: response.data.postalCode || ''
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 401) {
  localStorage.removeItem('userToken');
  setUser(null);
}
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.get(`${API}/orders`, headers);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.put(`${API}/auth/me`, profileForm, headers);

      setUser(response.data);
      setEditMode(false);
      toast({
        title: t('myAccount.toast.successTitle'),
        description: t('myAccount.toast.successDesc')
      });
    } catch (error) {
      toast({
        title: t('myAccount.toast.errorTitle'),
        description: error.response?.data?.detail || t('myAccount.toast.errorDesc'),
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    toast({
      title: t('myAccount.toast.logoutTitle'),
      description: t('myAccount.toast.logoutDesc')
    });
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: t('myAccount.status.pending'), color: 'bg-yellow-100 text-yellow-800' },
      processing: { text: t('myAccount.status.processing'), color: 'bg-blue-100 text-blue-800' },
      shipped: { text: t('myAccount.status.shipped'), color: 'bg-purple-100 text-purple-800' },
      delivered: { text: t('myAccount.status.delivered'), color: 'bg-green-100 text-green-800' },
      cancelled: { text: t('myAccount.status.cancelled'), color: 'bg-red-100 text-red-800' }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a7cf26]"></div>
      </div>
    );
  }
if (!user) {
  return (
    <div className="bg-gray-50 px-4 py-14 md:py-14">
      <div className="mx-auto max-w-[460px] rounded-[22px] bg-white px-5 py-7 text-center shadow-sm border border-gray-100 md:px-10 md:py-11 md:rounded-2xl md:shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 md:mb-6 md:h-20 md:w-20">
          <User className="h-7 w-7 text-gray-300 md:h-10 md:w-10" />
        </div>

        <h2 className="mb-3 text-[22px] font-extrabold leading-tight text-gray-900 md:mb-4 md:text-3xl">
          {t('myAccount.authRequired.title')}
        </h2>

        <p className="mx-auto mb-5 max-w-[330px] text-[14px] leading-relaxed text-gray-600 md:mb-6 md:text-base">
          {t('myAccount.authRequired.desc')}
        </p>

<button
  type="button"
  onClick={() => {
    window.dispatchEvent(new CustomEvent('open-auth-modal'));
  }}
  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#a7cf26] px-6 text-[14px] font-bold text-white transition hover:bg-[#a7cf26]/70 md:h-12 md:px-8 md:text-base"
>
  {language === 'ru' ? 'Войти' : 'Autentificare'}
</button>
      </div>
    </div>
  );
}

  return (
    <div className="bg-gray-50">
      {/* HERO */}
      {/* <div className="relative bg-gradient-to-r from-teal-600 to-teal-700 text-white py-14">
        <div className="w-full px-4 md:px-6">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">{t('myAccount.title')}</h1>
          </div>
          <p className="text-teal-100">
            {t('myAccount.welcome')} {user.firstName}
          </p>
        </div>
      </div> */}

      {/* BREADCRUMB */}
      <div className="relative bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#a7cf26]">
              {t('myAccount.breadcrumb.home')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">
              {t('myAccount.breadcrumb.page')}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <div className="w-20 h-20 bg-[#a7cf26]/25 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-[#a7cf26]" />
                </div>
                <h3 className="text-center font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-center text-sm text-gray-600">{user.email}</p>
              </div>

              <nav className="p-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition ${
                    activeTab === 'profile'
                      ? 'bg-[#a7cf26]/10 text-[#a7cf26] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  {t('myAccount.tabs.profile')}
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition ${
                    activeTab === 'orders'
                      ? 'bg-[#a7cf26]/10 text-[#a7cf26] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  {t('myAccount.tabs.orders')}
                  {orders.length > 0 && (
                    <span className="ml-auto bg-[#a7cf26] text-white text-xs px-2 py-1 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition ${
                    activeTab === 'favorites'
                      ? 'bg-[#a7cf26]/10 text-[#a7cf26] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  data-testid="favorites-tab-btn"
                >
                  <Heart className="w-5 h-5" />
                  {t('myAccount.tabs.favorites')}
                  {favoriteProducts.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {favoriteProducts.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition ${
                    activeTab === 'addresses'
                      ? 'bg-[#a7cf26]/10 text-[#a7cf26] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  {t('myAccount.tabs.addresses')}
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition ${
                    activeTab === 'settings'
                      ? 'bg-[#a7cf26]/10 text-[#a7cf26] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  {t('myAccount.tabs.settings')}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  {t('myAccount.tabs.logout')}
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('myAccount.profile.title')}
                  </h2>

                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 text-[#a7cf26] hover:text-[#a7cf26] font-semibold"
                    >
                      <Edit className="w-5 h-5" />
                      {t('myAccount.profile.edit')}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setProfileForm({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          phone: user.phone || '',
                          address: user.address || '',
                          city: user.city || '',
                          postalCode: user.postalCode || ''
                        });
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-700 font-semibold"
                    >
                      <X className="w-5 h-5" />
                      {t('myAccount.profile.cancel')}
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {t('myAccount.profile.firstName')}
                      </label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]/40 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {t('myAccount.profile.lastName')}
                      </label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]/40 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {t('myAccount.profile.email')}
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('myAccount.profile.emailNote')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {t('myAccount.profile.phone')}
                      </label>
                      <input
                        type="tel"
                        disabled={!editMode}
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]/40 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder={t('myAccount.profile.placeholderPhone')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {t('myAccount.profile.address')}
                      </label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]/40 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder={t('myAccount.profile.placeholderAddress')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {t('myAccount.profile.city')}
                      </label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]/40 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder={t('myAccount.profile.placeholderCity')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {t('myAccount.profile.postalCode')}
                      </label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profileForm.postalCode}
                        onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]/40 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder={t('myAccount.profile.placeholderPostalCode')}
                      />
                    </div>
                  </div>

                  {editMode && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center gap-2 bg-[#a7cf26] text-white px-8 py-3 rounded-xl focus:ring-[#a7cf26]/60 transition font-semibold"
                      >
                        <Save className="w-5 h-5" />
                        {t('myAccount.profile.save')}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('myAccount.orders.title')}
                </h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {t('myAccount.orders.emptyTitle')}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {t('myAccount.orders.emptyDesc')}
                    </p>
                    <Link
                      to="/"
                      className="inline-block bg-[#a7cf26] text-white px-8 py-3 rounded-xl hover:bg-[#a7cf26]/60 transition font-semibold"
                    >
                      {t('myAccount.orders.startShopping')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#a7cf26] transition">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                {t('myAccount.orders.order')} #{order.id.slice(0, 8).toUpperCase()}
                              </h3>
                              {getStatusBadge(order.status)}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(order.createdAt).toLocaleDateString('ro-RO', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                              <span>•</span>
                              <span>
                                {order.items.length}{' '}
                                {order.items.length === 1
                                  ? t('myAccount.orders.product')
                                  : t('myAccount.orders.products')}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#a7cf26]">
                              {order.totalAmount.toFixed(2)} MDL
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.paymentMethod === 'cash_on_delivery'
                                ? t('myAccount.orders.cashOnDelivery')
                                : order.paymentMethod}
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            {t('myAccount.orders.productsLabel')}
                          </h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.name} <span className="text-gray-500">x{item.quantity}</span>
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {item.price.toFixed(2)} MDL
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.shippingAddress && (
                          <div className="border-t mt-4 pt-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {t('myAccount.orders.shippingAddress')}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress.address}, {order.shippingAddress.city}
                              {order.shippingAddress.postalCode && `, ${order.shippingAddress.postalCode}`}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                  {t('myAccount.favorites.title')}
                  {favoriteProducts.length > 0 && (
                    <span className="text-lg text-gray-500 font-normal">
                      ({favoriteProducts.length})
                    </span>
                  )}
                </h2>

                {favoritesLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a7cf26]"></div>
                  </div>
                ) : favoriteProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {t('myAccount.favorites.emptyTitle')}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {t('myAccount.favorites.emptyDesc')}
                    </p>
                    <Link
                      to="/"
                      className="inline-block bg-[#a7cf26] text-white px-8 py-3 rounded-xl hover:bg-[#a7cf26]/60 transition font-semibold"
                      data-testid="favorites-empty-start-shopping-btn"
                    >
                      {t('myAccount.favorites.startShopping')}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {favoriteProducts.map((product) => (
                      <div key={product.id} className="relative group" data-testid="favorite-product-item">
                        <ProductCard product={product} />
                        <button
                          onClick={() => handleRemoveFavorite(product.id)}
                          className="absolute top-3 right-3 z-20 bg-white text-red-600 p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition"
                          title={t('myAccount.favorites.remove')}
                          data-testid="favorite-remove-btn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('myAccount.addresses.title')}
                </h2>
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {t('myAccount.addresses.desc')}
                  </p>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="mt-4 text-[#a7cf26] hover:text-[#a7cf26]/60 font-semibold"
                  >
                    {t('myAccount.addresses.viewProfile')}
                  </button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('myAccount.settings.title')}
                </h2>
                <div className="space-y-4">
                  <div className="p-4 border-2 border-red-200 rounded-xl bg-red-50">
                    <h3 className="font-bold text-red-900 mb-1">
                      {t('myAccount.settings.deleteAccount.title')}
                    </h3>
                    <p className="text-sm text-red-600 mb-3">
                      {t('myAccount.settings.deleteAccount.desc')}
                    </p>
                    <button className="text-red-600 hover:text-red-700 font-semibold text-sm">
                      {t('myAccount.settings.deleteAccount.action')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;