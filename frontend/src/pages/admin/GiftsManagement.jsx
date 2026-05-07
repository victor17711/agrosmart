import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../../context/AdminContext';
import { toast } from '../../hooks/use-toast';
import { Gift, Plus, Edit, Trash2, Save, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const emptyForm = {
  image: '',
  name: '',
  nameRu: '',
  description: '',
  descriptionRu: '',
  isActive: true
};

const GiftsManagement = () => {
  const { getAuthHeaders } = useAdmin();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchGifts(); }, []);

  const fetchGifts = async () => {
    try {
      const res = await axios.get(`${API}/gifts`);
      setGifts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (g) => {
    setEditingId(g.id);
    setForm({
      image: g.image || '',
      name: g.name || '',
      nameRu: g.nameRu || '',
      description: g.description || '',
      descriptionRu: g.descriptionRu || '',
      isActive: g.isActive !== false
    });
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Eroare', description: 'Imagine prea mare (max 5MB)', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast({ title: 'Eroare', description: 'Numele este obligatoriu', variant: 'destructive' });
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API}/gifts/${editingId}`, form, getAuthHeaders());
      } else {
        await axios.post(`${API}/gifts`, form, getAuthHeaders());
      }
      toast({ title: 'Succes', description: editingId ? 'Cadou actualizat!' : 'Cadou adăugat!' });
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchGifts();
    } catch (err) {
      toast({
        title: 'Eroare',
        description: err.response?.data?.detail || 'Nu s-a putut salva',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți acest cadou?')) return;
    try {
      await axios.delete(`${API}/gifts/${id}`, getAuthHeaders());
      toast({ title: 'Succes', description: 'Cadou șters!' });
      fetchGifts();
    } catch (err) {
      toast({ title: 'Eroare', description: 'Nu s-a putut șterge', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      {/* <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link to="/admin/dashboard" className="hover:text-brand-600">Panou de control</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-semibold">Adauga cadouri</span>
      </div> */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Gift className="w-8 h-8 text-brand-600" />
            Cadouri
          </h1>
          <p className="text-gray-600 mt-1">Gestionează cadourile promoționale (popup pe produs)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl hover:bg-brand-600 transition font-semibold"
          data-testid="add-gift-btn"
        >
          <Plus className="w-5 h-5" />
          Adaugă cadou
        </button>
      </div>

      {gifts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Niciun cadou adăugat</p>
          <p className="text-gray-500 text-sm">Click pe „Adaugă cadou" pentru a crea primul</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((g) => (
            <div key={g.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-brand-500 transition">
              {g.image && (
                <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                  <img src={g.image} alt={g.name} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{g.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${g.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {g.isActive ? 'Activ' : 'Inactiv'}
                  </span>
                </div>
                {g.nameRu && <p className="text-sm text-gray-500 mb-1">🇷🇺 {g.nameRu}</p>}
                {g.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{g.description}</p>}
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => openEdit(g)}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-500 transition"
                  >
                    <Edit className="w-4 h-4" /> Editează
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Editează cadou' : 'Adauga cadouri'}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Poza principală</label>
                {form.image && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 h-40 flex items-center justify-center bg-gray-50">
                    <img src={form.image} alt="preview" className="max-h-full object-contain" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  data-testid="gift-image-input"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nume 🇷🇴</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  data-testid="gift-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nume 🇷🇺</label>
                <input
                  type="text"
                  value={form.nameRu}
                  onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descriere produs 🇷🇴</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descriere produs 🇷🇺</label>
                <textarea
                  value={form.descriptionRu}
                  onChange={(e) => setForm({ ...form, descriptionRu: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-5 h-5 accent-brand-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {form.isActive ? 'Activ' : 'Inactiv'}
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
                  className="px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition font-semibold flex items-center gap-2"
                  data-testid="save-gift-btn"
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

export default GiftsManagement;
