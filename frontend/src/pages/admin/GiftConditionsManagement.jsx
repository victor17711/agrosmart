import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../../context/AdminContext';
import { toast } from '../../hooks/use-toast';
import { Target, Plus, Edit, Trash2, Save, X, Search, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const emptyForm = {
  name: '',
  categoryId: '',
  brandId: '',
  productIds: [],
  giftIds: [],
  minTime: 8,
  maxTime: 12,
  isActive: true
};

const GiftConditionsManagement = () => {
  const { getAuthHeaders } = useAdmin();
  const [conditions, setConditions] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [cRes, gRes, catRes, brRes, prRes] = await Promise.all([
        axios.get(`${API}/gift-conditions`),
        axios.get(`${API}/gifts`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/brands`),
        axios.get(`${API}/products?limit=500`)
      ]);

      setConditions(cRes.data);
      setGifts(gRes.data);
      setCategories(catRes.data);
      setBrands(brRes.data);
      setProducts(prRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setProductSearch('');
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);

    setForm({
      name: c.name || '',
      categoryId: c.categoryId || '',
      brandId: c.brandId || '',
      productIds: c.productIds || [],
      giftIds: c.giftIds || [],
      minTime: c.minTime ?? 8,
      maxTime: c.maxTime ?? 12,
      isActive: c.isActive !== false
    });

    setProductSearch('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setProductSearch('');
  };

  const toggleArrayValue = (arr, val) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) {
      toast({
        title: 'Eroare',
        description: 'Numele este obligatoriu',
        variant: 'destructive'
      });
      return;
    }

    if (!form.giftIds || form.giftIds.length === 0) {
      toast({
        title: 'Eroare',
        description: 'Selectează cel puțin un cadou',
        variant: 'destructive'
      });
      return;
    }

    try {
      const payload = {
        ...form,
        minTime: Number(form.minTime) || 0,
        maxTime: Number(form.maxTime) || 0
      };

      if (editingId) {
        await axios.put(
          `${API}/gift-conditions/${editingId}`,
          payload,
          getAuthHeaders()
        );
      } else {
        await axios.post(`${API}/gift-conditions`, payload, getAuthHeaders());
      }

      toast({
        title: 'Succes',
        description: editingId ? 'Condiție actualizată!' : 'Condiție adăugată!'
      });

      closeModal();
      fetchAll();
    } catch (err) {
      toast({
        title: 'Eroare',
        description: err.response?.data?.detail || 'Nu s-a putut salva',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți această condiție?')) return;

    try {
      await axios.delete(`${API}/gift-conditions/${id}`, getAuthHeaders());

      toast({
        title: 'Succes',
        description: 'Condiție ștearsă!'
      });

      fetchAll();
    } catch (err) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge',
        variant: 'destructive'
      });
    }
  };

  const categoryName = (id) =>
    categories.find((c) => c.id === id)?.name || '—';

  const brandName = (id) =>
    brands.find((b) => b.id === id)?.name || '—';

  const productName = (id) =>
    products.find((p) => p.id === id)?.name || id;

  const giftName = (id) =>
    gifts.find((g) => g.id === id)?.name || id;

  const filteredProducts = productSearch
    ? products.filter((p) =>
        (p.name || '').toLowerCase().includes(productSearch.toLowerCase())
      )
    : products.slice(0, 50);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Condiții Cadouri
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Total:{' '}
              <span className="font-semibold text-gray-800">
                {conditions.length}
              </span>{' '}
              condiții configurate
            </p>
          </div>

          <button
            onClick={openCreate}
            data-testid="add-condition-btn"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-md shadow-brand-200 transition"
          >
            <Plus className="w-5 h-5" />
            Adaugă condiție
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {conditions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-gray-300" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nicio condiție adăugată
            </h3>

            <p className="text-gray-500 mb-6">
              Click pe „Adaugă condiție” pentru a configura prima regulă.
            </p>

            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-full hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200"
            >
              <Plus className="w-5 h-5" />
              Adaugă condiție
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/60">
                <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Condiție</th>
                  <th className="px-6 py-4 font-semibold">Categorie</th>
                  <th className="px-6 py-4 font-semibold">Brand</th>
                  <th className="px-6 py-4 font-semibold">Produse</th>
                  <th className="px-6 py-4 font-semibold">Cadouri</th>
                  <th className="px-6 py-4 font-semibold">Timing</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right pr-8">
                    Acțiuni
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {conditions.map((c) => (
                  <tr
                    key={c.id}
                    className="bg-white hover:bg-brand-50/40 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-100">
                          <Target className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate max-w-[220px]">
                            {c.name || 'Fără nume'}
                          </div>

                          <div className="text-xs text-gray-500">
                            Regulă popup cadou
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {c.categoryId ? categoryName(c.categoryId) : '—'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {c.brandId ? brandName(c.brandId) : '—'}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-gray-50 text-gray-700 ring-1 ring-gray-100">
                        {c.productIds?.length || 0} produse
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                        {c.giftIds?.length || 0} cadouri
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {c.minTime}–{c.maxTime} sec.
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          c.isActive
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-100'
                            : 'bg-gray-50 text-gray-600 ring-1 ring-gray-100'
                        }`}
                      >
                        {c.isActive ? 'Activă' : 'Inactivă'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end pr-2">
                        <button
                          onClick={() => openEdit(c)}
                          title="Editează"
                          className="p-2.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(c.id)}
                          title="Șterge"
                          className="p-2.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-5 flex justify-between items-center border-b border-gray-100 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {editingId ? 'Editează condiție' : 'Adaugă condiție'}
                </h3>

                <p className="text-sm text-gray-500 mt-0.5">
                  Configurează unde și când se afișează popup-ul de cadouri.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nume condiție *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value
                    })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  data-testid="condition-name-input"
                  placeholder="ex: Cadou pentru categoria Tehnică"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Categorie
                  </label>

                  <select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        categoryId: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  >
                    <option value="">— Oricare —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Brand
                  </label>

                  <select
                    value={form.brandId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        brandId: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  >
                    <option value="">— Oricare —</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Produse specifice
                  <span className="ml-1 text-gray-400 font-normal">
                    (opțional)
                  </span>
                </label>

                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    placeholder="Caută produs după nume..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  />
                </div>

                {form.productIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.productIds.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-700 ring-1 ring-brand-100 rounded-full text-xs font-semibold"
                      >
                        {productName(id)}

                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              productIds: form.productIds.filter((x) => x !== id)
                            })
                          }
                          className="hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-2xl bg-gray-50">
                  {filteredProducts.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">
                      Niciun produs găsit
                    </p>
                  ) : (
                    filteredProducts.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={form.productIds.includes(p.id)}
                          onChange={() =>
                            setForm({
                              ...form,
                              productIds: toggleArrayValue(form.productIds, p.id)
                            })
                          }
                          className="w-4 h-4 accent-brand-500 cursor-pointer"
                        />

                        <span className="text-sm text-gray-700">
                          {p.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Cadouri *
                </label>

                {gifts.length === 0 ? (
                  <p className="text-sm text-gray-600 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                    Nu ai niciun cadou creat. Creează mai întâi cadouri la{' '}
                    <Link
                      to="/admin/gifts"
                      className="text-brand-600 underline font-semibold"
                    >
                      Cadouri
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-2xl bg-gray-50">
                    {gifts.map((g) => (
                      <label
                        key={g.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={form.giftIds.includes(g.id)}
                          onChange={() =>
                            setForm({
                              ...form,
                              giftIds: toggleArrayValue(form.giftIds, g.id)
                            })
                          }
                          className="w-4 h-4 accent-brand-500 cursor-pointer"
                        />

                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                          {g.image ? (
                            <img
                              src={g.image}
                              alt={g.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <Gift className="w-4 h-4 text-gray-400" />
                          )}
                        </div>

                        <span className="text-sm font-semibold text-gray-700">
                          {g.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Timp minim de rulare (s)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.minTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        minTime: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Timp maxim de rulare (s)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.maxTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        maxTime: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isActive: e.target.checked
                    })
                  }
                  className="w-5 h-5 accent-brand-500 cursor-pointer"
                />

                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Condiție activă
                  </p>

                  <p className="text-xs text-gray-500">
                    Dacă este bifat, popup-ul de cadou se va afișa după regula configurată.
                  </p>
                </div>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  data-testid="save-condition-btn"
                  className="flex-1 bg-brand-500 text-white py-3 rounded-xl hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200 inline-flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvează
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-semibold"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftConditionsManagement;