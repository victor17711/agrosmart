import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, Minus, Plus, ShoppingCart, Heart, Star, Truck, RefreshCw, Shield, X, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from '../hooks/use-toast';
import ProductCard from '../components/ProductCard';
import GiftPopup from '../components/GiftPopup';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { language, t } = useLanguage();

  const [product, setProduct] = useState(null);
  const [brand, setBrand] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specifications');
  const [reviewForm, setReviewForm] = useState({
    userName: '',
    userEmail: '',
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [installmentForm, setInstallmentForm] = useState({
    name: '',
    phone: ''
  });
  const [relatedScrollPosition, setRelatedScrollPosition] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && product.id) {
      fetchReviews();
    }
  }, [product]);


  const nextMainImage = (e) => {
  e.stopPropagation();
  setSelectedImage((prev) => (prev + 1) % images.length);
};

const prevMainImage = (e) => {
  e.stopPropagation();
  setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
};



  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);

      if (response.data.brandId) {
        try {
          const brandRes = await axios.get(`${API}/brands/${response.data.brandId}`);
          setBrand(brandRes.data);
        } catch (error) {
          console.error('Error fetching brand:', error);
        }
      }

      // Fetch category translation (nameRu) by matching the product's category name
      if (response.data.category) {
        try {
          const catRes = await axios.get(`${API}/categories`);
          const match = (catRes.data || []).find(
            (c) => c.name === response.data.category
          );
          if (match) setCategoryInfo(match);
        } catch (error) {
          console.error('Error fetching category info:', error);
        }
      }

      const relatedRes = await axios.get(
        `${API}/products?category=${encodeURIComponent(response.data.category)}`
      );
      setRelatedProducts(
        relatedRes.data.filter((p) => p.id !== response.data.id).slice(0, 15)
      );
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/products/${product.id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      await axios.post(`${API}/products/${product.id}/reviews`, {
        ...reviewForm,
        productId: product.id
      });

      toast({
        title: t('auth.success'),
        description: t('productDetail.reviewAdded')
      });

      setReviewForm({ userName: '', userEmail: '', rating: 5, comment: '' });
      fetchReviews();
      fetchProduct();
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: error.response?.data?.detail || t('productDetail.reviewError'),
        variant: 'destructive'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    const productName =
      language === 'ru' && product.nameRu ? product.nameRu : product.name;

    addToCart({
      ...product,
      quantity
    });

    toast({
      title: t('productCard.success'),
      description: `${productName} ${t('productCard.addedToCart')}`
    });
  };

  const scrollRelatedProducts = (direction) => {
    const container = document.getElementById('related-products-container');
    const scrollAmount = 300;

    if (container) {
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const handleBuyNow = () => {
    addToCart({
      ...product,
      quantity
    });
    window.location.href = '/checkout';
  };

  const handleAddToWishlist = () => {
    const productName =
      language === 'ru' && product.nameRu ? product.nameRu : product.name;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: t('productCard.success'),
        description: `${productName} ${t('productCard.removedFromWishlist') || 'eliminat din favorite'}`
      });
    } else {
      addToWishlist(product);
      toast({
        title: t('productCard.success'),
        description: `${productName} ${t('productCard.addedToWishlist')}`
      });
    }
  };

  const openGallery = (index) => {
    setGalleryIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = '';
  };

  const nextImage = () => {
    setGalleryIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setGalleryIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('productDetail.notFound')}
          </h2>
          <Link to="/" className="text-teal-600 hover:text-teal-700">
            {t('productDetail.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : ['https://via.placeholder.com/600x600?text=No+Image'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">
              {t('catalogCategory.breadcrumb.home')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/category/${product.category}`} className="hover:text-teal-600">
              {language === 'ru' && categoryInfo?.nameRu ? categoryInfo.nameRu : product.category}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">
              {language === 'ru' && product.nameRu ? product.nameRu : product.name}
            </span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Images */}
<div>
  <div
    className="relative bg-white rounded-2xl overflow-hidden mb-4 border-2 border-gray-100 cursor-pointer hover:border-teal-500 transition group"
    onClick={() => openGallery(selectedImage)}
  >
    <img
      src={images[selectedImage]}
      alt={product.name}
      className="w-full h-[300px] md:h-[600px] object-contain"
    />

    {images.length > 1 && (
      <>
        <button
          type="button"
          onClick={prevMainImage}
          className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white border border-teal-600 flex items-center justify-center transition"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>

        <button
          type="button"
          onClick={nextMainImage}
          className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white border border-teal-600 flex items-center justify-center transition"
        >
          <ChevronRight className="w-6 h-6 text-gray-900" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/60 text-white text-sm font-semibold">
          {selectedImage + 1} / {images.length}
        </div>
      </>
    )}
  </div>

  {images.length > 1 && (
    <div className="grid grid-cols-5 gap-2">
      {images.map((img, idx) => (
        <button
          key={idx}
          onClick={() => setSelectedImage(idx)}
          className={`bg-white rounded-lg overflow-hidden border-2 transition cursor-pointer hover:border-teal-400 ${
            selectedImage === idx ? 'border-teal-600' : 'border-gray-200'
          }`}
        >
          <img
            src={img}
            alt=""
            className="w-full h-[60px] md:h-[140px] object-cover"
          />
        </button>
      ))}
    </div>
  )}
</div>

          {/* Info */}
          <div>
            {(() => {
              const productName =
                language === 'ru' && product.nameRu ? product.nameRu : product.name;
              const productBadge =
                language === 'ru' && product.badgeRu ? product.badgeRu : product.badge;

              return (
                <>
                  {productBadge && (
                    <span className="inline-block bg-red-500 text-white text-sm px-3 py-1 rounded-full mb-3">
                      {productBadge}
                    </span>
                  )}

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1 min-w-0 break-words">
                      {productName}
                    </h1>

                    <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                      {brand && brand.logo && (
                        <div className="bg-white border-2 border-teal-500 rounded-xl w-[160px] h-[64px] flex-shrink-0 flex items-center justify-center px-4">
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="max-w-full max-h-[34px] object-contain"
                          />
                        </div>
                      )}

                      <button
                        onClick={handleAddToWishlist}
                        className="hidden md:flex bg-white border-2 border-red-500 rounded-xl p-3 md:p-4 hover:bg-red-50 transition group"
                        data-testid="product-detail-wishlist-btn"
                      >
                        <Heart
                          className={`w-6 h-6 md:w-7 md:h-7 text-red-500 transition ${isInWishlist(product.id) ? 'fill-red-500' : 'group-hover:fill-red-500'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {product.sku && (
                    <div className="mb-4 flex items-center gap-2 text-gray-600">
                      <span className="font-semibold">{t('productDetail.sku')}:</span>
                      <span className="text-gray-800">{product.sku}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-6">
                    {reviews.length > 0 && (
                      <>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < Math.floor(product.rating || 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>

                        <span className="text-gray-600">
                          ({reviews.length} {t('productDetail.reviews')})
                        </span>
                      </>
                    )}

                    <span className="text-teal-600 font-semibold">
                      {product.sold ?? 0} {t('productDetail.sold')}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-4">
                      <span className="text-2xl md:text-4xl font-bold text-teal-600">
                        {product.price * quantity} MDL
                      </span>
                      {product.originalPrice && (
                        <>
                          <span className="text-xl md:text-2xl text-gray-400 line-through">
                            {product.originalPrice * quantity} MDL
                          </span>
                          <span className="text-l md:text-xl font-semibold text-green-600">
                            -
                            {Math.round(
                              ((product.originalPrice - product.price) / product.originalPrice) *
                              100
                            )}
                            %
                          </span>
                        </>
                      )}
                    </div>
                  </div>

{/* Quantity */}
<div className="mb-6">
  <label className="block text-sm font-bold text-gray-900 mb-3">
    {t('productDetail.quantity')}
  </label>

  <div className="flex items-center gap-4">
    <div
      className={`flex items-center border-2 rounded-lg ${
        product.available
          ? 'border-gray-300'
          : 'border-gray-200 opacity-50 cursor-not-allowed'
      }`}
    >
      <button
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        disabled={!product.available}
        className="p-3 hover:bg-gray-100 transition disabled:cursor-not-allowed"
      >
        <Minus className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      <span className="px-2 md:px-6 py-2 font-bold text-lg">
        {quantity}
      </span>

      <button
        onClick={() => setQuantity(quantity + 1)}
        disabled={!product.available}
        className="p-3 hover:bg-gray-100 transition disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>

    <span
      className={`font-medium ${
        product.available ? 'text-gray-600' : 'text-red-600'
      }`}
    >
      {product.available
        ? `${product.available} ${t('productDetail.available')}`
        : language === 'ru'
        ? 'Нет в наличии'
        : 'Nu este în stoc'}
    </span>
  </div>
</div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 mb-4">
                    <a
                      href="tel:+37369119991"
                      className="flex items-center justify-center gap-3 border-2 border-indigo-500 rounded-2xl px-4 md:px-6 py-3 md:py-4 transition hover:shadow-md order-2 md:order-1"
                    >
                      <span className="text-base md:text-lg font-semibold text-indigo-500">
                        {t('productDetail.orderByPhone')}
                      </span>
                      <span className="text-indigo-500 text-xl">📞</span>
                      <span className="text-base md:text-lg font-bold text-pink-600 underline">
                        +373 691 19 991
                      </span>
                    </a>

                    <div className="grid grid-cols-2 gap-3 order-1 md:order-2">
                      <button
                        onClick={handleAddToCart}
                        className="bg-white border-2 border-teal-600 text-teal-600 py-4 rounded-xl hover:bg-teal-50 transition font-bold text-l md:text-lg flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4 md:w-6 md:h-6" />
                        {t('productDetail.addToCart')}
                      </button>

                      <button
                        onClick={handleBuyNow}
                        className="bg-teal-600 text-white py-4 rounded-xl hover:bg-teal-700 transition font-bold text-l md:text-lg"
                      >
                        {t('productDetail.buyNow')}
                      </button>
                    </div>
                  </div>

                  {/* Installment Plan Box */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-2xl px-4 md:px-6 py-3 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-500 text-white p-2 md:p-3 rounded-xl">
                          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>

                        <div>
                          <h3 className="font-bold text-gray-900 text-sm md:text-base">
                            {t('productDetail.installmentTitle')}
                          </h3>

                          <div className="flex items-baseline gap-2">
                            <span className="text-xl md:text-2xl font-bold text-orange-600">
                              {(product.price / 3).toFixed(2)} MDL
                            </span>
                            <span className="text-sm text-gray-600">
                              {t('productDetail.perMonth')}
                            </span>
                          </div>

                          <p className="text-xs md:text-sm text-gray-600">
                            {t('productDetail.noInterest')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowInstallmentModal(true)}
                        className="w-full md:w-auto bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition font-semibold flex items-center justify-center gap-2"
                      >
                        {t('productDetail.learnMore')}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                        <Truck className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {t('productDetail.freeDelivery')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t('productDetail.freeDeliveryDesc')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {t('productDetail.return')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t('productDetail.returnDesc')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {t('productDetail.securePayment')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t('productDetail.securePaymentDesc')}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-8 mb-12">
          <div className="flex gap-8 border-b mb-6">
            {['specifications', 'description', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-semibold transition border-b-2 ${activeTab === tab
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab === 'description' && t('productDetail.tabs.description')}
                {tab === 'specifications' && t('productDetail.tabs.specifications')}
                {tab === 'reviews' && t('productDetail.tabs.reviews')}
              </button>
            ))}
          </div>

          <div className="prose max-w-none">
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {language === 'ru' && product.descriptionRu
                    ? product.descriptionRu
                    : product.description || t('productDetail.noDescription')}
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.specifications.map((spec, index) => {
                      const specTitle =
                        language === 'ru' && spec.titleRu ? spec.titleRu : spec.title;
                      const specValue =
                        language === 'ru' && spec.valueRu ? spec.valueRu : spec.value;

                      return (
                        <div key={index} className="border-b pb-2">
                          <strong className="text-gray-900">{specTitle}:</strong>
                          <span className="ml-2 text-gray-700">{specValue}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">{t('productDetail.noSpecifications')}</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Review Form */}
                <div className="bg-gray-50 rounded-xl p-6 h-fit">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t('productDetail.writeReview')}
                  </h3>

                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('productDetail.yourName')} *
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewForm.userName}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, userName: e.target.value })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Ion Popescu"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('productDetail.email')} *
                        </label>
                        <input
                          type="email"
                          required
                          value={reviewForm.userEmail}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, userEmail: e.target.value })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="email@exemplu.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('productDetail.rating')} *
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 ${star <= reviewForm.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('productDetail.comment')} *
                      </label>
                      <textarea
                        required
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, comment: e.target.value })
                        }
                        rows="4"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={t('productDetail.commentPlaceholder')}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReview
                        ? t('productDetail.submitting')
                        : t('productDetail.submitReview')}
                    </button>
                  </form>
                </div>

                {/* Reviews List */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    {t('productDetail.customerReviews')}
                  </h3>

                  {reviews.length > 0 ? (
                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {review.userName}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('ro-RO')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-600 bg-gray-50 rounded-lg">
                      {t('productDetail.noReviews')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                {t('productDetail.relatedProducts')}
              </h2>

              {relatedProducts.length > 5 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollRelatedProducts('left')}
                    className="p-2 rounded-full bg-teal-100 hover:bg-gray-200 border border-teal-600 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollRelatedProducts('right')}
                    className="p-2 rounded-full bg-teal-100 hover:bg-gray-200 border border-teal-600 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div
              id="related-products-container"
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {relatedProducts.map((prod) => (
                <div key={prod.id} className="flex-shrink-0 w-[70%] sm:w-[45%] md:w-[30%] lg:w-[20%]">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Installment Plan Modal */}
      {showInstallmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-30">
              <h3 className="relative z-10 text-xl font-bold text-gray-900">
                {t('productDetail.installmentModal.title')} -{' '}
                {language === 'ru' && product.nameRu ? product.nameRu : product.name}
              </h3>

              <button
                onClick={() => setShowInstallmentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Plan Details */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  {t('productDetail.installmentModal.plan')}
                </h4>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {t('productDetail.installmentModal.total')}:
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      {product.price} MDL
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {t('productDetail.installmentModal.monthly')}:
                    </span>
                    <span className="text-xl font-bold text-teal-600">
                      {(product.price / 3).toFixed(2)} MDL
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="mb-6">
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-4">
                  {t('productDetail.installmentModal.schedule')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {[1, 2, 3].map((month) => (
                    <div key={month} className="bg-gray-50 rounded-xl p-3 md:p-4 text-center">
                      <div className="relative z-0 w-16 h-16 md:w-24 md:h-24 mx-auto mb-2 md:mb-3">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 relative z-0">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={month === 1 ? '#F97316' : month === 2 ? '#14B8A6' : '#06B6D4'}
                            strokeWidth="10"
                            strokeDasharray={`${(month / 3) * 251.2} 251.2`}
                          />
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm md:text-2xl font-bold text-gray-900">
                            {month}/3
                          </span>
                        </div>
                      </div>

                      <p className="font-bold text-gray-900 mb-1 text-sm md:text-base">
                        {t('productDetail.installmentModal.month')} {month}
                      </p>
                      <p className="text-sm md:text-lg font-bold text-teal-600">
                        {(product.price / 3).toFixed(2)} MDL
                      </p>
                      <p className="text-[11px] md:text-xs text-gray-500 mt-1">
                        {new Date(
                          Date.now() + month * 30 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString('ro-RO', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Form */}
              <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6 mb-4">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  {t('productDetail.installmentModal.request')}
                </h4>

                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.post(`${API}/installment/request`, {
                        productId: product.id,
                        productName: product.name,
                        productPrice: product.price,
                        name: installmentForm.name,
                        phone: installmentForm.phone
                      });

                      toast({
                        title: t('productDetail.installmentModal.success'),
                        description: `${t('checkout.thankYou') || 'Mulțumim'} ${installmentForm.name}!`
                      });

                      setShowInstallmentModal(false);
                      setInstallmentForm({ name: '', phone: '' });
                    } catch (error) {
                      toast({
                        title: t('auth.error'),
                        description: t('productDetail.installmentModal.error'),
                        variant: 'destructive'
                      });
                    }
                  }}
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      {t('productDetail.installmentModal.fullName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={installmentForm.name}
                      onChange={(e) =>
                        setInstallmentForm({ ...installmentForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ion Popescu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      {t('productDetail.installmentModal.phone')} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={installmentForm.phone}
                      onChange={(e) =>
                        setInstallmentForm({ ...installmentForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="+373 69 123 456"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition font-bold text-lg"
                  >
                    {t('productDetail.installmentModal.send')}
                  </button>

                  <p className="text-xs text-gray-600 text-center">
                    {t('productDetail.installmentModal.note')}
                  </p>
                </form>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{t('productDetail.installmentModal.benefits.noInterest')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{t('productDetail.installmentModal.benefits.noFees')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{t('productDetail.installmentModal.benefits.fastApproval')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{t('productDetail.installmentModal.benefits.online')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[999]">
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition z-[1000]"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {images.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition z-[1000]"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          <div className="max-w-7xl max-h-[90vh] px-4">
            <img
              src={images[galleryIndex]}
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition z-[1000]"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white bg-opacity-20 rounded-full text-white font-semibold">
              {galleryIndex + 1} / {images.length}
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setGalleryIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${galleryIndex === idx
                    ? 'border-teal-500'
                    : 'border-white border-opacity-30 hover:border-opacity-60'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gift popup – appears if the product matches any active gift condition */}
      <GiftPopup product={product} />
    </div>
  );
};

export default ProductDetailPage;