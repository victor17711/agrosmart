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
      <Link to={`/product/${product.slug || product.id}`} className="block">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition group relative">
          {/* Badge */}
          {productBadge && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                {productBadge}
              </span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={handleAddToWishlist}
              className={`p-2 rounded-full ${inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} shadow-md hover:scale-110 transition`}
            >
              <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            {/* <button
              onClick={handleQuickView}
              className="bg-white text-gray-600 p-2 rounded-full shadow-md hover:scale-110 transition"
            >
              <Eye className="w-4 h-4" />
            </button> */}
          </div>

          {/* Product Image */}
          <div className="relative overflow-hidden bg-gray-100 aspect-square">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />
          </div>

          {/* Product Info */}
          <div className="p-4">
            {productStoreName && (
              <p className="text-xs text-gray-500 mb-1">{productStoreName}</p>
            )}
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-teal-600 transition">
              {productName}
            </h3>

            {/* Rating - Only show if reviews exist */}
            {/* {product.reviews > 0 && (
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
            )} */}

            {/* Colors
            {product.colors && (
              <div className="flex gap-1 mb-3">
                {product.colors.slice(0, 4).map((color, index) => (
                  <button
                    key={index}
                    className="w-5 h-5 rounded-full border-2 border-gray-200 hover:border-gray-400 transition"
                    style={{ backgroundColor: color }}
                    onClick={(e) => e.preventDefault()}
                  />
                ))}
              </div>
            )} */}

{/* Price */}
<div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-3">
  <span
    className={`text-lg font-bold ${
      product.originalPrice && Number(product.originalPrice) > Number(product.price)
        ? 'text-red-500'
        : 'text-gray-900'
    }`}
  >
    {product.price} MDL
  </span>

  {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
    <>
      <span className="text-sm text-gray-400 line-through">
        {product.originalPrice} MDL
      </span>
    </>
  )}
</div>

            {/* Progress Bar (if enabled) */}
            {/* {showProgress && product.sold !== undefined && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Vândut: <strong>{product.sold}</strong></span>
                  <span>Disponibil: <strong>{product.available}</strong></span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{ width: `${(product.sold / (product.sold + product.available)) * 100}%` }}
                  />
                </div>
              </div>
            )} */}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-teal-600 text-white font-bold py-2 rounded-md hover:bg-teal-700 transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
              {t('productCard.buy')}
            </button>
          </div>
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
