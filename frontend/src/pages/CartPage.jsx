import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="pt-36 pb-36 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('cart.emptyTitle')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('cart.emptyDesc')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#a7cf26] text-white px-8 py-3 rounded-xl hover:bg-[#a7cf26] transition font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 md:px-6 py-6 md:py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8">
          {t('cart.title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const productName =
                language === 'ru' && item.nameRu ? item.nameRu : item.name;

              return (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="bg-white rounded-2xl p-4 md:p-6 border-2 border-gray-100"
                >
                  <div className="relative">
                    {/* Remove button mobile */}
                    <button
                      onClick={() =>
                        removeFromCart(item.id, item.selectedSize, item.selectedColor)
                      }
                      className="absolute top-0 right-0 md:hidden text-red-500 hover:text-red-700 transition p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex gap-4 md:gap-6 pr-8 md:pr-0">
                      {/* Image */}
                      <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={item.image}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.id}`}>
                          <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 hover:text-[#a7cf26] transition leading-snug break-words">
                            {productName}
                          </h3>
                        </Link>

                        {item.specifications && item.specifications.length > 0 && (
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm text-gray-600 mb-4">
                            {item.specifications.slice(0, 3).map((spec, index) => (
                              <div key={index} className="break-words">
                                <span className="font-semibold">{spec.title}:</span> {spec.value}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Quantity */}
                          <div className="flex items-center border-2 border-gray-300 rounded-lg w-fit">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(1, item.quantity - 1),
                                  item.selectedSize,
                                  item.selectedColor
                                )
                              }
                              className="p-2 hover:bg-gray-100 transition"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <span className="px-4 py-2 font-semibold min-w-[44px] text-center">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity + 1,
                                  item.selectedSize,
                                  item.selectedColor
                                )
                              }
                              className="p-2 hover:bg-gray-100 transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-left md:text-right">
                            <div className="text-lg md:text-2xl font-bold text-[#a7cf26] break-words">
                              {item.price * item.quantity} MDL
                            </div>
                            <div className="text-xs md:text-sm text-gray-500 break-words">
                              {item.price} MDL x {item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Remove desktop */}
                      <button
                        onClick={() =>
                          removeFromCart(item.id, item.selectedSize, item.selectedColor)
                        }
                        className="hidden md:block text-red-500 hover:text-red-700 transition self-start"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 md:p-6 border-2 border-gray-100 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('cart.orderSummary')}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 gap-4">
                  <span>
                    {t('cart.subtotal')} ({cart.length} {t('cart.products')})
                  </span>
                  <span className="font-semibold text-right">{getCartTotal()} MDL</span>
                </div>

                <div className="flex justify-between text-gray-600 gap-4">
                  <span>{t('cart.shipping')}</span>
                  <span className="font-semibold text-green-600 text-right">
                    {t('cart.freeShipping')}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg md:text-xl font-bold text-gray-900 gap-4">
                    <span>{t('cart.total')}</span>
                    <span className="text-[#a7cf26] text-right">{getCartTotal()} MDL</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#a7cf26] text-white py-4 rounded-xl hover:bg-[#a7cf26] transition font-bold text-base md:text-lg mb-4"
              >
                {t('cart.checkout')}
              </button>

              <Link
                to="/"
                className="block text-center text-[#a7cf26] hover:text-[#a7cf26] font-semibold"
              >
                {t('cart.continueShopping')}
              </Link>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                {/* <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                  {t('cart.freeShippingNote')}
                </div> */}

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#a7cf26] rounded-full"></div>
                  {t('cart.freeReturnNote')}
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#a7cf26] rounded-full"></div>
                  {t('cart.securePaymentNote')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;