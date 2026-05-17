import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { X, Gift, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GiftPopup = ({ product, categories = [] }) => {
  const { language } = useLanguage();
  const [matched, setMatched] = useState(null);
  const [open, setOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!product || !product.id) return;

    dismissedRef.current = false;
    setOpen(false);
    setMatched(null);

    let timerId;

    const run = async () => {
      try {
        const [condRes, giftRes, catRes] = await Promise.all([
          axios.get(`${API}/gift-conditions`),
          axios.get(`${API}/gifts`),
          categories.length > 0
            ? Promise.resolve({ data: categories })
            : axios.get(`${API}/categories`),
        ]);

        const allCategories = catRes.data || categories;
        const activeConds = (condRes.data || []).filter((c) => c.isActive !== false);
        const activeGiftsById = new Map(
          (giftRes.data || [])
            .filter((g) => g.isActive !== false)
            .map((g) => [g.id, g])
        );

        const match = activeConds.find((c) =>
          matchesCondition(c, product, allCategories)
        );

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
    if (cond.productIds && cond.productIds.length > 0) {
      return cond.productIds.includes(prod.id);
    }

    if (cond.categoryId) {
      const cat = cats.find((c) => c.id === cond.categoryId);
      if (!cat) return false;

      const inLegacy = prod.category === cat.name;
      const inArray =
        Array.isArray(prod.categories) && prod.categories.includes(cat.name);

      if (!inLegacy && !inArray) return false;
    }

    if (cond.brandId) {
      if (prod.brandId !== cond.brandId) return false;
    }

    if (
      !cond.categoryId &&
      !cond.brandId &&
      (!cond.productIds || cond.productIds.length === 0)
    ) {
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
        customerPhone: formPhone.trim(),
      });

      toast({
        title: language === 'ru' ? 'Спасибо!' : 'Mulțumim!',
        description:
          language === 'ru'
            ? 'Мы скоро свяжемся с вами.'
            : 'Te vom contacta în scurt timp.',
      });

      handleClose();
      setFormName('');
      setFormPhone('');
    } catch (err) {
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Eroare',
        description: err.response?.data?.detail || 'Nu s-a putut trimite',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !matched) return null;

  const isRu = language === 'ru';
  const productName = isRu && product.nameRu ? product.nameRu : product.name;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-2 py-3 md:px-3 md:py-4"
      onClick={handleClose}
      data-testid="gift-popup-overlay"
    >
      <div
        className="relative w-full max-w-[920px] max-h-[94vh] overflow-y-auto rounded-[22px] md:rounded-[28px] bg-white border border-gray-100"
        onClick={(e) => e.stopPropagation()}
        data-testid="gift-popup"
      >
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 md:right-4 md:top-4 z-20 flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          aria-label="close"
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr]">
          <div className="p-3 md:p-6 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="mb-3 md:mb-4 inline-flex items-center gap-2 rounded-full bg-[#a7cf26]/10 px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.12em] text-[#7fa20f]">
              <Gift className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {isRu ? 'Подарок к заказу' : 'Cadou la comandă'}
            </div>

            <h2 className="pr-10 text-lg md:text-3xl font-extrabold text-gray-900 leading-tight">
              {isRu
                ? 'Купите сейчас и получите подарки'
                : 'Cumpără acum și primești cadouri'}
            </h2>

            <p className="hidden md:block mt-2 text-sm text-gray-500 leading-relaxed">
              {isRu
                ? 'Оставьте данные, и мы свяжемся с вами для подтверждения заказа.'
                : 'Lasă datele, iar noi te contactăm pentru confirmarea comenzii.'}
            </p>

            <div className="mt-3 md:mt-5 rounded-[18px] md:rounded-[24px] bg-white border border-gray-100 p-2.5 md:p-4">
              <div className="flex items-center gap-3 md:gap-4">
                {product.image && (
                  <div className="flex h-16 w-16 md:h-24 md:w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 p-1.5 md:p-2">
                    <img
                      src={product.image}
                      alt={productName}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm md:text-lg font-extrabold text-gray-900">
                    {productName}
                  </h3>

                  <div className="mt-1.5 md:mt-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-lg md:text-2xl font-extrabold text-gray-900">
                      {product.price} MDL
                    </span>

                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="text-xs md:text-sm font-semibold text-gray-400 line-through">
                          {product.originalPrice} MDL
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 md:mt-4 rounded-[18px] md:rounded-[24px] bg-white border border-gray-100 p-2.5 md:p-4">
              <div className="flex items-center justify-between gap-2 md:gap-3">
                {matched.gifts.slice(0, 1).map((g) => {
                  const gName = isRu && g.nameRu ? g.nameRu : g.name;

                  return (
                    <div
                      key={g.id}
                      className="min-w-0 flex flex-1 items-center gap-2 md:gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-2 md:p-2.5"
                    >
                      <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white border border-gray-100">
                        {g.image ? (
                          <img
                            src={g.image}
                            alt={gName}
                            className="max-h-8 max-w-8 md:max-h-9 md:max-w-9 object-contain"
                          />
                        ) : (
                          <Gift className="h-5 w-5 text-[#a7cf26]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="mb-0.5 md:mb-1 inline-flex rounded-full bg-[#a7cf26]/10 px-2 py-0.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.08em] text-[#7fa20f]">
                          {isRu ? 'Подарок' : 'Cadou'}
                        </span>

                        <p className="line-clamp-1 md:line-clamp-2 text-xs md:text-sm font-bold text-gray-800 leading-snug">
                          {gName}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="hidden sm:flex h-12 w-12 md:h-16 md:w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#a7cf26]/10">
                  <Gift className="h-8 w-8 md:h-14 md:w-14 text-[#a7cf26]" />
                </div>
              </div>

              {matched.gifts.length > 1 && (
                <div className="mt-2 md:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-2.5">
                  {matched.gifts.slice(1, 3).map((g) => {
                    const gName = isRu && g.nameRu ? g.nameRu : g.name;

                    return (
                      <div
                        key={g.id}
                        className="flex items-center gap-2 md:gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-2 md:p-2.5"
                      >
                        <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white border border-gray-100">
                          {g.image ? (
                            <img
                              src={g.image}
                              alt={gName}
                              className="max-h-8 max-w-8 md:max-h-9 md:max-w-9 object-contain"
                            />
                          ) : (
                            <Gift className="h-5 w-5 text-[#a7cf26]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="mb-0.5 md:mb-1 inline-flex rounded-full bg-[#a7cf26]/10 px-2 py-0.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.08em] text-[#7fa20f]">
                            {isRu ? 'Подарок' : 'Cadou'}
                          </span>

                          <p className="line-clamp-1 md:line-clamp-2 text-xs md:text-sm font-bold text-gray-800 leading-snug">
                            {gName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 md:p-6 bg-white">
            <div className="mb-3 md:mb-5">
              <h3 className="pr-10 text-lg md:text-2xl font-extrabold text-gray-900">
                {isRu ? 'Оставьте заявку' : 'Lasă o cerere'}
              </h3>

              <p className="hidden md:block mt-2 text-sm text-gray-500">
                {isRu
                  ? 'Заполните поля ниже, чтобы получить подарок.'
                  : 'Completează câmpurile de mai jos pentru a primi cadoul.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5 md:space-y-3">
              <div>
                <label className="mb-1 block md:mb-1.5 text-xs md:text-sm font-bold text-gray-800">
                  {isRu ? 'Ваше имя *' : 'Prenumele Dvs. *'}
                </label>

                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={isRu ? 'Как вас зовут' : 'Cum vă numiți'}
                  className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 md:py-3 text-sm font-semibold text-gray-900 outline-none focus:border-[#a7cf26] focus:ring-2 focus:ring-[#a7cf26]/20"
                  data-testid="gift-popup-name"
                />
              </div>

              <div>
                <label className="mb-1 block md:mb-1.5 text-xs md:text-sm font-bold text-gray-800">
                  {isRu ? 'Номер телефона *' : 'Numărul de telefon *'}
                </label>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+373 ..."
                    className="w-full rounded-2xl border-2 border-gray-200 bg-white py-2.5 md:py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none focus:border-[#a7cf26] focus:ring-2 focus:ring-[#a7cf26]/20"
                    data-testid="gift-popup-phone"
                  />
                </div>
              </div>

              <p className="hidden md:block text-xs leading-relaxed text-gray-500">
                {isRu
                  ? 'Нажимая кнопку, вы соглашаетесь на обработку введенных данных.'
                  : 'Apăsând butonul, sunteți de acord cu prelucrarea datelor introduse.'}
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a7cf26] px-5 py-3 md:py-3.5 text-sm font-extrabold text-white hover:bg-[#96bc21] disabled:opacity-50"
                data-testid="gift-popup-submit"
              >
                <Gift className="h-5 w-5" />
                {submitting
                  ? isRu
                    ? 'Отправка...'
                    : 'Se trimite...'
                  : isRu
                    ? 'Получить подарок'
                    : 'Primește cadoul'}
              </button>

              <div className="hidden md:block rounded-2xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                  {isRu
                    ? 'Подарок доступен только для товаров, участвующих в акции.'
                    : 'Cadoul este valabil doar pentru produsele participante în promoție.'}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftPopup;