import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { toast } from '../hooks/use-toast';
import { Package, MapPin, CreditCard, Check } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  const getProductName = (item) => {
    return language === 'ru' && item.nameRu ? item.nameRu : item.name;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        userId: user?.id || 'guest',
        customerEmail: formData.email,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        items: cart.map((item) => ({
          productId: item.id,
          name: getProductName(item),
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedSize: item.selectedSize || '',
          selectedColor: item.selectedColor || ''
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          notes: formData.notes
        },
        totalAmount: getCartTotal(),
        status: 'pending',
        paymentMethod: paymentMethod
      };

      await axios.post(`${API}/orders`, orderData);

      clearCart();

      toast({
        title: t('checkout.successTitle'),
        description: t('checkout.successDesc')
      });

      setTimeout(() => {
        navigate('/order-success');
      }, 100);
    } catch (error) {
      toast({
        title: t('checkout.errorTitle'),
        description: error.response?.data?.detail || t('checkout.errorDesc'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-6 py-8">
        <div className="mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('checkout.title')}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('checkout.desc')}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#a7cf26]/20 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#a7cf26]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {t('checkout.contactInfo')}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('checkout.fullName')}
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={t('checkout.placeholderFullName')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('checkout.phone')}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={t('checkout.placeholderPhone')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('checkout.email')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={t('checkout.placeholderEmail')}
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#a7cf26]/20 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#a7cf26]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {t('checkout.shippingAddress')}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('checkout.address')}
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={t('checkout.placeholderAddress')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('checkout.city')}
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder={t('checkout.placeholderCity')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('checkout.postalCode')}
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder={t('checkout.placeholderPostalCode')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('checkout.notes')}
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={t('checkout.placeholderNotes')}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#a7cf26]/20 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-[#a7cf26]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {t('checkout.paymentMethod')}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: 'cash_on_delivery',
                        label: t('checkout.cashOnDelivery'),
                        desc: t('checkout.cashOnDeliveryDesc')
                      },
                      {
                        id: 'card_on_delivery',
                        label: t('checkout.cardOnDelivery'),
                        desc: t('checkout.cardOnDeliveryDesc')
                      },
                      {
                        id: 'bank_transfer',
                        label: t('checkout.bankTransfer'),
                        desc: t('checkout.bankTransferDesc')
                      }
                    ].map((opt) => {
                      const checked = paymentMethod === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                            checked
                              ? 'border-[#a7cf26] bg-[#a7cf26]/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          data-testid={`payment-option-${opt.id}`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={opt.id}
                            checked={checked}
                            onChange={() => setPaymentMethod(opt.id)}
                            className="w-5 h-5 text-teal-600"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{opt.label}</div>
                            <div className="text-sm text-gray-600">{opt.desc}</div>
                          </div>
                          {checked && <Check className="w-6 h-6 text-[#a7cf26]" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 sticky top-24">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {t('checkout.orderSummary')}
                  </h2>

                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cart.map((item) => {
                      const productName =
                        language === 'ru' && item.nameRu ? item.nameRu : item.name;

                      return (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">
                              {productName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.selectedSize && `${t('checkout.size')}: ${item.selectedSize}`}
                            </div>
                            <div className="text-sm font-semibold text-[#a7cf26]">
                              {item.price} MDL x {item.quantity}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3 pt-6 border-t">
                    <div className="flex justify-between text-gray-600">
                      <span>{t('checkout.subtotal')}</span>
                      <span className="font-semibold">{getCartTotal()} MDL</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>{t('checkout.shipping')}</span>
                      <span className="font-semibold text-green-600">
                        {t('checkout.freeShipping')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
                      <span>{t('checkout.total')}</span>
                      <span className="text-[#a7cf26]">{getCartTotal()} MDL</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#a7cf26] text-white py-4 rounded-xl hover:bg-[#a7cf26] transition font-bold text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? t('checkout.processing') : t('checkout.placeOrder')}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    {t('checkout.termsText')}{' '}
                    <a href="/page/politica-de-confidentialitate" className="text-[#a7cf26] hover:underline">
                      {t('checkout.termsLink')}
                    </a>{' '}
                    {t('checkout.termsSuffix')}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;