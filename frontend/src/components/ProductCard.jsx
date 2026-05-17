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

  const productName =
    language === 'ru' && product.nameRu ? product.nameRu : product.name;

  const productBadge =
    language === 'ru' && product.badgeRu ? product.badgeRu : product.badge;

  const productStoreName =
    language === 'ru' && product.storeNameRu
      ? product.storeNameRu
      : product.storeName;

  const hasDiscount =
    product.originalPrice &&
    Number(product.originalPrice) > Number(product.price);

  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.originalPrice) - Number(product.price)) /
          Number(product.originalPrice)) *
          100
      )
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      ...product,
      quantity: 1,
      selectedSize: product.sizes?.[0] || null,
      selectedColor: product.colors?.[0] || null,
    });

    toast({
      title: t('productCard.success'),
      description: `${productName} ${t('productCard.addedToCart')}`,
    });
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(product.id);

      toast({
        title: t('productCard.success'),
        description: `${productName} ${
          t('productCard.removedFromWishlist') || 'eliminat din favorite'
        }`,
      });
    } else {
      addToWishlist(product);

      toast({
        title: t('productCard.success'),
        description: `${productName} ${t('productCard.addedToWishlist')}`,
      });
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <Link to={`/product/${product.slug || product.id}`} className="block h-full">
        <div
          className={`bg-white rounded-[20px] md:rounded-[24px] overflow-hidden border transition group relative h-full flex flex-col ${
            hasDiscount ? 'border-red-500' : 'border-[#e2e2e2]'
          }`}
        >
          {/* Badges */}
          {(productBadge || hasDiscount) && (
            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex flex-col items-start gap-1.5">
              {productBadge && (
                <span className="bg-[#a7cf26] text-white text-[10px] md:text-xs font-semibold px-2.5 md:px-3 py-1 rounded-full">
                  {productBadge}
                </span>
              )}

              {hasDiscount && (
                <span className="bg-red-500 text-white text-[10px] md:text-xs font-extrabold px-2.5 md:px-3 py-1 rounded-full">
                  -{discountPercent}%
                </span>
              )}
            </div>
          )}

          {/* Product Image */}
          <div className="relative bg-white aspect-[1/0.88] md:aspect-auto md:h-[250px] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-[1.03]"
            />
          </div>

          {/* Product Info */}
          <div className="px-3.5 pb-3 pt-2.5 md:px-5 md:pb-5 md:pt-4 flex flex-col flex-1">
            {productStoreName && (
              <p className="text-[12px] md:text-[14px] leading-none text-[#b5b5b5] font-normal mb-2 md:mb-3 truncate">
                {productStoreName}
              </p>
            )}

            <h3 className="h-[38px] md:h-[52px] text-[14px] md:text-[16px] leading-[1.35] font-semibold text-[#333333] line-clamp-2 overflow-hidden">
              {productName}
            </h3>
          </div>

          {/* Bottom Price Row */}
          <div className="border-t border-[#e2e2e2] px-3.5 py-3 md:px-5 md:py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap min-w-0">
              {hasDiscount && (
                <span className="text-[12px] md:text-[14px] text-gray-400 line-through leading-none">
                  {product.originalPrice} MDL
                </span>
              )}

              <span
                className={`text-[14px] md:text-[16px] leading-none font-medium ${
                  hasDiscount ? 'text-red-500' : 'text-[#9dcc24]'
                }`}
              >
                {product.price} MDL
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="shrink-0 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#333333] hover:text-[#9dcc24] transition"
              aria-label={t('productCard.buy') || 'Adaugă în coș'}
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.2} />
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