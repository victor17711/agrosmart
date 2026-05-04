import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../../context/AdminContext';
import { toast } from '../../hooks/use-toast';
import { Target, Plus, Edit, Trash2, Save, X, ChevronRight, Search } from 'lucide-react';
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

  useEffect(() => { fetchAll(); }, []);

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

  const toggleArrayValue = (arr, val) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast({ title: 'Eroare', description: 'Numele este obligatoriu', variant: 'destructive' });
      return;
    }
    if (!form.giftIds || form.giftIds.length === 0) {
      toast({ title: 'Eroare', description: 'Selectează cel puțin un cadou', variant: 'destructive' });
      return;
    }
    try {
      const payload = {
        ...form,
        minTime: Number(form.minTime) || 0,
        maxTime: Number(form.maxTime) || 0
      };
      if (editingId) {
        await axios.put(`${API}/gift-conditions/${editingId}`, payload, getAuthHeaders());
      } else {
        await axios.post(`${API}/gift-conditions`, payload, getAuthHeaders());
      }
      toast({ title: 'Succes', description: editingId ? 'Condiție actualizată!' : 'Condiție adăugată!' });
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
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
      toast({ title: 'Succes', description: 'Condiție ștearsă!' });
      fetchAll();
    } catch (err) {
      toast({ title: 'Eroare', description: 'Nu s-a putut șterge', variant: 'destructive' });
    }
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '—';
  const brandName = (id) => brands.find((b) => b.id === id)?.name || '—';
  const productName = (id) => products.find((p) => p.id === id)?.name || id;
  const giftName = (id) => gifts.find((g) => g.id === id)?.name || id;

  const filteredProducts = productSearch
    ? products.filter((p) => (p.name || '').toLowerCase().includes(productSearch.toLowerCase()))
    : products.slice(0, 50);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link to="/admin/dashboard" className="hover:text-teal-600">Panou de control</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-semibold">Adauga conditie</span>
      </div> */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="w-8 h-8 text-teal-600" />
            Condiții Cadouri
          </h1>
          <p className="text-gray-600 mt-1">Alege unde apare popup-ul de cadouri (categorie, brand sau produse specifice)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition font-semibold"
          data-testid="add-condition-btn"
        >
          <Plus className="w-5 h-5" />
          Adaugă condiție
        </button>
      </div>

      {conditions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Nicio condiție adăugată</p>
          <p className="text-gray-500 text-sm">Click pe „Adaugă condiție" pentru a configura prima</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs font-bold text-gray-600 uppercase">
                  <th className="px-4 py-3">Nume</th>
                  <th className="px-4 py-3">Categorie</th>
                  <th className="px-4 py-3">Producător</th>
                  <th className="px-4 py-3">Produse</th>
                  <th className="px-4 py-3">Cadouri</th>
                  <th className="px-4 py-3">Timing (s)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {conditions.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.categoryId ? categoryName(c.categoryId) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.brandId ? brandName(c.brandId) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.productIds?.length || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.giftIds?.length || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.minTime}–{c.maxTime}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {c.isActive ? 'Activ' : 'Inactiv'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Editează condiție' : 'Adauga conditie'}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nume</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  data-testid="condition-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Alegeți categoria</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">— Oricare —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Producător (Brand)</label>
                <select
                  value={form.brandId}
                  onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">— Oricare —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Adăugați produse <span className="text-gray-400 font-normal">(opțional — dacă lista e goală, se aplică doar categoria/brandul)</span>
                </label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Caută produs după nume..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                {form.productIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.productIds.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                      >
                        {productName(id)}
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, productIds: form.productIds.filter((x) => x !== id) })}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="max-h-40 overflow-y-auto border-2 border-gray-200 rounded-xl bg-gray-50">
                  {filteredProducts.length === 0 ? (
                    <p className="p-3 text-sm text-gray-500">Niciun produs găsit</p>
                  ) : (
                    filteredProducts.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={form.productIds.includes(p.id)}
                          onChange={() => setForm({ ...form, productIds: toggleArrayValue(form.productIds, p.id) })}
                          className="w-4 h-4 accent-teal-600"
                        />
                        <span className="text-sm">{p.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Alegeți cadouri <span className="text-red-500">*</span></label>
                {gifts.length === 0 ? (
                  <p className="text-sm text-gray-500 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    Nu ai niciun cadou creat. Creează mai întâi cadouri la <Link to="/admin/gifts" className="text-teal-600 underline">Cadouri</Link>.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto border-2 border-gray-200 rounded-xl bg-gray-50">
                    {gifts.map((g) => (
                      <label
                        key={g.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-white cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={form.giftIds.includes(g.id)}
                          onChange={() => setForm({ ...form, giftIds: toggleArrayValue(form.giftIds, g.id) })}
                          className="w-4 h-4 accent-teal-600"
                        />
                        {g.image && <img src={g.image} alt="" className="w-8 h-8 object-contain rounded" />}
                        <span className="text-sm font-semibold">{g.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Timp minim de rulare (s)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minTime}
                    onChange={(e) => setForm({ ...form, minTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Timp maxim de rulare (s)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxTime}
                    onChange={(e) => setForm({ ...form, maxTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-5 h-5 accent-teal-600"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    {form.isActive ? 'Activă (se afișează popup-ul)' : 'Inactivă'}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-semibold flex items-center gap-2"
                  data-testid="save-condition-btn"
                >
                  <Save className="w-5 h-5" />
                  Salvează
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
