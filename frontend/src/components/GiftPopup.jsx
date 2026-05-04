import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { X, Gift, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/**
 * Popup with free gifts on the product detail page.
 * Appears after a random delay between condition.minTime and condition.maxTime seconds
 * if the current product matches at least one active gift condition.
 */
const GiftPopup = ({ product, categories = [] }) => {
  const { language } = useLanguage();
  const [matched, setMatched] = useState(null); // { condition, gifts[] }
  const [open, setOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!product || !product.id) return;
    // Reset for every product change
    dismissedRef.current = false;
    setOpen(false);
    setMatched(null);

    let timerId;
    const run = async () => {
      try {
        const [condRes, giftRes, catRes] = await Promise.all([
          axios.get(`${API}/gift-conditions`),
          axios.get(`${API}/gifts`),
          categories.length > 0 ? Promise.resolve({ data: categories }) : axios.get(`${API}/categories`)
        ]);

        const allCategories = catRes.data || categories;
        const activeConds = (condRes.data || []).filter((c) => c.isActive !== false);
        const activeGiftsById = new Map(
          (giftRes.data || []).filter((g) => g.isActive !== false).map((g) => [g.id, g])
        );

        // Find first matching condition
        const match = activeConds.find((c) => matchesCondition(c, product, allCategories));
        if (!match) return;

        const gifts = (match.giftIds || [])
          .map((id) => activeGiftsById.get(id))
          .filter(Boolean);
        if (gifts.length === 0) return;

        const min = Number(match.minTime) || 0;
        const max = Math.max(Number(match.maxTime) || 0, min);
        const delay = min + Math.random() * Math.max(max - min, 0);

        timerId = setTimeout(() => {
          if (dismissedRef.current) return;
          setMatched({ condition: match, gifts });
          setOpen(true);
        }, delay * 1000);
      } catch (err) {
        console.error('Gift popup fetch error:', err);
      }
    };
    run();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, categories.length]);

  const matchesCondition = (cond, prod, cats) => {
    // 1. Specific product list takes precedence
    if (cond.productIds && cond.productIds.length > 0) {
      return cond.productIds.includes(prod.id);
    }
    // 2. Category match (support legacy `category` string + new `categories` array)
    if (cond.categoryId) {
      const cat = cats.find((c) => c.id === cond.categoryId);
      if (!cat) return false;
      const inLegacy = prod.category === cat.name;
      const inArray = Array.isArray(prod.categories) && prod.categories.includes(cat.name);
      if (!inLegacy && !inArray) return false;
    }
    // 3. Brand match
    if (cond.brandId) {
      if (prod.brandId !== cond.brandId) return false;
    }
    // If all filters empty, don't match (explicit opt-in required)
    if (!cond.categoryId && !cond.brandId && (!cond.productIds || cond.productIds.length === 0)) {
      return false;
    }
    return true;
  };

  const handleClose = () => {
    dismissedRef.current = true;
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/gift-leads`, {
        productId: product.id,
        productName: product.name,
        giftConditionId: matched?.condition?.id || '',
        giftIds: matched?.gifts?.map((g) => g.id) || [],
        customerName: formName.trim(),
        customerPhone: formPhone.trim()
      });
      toast({
        title: language === 'ru' ? 'Спасибо!' : 'Mulțumim!',
        description:
          language === 'ru'
            ? 'Мы скоро свяжемся с вами.'
            : 'Te vom contacta în scurt timp.'
      });
      handleClose();
      setFormName('');
      setFormPhone('');
    } catch (err) {
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Eroare',
        description: err.response?.data?.detail || 'Nu s-a putut trimite',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !matched) return null;

  const productName = language === 'ru' && product.nameRu ? product.nameRu : product.name;
  const isRu = language === 'ru';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={handleClose}
      data-testid="gift-popup-overlay"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="gift-popup"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 font-bold">
            <Gift className="w-5 h-5" />
            {isRu ? 'Купите сейчас — получите подарки' : 'Cumpără acum primește cadouri'}
          </div>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 rounded-full p-1 transition"
            aria-label="close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product card */}
        <div className="p-5">
          <div className="border-2 border-pink-200 rounded-xl p-4 flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{productName}</h3>
            <p className="text-xs text-pink-600 font-semibold mb-3">
              {isRu
                ? 'Оформите заказ сейчас и получите бесплатные подарки!'
                : 'Comandă acum și primești cadouri gratuite!'}
            </p>
            {product.image && (
              <img
                src={product.image}
                alt={productName}
                className="h-28 object-contain mb-3"
              />
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{product.price} MDL</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through">{product.originalPrice} MDL</span>
              )}
            </div>
          </div>

          {/* Gifts */}
          <div className="mt-5">
            <h4 className="text-center text-lg font-bold text-gray-900 mb-1">
              🎁 {isRu ? 'БЕСПЛАТНЫЕ подарки для тебя' : 'Cadouri GRATUITE pentru tine'}
            </h4>
            <p className="text-center text-xs text-gray-500 mb-4">
              {isRu
                ? 'Закажите этот товар сейчас и получите все подарки ниже.'
                : 'Comandă acum acest produs și primești toate cadourile de mai jos.'}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-5">
              {matched.gifts.map((g) => {
                const gName = isRu && g.nameRu ? g.nameRu : g.name;
                return (
                  <div
                    key={g.id}
                    className="w-32 border-2 border-dashed border-pink-300 rounded-xl p-2 flex flex-col items-center"
                  >
                    {g.image ? (
                      <img src={g.image} alt={gName} className="h-16 object-contain mb-2" />
                    ) : (
                      <Gift className="w-12 h-12 text-pink-400 mb-2" />
                    )}
                    <p className="text-xs font-semibold text-center text-gray-700 line-clamp-2">{gName}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {isRu ? 'Ваше имя *' : 'Prenumele Dvs. *'}
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={isRu ? 'Как вас зовут' : 'Cum vă numiți'}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                data-testid="gift-popup-name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {isRu ? 'Номер телефона *' : 'Numărul de telefon *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+373 ..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  data-testid="gift-popup-phone"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {isRu
                ? 'Нажимая кнопку, вы соглашаетесь на обработку ваших данных.'
                : 'Apăsând butonul, sunteți de acord cu prelucrarea datelor introduse.'}
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
              data-testid="gift-popup-submit"
            >
              {submitting
                ? (isRu ? 'Отправка...' : 'Se trimite...')
                : (isRu ? 'Получить подарки' : 'Primește cadouri')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GiftPopup;
