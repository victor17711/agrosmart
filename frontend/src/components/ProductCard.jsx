import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from '../hooks/use-toast';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product, showProgress = false }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { language, t } = useLanguage();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const inWishlist = isInWishlist(product.id);

  // Get translated content
  const productName = language === 'ru' && product.nameRu ? product.nameRu : product.name;
  const productBadge = language === 'ru' && product.badgeRu ? product.badgeRu : product.badge;
  const productStoreName = language === 'ru' && product.storeNameRu ? product.storeNameRu : product.storeName;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      quantity: 1,
      selectedSize: product.sizes?.[0] || null,
      selectedColor: product.colors?.[0] || null
    });
    toast({ title: t('productCard.success'), description: `${productName} ${t('productCard.addedToCart')}` });
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast({ title: t('productCard.success'), description: `${productName} ${t('productCard.removedFromWishlist') || 'eliminat din favorite'}` });
    } else {
      addToWishlist(product);
      toast({ title: t('productCard.success'), description: `${productName} ${t('productCard.addedToWishlist')}` });
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);


  return (
  <>
    <Link to={`/product/${product.slug || product.id}`} className="block h-full">
      <div
  className={`bg-white rounded-[24px] overflow-hidden border transition group relative h-full flex flex-col ${
    product.originalPrice &&
    Number(product.originalPrice) > Number(product.price)
      ? 'border-red-500'
      : 'border-[#e2e2e2]'
  }`}
>

        {/* Badge */}
        {productBadge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {productBadge}
            </span>
          </div>
        )}

        {/* Product Image */}
        <div className="relative bg-white h-[220px] md:h-[250px] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </div>

        {/* Product Info */}
        <div className="px-5 pb-5 pt-4 flex flex-col flex-1">
          {productStoreName && (
            <p className="text-[14px] leading-none text-[#b5b5b5] font-normal mb-3">
              {productStoreName}
            </p>
          )}

          <h3 className="h-[44px] md:h-[52px] text-[16px] leading-[1.35] font-semibold text-[#333333] line-clamp-2 overflow-hidden">
  {productName}
</h3>
        </div>

        {/* Bottom Price Row */}
        <div className="border-t border-[#e2e2e2] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
  {product.originalPrice &&
    Number(product.originalPrice) > Number(product.price) && (
      <span className="text-[14px] text-gray-400 line-through">
        {product.originalPrice} MDL
      </span>
    )}

  <span
    className={`text-[16px] leading-none font-medium ${
      product.originalPrice &&
      Number(product.originalPrice) > Number(product.price)
        ? 'text-red-500'
        : 'text-[#9dcc24]'
    }`}
  >
    {product.price} MDL
  </span>
</div>

          <button
            onClick={handleAddToCart}
            className="w-9 h-9 flex items-center justify-center text-[#333333] hover:text-[#9dcc24] transition"
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2.2} />
          </button>
        </div>

        {/* Wishlist - comentat */}
        {/*
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleAddToWishlist}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <Heart className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>
        */}

        {/* Buton vechi - comentat */}
        {/*
        <button
          onClick={handleAddToCart}
          className="w-full bg-teal-600 text-white font-bold py-2 rounded-md hover:bg-teal-700 transition flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
          {t('productCard.buy')}
        </button>
        */}

        {/* Quick Actions - comentat */}
        {/*
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={handleAddToWishlist}
            className={`p-2 rounded-full ${
              inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
            } shadow-md hover:scale-110 transition`}
          >
            <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleQuickView}
            className="bg-white text-gray-600 p-2 rounded-full shadow-md hover:scale-110 transition"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
        */}

        {/* Rating - comentat */}
        {/*
        {product.reviews > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviews})</span>
          </div>
        )}
        */}
      </div>
    </Link>

    <QuickViewModal
      isOpen={quickViewOpen}
      onClose={() => setQuickViewOpen(false)}
      product={product}
    />
  </>
);
};

export default ProductCard;
